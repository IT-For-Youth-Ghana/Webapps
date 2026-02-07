/**
 * Course Controller
 * Handles course management endpoints
 */

import courseService from './course.service.js';
import cacheService from '../../config/redis.js';
import { successResponse } from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

class CourseController {
    /**
     * GET /api/courses
     * List all courses (public)
     */
    getAllCourses = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, category, level, search, status = 'active' } = req.query;

        // Generate cache key based on query params
        const cacheKey = cacheService.buildKey('courses', 'list', JSON.stringify({ page, limit, category, level, search, status }));

        const courses = await cacheService.getOrSet(
            cacheKey,
            () => courseService.getAll({
                page: parseInt(page),
                limit: parseInt(limit),
                category,
                level,
                search,
                status,
            }),
            cacheService.ttl.courses
        );

        return successResponse(res, {
            statusCode: 200,
            message: 'Courses retrieved successfully',
            data: courses,
        });
    });

    /**
     * GET /api/courses/categories
     * Get all course categories (public)
     */
    getCategories = asyncHandler(async (req, res) => {
        const cacheKey = cacheService.buildKey('categories', 'all');

        const categories = await cacheService.getOrSet(
            cacheKey,
            () => courseService.getCategories(),
            cacheService.ttl.categories
        );

        return successResponse(res, {
            statusCode: 200,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    });

    /**
     * GET /api/courses/popular
     * Get popular courses (public)
     */
    getPopularCourses = asyncHandler(async (req, res) => {
        const { limit = 6 } = req.query;

        const cacheKey = cacheService.buildKey('courses', 'popular', limit);

        const courses = await cacheService.getOrSet(
            cacheKey,
            () => courseService.getPopular(parseInt(limit)),
            cacheService.ttl.popularCourses
        );

        return successResponse(res, {
            statusCode: 200,
            message: 'Popular courses retrieved successfully',
            data: courses,
        });
    });

    /**
     * GET /api/courses/:id
     * Get course details (public)
     */
    getCourseById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const cacheKey = cacheService.buildKey('courses', 'detail', id);

        const course = await cacheService.getOrSet(
            cacheKey,
            () => courseService.getById(id),
            cacheService.ttl.courses
        );

        return successResponse(res, {
            statusCode: 200,
            message: 'Course retrieved successfully',
            data: course,
        });
    });

    // ==========================================
    // Admin Endpoints
    // ==========================================

    /**
     * POST /api/courses
     * Create a new course (admin only)
     */
    createCourse = asyncHandler(async (req, res) => {
        const courseData = req.body;

        const course = await courseService.create(courseData, req.userId);

        // Invalidate course caches
        await cacheService.invalidateCourses();

        logger.info(`Course ${course.id} created by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 201,
            message: 'Course created successfully',
            data: course,
        });
    });

    /**
     * PUT /api/courses/:id
     * Update a course (admin only)
     */
    updateCourse = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const courseData = req.body;

        const course = await courseService.update(id, courseData, req.userId);

        // Invalidate course caches
        await cacheService.invalidateCourses();

        logger.info(`Course ${id} updated by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'Course updated successfully',
            data: course,
        });
    });

    /**
     * DELETE /api/courses/:id
     * Delete a course (admin only)
     */
    deleteCourse = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await courseService.delete(id, req.userId);

        // Invalidate course caches
        await cacheService.invalidateCourses();

        logger.info(`Course ${id} deleted by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'Course deleted successfully',
        });
    });

    /**
     * POST /api/courses/sync-moodle
     * Sync courses from Moodle (admin only)
     */
    syncFromMoodle = asyncHandler(async (req, res) => {
        const result = await courseService.syncFromMoodle();

        // Invalidate course caches after sync
        await cacheService.invalidateCourses();

        logger.info(`Moodle sync completed by admin ${req.userId}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'Moodle sync completed',
            data: result,
        });
    });

    /**
     * GET /api/courses/stats
     * Get course statistics (admin only)
     */
    getCourseStats = asyncHandler(async (req, res) => {
        const stats = await courseService.getStats();

        return successResponse(res, {
            statusCode: 200,
            message: 'Course statistics retrieved successfully',
            data: stats,
        });
    });
}

export default new CourseController();
