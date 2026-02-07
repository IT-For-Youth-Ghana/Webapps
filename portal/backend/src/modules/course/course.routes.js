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

/**
 * @openapi
 * /courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: List all courses
 *     description: Retrieve a list of all available courses
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses by title or description
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                         courses:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Course'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/', courseController.getAllCourses);

/**
 * @openapi
 * /courses/categories:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course categories
 *     description: Retrieve all available course categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 */
router.get('/categories', courseController.getCategories);

/**
 * @openapi
 * /courses/popular:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get popular courses
 *     description: Retrieve a list of popular courses based on enrollment count
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Popular courses retrieved successfully
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
 *                         $ref: '#/components/schemas/Course'
 */
router.get('/popular', courseController.getPopularCourses);

/**
 * @openapi
 * /courses/{id}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course details
 *     description: Retrieve detailed information about a specific course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validate(courseValidator.getCourseById), courseController.getCourseById);

// ==========================================
// Admin Routes
// ==========================================

/**
 * @openapi
 * /courses/admin/stats:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course statistics (Admin)
 *     description: Retrieve statistics about courses
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
 *                         totalCourses:
 *                           type: integer
 *                         activeCourses:
 *                           type: integer
 *                         totalEnrollments:
 *                           type: integer
 *                         coursesByCategory:
 *                           type: object
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/stats', authenticate, requireRole(['admin']), courseController.getCourseStats);

/**
 * @openapi
 * /courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create new course (Admin)
 *     description: Create a new course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - level
 *               - duration
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Web Development"
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               duration:
 *                 type: integer
 *                 description: Duration in weeks
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: "GHS"
 *               moodleCourseId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Course'
 */
router.post('/', authenticate, requireRole(['admin']), validate(courseValidator.createCourse), courseController.createCourse);

/**
 * @openapi
 * /courses/{id}:
 *   put:
 *     tags:
 *       - Courses
 *     summary: Update course (Admin)
 *     description: Update an existing course
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *               duration:
 *                 type: integer
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Course'
 */
router.put('/:id', authenticate, requireRole(['admin']), validate(courseValidator.updateCourse), courseController.updateCourse);

/**
 * @openapi
 * /courses/{id}:
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete course (Admin)
 *     description: Delete/deactivate a course
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
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete('/:id', authenticate, requireRole(['admin']), validate(courseValidator.getCourseById), courseController.deleteCourse);

/**
 * @openapi
 * /courses/sync-moodle:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Sync courses from Moodle (Admin)
 *     description: Synchronize courses from Moodle LMS
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses synced successfully
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
 *                         synced:
 *                           type: integer
 *                         updated:
 *                           type: integer
 *                         failed:
 *                           type: integer
 */
router.post('/sync-moodle', authenticate, requireRole(['admin']), courseController.syncFromMoodle);

export default router;
