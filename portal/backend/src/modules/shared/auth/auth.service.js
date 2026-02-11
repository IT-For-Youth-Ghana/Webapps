/**
 * Enhanced Auth Service
 * Business logic for authentication operations with queue integration
 * Refactored for Phase 1 queue integration
 */

import User from '../../user/user.model.js';
import VerificationCode from '../../auth/verification-code.model.js';
import jwtUtil from './jwt.util.js';
import logger from '../../../utils/logger.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../../../utils/errors.js';
import crypto from 'crypto';
import cacheService from '../../../config/redis.js';

// Queue imports
import { emailQueue } from '../../../queues/index.js';

class AuthService {
    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Request password reset
     * Enhanced with queue and rate limiting
     */
    async requestPasswordReset(email) {
        email = email.toLowerCase().trim();

        // Rate limiting
        const rateLimitKey = cacheService.buildKey('password-reset', 'attempt', email);
        const recentAttempt = await cacheService.get(rateLimitKey);

        if (recentAttempt) {
            // Don't reveal if it's rate limited
            logger.info(`Password reset rate limited for: ${email}`);
            return {
                success: true,
                message: 'If the email exists, a reset link has been sent',
            };
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Don't reveal if user exists (security)
            logger.info(`Password reset requested for non-existent email: ${email}`);
            
            // Set rate limit anyway to prevent enumeration
            await cacheService.set(rateLimitKey, true, 300); // 5 minutes
            
            return {
                success: true,
                message: 'If the email exists, a reset link has been sent',
            };
        }

        // Check if user is active
        if (user.status !== 'active') {
            logger.info(`Password reset requested for inactive user: ${email}`);
            return {
                success: true,
                message: 'If the email exists, a reset link has been sent',
            };
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store reset token
        await VerificationCode.upsert({
            email,
            code: resetToken,
            expiresAt,
            verified: false,
            registrationData: { 
                type: 'password_reset',
                userId: user.id,
            },
        });

        // Queue reset email (Phase 1) - Non-blocking
        await emailQueue.sendPasswordReset(email, resetToken, user.firstName);

        // Set rate limit (5 minutes)
        await cacheService.set(rateLimitKey, true, 300);

        logger.info(`Password reset requested for: ${email}`);

        return {
            success: true,
            message: 'Password reset instructions sent to your email',
        };
    }

    /**
     * Reset password with token
     * Enhanced with better validation
     */
    async resetPassword(token, newPassword) {
        // Validate password strength
        const validation = this.validatePassword(newPassword);
        if (!validation.valid) {
            throw new ValidationError(validation.errors.join(', '));
        }

        // Find valid reset token
        const verification = await VerificationCode.findOne({
            where: {
                code: token,
                verified: false,
            },
        });

        if (!verification) {
            throw new ValidationError('Invalid or expired reset token');
        }

        if (new Date() > verification.expiresAt) {
            throw new ValidationError('Reset token has expired. Please request a new one');
        }

        // Check if it's a password reset token
        if (verification.registrationData?.type !== 'password_reset') {
            throw new ValidationError('Invalid reset token');
        }

        // Find user
        const user = await User.findOne({ where: { email: verification.email } });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check if user is active
        if (user.status !== 'active') {
            throw new ValidationError('Cannot reset password for inactive account');
        }

        // Check if new password is same as current (optional security check)
        const isSame = await user.verifyPassword(newPassword);
        if (isSame) {
            throw new ValidationError('New password must be different from current password');
        }

        // Update password
        await user.update({ 
            passwordHash: newPassword, 
            tempPassword: null 
        });

        // Mark token as used
        await verification.update({ verified: true });

        // Invalidate all user sessions
        await cacheService.deletePattern(cacheService.buildKey('session', user.id, '*'));
        await cacheService.delete(cacheService.buildKey('user', user.id));

        // TODO: Queue password changed notification email (Phase 1)
        // await emailQueue.sendPasswordChanged(user.id);

        logger.info(`Password reset successful for user: ${user.id}`);

        return {
            success: true,
            message: 'Password reset successfully',
        };
    }

    /**
     * Refresh access token
     * Enhanced with caching
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwtUtil.verifyToken(refreshToken);

            // Check cache for user
            const cacheKey = cacheService.buildKey('user', decoded.id);
            let user = await cacheService.get(cacheKey);

            if (!user) {
                user = await User.findByPk(decoded.id);

                if (!user) {
                    throw new UnauthorizedError('User not found');
                }

                user = user.toJSON();
                await cacheService.set(cacheKey, user, cacheService.ttl.userProfile);
            }

            if (user.status !== 'active') {
                throw new UnauthorizedError('Account is inactive');
            }

            // Generate new access token
            const newAccessToken = jwtUtil.generateToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            // Optionally generate new refresh token (rotation)
            const newRefreshToken = jwtUtil.generateRefreshToken({
                id: user.id,
                email: user.email,
            });

            logger.info(`Token refreshed for user: ${user.id}`);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: user,
            };
        } catch (error) {
            logger.error('Token refresh failed', { error: error.message });
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    /**
     * Verify email ownership (resend verification)
     * Enhanced with rate limiting
     */
    async resendVerificationCode(email) {
        email = email.toLowerCase().trim();

        // Rate limiting
        const rateLimitKey = cacheService.buildKey('verification', 'resend', email);
        const recentAttempt = await cacheService.get(rateLimitKey);

        if (recentAttempt) {
            throw new ValidationError('Please wait 60 seconds before requesting another code');
        }

        const verification = await VerificationCode.findOne({
            where: { email, verified: false },
        });

        if (!verification) {
            throw new NotFoundError('No pending verification for this email');
        }

        // Generate new code
        const code = crypto.randomInt(100000, 999999).toString();

        await verification.update({
            code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });

        // Queue verification email (Phase 1)
        const firstName = verification.registrationData?.firstName || 'User';
        await emailQueue.sendVerificationCode(email, code, firstName);

        // Set rate limit (60 seconds)
        await cacheService.set(rateLimitKey, true, 60);

        logger.info(`Verification code resent to: ${email}`);

        return {
            success: true,
            message: 'Verification code resent',
        };
    }

    /**
     * Invalidate all sessions (logout from all devices)
     * Enhanced with cache clearing
     */
    async invalidateAllSessions(userId) {
        // Clear all user sessions from cache
        await cacheService.deletePattern(cacheService.buildKey('session', userId, '*'));
        
        // Clear user cache
        await cacheService.delete(cacheService.buildKey('user', userId));

        logger.info(`All sessions invalidated for user: ${userId}`);

        return {
            success: true,
            message: 'All sessions invalidated. Please log in again.',
        };
    }

    /**
     * Verify user account email (for unverified users)
     */
    async verifyUserEmail(userId, code) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.emailVerified) {
            throw new ValidationError('Email already verified');
        }

        const verification = await VerificationCode.findOne({
            where: {
                email: user.email,
                code,
                verified: false,
            },
        });

        if (!verification) {
            throw new ValidationError('Invalid verification code');
        }

        if (new Date() > verification.expiresAt) {
            throw new ValidationError('Verification code expired. Please request a new one');
        }

        // Update user and verification
        await Promise.all([
            user.update({ emailVerified: true }),
            verification.update({ verified: true }),
        ]);

        // Clear cache
        await cacheService.delete(cacheService.buildKey('user', userId));

        logger.info(`Email verified for user: ${userId}`);

        return {
            success: true,
            message: 'Email verified successfully',
        };
    }

    /**
     * Check if email is available
     */
    async isEmailAvailable(email) {
        email = email.toLowerCase().trim();
        
        const user = await User.findOne({ 
            where: { email },
            attributes: ['id'],
        });

        return !user;
    }

    /**
     * Generate temporary password for new users
     */
    generateTempPassword(length = 16) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Validate session token
     */
    async validateSession(token) {
        try {
            const decoded = jwtUtil.verifyToken(token);

            // Check if user exists and is active
            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'email', 'role', 'status'],
            });

            if (!user) {
                return { valid: false, reason: 'user_not_found' };
            }

            if (user.status !== 'active') {
                return { valid: false, reason: 'user_inactive' };
            }

            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            };
        } catch (error) {
            return {
                valid: false,
                reason: error.name === 'TokenExpiredError' ? 'token_expired' : 'token_invalid',
            };
        }
    }

    /**
     * Account lockout management (after failed login attempts)
     */
    async isAccountLocked(email) {
        const lockoutKey = cacheService.buildKey('lockout', email);
        const lockout = await cacheService.get(lockoutKey);

        if (lockout) {
            const timeRemaining = Math.ceil((lockout.expiresAt - Date.now()) / 1000 / 60);
            return {
                locked: true,
                timeRemaining: timeRemaining,
                reason: 'Too many failed login attempts',
            };
        }

        return { locked: false };
    }

    /**
     * Lock account temporarily (after too many failed attempts)
     */
    async lockAccount(email, durationMinutes = 15) {
        const lockoutKey = cacheService.buildKey('lockout', email);
        
        await cacheService.set(
            lockoutKey,
            {
                email,
                expiresAt: Date.now() + (durationMinutes * 60 * 1000),
            },
            durationMinutes * 60
        );

        // TODO: Queue account locked notification email
        // await emailQueue.sendAccountLocked(email, durationMinutes);

        logger.warn(`Account locked for ${email} for ${durationMinutes} minutes`);
    }

    /**
     * Clear account lockout
     */
    async clearAccountLockout(email) {
        const lockoutKey = cacheService.buildKey('lockout', email);
        await cacheService.delete(lockoutKey);

        logger.info(`Account lockout cleared for ${email}`);
    }
}

export default new AuthService();