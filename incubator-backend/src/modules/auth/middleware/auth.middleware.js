/* eslint-disable no-undef */
/**
 * Authentication & Authorization Middleware
 * Handles JWT verification, role-based access control, and token blacklisting
 * Integrates with AuthHelpers, cache (Redis), and user repository
 */

import { AuthHelpers } from "../../../utils/helpers/auth.helpers";
import { ERROR_MESSAGES, HTTP_STATUS_CODES, ROLES } from "../../../utils/constants";
import { sendErrorResponse } from "../../../utils/helpers/response.helpers";
import { cache } from "../../../utils/cache/cache.util";
import userRepository from "../../user/repositories/user.repository";

/**
 * Extract JWT token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} - Extracted token or null
 * @private
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and "<token>" formats
  const parts = authHeader.split(" ");
  
  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }
  
  if (parts.length === 1) {
    return parts[0];
  }

  return null;
};

/**
 * Main authentication middleware
 * Verifies JWT token, checks blacklist, and attaches user to request
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * @returns {void}
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const token = extractToken(req);
    
    if (!token) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.UNAUTHORIZED),
        "Authentication required. Please provide a valid token.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // 2. Check if token is blacklisted
    const isBlacklisted = await AuthHelpers.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.INVALID_TOKEN),
        "This token has been revoked. Please log in again.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // 3. Verify JWT signature and expiration
    let payload;
    try {
      payload = AuthHelpers.verifyToken(token);
    } catch (error) {
      const message = error.message.includes("expired")
        ? ERROR_MESSAGES.TOKEN_EXPIRED
        : ERROR_MESSAGES.INVALID_TOKEN;
      
      return sendErrorResponse(
        res,
        error,
        message,
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // 4. Check if user exists and is active
    const user = await userRepository.findById(payload.sub, {
      select: "email role is_active status deleted_at",
      lean: true,
    });

    if (!user) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.USER_NOT_FOUND),
        "User account not found.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // 5. Validate user status
    if (user.deleted_at) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND),
        "This account has been deleted.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    if (!user.is_active) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.UNAUTHORIZED),
        "Your account has been deactivated. Contact support.",
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }

    if (user.status === "pending") {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.ACCOUNT_PENDING),
        ERROR_MESSAGES.ACCOUNT_PENDING,
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }

    if (user.status === "rejected") {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.ACCOUNT_REJECTED),
        ERROR_MESSAGES.ACCOUNT_REJECTED,
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }

    // 6. Attach user info to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    };

    req.token = token;

    // 7. Log successful authentication (optional, for audit)
    if (process.env.LOG_AUTH_EVENTS === "true") {
      console.log(JSON.stringify({
        event: "auth.success",
        userId: req.user.id,
        role: req.user.role,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      }));
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return sendErrorResponse(
      res,
      error,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 * 
 * @param {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/admin-only', authenticate, authorize(ROLES.ADMIN), controller.action);
 * router.post('/jobs', authenticate, authorize(ROLES.COMPANY, ROLES.ADMIN), controller.create);
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Must be authenticated first
    if (!req.user) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.UNAUTHORIZED),
        "Authentication required.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.FORBIDDEN),
        `Access restricted to: ${allowedRoles.join(", ")}`,
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if token is missing
 * Useful for routes that have different behavior for authenticated vs unauthenticated users
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * @returns {void}
 * 
 * @example
 * router.get('/jobs', optionalAuth, controller.listJobs); // Public but may show more to authenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      // No token provided - continue as unauthenticated
      return next();
    }

    // Check blacklist
    const isBlacklisted = await AuthHelpers.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(); // Continue as unauthenticated
    }

    // Verify token
    try {
      const payload = AuthHelpers.verifyToken(token);
      
      // Get user
      const user = await userRepository.findById(payload.sub, {
        select: "email role is_active status deleted_at",
        lean: true,
      });

      if (user && !user.deleted_at && user.is_active && user.status === "approved") {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          status: user.status,
        };
        req.token = token;
      }
    } catch (error) {
      console.warn("Optional auth token invalid:", error.message);
      // Token invalid/expired - continue as unauthenticated
      // Don't send error response
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    // Continue even on error
    next();
  }
};

/**
 * Ownership verification middleware factory
 * Ensures user owns the resource they're trying to access/modify
 * 
 * @param {Function} getResourceOwnerId - Async function that extracts owner ID from request
 * @returns {Function} Express middleware
 * 
 * @example
 * // For profile routes
 * router.put('/profile/:id', authenticate, requireOwnership(
 *   async (req) => req.params.id
 * ), controller.update);
 * 
 * // For job routes (company owns jobs)
 * router.put('/jobs/:id', authenticate, requireOwnership(
 *   async (req) => {
 *     const job = await jobRepository.findById(req.params.id);
 *     return job.company_id;
 *   }
 * ), controller.update);
 */
export const requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Must be authenticated
      if (!req.user) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.UNAUTHORIZED),
          "Authentication required.",
          HTTP_STATUS_CODES.UNAUTHORIZED
        );
      }

      // Admins can access everything
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // Get resource owner ID
      const resourceOwnerId = await getResourceOwnerId(req);
      
      if (!resourceOwnerId) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.NOT_FOUND),
          "Resource not found.",
          HTTP_STATUS_CODES.NOT_FOUND
        );
      }

      // Check ownership
      if (resourceOwnerId.toString() !== req.user.id) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.FORBIDDEN),
          "You don't have permission to access this resource.",
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return sendErrorResponse(
        res,
        error,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  };
};

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks on login/register
 * 
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMinutes - Time window in minutes
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/login', authRateLimit(5, 15), controller.login);
 */
export const authRateLimit = (maxAttempts = 5, windowMinutes = 15) => {
  return async (req, res, next) => {
    try {
      const identifier = req.body.email || req.ip;
      const key = `auth_rate_limit:${identifier}`;
      
      const attempts = await cache.get(key);
      
      if (attempts && parseInt(attempts) >= maxAttempts) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.TOO_MANY_REQUESTS),
          `Too many attempts. Please try again in ${windowMinutes} minutes.`,
          HTTP_STATUS_CODES.TOO_MANY_REQUESTS
        );
      }

      // Increment counter
      if (!attempts) {
        await cache.set(key, "1", "EX", windowMinutes * 60);
      } else {
        await cache.incr(key);
      }

      next();
    } catch (error) {
      console.error("Rate limit error:", error);
      // Continue on error (fail open)
      next();
    }
  };
};

/**
 * Email verification check middleware
 * Ensures user has verified their email before accessing certain routes
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * @returns {void}
 */
export const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.UNAUTHORIZED),
        "Authentication required.",
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    const user = await userRepository.findById(req.user.id, {
      select: "email_verified",
      lean: true,
    });

    if (!user || !user.email_verified) {
      return sendErrorResponse(
        res,
        new Error(ERROR_MESSAGES.EMAIL_NOT_VERIFIED),
        ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        HTTP_STATUS_CODES.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    return sendErrorResponse(
      res,
      error,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Admin permission check middleware
 * For fine-grained admin permissions (create, update, delete, super)
 * 
 * @param {...string} requiredPermissions - Permissions needed
 * @returns {Function} Express middleware
 * 
 * @example
 * router.delete('/users/:id', authenticate, authorize(ROLES.ADMIN), 
 *   requireAdminPermission('delete', 'super'), controller.delete);
 */
export const requireAdminPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== ROLES.ADMIN) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.ADMIN_ONLY),
          ERROR_MESSAGES.ADMIN_ONLY,
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }

      // Get admin profile with permissions
      const adminProfile = await userRepository.findById(req.user.id, {
        populate: { path: "admin_profile", select: "permissions" },
      });

      if (!adminProfile?.admin_profile?.permissions) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.FORBIDDEN),
          "Admin permissions not configured.",
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }

      const userPermissions = adminProfile.admin_profile.permissions;

      // Super admins have all permissions
      if (userPermissions.includes("super")) {
        return next();
      }

      // Check if user has required permissions
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return sendErrorResponse(
          res,
          new Error(ERROR_MESSAGES.FORBIDDEN),
          `Required permissions: ${requiredPermissions.join(", ")}`,
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      console.error("Admin permission check error:", error);
      return sendErrorResponse(
        res,
        error,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  };
};

/**
 * Export all middleware functions
 */
export default {
  authenticate,
  authorize,
  optionalAuth,
  requireOwnership,
  authRateLimit,
  requireEmailVerification,
  requireAdminPermission,
};