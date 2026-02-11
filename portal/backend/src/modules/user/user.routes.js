/**
 * User Routes
 * Handles user profile and admin management endpoints
 */

import { Router } from 'express';
import userController from './user.controller.js';
import { authenticate, requireRole } from '../shared/auth/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import userValidator from './user.validator.js';

const router = Router();

// ==========================================
// Authenticated User Routes
// ==========================================

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieve the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     description: Update profile information for the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "+233241234567"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/profile', authenticate, validate(userValidator.updateProfile), userController.updateProfile);

/**
 * @openapi
 * /users/notifications:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user notifications
 *     description: Retrieve notifications for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter to show only unread notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         notifications:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Notification'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/notifications', authenticate, userController.getNotifications);

/**
 * @openapi
 * /users/notifications/{id}/read:
 *   put:
 *     tags:
 *       - Users
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/notifications/:id/read', authenticate, userController.markNotificationRead);

/**
 * @openapi
 * /users/notifications/read-all:
 *   put:
 *     tags:
 *       - Users
 *     summary: Mark all notifications as read
 *     description: Mark all user notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/notifications/read-all', authenticate, userController.markAllNotificationsRead);

// ==========================================
// Admin Routes
// ==========================================

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users (Admin)
 *     description: Retrieve a paginated list of all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, teacher, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, suspended]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, requireRole('admin'), userController.getAllUsers);

/**
 * @openapi
 * /users/stats:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user statistics (Admin)
 *     description: Retrieve statistics about users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                         activeUsers:
 *                           type: integer
 *                         suspendedUsers:
 *                           type: integer
 *                         usersByRole:
 *                           type: object
 */
router.get('/stats', authenticate, requireRole('admin'), userController.getUserStats);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID (Admin)
 *     description: Retrieve a specific user's details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, requireRole(['admin']), userController.getUserById);

/**
 * @openapi
 * /users/{id}/suspend:
 *   put:
 *     tags:
 *       - Users
 *     summary: Suspend user (Admin)
 *     description: Suspend a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for suspension
 *     responses:
 *       200:
 *         description: User suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/:id/suspend', authenticate, requireRole(['admin']), validate(userValidator.suspendUser), userController.suspendUser);

/**
 * @openapi
 * /users/{id}/activate:
 *   put:
 *     tags:
 *       - Users
 *     summary: Activate user (Admin)
 *     description: Activate a suspended user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/:id/activate', authenticate, requireRole(['admin']), userController.activateUser);

export default router;
