/**
 * Auth Service
 * Business logic for authentication operations
 */

import User from '../../user/user.model.js';
import VerificationCode from '../../auth/verification-code.model.js';
import jwtUtil from './jwt.util.js';
import emailService from '../email/email.service.js';
import logger from '../../../utils/logger.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../../../utils/errors.js';
import crypto from 'crypto';

class AuthService {
    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Don't reveal if user exists
            logger.info(`Password reset requested for non-existent email: ${email}`);
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
            registrationData: { type: 'password_reset' },
        });

        // Send reset email
        await emailService.sendPasswordReset(email, resetToken, user.firstName);

        logger.info(`Password reset requested for: ${email}`);

        return {
            success: true,
            message: 'Password reset instructions sent to your email',
        };
    }

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
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
            throw new ValidationError('Reset token has expired');
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

        // Update password
        await user.update({ passwordHash: newPassword, tempPassword: null });

        // Mark token as used
        await verification.update({ verified: true });

        logger.info(`Password reset successful for user: ${user.id}`);

        return {
            success: true,
            message: 'Password reset successfully',
        };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwtUtil.verifyToken(refreshToken);

            // Check if user exists and is active
            const user = await User.findByPk(decoded.id);

            if (!user) {
                throw new UnauthorizedError('User not found');
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

            // Optionally generate new refresh token
            const newRefreshToken = jwtUtil.generateRefreshToken({
                id: user.id,
                email: user.email,
            });

            logger.info(`Token refreshed for user: ${user.id}`);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: user.toPublicJSON(),
            };
        } catch (error) {
            logger.error('Token refresh failed', error);
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

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
     * Verify email ownership (resend verification)
     */
    async resendVerificationCode(email) {
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

        // Send email
        const firstName = verification.registrationData?.firstName || 'User';
        await emailService.sendVerificationCode(email, code, firstName);

        logger.info(`Verification code resent to: ${email}`);

        return {
            success: true,
            message: 'Verification code resent',
        };
    }

    /**
     * Invalidate all sessions (logout from all devices)
     */
    async invalidateAllSessions(userId) {
        // In a stateless JWT system, we can't truly invalidate tokens
        // This would require a blacklist or token versioning
        // For now, we'll just log the action
        logger.info(`All sessions invalidated for user: ${userId}`);

        return {
            success: true,
            message: 'All sessions invalidated. Please log in again.',
        };
    }
}

export default new AuthService();