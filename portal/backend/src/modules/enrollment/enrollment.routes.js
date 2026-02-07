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

/**
 * @openapi
 * /enrollments:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get user enrollments
 *     description: Retrieve all enrollments for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, completed, dropped]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, enrollmentController.getMyEnrollments);

/**
 * @openapi
 * /enrollments:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Create enrollment
 *     description: Enroll in a course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the course to enroll in
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Already enrolled or course not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, validate(enrollmentValidator.createEnrollment), enrollmentController.createEnrollment);

/**
 * @openapi
 * /enrollments/{id}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollment details
 *     description: Retrieve detailed information about a specific enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: Enrollment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, validate(enrollmentValidator.getEnrollmentById), enrollmentController.getEnrollmentDetails);

/**
 * @openapi
 * /enrollments/{id}/progress/{moduleId}:
 *   put:
 *     tags:
 *       - Enrollments
 *     summary: Update progress
 *     description: Update progress for a specific module in an enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enrollment ID
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/:id/progress/:moduleId', authenticate, validate(enrollmentValidator.updateProgress), enrollmentController.updateProgress);

/**
 * @openapi
 * /enrollments/{id}/drop:
 *   put:
 *     tags:
 *       - Enrollments
 *     summary: Drop enrollment
 *     description: Drop/cancel an enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enrollment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for dropping
 *     responses:
 *       200:
 *         description: Enrollment dropped successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put('/:id/drop', authenticate, validate(enrollmentValidator.dropEnrollment), enrollmentController.dropEnrollment);

/**
 * @openapi
 * /enrollments/{id}/certificate:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get certificate
 *     description: Get course completion certificate
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
 *         description: Certificate retrieved successfully
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
 *                         certificateUrl:
 *                           type: string
 *                         issuedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Course not completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/certificate', authenticate, enrollmentController.getCertificate);

// ==========================================
// Admin/Teacher Routes
// ==========================================

/**
 * @openapi
 * /enrollments/admin/stats:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollment statistics (Admin)
 *     description: Retrieve statistics about enrollments
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
 *                         totalEnrollments:
 *                           type: integer
 *                         activeEnrollments:
 *                           type: integer
 *                         completedEnrollments:
 *                           type: integer
 *                         droppedEnrollments:
 *                           type: integer
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/stats', authenticate, requireRole(['admin']), enrollmentController.getEnrollmentStats);

/**
 * @openapi
 * /enrollments/course/{courseId}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get course enrollments (Admin/Teacher)
 *     description: Retrieve all enrollments for a specific course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
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
 *                         enrollments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Enrollment'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/course/:courseId', authenticate, requireRole(['admin', 'teacher']), enrollmentController.getCourseEnrollments);

export default router;
