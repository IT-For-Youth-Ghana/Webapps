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

// Profile management
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(userValidator.updateProfile), userController.updateProfile);

// Notifications
router.get('/notifications', authenticate, userController.getNotifications);
router.put('/notifications/:id/read', authenticate, userController.markNotificationRead);
router.put('/notifications/read-all', authenticate, userController.markAllNotificationsRead);

// ==========================================
// Admin Routes
// ==========================================

// List all users
router.get('/', authenticate, requireRole(['admin']), userController.getAllUsers);

// User statistics
router.get('/stats', authenticate, requireRole(['admin']), userController.getUserStats);

// Get specific user
router.get('/:id', authenticate, requireRole(['admin']), userController.getUserById);

// Suspend/activate user
router.put('/:id/suspend', authenticate, requireRole(['admin']), validate(userValidator.suspendUser), userController.suspendUser);
router.put('/:id/activate', authenticate, requireRole(['admin']), userController.activateUser);

export default router;
