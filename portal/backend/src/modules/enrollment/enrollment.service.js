/**
 * Enhanced Enrollment Service
 * Business logic for enrollment management with queue integration
 * Refactored for Phase 2 queue integration
 */

import Enrollment from "./enrollment.model.js";
import StudentProgress from "./student-progress.model.js";
import Course from "../course/course.model.js";
import CourseModule from "../course/course-module.model.js";
import User from "../user/user.model.js";
import { NotFoundError, ValidationError, AppError, ConflictError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import cacheService from "../../config/redis.js";

// Queue imports
import { enrollmentQueue, emailQueue } from "../../queues/index.js";
import syncQueue from "../../queues/services/sync.queue.js";

class EnrollmentService {
    /**
     * Create pending enrollment
     * Enhanced with validation and duplicate checking
     */
    async createPending(userId, courseId, options = {}) {
        const { transaction } = options;

        // Verify course exists and is active
        const course = await Course.findByPk(courseId, { transaction });

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        if (course.status !== "active") {
            throw new ValidationError("Course is not available for enrollment");
        }

        // Verify user exists and is active
        const user = await User.findByPk(userId, { transaction });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (user.status !== "active") {
            throw new ValidationError("User account is not active");
        }

        // Check for duplicate enrollment
        const existing = await Enrollment.findOne({
            where: { userId, courseId },
            transaction,
        });

        if (existing) {
            // Allow re-enrollment if dropped
            if (existing.enrollmentStatus === "dropped") {
                await existing.update(
                    {
                        enrollmentStatus: "pending",
                        paymentStatus: "pending",
                        droppedAt: null,
                    },
                    { transaction }
                );

                logger.info(`Re-enrolling user ${userId} in course ${courseId}`);
                return existing;
            }

            // Check if already enrolled or completed
            if (['enrolled', 'completed'].includes(existing.enrollmentStatus)) {
                throw new ConflictError("Already enrolled in this course");
            }

            // Return existing pending enrollment
            if (existing.enrollmentStatus === 'pending') {
                logger.info(`Returning existing pending enrollment for user ${userId}, course ${courseId}`);
                return existing;
            }
        }

        // Validate Moodle integration if enabled
        const moodleService = (await import("../../integrations/moodle/moodle.service.js")).default;

        if (moodleService.enabled && course.moodleCourseId) {
            try {
                const moodleCourse = await moodleService.getCourseById(course.moodleCourseId);

                if (!moodleCourse) {
                    throw new ValidationError("Course is temporarily unavailable on LMS");
                }
            } catch (err) {
                if (err instanceof ValidationError) throw err;
                logger.error("Moodle course validation failed", {
                    courseId: course.id,
                    error: err?.message
                });
                // Continue without blocking - Moodle sync can happen later
            }
        }

        // Create pending enrollment
        const enrollment = await Enrollment.create(
            {
                userId,
                courseId,
                paymentStatus: "pending",
                enrollmentStatus: "pending",
                progressPercentage: 0,
            },
            { transaction }
        );

        logger.info(`Pending enrollment created: ${enrollment.id}`, {
            userId,
            courseId,
        });

        return enrollment;
    }

    /**
     * Complete enrollment after payment
     * Enhanced with queue integration - now non-blocking
     */
    async completeEnrollment(enrollmentId, paymentReference) {
        const enrollment = await Enrollment.findByPk(enrollmentId, {
            include: [
                { model: User, as: 'user' },
                { model: Course, as: 'course' },
            ],
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        // Check if already completed
        if (enrollment.enrollmentStatus === 'enrolled') {
            logger.info(`Enrollment ${enrollmentId} already completed`);
            return { success: true, alreadyCompleted: true };
        }

        // Update enrollment status immediately
        await enrollment.update({
            paymentStatus: 'completed',
            enrollmentStatus: 'enrolled',
            paymentReference,
            enrolledAt: new Date(),
        });

        // Invalidate cache
        await cacheService.deletePattern(cacheService.buildKey('enrollment', enrollmentId, '*'));
        await cacheService.deletePattern(cacheService.buildKey('user', enrollment.userId, '*'));

        // Queue background tasks (Phase 2) - Non-blocking
        try {
            // Immediate Moodle enrollment sync (high priority)
            if (enrollment.course.moodleCourseId) {
                await syncQueue.addUserEnrollmentSyncJob(
                    enrollment.userId,
                    enrollment.courseId
                );
            }

            // Queue Moodle enrollment sync (fallback/background)
            if (enrollment.course.moodleCourseId) {
                await enrollmentQueue.syncMoodleEnrollment(
                    enrollment.userId,
                    enrollment.courseId,
                    enrollmentId
                );
            }

            // Queue Incubator profile sync
            await enrollmentQueue.syncIncubatorProfile(enrollment.userId);

            // Queue progress initialization
            await enrollmentQueue.initializeProgress(enrollmentId);

            // Queue course enrollment confirmation email
            await emailQueue.sendCourseEnrollmentEmail(
                enrollment.userId,
                enrollment.courseId
            );

        } catch (error) {
            // Log but don't fail enrollment
            logger.error('Failed to queue post-enrollment tasks', {
                enrollmentId,
                error: error.message,
            });
        }

        logger.info(`Enrollment ${enrollmentId} completed successfully`);

        return { success: true };
    }

    /**
     * Get student enrollments with caching
     */
    async getStudentEnrollments(userId, filters = {}) {
        const { status, page = 1, limit = 10 } = filters;

        // Build cache key
        const cacheKey = cacheService.buildKey('user', userId, 'enrollments', JSON.stringify(filters));
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const where = { userId };
        if (status) {
            where.enrollmentStatus = status === "active" ? "enrolled" : status;
        }

        const result = await Enrollment.paginate({
            page,
            limit,
            where,
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ['id', 'title', 'slug', 'thumbnailUrl', 'level', 'durationWeeks', 'moodleCourseId'],
                },
            ],
            order: [["enrolledAt", "DESC"]],
        });

        // Cache for 2 minutes
        await cacheService.set(cacheKey, result, 120);

        return result;
    }

    /**
     * Get enrollment details with progress
     * Enhanced with caching
     */
    async getEnrollmentDetails(enrollmentId, userId) {
        // Build cache key
        const cacheKey = cacheService.buildKey('enrollment', enrollmentId, 'details');
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            // Verify ownership if userId provided
            if (userId && cached.userId !== userId) {
                throw new NotFoundError("Enrollment not found");
            }
            return cached;
        }

        const enrollment = await Enrollment.findOne({
            where: { id: enrollmentId, ...(userId ? { userId } : {}) },
            include: [
                {
                    model: Course,
                    as: "course",
                    include: [
                        {
                            model: User,
                            as: "teachers",
                            through: { attributes: [] },
                            attributes: ["id", "firstName", "lastName"],
                        },
                        {
                            model: CourseModule,
                            as: "modules",
                            order: [["orderIndex", "ASC"]],
                        },
                    ],
                },
                {
                    model: StudentProgress,
                    as: "progressRecords",
                    include: [
                        {
                            model: CourseModule,
                            as: "module",
                        },
                    ],
                    order: [['moduleId', 'ASC']],
                },
            ],
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        const details = enrollment.toJSON();

        // Cache for 1 minute (frequently updated)
        await cacheService.set(cacheKey, details, 60);

        return details;
    }

    /**
     * Update module progress
     * Enhanced with queue integration for calculation
     */
    async updateModuleProgress(enrollmentId, moduleId, data, userId) {
        const enrollment = await Enrollment.findOne({
            where: {
                id: enrollmentId,
                ...(userId ? { userId } : {})
            },
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.enrollmentStatus !== 'enrolled') {
            throw new ValidationError("Cannot update progress for non-enrolled status");
        }

        // Verify module belongs to course
        const module = await CourseModule.findOne({
            where: {
                id: moduleId,
                courseId: enrollment.courseId,
            },
        });

        if (!module) {
            throw new NotFoundError("Module not found in this course");
        }

        // Find or create progress record
        const [progress, created] = await StudentProgress.findOrCreate({
            where: { enrollmentId, moduleId },
            defaults: { status: "not_started" },
        });

        // Validate status transition
        const validStatuses = ['not_started', 'in_progress', 'completed'];
        if (data.status && !validStatuses.includes(data.status)) {
            throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Validate score
        if (data.score !== undefined) {
            const score = parseFloat(data.score);
            if (isNaN(score) || score < 0 || score > 100) {
                throw new ValidationError('Score must be between 0 and 100');
            }
        }

        // Update progress
        const updateData = {};

        if (data.status) {
            updateData.status = data.status;
        }

        if (data.score !== undefined) {
            updateData.score = data.score;
        }

        // Auto-set timestamps
        if (data.status === 'in_progress' && !progress.startedAt) {
            updateData.startedAt = new Date();
        }

        if (data.status === 'completed' && !progress.completedAt) {
            updateData.completedAt = new Date();
        }

        await progress.update(updateData);

        // Queue progress recalculation (Phase 2) - Non-blocking
        await enrollmentQueue.calculateProgress(enrollmentId);

        // Invalidate cache
        await cacheService.deletePattern(cacheService.buildKey('enrollment', enrollmentId, '*'));

        logger.info(`Module ${moduleId} progress updated for enrollment ${enrollmentId}`);

        return progress.toJSON();
    }

    /**
     * Get course enrollments (Admin/Teacher)
     * Enhanced with caching
     */
    async getCourseEnrollments(courseId, filters = {}) {
        const { page = 1, limit = 20, status } = filters;

        // Build cache key
        const cacheKey = cacheService.buildKey('course', courseId, 'enrollments', JSON.stringify(filters));
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const where = { courseId };
        if (status) {
            where.enrollmentStatus = status === "active" ? "enrolled" : status;
        }

        const result = await Enrollment.paginate({
            page,
            limit,
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "phone"],
                },
            ],
            order: [["enrolledAt", "DESC"]],
        });

        // Cache for 2 minutes
        await cacheService.set(cacheKey, result, 120);

        return result;
    }

    /**
     * Drop enrollment
     * Enhanced with validation
     */
    async dropEnrollment(enrollmentId, userId, reason = null) {
        const enrollment = await Enrollment.findOne({
            where: {
                id: enrollmentId,
                ...(userId ? { userId } : {})
            },
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.enrollmentStatus === "completed") {
            throw new ValidationError("Cannot drop completed course");
        }

        if (enrollment.enrollmentStatus === "dropped") {
            throw new ValidationError("Enrollment already dropped");
        }

        await enrollment.update({
            enrollmentStatus: "dropped",
            droppedAt: new Date(),
            metadata: {
                ...enrollment.metadata,
                drop_reason: reason,
                dropped_at: new Date().toISOString(),
            },
        });

        // Invalidate cache
        await cacheService.deletePattern(cacheService.buildKey('enrollment', enrollmentId, '*'));
        await cacheService.deletePattern(cacheService.buildKey('user', enrollment.userId, '*'));

        logger.info(`Enrollment ${enrollmentId} dropped by user ${userId}`, { reason });

        return { success: true };
    }

    /**
     * Find enrollment by ID
     */
    async findById(enrollmentId, userId = null) {
        const enrollment = userId
            ? await Enrollment.findOne({ where: { id: enrollmentId, userId } })
            : await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        return enrollment;
    }

    /**
     * Get enrollment certificate (if completed)
     */
    async getCertificate(enrollmentId, userId) {
        const enrollment = await Enrollment.findOne({
            where: { id: enrollmentId, userId },
            include: [
                { model: Course, as: 'course' },
            ],
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.enrollmentStatus !== "completed") {
            throw new ValidationError("Course not completed yet");
        }

        // TODO: Generate actual certificate
        return {
            certificateUrl: `/certificates/${enrollment.id}`,
            issuedAt: enrollment.completedAt || new Date(),
            studentName: `${enrollment.user?.firstName} ${enrollment.user?.lastName}`,
            courseName: enrollment.course.title,
        };
    }

    /**
     * Get enrollment statistics (Admin)
     * Enhanced with caching
     */
    async getEnrollmentStats() {
        const cacheKey = cacheService.buildKey('enrollments', 'stats');
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const [
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            droppedEnrollments,
            pendingEnrollments,
        ] = await Promise.all([
            Enrollment.count(),
            Enrollment.count({ where: { enrollmentStatus: "enrolled" } }),
            Enrollment.count({ where: { enrollmentStatus: "completed" } }),
            Enrollment.count({ where: { enrollmentStatus: "dropped" } }),
            Enrollment.count({ where: { enrollmentStatus: "pending" } }),
        ]);

        const stats = {
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            droppedEnrollments,
            pendingEnrollments,
            completionRate: totalEnrollments > 0
                ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2)
                : 0,
        };

        // Cache for 5 minutes
        await cacheService.set(cacheKey, stats, 300);

        return stats;
    }

    /**
     * Check if user is enrolled in course
     */
    async isEnrolled(userId, courseId) {
        const enrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId,
                enrollmentStatus: {
                    [Enrollment.sequelize.Op.in]: ["enrolled", "completed"]
                },
            },
        });

        return !!enrollment;
    }

    /**
     * Get enrollment completion rate for a course
     */
    async getCourseCompletionRate(courseId) {
        const cacheKey = cacheService.buildKey('course', courseId, 'completion-rate');
        const cached = await cacheService.get(cacheKey);

        if (cached !== null) {
            return cached;
        }

        const [total, completed] = await Promise.all([
            Enrollment.count({
                where: {
                    courseId,
                    enrollmentStatus: {
                        [Enrollment.sequelize.Op.in]: ['enrolled', 'completed']
                    }
                }
            }),
            Enrollment.count({
                where: {
                    courseId,
                    enrollmentStatus: 'completed'
                }
            }),
        ]);

        const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

        // Cache for 10 minutes
        await cacheService.set(cacheKey, rate, 600);

        return parseFloat(rate);
    }

    /**
     * Get student's average progress across all enrollments
     */
    async getStudentAverageProgress(userId) {
        const enrollments = await Enrollment.findAll({
            where: {
                userId,
                enrollmentStatus: {
                    [Enrollment.sequelize.Op.in]: ['enrolled', 'completed']
                },
            },
            attributes: ['progressPercentage'],
        });

        if (enrollments.length === 0) {
            return 0;
        }

        const total = enrollments.reduce((sum, e) => sum + e.progressPercentage, 0);
        return Math.round(total / enrollments.length);
    }

    /**
     * Suspend enrollment (Admin)
     */
    async suspendEnrollment(enrollmentId, adminId, reason) {
        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.enrollmentStatus !== 'enrolled') {
            throw new ValidationError("Can only suspend active enrollments");
        }

        await enrollment.update({
            enrollmentStatus: 'suspended',
            metadata: {
                ...enrollment.metadata,
                suspended_by: adminId,
                suspended_reason: reason,
                suspended_at: new Date().toISOString(),
            },
        });

        // Invalidate cache
        await cacheService.deletePattern(cacheService.buildKey('enrollment', enrollmentId, '*'));

        logger.info(`Enrollment ${enrollmentId} suspended by admin ${adminId}`, { reason });

        return enrollment.toJSON();
    }

    /**
     * Reactivate suspended enrollment (Admin)
     */
    async reactivateEnrollment(enrollmentId, adminId) {
        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.enrollmentStatus !== 'suspended') {
            throw new ValidationError("Enrollment is not suspended");
        }

        await enrollment.update({
            enrollmentStatus: 'enrolled',
            metadata: {
                ...enrollment.metadata,
                reactivated_by: adminId,
                reactivated_at: new Date().toISOString(),
            },
        });

        // Invalidate cache
        await cacheService.deletePattern(cacheService.buildKey('enrollment', enrollmentId, '*'));

        logger.info(`Enrollment ${enrollmentId} reactivated by admin ${adminId}`);

        return enrollment.toJSON();
    }
}

export default new EnrollmentService();