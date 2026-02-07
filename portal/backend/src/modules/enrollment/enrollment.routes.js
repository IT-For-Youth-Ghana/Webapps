/**
 * Enrollment Routes
 * Handles enrollment management endpoints
 */

import { Router } from 'express';
import enrollmentController from './enrollment.controller.js';
import { authenticate, requireRole } from '../shared/auth/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import enrollmentValidator from './enrollment.validator.js';

const router = Router();

// ==========================================
// Authenticated User Routes
// ==========================================

// Get user's enrollments
router.get('/', authenticate, enrollmentController.getMyEnrollments);

// Create enrollment
router.post('/', authenticate, validate(enrollmentValidator.createEnrollment), enrollmentController.createEnrollment);

// Get specific enrollment
router.get('/:id', authenticate, validate(enrollmentValidator.getEnrollmentById), enrollmentController.getEnrollmentDetails);

// Update progress
router.put('/:id/progress/:moduleId', authenticate, validate(enrollmentValidator.updateProgress), enrollmentController.updateProgress);

// Drop enrollment
router.put('/:id/drop', authenticate, validate(enrollmentValidator.dropEnrollment), enrollmentController.dropEnrollment);

// Get certificate
router.get('/:id/certificate', authenticate, enrollmentController.getCertificate);

// ==========================================
// Admin/Teacher Routes
// ==========================================

// Enrollment statistics
router.get('/admin/stats', authenticate, requireRole(['admin']), enrollmentController.getEnrollmentStats);

// Get course enrollments
router.get('/course/:courseId', authenticate, requireRole(['admin', 'teacher']), enrollmentController.getCourseEnrollments);

export default router;
