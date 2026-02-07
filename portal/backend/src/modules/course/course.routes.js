/**
 * Course Routes
 * Handles course browsing and admin management endpoints
 */

import { Router } from 'express';
import courseController from './course.controller.js';
import { authenticate, requireRole, optionalAuth } from '../shared/auth/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import courseValidator from './course.validator.js';

const router = Router();

// ==========================================
// Public Routes
// ==========================================

// List and browse courses
router.get('/', courseController.getAllCourses);
router.get('/categories', courseController.getCategories);
router.get('/popular', courseController.getPopularCourses);
router.get('/:id', validate(courseValidator.getCourseById), courseController.getCourseById);

// ==========================================
// Admin Routes
// ==========================================

// Course statistics
router.get('/admin/stats', authenticate, requireRole(['admin']), courseController.getCourseStats);

// Create course
router.post('/', authenticate, requireRole(['admin']), validate(courseValidator.createCourse), courseController.createCourse);

// Update course
router.put('/:id', authenticate, requireRole(['admin']), validate(courseValidator.updateCourse), courseController.updateCourse);

// Delete course
router.delete('/:id', authenticate, requireRole(['admin']), validate(courseValidator.getCourseById), courseController.deleteCourse);

// Moodle sync
router.post('/sync-moodle', authenticate, requireRole(['admin']), courseController.syncFromMoodle);

export default router;
