/**
 * Enrollment Service
 * Business logic for enrollment management
 */

import Enrollment from "./enrollment.model.js";
import StudentProgress from "./student-progress.model.js";
import Course from "../course/course.model.js";
import CourseModule from "../course/course-module.model.js";
import User from "../user/user.model.js";
import { NotFoundError, ValidationError, AppError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import moodleService from "../../integrations/moodle/moodle.service.js";
import incubatorService from "../../integrations/incubator/incubator.service.js";
import emailService from "../shared/email/email.service.js";
import notificationService from "../shared/notification/notification.service.js";

class EnrollmentService {

    /**
     * Create pending enrollment
     */
    async createPending(userId, courseId, options = {}) {
        const { transaction } = options;

        // Verify course exists and is active
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        if (course.status !== "active") {
            throw new ValidationError("Course is not active");
        }

        // Check for duplicate enrollment
        const existing = await Enrollment.findOne({
            where: { userId, courseId },
        });

        if (existing) {
            if (existing.enrollmentStatus === "dropped") {
                // Reactivate dropped enrollment
                await existing.update({ enrollmentStatus: "pending", paymentStatus: "pending" }, { transaction });
                return existing;
            }
            throw new ValidationError("Already enrolled in this course");
        }

        // Create pending enrollment
        const enrollment = await Enrollment.create(
            {
                userId,
                courseId,
                paymentStatus: "pending",
                enrollmentStatus: "pending",
            },
            { transaction }
        );

        logger.info(`Pending enrollment created: ${enrollment.id}`);

        return enrollment;
    }

    /**
     * Complete enrollment after payment
     */
    async completeEnrollment(enrollmentId, paymentReference) {
        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        // Get user and course
        const user = await User.findByPk(enrollment.userId);
        const course = await Course.findByPk(enrollment.courseId);

        try {
            // Use transaction for all operations
            await Enrollment.executeInTransaction(async (transaction) => {

                // 1. Create Moodle user if needed
                if (!user.moodleUserId && course.moodleCourseId) {
                    try {
                        const moodleUser = await moodleService.createUser({
                            username: `${user.email.split("@")[0]}_${user.id}`,
                            password: user.tempPassword || "TempPass123!",
                            firstname: user.firstName,
                            lastname: user.lastName,
                            email: user.email,
                        });

                        await user.update(
                            { moodleUserId: moodleUser.id },
                            { transaction }
                        );
                    } catch (error) {
                        logger.error("Failed to create Moodle user", error);
                        // Continue without Moodle - can be synced later
                    }
                }

                // 2. Enroll in Moodle course
                if (user.moodleUserId && course.moodleCourseId) {
                    try {
                        await moodleService.enrollUser(
                            user.moodleUserId,
                            course.moodleCourseId
                        );
                    } catch (error) {
                        logger.error("Failed to enroll in Moodle", error);
                    }
                }

                // 3. Create Incubator user if needed
                if (!user.incubatorUserId) {
                    try {
                        const incubatorUser = await incubatorService.createUser({
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            centralUserId: user.id,
                        });

                        await user.update(
                            { incubatorUserId: incubatorUser._id },
                            { transaction }
                        );
                    } catch (error) {
                        logger.error("Failed to create Incubator user", error);
                        // Continue without Incubator - can be synced later
                    }
                }

                // 4. Update enrollment
                await enrollment.update(
                    {
                        paymentStatus: "completed",
                        enrollmentStatus: "enrolled",
                        paymentReference,
                        enrolledAt: new Date(),
                    },
                    { transaction }
                );

                // 5. Initialize progress records for all modules
                const modules = await CourseModule.findAll({
                    where: { courseId: course.id },
                });

                for (const module of modules) {
                    await StudentProgress.findOrCreate({
                        where: { enrollmentId: enrollment.id, moduleId: module.id },
                        defaults: { status: "not_started" },
                        transaction,
                    });
                }

                logger.info(`Enrollment ${enrollmentId} completed`);
            });

            // 5. Send notifications (outside transaction)
            await emailService.sendWelcomeEmail(user, course);

            await notificationService.notifyEnrollmentSuccess(user.id, course);

            return { success: true };

        } catch (error) {
            logger.error(`Enrollment completion failed: ${error.message}`);

            // Mark enrollment as failed
            await enrollment.update({
                enrollmentStatus: "failed",
            });

            throw new AppError("Failed to complete enrollment", 500);
        }
    }

    /**
     * Get student enrollments
     */
    async getStudentEnrollments(userId, filters = {}) {
        const { status, page = 1, limit = 10 } = filters;

        const where = { userId };
        if (status) where.enrollmentStatus = status;

        const result = await Enrollment.paginate({
            page,
            limit,
            where,
            include: [
                {
                    model: Course,
                    as: "course",
                },
            ],
            order: [["enrolledAt", "DESC"]],
        });

        return result;
    }

    /**
     * Get enrollment details with progress
     */
    async getEnrollmentDetails(userId, enrollmentId) {
        const enrollment = await Enrollment.findOne({
            where: { id: enrollmentId, userId },
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
                },
            ],
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        return enrollment.toJSON();
    }

    /**
     * Update module progress
     */
    async updateModuleProgress(enrollmentId, moduleId, data) {
        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        // Find or create progress record
        const [progress, created] = await StudentProgress.findOrCreate({
            where: { enrollmentId, moduleId },
            defaults: { status: "not_started" },
        });

        // Update progress
        await progress.update({
            status: data.status || progress.status,
            score: data.score !== undefined ? data.score : progress.score,
            startedAt: data.status === "in_progress" && !progress.startedAt ? new Date() : progress.startedAt,
            completedAt: data.status === "completed" && !progress.completedAt ? new Date() : progress.completedAt,
        });

        // Recalculate overall progress
        await this.recalculateProgress(enrollmentId);

        logger.info(`Module ${moduleId} progress updated for enrollment ${enrollmentId}`);

        return progress.toJSON();
    }

    /**
     * Recalculate overall enrollment progress
     */
    async recalculateProgress(enrollmentId) {
        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        // Get total and completed modules
        const totalModules = await CourseModule.count({
            where: { courseId: enrollment.courseId },
        });

        const completedModules = await StudentProgress.count({
            where: { enrollmentId, status: "completed" },
        });

        const progressPercentage = totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

        const updateData = {
            progressPercentage,
            lastAccessed: new Date(),
        };

        // Auto-complete if 100%
        if (progressPercentage === 100 && enrollment.enrollmentStatus !== "completed") {
            updateData.enrollmentStatus = "completed";
            updateData.completedAt = new Date();

            // Send completion notification
            const user = await User.findByPk(enrollment.userId);
            const course = await Course.findByPk(enrollment.courseId);

            await notificationService.notifyCourseCompletion(user.id, course);
        }

        await enrollment.update(updateData);

        return enrollment.toJSON();
    }

    /**
     * Get course enrollments (Admin/Teacher)
     */
    async getCourseEnrollments(courseId, filters = {}) {
        const { page = 1, limit = 20, status } = filters;

        const where = { courseId };
        if (status) where.enrollmentStatus = status;

        const result = await Enrollment.paginate({
            page,
            limit,
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
            order: [["enrolledAt", "DESC"]],
        });

        return result;
    }

    /**
     * Drop enrollment
     */
    async dropEnrollment(userId, enrollmentId) {
        const enrollment = await Enrollment.findOne({
            where: { id: enrollmentId, userId },
        });

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.enrollmentStatus === "completed") {
            throw new ValidationError("Cannot drop completed course");
        }

        await enrollment.update({
            enrollmentStatus: "dropped",
        });

        logger.info(`Enrollment ${enrollmentId} dropped by user ${userId}`);

        return { success: true };
    }

    /**
     * Get enrollment by ID
     */
    async findById(enrollmentId) {
        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found");
        }

        return enrollment;
    }

    /**
     * Check if user is enrolled in course
     */
    async isEnrolled(userId, courseId) {
        const enrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId,
                enrollmentStatus: { [Enrollment.sequelize.Op.in]: ["enrolled", "completed"] },
            },
        });

        return !!enrollment;
    }
}

export default new EnrollmentService();
