/**
 * User Controller
 * Handles user management endpoints
 */

import userService from './user.service.js';
import { successResponse } from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

class UserController {
    /**
     * GET /api/users/profile
     * Get current user's profile
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
     * PUT /api/users/profile
     * Update current user's profile
     */
    updateProfile = asyncHandler(async (req, res) => {
        const { firstName, lastName, phone, dateOfBirth, settings } = req.body;

        const user = await userService.updateProfile(req.userId, {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            settings,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Profile updated successfully',
            data: user,
        });
    });

    /**
     * GET /api/users/notifications
     * Get user's notifications
     */
    getNotifications = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const notifications = await userService.getNotifications(req.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            unreadOnly: unreadOnly === 'true',
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Notifications retrieved successfully',
            data: notifications,
        });
    });

    /**
     * PUT /api/users/notifications/:id/read
     * Mark notification as read
     */
    markNotificationRead = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await userService.markNotificationRead(req.userId, id);

        return successResponse(res, {
            statusCode: 200,
            message: 'Notification marked as read',
        });
    });

    /**
     * PUT /api/users/notifications/read-all
     * Mark all notifications as read
     */
    markAllNotificationsRead = asyncHandler(async (req, res) => {
        await userService.markAllNotificationsRead(req.userId);

        return successResponse(res, {
            statusCode: 200,
            message: 'All notifications marked as read',
        });
    });

    // ==========================================
    // Admin Endpoints
    // ==========================================

    /**
     * GET /api/users
     * List all users (admin only)
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, role, status, search } = req.query;

        const users = await userService.getAllUsers({
            page: parseInt(page),
            limit: parseInt(limit),
            role,
            status,
            search,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Users retrieved successfully',
            data: users,
        });
    });

    /**
     * GET /api/users/:id
     * Get user by ID (admin only)
     */
    getUserById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const user = await userService.getById(id);

        return successResponse(res, {
            statusCode: 200,
            message: 'User retrieved successfully',
            data: user,
        });
    });

    /**
     * PUT /api/users/:id
     * Update user (admin only) - currently supports updating role
     */
    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;

        const user = await userService.updateRole(id, role, req.userId);

        logger.info(`User ${id} updated by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'User updated successfully',
            data: user,
        });
    });

    /**
     * PUT /api/users/:id/suspend
     * Suspend a user (admin only)
     */
    suspendUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;

        await userService.suspendUser(id, reason, req.userId);

        logger.info(`User ${id} suspended by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'User suspended successfully',
        });
    });

    /**
     * PUT /api/users/:id/activate
     * Activate a user (admin only)
     */
    activateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await userService.activateUser(id, req.userId);

        logger.info(`User ${id} activated by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'User activated successfully',
        });
    });

    /**
     * GET /api/users/stats
     * Get user statistics (admin only)
     */
    getUserStats = asyncHandler(async (req, res) => {
        const stats = await userService.getStats();

        return successResponse(res, {
            statusCode: 200,
            message: 'User statistics retrieved successfully',
            data: stats,
        });
    });
}

export default new UserController();
