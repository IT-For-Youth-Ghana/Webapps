/* eslint-disable no-undef */
/**
 * The Authentication and Authorization Service
 * Handles user registration, login, token management, password resets, and email verification
 */

import BaseService from "../../shared/base.service";
import userRepository from "../../user/repositories/user.repository";
import AuthValidation from "../validation/auth.validation";
import {
  ERROR_MESSAGES,
  JWT_EXPIRATION,
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_DURATION_MINUTES,
  USER_STATUSES,
} from "../../../utils/constants";
import { AuthHelpers } from "../../../utils/helpers/auth.helpers";
import studentRepository from "../../user/repositories/student.repository";
import companyRepository from "../../user/repositories/company.repository";
import adminRepository from "../../user/repositories/admin.repository";
import db from "../../../database/app.database";
import { cache } from "../../../utils/cache/cache.util";
import bcrypt from "bcrypt";

// Attach validation once
BaseService.setValidation(AuthValidation);

class AuthService extends BaseService {
  constructor() {
    super({
      user: userRepository,
      student: studentRepository,
      company: companyRepository,
      admin: adminRepository,
    });
  }

  /**
   * Create user and return access + refresh tokens
   * @param {Object} rawData - { email, password, role, profile }
   * @param {Object} [options] - { session, lean }
   * @returns {Promise<Object>} - { user, accessToken, refreshToken }
   */
  async register(rawData, options = {}) {
    return this.runInContext({ action: "register" }, async () => {
      const session = options.session || (await db.startSession());
      if (!options.session) session.startTransaction();

      try {
        this.log("register.start", { email: rawData.email });

        // 1. Validate input
        const { email, password, role, profile } = this.validate(
          rawData,
          AuthValidation.registerSchema
        );

        // 2. Check for existing user
        const existingUser = await this.repo("user").findByEmail(email);
        if (existingUser) {
          throw new Error(ERROR_MESSAGES.ACCOUNT_ALREADY_EXISTS);
        }

        // 3. Create user
        const newUser = await this.repo("user").createUser(
          {
            email,
            password_hash: password,
            role,
            status: USER_STATUSES.APPROVED,
            email_verified: false,
          },
          { session }
        );

        // 4. Create role-specific profile
        const profileRepo = this.repo(role);
        if (!profileRepo) {
          throw new Error(ERROR_MESSAGES.INVALID_ROLE);
        }

        const userProfile = await profileRepo.createProfile(
          { user: newUser._id, ...profile },
          { session }
        );

        const verificationToken = await AuthHelpers.generateAndStoreVerificationToken(
          newUser._id.toString()
        );

        // 6. Queue welcome + verification email
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
        // await agenda.now("sendWelcomeEmail", { ... });

        if (!options.session) {
          await session.commitTransaction();
        }

        // 7. Generate tokens
        const accessToken = AuthHelpers.generateToken(
          newUser._id,
          role,
          "access"
        );
        const refreshToken = AuthHelpers.generateToken(
          newUser._id,
          role,
          "refresh"
        );

        // 8. Store refresh token in Redis
        await AuthHelpers.storeRefreshToken(
          newUser._id.toString(),
          refreshToken
        );

        this.log("register.success", { userId: newUser._id, role });

        return this.success({
          user: newUser.deserialize({ exclude: ["password_hash"] }),
          profile: userProfile,
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRATION.ACCESS_TOKEN,
          message: "Registration successful. Please check your email to verify your account.",
        });
      } catch (error) {
        // Rollback on error
        if (!options.session && session.inTransaction()) {
          await session.abortTransaction();
        }
        this.log("register.error", { error: error.message });
        return this.error(error, "Failed to register user");
      } finally {
        if (!options.session) {
          session.endSession();
        }
      }
    });
  }

  /**
   * Login user and return access + refresh tokens
   * @param {Object} rawData - { email, password }
   * @param {Object} [metadata] - { ip, userAgent }
   * @returns {Promise<Object>} - { user, accessToken, refreshToken }
   */
  async login(rawData, metadata = {}) {
    return this.runInContext({ action: "login" }, async () => {
      try {
        this.log("login.start", { email: rawData.email, ip: metadata.ip });

        const { email, password } = this.validate(
          rawData,
          AuthValidation.loginSchema
        );

        const rateLimitKey = `login_attempts:${metadata.ip || 'unknown'}:${email}`;
        const attempts = await cache.get(rateLimitKey);
        
        if (attempts && parseInt(attempts) >= 5) {
          this.log("login.rate_limited", { email, ip: metadata.ip });
          throw new Error("Too many login attempts. Please try again in 15 minutes.");
        }

        const user = await this.repo("user").findByEmail(email, {
          select: "+password_hash +login_attempts +locked_until",
        });

        // Use a dummy hash if user doesn't exist to maintain consistent timing
        const passwordHash = user?.password_hash || 
          "$2b$10$X/invalid/hash/that/will/never/match/anythingXXXXXXXXXXXXXXXXX";
        
        const isValid = await bcrypt.compare(password, passwordHash);

        // Check if user exists AFTER password comparison (constant time)
        if (!user) {
          // Increment rate limit counter
          await this._incrementRateLimit(rateLimitKey);
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Check account lock
        if (user.locked_until && user.locked_until > new Date()) {
          const minutesLeft = Math.ceil((user.locked_until - new Date()) / 60000);
          throw new Error(
            ERROR_MESSAGES.ACCOUNT_LOCKED.replace("{duration}", minutesLeft)
          );
        }

        // Verify password result
        if (!isValid) {
          await this._handleFailedLogin(user);
          await this._incrementRateLimit(rateLimitKey);
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Check email verification
        if (!user.email_verified) {
          throw new Error(ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
        }

        // Check account status
        if (user.status !== USER_STATUSES.APPROVED) {
          throw new Error("Your account is pending approval or has been disabled.");
        }

        if (user.login_attempts > 0) {
          await this.repo("user").updateById(user._id, {
            login_attempts: 0,
            locked_until: null,
          });
        }

        await cache.del(rateLimitKey);

        // Update last login
        await this.repo("user").updateById(user._id, {
          last_login: new Date(),
        });

        // Generate tokens
        const accessToken = AuthHelpers.generateToken(
          user._id,
          user.role,
          "access"
        );
        const refreshToken = AuthHelpers.generateToken(
          user._id,
          user.role,
          "refresh"
        );

        // Store refresh token
        await AuthHelpers.storeRefreshToken(user._id.toString(), refreshToken);

        if (metadata.userAgent) {
          await cache.set(
            `device:${user._id}`,
            JSON.stringify({
              userAgent: metadata.userAgent,
              ip: metadata.ip,
              lastLogin: new Date(),
            }),
            "EX",
            30 * 24 * 60 * 60 // 30 days
          );
        }

        this.log("login.success", { userId: user._id, role: user.role });
        
        return this.success({
          user: user.deserialize({ exclude: ["password_hash"] }),
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRATION.ACCESS_TOKEN,
        });
      } catch (error) {
        this.log("login.error", { error: error.message });
        return this.error(error, ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    });
  }

  /**
   * Refresh access token using refresh token
   * @param {Object} rawData - { refreshToken }
   * @returns {Promise<Object>} - { accessToken, refreshToken }
   */
  async refreshToken(rawData) {
    return this.runInContext({ action: "refreshToken" }, async () => {
      try {
        this.log("refreshToken.start");

        const { refreshToken } = this.validate(
          rawData,
          AuthValidation.refreshTokenSchema
        );

        // Verify token signature
        const payload = AuthHelpers.verifyToken(refreshToken);
        if (!payload) {
          throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
        }

        // Get user
        const user = await this.repo("user").findById(payload.sub);
        if (!user || user.deleted_at) {
          throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
        }

        const storedToken = await AuthHelpers.getStoredRefreshToken(
          user._id.toString()
        );
        if (storedToken !== refreshToken) {
          // Possible token theft - invalidate all tokens
          await AuthHelpers.deleteRefreshToken(user._id.toString());
          this.log("refreshToken.token_reuse_detected", { userId: user._id });
          throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
        }

        // Generate new tokens
        const newAccessToken = AuthHelpers.generateToken(
          user._id,
          user.role,
          "access"
        );
        const newRefreshToken = AuthHelpers.generateToken(
          user._id,
          user.role,
          "refresh"
        );

        await AuthHelpers.storeRefreshToken(
          user._id.toString(),
          newRefreshToken
        );

        this.log("refreshToken.success", { userId: user._id });
        
        return this.success({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: JWT_EXPIRATION.ACCESS_TOKEN,
        });
      } catch (error) {
        this.log("refreshToken.error", { error: error.message });
        return this.error(error, ERROR_MESSAGES.TOKEN_EXPIRED);
      }
    });
  }

  /**
   * Logout user — invalidate refresh token and blacklist access token
   * @param {string} userId
   * @param {string} [refreshToken]
   * @param {string} [accessToken]
   */
  async logout(userId, refreshToken = null, accessToken = null) {
    return this.runInContext({ action: "logout", userId }, async () => {
      try {
        this.log("logout.start", { userId });

        if (refreshToken) {
          await AuthHelpers.deleteRefreshToken(userId);
        }

        if (accessToken) {
          try {
            const payload = AuthHelpers.verifyToken(accessToken);
            const ttl = payload.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
              await AuthHelpers.blacklistToken(accessToken, ttl);
            }
          } catch (error) {
            // Token already invalid, no need to blacklist
            this.log("logout.invalid_access_token", { error: error.message });
          }
        }

        this.log("logout.success", { userId });
        return this.success({ message: "Logged out successfully" });
      } catch (error) {
        this.log("logout.error", { error: error.message });
        return this.error(error, "Logout failed");
      }
    });
  }

  /**
   * Request password reset — send email with token
   * @param {Object} rawData - { email }
   */
  async requestPasswordReset(rawData) {
    return this.runInContext({ action: "requestPasswordReset" }, async () => {
      try {
        this.log("requestPasswordReset.start", { email: rawData.email });

        const { email } = this.validate(
          rawData,
          AuthValidation.forgotPasswordSchema
        );

        const user = await this.repo("user").findByEmail(email);
        
        //return success to prevent email enumeration
        if (!user) {
          this.log("requestPasswordReset.no_user", { email });
          // Still wait a bit to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 100));
          return this.success({ 
            message: "If an account exists with this email, a reset link has been sent." 
          });
        }

        const resetToken = await AuthHelpers.generateAndStoreResetToken(
          user._id.toString()
        );
        const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

        // Queue email
        // await agenda.now("sendPasswordResetEmail", {
        //   to: user.email,
        //   resetUrl,
        //   userId: user._id,
        // });

        this.log("requestPasswordReset.success", { userId: user._id });
        return this.success({ 
          message: "If an account exists with this email, a reset link has been sent." 
        });
      } catch (error) {
        this.log("requestPasswordReset.error", { error: error.message });
        return this.error(error, "Failed to process password reset request");
      }
    });
  }

  /**
   * Reset password using token
   * @param {Object} rawData - { token, password, confirmPassword }
   */
  async resetPassword(rawData) {
    return this.runInContext({ action: "resetPassword" }, async () => {
      try {
        this.log("resetPassword.start");

        const { token, password } = this.validate(
          rawData,
          AuthValidation.resetPasswordSchema
        );

        const userId = await AuthHelpers.getUserIdFromResetToken(token);
        if (!userId) {
          throw new Error(ERROR_MESSAGES.PASSWORD_RESET_TOKEN_EXPIRED);
        }

        // Verify JWT signature
        const payload = AuthHelpers.verifyToken(token);
        if (!payload || payload.sub !== userId) {
          throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
        }

        const user = await this.repo("user").findById(userId);
        if (!user || user.deleted_at) {
          throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
        }

        // Hash new password
        const hashedPassword = await AuthHelpers.hashPassword(password);

        // Update password
        await this.repo("user").updateById(user._id, {
          password_hash: hashedPassword,
          login_attempts: 0,
          locked_until: null,
        });

        await AuthHelpers.deleteResetToken(token);

        await AuthHelpers.deleteRefreshToken(user._id.toString());

        // Send confirmation email
        // await agenda.now("sendPasswordChangedEmail", { to: user.email });

        this.log("resetPassword.success", { userId: user._id });
        return this.success({ 
          message: "Password reset successfully. Please login with your new password." 
        });
      } catch (error) {
        this.log("resetPassword.error", { error: error.message });
        return this.error(error, "Failed to reset password");
      }
    });
  }

  /**
   * Verify email using token
   * @param {Object} rawData - { token }
   */
  async verifyEmail(rawData) {
    return this.runInContext({ action: "verifyEmail" }, async () => {
      try {
        this.log("verifyEmail.start");

        const { token } = this.validate(
          rawData,
          AuthValidation.verifyEmailSchema
        );

        const userId = await AuthHelpers.getUserIdFromVerificationToken(token);
        if (!userId) {
          throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
        }

        // Verify JWT signature
        const payload = AuthHelpers.verifyToken(token);
        if (!payload || payload.sub !== userId) {
          throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
        }

        const user = await this.repo("user").findById(userId);
        if (!user || user.deleted_at) {
          throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
        }

        if (user.email_verified) {
          throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        // Update user
        await this.repo("user").updateById(user._id, {
          email_verified: true,
          email_verified_at: new Date(),
        });

        await AuthHelpers.deleteVerificationToken(token);

        // Send welcome email
        // await agenda.now("sendWelcomeEmail", { to: user.email, userId: user._id });

        this.log("verifyEmail.success", { userId: user._id });
        return this.success({ message: "Email verified successfully" });
      } catch (error) {
        this.log("verifyEmail.error", { error: error.message });
        return this.error(error, "Failed to verify email");
      }
    });
  }

  /**
   * Unlock account after lock duration (admin or auto)
   * @param {string} userId
   */
  async unlockAccount(userId) {
    return this.runInContext({ action: "unlockAccount", userId }, async () => {
      try {
        this.log("unlockAccount.start", { userId });

        const user = await this.repo("user").findById(userId);
        if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

        if (!user.locked_until || user.locked_until <= new Date()) {
          throw new Error("Account is not locked");
        }

        await this.repo("user").updateById(userId, {
          login_attempts: 0,
          locked_until: null,
        });

        this.log("unlockAccount.success", { userId });
        return this.success({ message: "Account unlocked successfully" });
      } catch (error) {
        this.log("unlockAccount.error", { error: error.message });
        return this.error(error, "Failed to unlock account");
      }
    });
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  /**
   * Handle failed login attempt
   * @param {Object} user
   * @private
   */
  async _handleFailedLogin(user) {
    const attempts = (user.login_attempts || 0) + 1;
    const updates = { login_attempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updates.locked_until = new Date(
        Date.now() + ACCOUNT_LOCK_DURATION_MINUTES * 60000
      );
      
      this.log("account_locked", { 
        userId: user._id, 
        attempts,
        lockedUntil: updates.locked_until 
      });
    }

    await this.repo("user").updateById(user._id, updates);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      // Queue account locked email
      // await agenda.now("sendAccountLockedEmail", {
      //   to: user.email,
      //   duration: ACCOUNT_LOCK_DURATION_MINUTES,
      // });
    }
  }

  /**
   * Increment rate limit counter
   * @param {string} key
   * @private
   */
  async _incrementRateLimit(key) {
    const current = await cache.get(key);
    if (!current) {
      await cache.set(key, "1", "EX", 900); // 15 minutes
    } else {
      await cache.incr(key);
    }
  }
}

// Export singleton
export const authService = new AuthService();
export default authService;