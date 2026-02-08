/**
 * Auth Controller
 * Handles authentication endpoints
 */

import authService from './auth.service.js';
import userService from '../../user/user.service.js';
import { successResponse, errorResponse } from '../../../utils/response.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import logger from '../../../utils/logger.js';
import emailService from '../email/email.service.js';

class AuthController {
    /**
     * POST /api/auth/register/start
     * Start registration - send verification code
     */
    startRegistration = asyncHandler(async (req, res) => {
        const { email, firstName, lastName } = req.body;

        if (!email || !firstName || !lastName) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        const result = await userService.startRegistration({
            email,
            firstName,
            lastName,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Verification code sent to your email',
            data: result,
        });
    });

    /**
     * POST /api/auth/register/verify
     * Verify email code
     */
    verifyCode = asyncHandler(async (req, res) => {

        console.log(req.body)
        const { email, code } = req.body;

        if (!email || !code) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        const result = await userService.verifyCode(email, code);

        return successResponse(res, {
            statusCode: 200,
            message: 'Email verified successfully',
            data: result,
        });
    });

    /**
     * POST /api/auth/register/complete
     * Complete registration with course enrollment
     */
    completeRegistration = asyncHandler(async (req, res) => {
        const { tempToken, phone, dateOfBirth, courseId } = req.body;

        if (!tempToken || !phone || !dateOfBirth) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        const result = await userService.completeRegistration({
            tempToken,
            phone,
            dateOfBirth,
            courseId,
        });

        console.log('Registration completed:', result);


        return successResponse(res, {
            statusCode: 201,
            message: 'Registration completed successfully',
            data: result,
        });
    });

    /**
     * POST /api/auth/login
     * Login user
     */
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        const result = await userService.login(email, password);

        return successResponse(res, {
            statusCode: 200,
            message: 'Login successful',
            data: result,
        });
    });

    /**
     * POST /api/auth/logout
     * Logout user (client-side token removal)
     */
    logout = asyncHandler(async (req, res) => {
        // JWT is stateless, so logout is handled client-side
        // This endpoint can be used for logging purposes
        logger.info(`User ${req.userId} logged out`);

        return successResponse(res, {
            statusCode: 200,
            message: 'Logged out successfully',
        });
    });

    /**
     * POST /api/auth/refresh
     * Refresh access token
     */
    refreshToken = asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        const result = await authService.refreshAccessToken(refreshToken);

        return successResponse(res, {
            statusCode: 200,
            message: 'Token refreshed successfully',
            data: result,
        });
    });

    /**
     * POST /api/auth/forgot-password
     * Request password reset
     */
    forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        const result = await authService.requestPasswordReset(email);

        return successResponse(res, {
            statusCode: 200,
            message: 'Password reset instructions sent to your email',
            data: result,
        });
    });

    /**
     * POST /api/auth/reset-password
     * Reset password with token
     */
    resetPassword = asyncHandler(async (req, res) => {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        const result = await authService.resetPassword(token, newPassword);

        return successResponse(res, {
            statusCode: 200,
            message: 'Password reset successfully',
            data: result,
        });
    });

    /**
     * POST /api/auth/change-password
     * Change password (authenticated)
     */
    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        await userService.changePassword(req.userId, currentPassword, newPassword);

        return successResponse(res, {
            statusCode: 200,
            message: 'Password changed successfully',
        });
    });

    /**
     * GET /api/auth/me
     * Get current user profile
     */
    getProfile = asyncHandler(async (req, res) => {
        const user = await userService.getProfile(req.userId);

        return successResponse(res, {
            statusCode: 200,
            message: 'Profile retrieved successfully',
            data: user,
        });
    });

    /**
     * POST /api/auth/verify-token
     * Verify if token is valid
     */
    verifyToken = asyncHandler(async (req, res) => {
        // If middleware passed, token is valid
        return successResponse(res, {
            statusCode: 200,
            message: 'Token is valid',
            data: {
                userId: req.userId,
                email: req.user.email,
                role: req.user.role,
            },
        });
    });
}

export default new AuthController();