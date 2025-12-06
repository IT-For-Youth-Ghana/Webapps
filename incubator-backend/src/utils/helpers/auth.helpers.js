/**
 * The Authentication Helper Utility
 * Handles JWT, password hashing, and refresh token management
 * Uses Redis (or in-memory fallback) for token storage & blacklisting
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { JWT_CONFIG } from "../../config/jwt.config.js";
import { SALT_ROUNDS, JWT_EXPIRATION } from "../../utils/constants.js";
import { cache } from "../../utils/cache/cache.util.js";
const jwtLibrary = jwt;

export class AuthHelpers {
  /**
   * Generates a JWT token for a user
   * @param {string} userId - The user's unique identifier
   * @param {string} role - The user's role
   * @param {string} [tokenType='access'] - 'access', 'refresh', 'reset', 'verification'
   * @returns {string} The generated JWT token
   */
  static generateToken(userId, role, tokenType = "access") {
    try {
      const expiresIn =
        JWT_EXPIRATION[`${tokenType.toUpperCase()}_TOKEN`] ||
        JWT_EXPIRATION.ACCESS_TOKEN;

      const payload = {
        sub: userId,
        role,
        iat: Math.floor(Date.now() / 1000),
        // Custom claims (configurable)
        ...(JWT_CONFIG.CUSTOM_CLAIMS.includeStatus && { status: "active" }),
        ...(JWT_CONFIG.CUSTOM_CLAIMS.permissions && {
          permissions: this._getDefaultPermissions(role),
        }),
      };

      return jwtLibrary.sign(payload, JWT_CONFIG.SECRET_KEY, {
        ...JWT_CONFIG.TOKEN_OPTIONS,
        jwtid: crypto.randomBytes(16).toString('hex'),
        expiresIn,
        algorithm: JWT_CONFIG.ALGORITHM,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Verifies a JWT token and returns its payload
   * @param {string} token - The JWT token to verify
   * @returns {object} The decoded payload
   */
  static verifyToken(token) {
    try {
      return jwtLibrary.verify(token, JWT_CONFIG.SECRET_KEY, {
        algorithms: [JWT_CONFIG.ALGORITHM],
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
        ignoreExpiration: false,
      });
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Hashes a plain password
   * @param {string} plainPassword
   * @returns {Promise<string>}
   */
  static async hashPassword(plainPassword) {
    try {
      return await bcrypt.hash(plainPassword, SALT_ROUNDS);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Compares plain password with hash
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  static async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }

  /**
   * Store refresh token in cache (Redis)
   * @param {string} userId
   * @param {string} refreshToken
   * @returns {Promise<void>}
   */
  static async storeRefreshToken(userId, refreshToken) {
    try {
      const key = `refresh:${userId}`;
      const ttlSeconds = this._parseJwtExpiry(JWT_EXPIRATION.REFRESH_TOKEN);
      await cache.set(key, refreshToken, "EX", ttlSeconds);
    } catch (error) {
      throw new Error(`Failed to store refresh token: ${error.message}`);
    }
  }

  /**
   * Get stored refresh token
   * @param {string} userId
   * @returns {Promise<string|null>}
   */
  static async getStoredRefreshToken(userId) {
    try {
      const key = `refresh:${userId}`;
      return await cache.get(key);
    } catch (error) {
      throw new Error(`Failed to get refresh token: ${error.message}`);
    }
  }

  /**
   * Delete refresh token (on logout, password reset)
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async deleteRefreshToken(userId) {
    try {
      const key = `refresh:${userId}`;
      await cache.del(key);
    } catch (error) {
      throw new Error(`Failed to delete refresh token: ${error.message}`);
    }
  }

  // ========================================
  // PASSWORD RESET TOKEN MANAGEMENT (Redis-backed)
  // ========================================

  /**
   * Generate and store password reset token
   * @param {string} userId
   * @returns {Promise<string>} resetToken (JWT)
   */
  static async generateAndStoreResetToken(userId) {
    try {
      const resetToken = this.generateToken(userId, "reset", "reset");
      const key = `reset:${resetToken}`;
      const ttlSeconds = this._parseJwtExpiry(JWT_EXPIRATION.RESET_TOKEN);

      await cache.set(key, userId, "EX", ttlSeconds);
      return resetToken;
    } catch (error) {
      throw new Error(`Failed to generate reset token: ${error.message}`);
    }
  }

  /**
   * Get user ID from reset token
   * @param {string} resetToken
   * @returns {Promise<string|null>} userId
   */
  static async getUserIdFromResetToken(resetToken) {
    try {
      const key = `reset:${resetToken}`;
      return await cache.get(key);
    } catch (error) {
      throw new Error(`Failed to retrieve reset token: ${error.message}`);
    }
  }

  /**
   * Delete password reset token (after use or expiry)
   * @param {string} resetToken
   * @returns {Promise<void>}
   */
  static async deleteResetToken(resetToken) {
    try {
      const key = `reset:${resetToken}`;
      await cache.del(key);
    } catch (error) {
      throw new Error(`Failed to delete reset token: ${error.message}`);
    }
  }

  // ========================================
  // EMAIL VERIFICATION TOKEN (Optional)
  // ========================================

  /**
   * Generate and store email verification token
   * @param {string} userId
   * @returns {Promise<string>} verificationToken
   */
  static async generateAndStoreVerificationToken(userId) {
    try {
      const token = this.generateToken(userId, "verification", "verification");
      const key = `verify:${token}`;
      const ttlSeconds = this._parseJwtExpiry(
        JWT_EXPIRATION.VERIFICATION_TOKEN
      );

      await cache.set(key, userId, "EX", ttlSeconds);
      return token;
    } catch (error) {
      throw new Error(
        `Failed to generate verification token: ${error.message}`
      );
    }
  }

  /**
   * Validate verification token and get user
   * @param {string} token
   * @returns {Promise<string|null>}
   */
  static async getUserIdFromVerificationToken(token) {
    try {
      const key = `verify:${token}`;
      return await cache.get(key);
    } catch (error) {
      throw new Error(`Failed to verify token: ${error.message}`);
    }
  }

  /**
   * Delete verification token
   * @param {string} token
   */
  static async deleteVerificationToken(token) {
    try {
      const key = `verify:${token}`;
      await cache.del(key);
    } catch (error) {
      throw new Error(`Failed to delete verification token: ${error.message}`);
    }
  }

  // ========================================
  // BLACKLIST & UTILITIES
  // ========================================

  /**
   * Blacklist any token
   * @param {string} token
   * @param {number} [ttlSeconds]
   */
  static async blacklistToken(token, ttlSeconds = 7 * 24 * 60 * 60) {
    try {
      const key = `blacklist:${token}`;
      await cache.set(key, "1", "EX", ttlSeconds);
    } catch (error) {
      throw new Error(`Failed to blacklist token: ${error.message}`);
    }
  }

  /**
   * Check if token is blacklisted
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  static async isTokenBlacklisted(token) {
    try {
      const key = `blacklist:${token}`;
      const result = await cache.get(key);
      return result === "1";
    } catch (error) {
      console.warn("Blacklist check failed:", error.message);
      return false;
    }
  }
  // ========================================
  // PRIVATE HELPERS
  // ========================================

  /**
   * Convert JWT expiry string (e.g., "7d") to seconds
   * @param {string} expiry
   * @returns {number}
   */
  static _parseJwtExpiry(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // default 1h

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
  }

  /**
   * Get default permissions by role
   * @param {string} role
   * @returns {string[]}
   */
  static _getDefaultPermissions(role) {
    const perms = {
      student: ["read", "apply"],
      company: ["read", "post_job", "manage_applications"],
      admin: ["read", "write", "delete", "manage_users"],
    };
    return perms[role] || ["read"];
  }
}
