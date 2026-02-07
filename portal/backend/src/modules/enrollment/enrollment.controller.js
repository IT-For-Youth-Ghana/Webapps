/**
 * Enrollment Controller
 * Handles enrollment management endpoints
 */

import enrollmentService from './enrollment.service.js';
import { successResponse } from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

class EnrollmentController {
    /**
     * GET /api/enrollments
     * Get current user's enrollments
     */
    getMyEnrollments = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, status } = req.query;

        const enrollments = await enrollmentService.getByUser(req.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Enrollments retrieved successfully',
            data: enrollments,
        });
    });

    /**
     * GET /api/enrollments/:id
     * Get enrollment details with progress
     */
    getEnrollmentDetails = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const enrollment = await enrollmentService.getById(id, req.userId);

        return successResponse(res, {
            statusCode: 200,
            message: 'Enrollment retrieved successfully',
            data: enrollment,
        });
    });

    /**
     * POST /api/enrollments
     * Create a new enrollment (initiates payment flow)
     */
    createEnrollment = asyncHandler(async (req, res) => {
        const { courseId } = req.body;

        const result = await enrollmentService.createPending(req.userId, courseId);

        return successResponse(res, {
            statusCode: 201,
            message: 'Enrollment initiated. Please complete payment.',
            data: result,
        });
    });

    /**
     * PUT /api/enrollments/:id/progress/:moduleId
     * Update module progress
     */
    updateProgress = asyncHandler(async (req, res) => {
        const { id, moduleId } = req.params;
        const { progress, status } = req.body;

        const result = await enrollmentService.updateModuleProgress(
            id,
            moduleId,
            { progress, status },
            req.userId
        );

        return successResponse(res, {
            statusCode: 200,
            message: 'Progress updated successfully',
            data: result,
        });
    });

    /**
     * PUT /api/enrollments/:id/drop
     * Drop from course
     */
    dropEnrollment = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;

        await enrollmentService.dropEnrollment(id, req.userId, reason);

        logger.info(`User ${req.userId} dropped enrollment ${id}`);

        return successResponse(res, {
            statusCode: 200,
            message: 'Successfully dropped from course',
        });
    });

    /**
     * GET /api/enrollments/:id/certificate
     * Get enrollment certificate (if completed)
     */
    getCertificate = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const certificate = await enrollmentService.getCertificate(id, req.userId);

        return successResponse(res, {
            statusCode: 200,
            message: 'Certificate retrieved successfully',
            data: certificate,
        });
    });

    // ==========================================
    // Admin/Teacher Endpoints
    // ==========================================

    /**
     * GET /api/enrollments/course/:courseId
     * Get all enrollments for a course (admin/teacher)
     */
    getCourseEnrollments = asyncHandler(async (req, res) => {
        const { courseId } = req.params;
        const { page = 1, limit = 50, status } = req.query;

        const enrollments = await enrollmentService.getByCourse(courseId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Course enrollments retrieved successfully',
            data: enrollments,
        });
    });

    /**
     * GET /api/enrollments/stats
     * Get enrollment statistics (admin)
     */
    getEnrollmentStats = asyncHandler(async (req, res) => {
        const stats = await enrollmentService.getStats();

        return successResponse(res, {
            statusCode: 200,
            message: 'Enrollment statistics retrieved successfully',
            data: stats,
        });
    });
}

export default new EnrollmentController();
