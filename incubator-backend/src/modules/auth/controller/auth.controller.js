/**
 * Auth Controller
 * Handles all authentication and authorization operations
 * - Registration (student, company, admin)
 * - Login/Logout
 * - Token refresh
 * - Password reset (request & confirm)
 * - Email verification
 * - Account unlocking
 */

import BaseController from "../../shared/base.controller";
import authService from "../service/auth.service";
import AuthValidation from "../validation/auth.validation";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../utils/constants";

class AuthController extends BaseController {
  constructor() {
    super({
      auth: authService,
    });
  }

  // ========================================
  // 1. REGISTRATION
  // ========================================

  /**
   * Register a new user (student, company, or admin)
   * POST /api/auth/register
   * Body: { email, password, confirmPassword, role, profile }
   */
  register = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "register", role: req.body.role });

    // Validate input
    const validatedData = this.validate(req.body, AuthValidation.registerSchema);

    // Call service
    const result = await this.service("auth").register(validatedData);

    if (!result.success) {
      // Handle specific errors
      if (result.error.message.includes("already exists")) {
        return this.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    // Success response
    return this.created(
      res,
      {
        user: result.data.user,
        profile: result.data.profile,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      },
      result.data.message || SUCCESS_MESSAGES.REGISTER_SUCCESS
    );
  });

  // ========================================
  // 2. LOGIN
  // ========================================

  /**
   * Login user
   * POST /api/auth/login
   * Body: { email, password }
   */
  login = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "login", email: req.body.email });

    // Validate input
    const validatedData = this.validate(req.body, AuthValidation.loginSchema);

    // Extract metadata for rate limiting and device tracking
    const metadata = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    // Call service
    const result = await this.service("auth").login(validatedData, metadata);

    console.log("Login result:", result); // Debug log

    if (!result.success) {
      // Handle specific errors
      if (result.error.includes(ERROR_MESSAGES.INVALID_CREDENTIALS)) {
        return this.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
      if (result.error.includes(ERROR_MESSAGES.ACCOUNT_LOCKED)) {
        return this.forbidden(res, result.error);
      }
      if (result.error.includes(ERROR_MESSAGES.EMAIL_NOT_VERIFIED)) {
        return this.forbidden(res, ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
      }
      if (result.error.includes(ERROR_MESSAGES.TOO_MANY_REQUESTS)) {
        return this.error(res, result.error, 429);
      }
      return this.error(res, result.error);
    }

    // Success response
    this.log("info", {
      action: "login.success",
      userId: result.data.user._id,
      role: result.data.user.role,
    });

    return this.success(
      res,
      {
        user: result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      },
      SUCCESS_MESSAGES.LOGIN_SUCCESS
    );
  });

  // ========================================
  // 3. LOGOUT
  // ========================================

  /**
   * Logout user (invalidate tokens)
   * POST /api/auth/logout
   * Headers: Authorization: Bearer <token>
   * Body: { refreshToken } (optional)
   */
  logout = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const userId = user?.id;
    const refreshToken = req.body.refreshToken;
    const accessToken = req.token;

    this.log("info", { action: "logout", userId });

    // Call service
    const result = await this.service("auth").logout(
      userId,
      refreshToken,
      accessToken
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, null, result.data.message);
  });

  // ========================================
  // 4. TOKEN REFRESH
  // ========================================

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh
   * Body: { refreshToken }
   */
  refreshToken = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "refreshToken" });

    // Validate input
    const validatedData = this.validate(
      req.body,
      AuthValidation.refreshTokenSchema
    );

    // Call service
    const result = await this.service("auth").refreshToken(validatedData);

    if (!result.success) {
      if (
        result.error.message.includes("Invalid") ||
        result.error.message.includes("expired")
      ) {
        return this.unauthorized(res, ERROR_MESSAGES.TOKEN_EXPIRED);
      }
      return this.error(res, result.error);
    }

    return this.success(
      res,
      {
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      },
      "Token refreshed successfully"
    );
  });

  // ========================================
  // 5. PASSWORD RESET REQUEST
  // ========================================

  /**
   * Request password reset (send email with token)
   * POST /api/auth/forgot-password
   * Body: { email }
   */
  forgotPassword = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "forgotPassword", email: req.body.email });

    // Validate input
    const validatedData = this.validate(
      req.body,
      AuthValidation.forgotPasswordSchema
    );

    // Call service
    const result = await this.service("auth").requestPasswordReset(
      validatedData
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    // Always return success to prevent email enumeration
    return this.success(res, null, result.data.message);
  });

  // ========================================
  // 6. PASSWORD RESET CONFIRM
  // ========================================

  /**
   * Reset password using token
   * POST /api/auth/reset-password
   * Body: { token, password, confirmPassword }
   */
  resetPassword = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "resetPassword" });

    // Validate input
    const validatedData = this.validate(
      req.body,
      AuthValidation.resetPasswordSchema
    );

    // Call service
    const result = await this.service("auth").resetPassword(validatedData);

    if (!result.success) {
      if (result.error.message.includes("expired")) {
        return this.unauthorized(
          res,
          ERROR_MESSAGES.PASSWORD_RESET_TOKEN_EXPIRED
        );
      }
      if (result.error.message.includes("Invalid")) {
        return this.badRequest(res, ERROR_MESSAGES.INVALID_TOKEN);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, result.data.message);
  });

  // ========================================
  // 7. EMAIL VERIFICATION
  // ========================================

  /**
   * Verify email using token
   * POST /api/auth/verify-email
   * Body: { token }
   */
  verifyEmail = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "verifyEmail" });

    // Validate input
    const validatedData = this.validate(
      req.body,
      AuthValidation.verifyEmailSchema
    );

    // Call service
    const result = await this.service("auth").verifyEmail(validatedData);

    if (!result.success) {
      if (result.error.message.includes("expired")) {
        return this.unauthorized(res, ERROR_MESSAGES.TOKEN_EXPIRED);
      }
      if (result.error.message.includes("already verified")) {
        return this.badRequest(res, ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, SUCCESS_MESSAGES.EMAIL_VERIFIED);
  });

  // ========================================
  // 8. RESEND VERIFICATION EMAIL
  // ========================================

  /**
   * Resend email verification link
   * POST /api/auth/resend-verification
   * Body: { email }
   */
  resendVerification = this.asyncHandler(async (req, res) => {
    this.log("info", {
      action: "resendVerification",
      email: req.body.email,
    });

    // Validate email
    const validatedData = this.validate(
      req.body,
      AuthValidation.forgotPasswordSchema // Reuse email schema
    );

    // Call resendVerification service method
    const result = await this.service("auth").resendVerification(validatedData);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(
      res,
      null,
      result.data.message || "Verification email sent. Please check your inbox."
    );
  });

  // ========================================
  // 9. GET CURRENT USER
  // ========================================

  /**
   * Get current authenticated user
   * GET /api/auth/me
   * Headers: Authorization: Bearer <token>
   */
  getCurrentUser = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "getCurrentUser", userId: user.id });

    // Get full user details from service
    // This could be enhanced to return profile data as well
    return this.success(
      res,
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      "User retrieved successfully"
    );
  });

  // ========================================
  // 10. CHANGE PASSWORD (Authenticated)
  // ========================================

  /**
   * Change password for authenticated user
   * PUT /api/auth/change-password
   * Headers: Authorization: Bearer <token>
   * Body: { currentPassword, newPassword, confirmPassword }
   */
  changePassword = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "changePassword", userId: user.id });

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return this.badRequest(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }

    if (newPassword !== confirmPassword) {
      return this.badRequest(res, ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH);
    }

    // Call changePassword service method
    const result = await this.service("auth").changePassword(
      user.id,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      if (result.error.message?.includes("incorrect")) {
        return this.unauthorized(res, "Current password is incorrect");
      }
      if (result.error.message?.includes("different")) {
        return this.badRequest(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, result.data.message || "Password changed successfully");
  });

  // ========================================
  // 11. UNLOCK ACCOUNT (Admin)
  // ========================================

  /**
   * Unlock a locked user account
   * POST /api/auth/unlock/:userId
   * Headers: Authorization: Bearer <token> (admin only)
   */
  unlockAccount = this.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const admin = this.getUser(req);

    this.log("info", {
      action: "unlockAccount",
      userId,
      adminId: admin.id,
    });

    // Call service
    const result = await this.service("auth").unlockAccount(userId);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, result.data.message);
  });

  // ========================================
  // 12. CHECK AUTH STATUS
  // ========================================

  /**
   * Check if current token is valid
   * GET /api/auth/check
   * Headers: Authorization: Bearer <token>
   */
  checkAuth = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    return this.success(
      res,
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      "Token is valid"
    );
  });

  // ========================================
  // 13. REVOKE ALL TOKENS (Security)
  // ========================================

  /**
   * Revoke all refresh tokens for current user
   * POST /api/auth/revoke-all
   * Headers: Authorization: Bearer <token>
   */
  revokeAllTokens = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "revokeAllTokens", userId: user.id });

    // Call service to revoke all tokens
    const result = await this.service("auth").logout(user.id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(
      res,
      null,
      "All tokens revoked. Please log in again."
    );
  });
}

// Export singleton instance
export default new AuthController();