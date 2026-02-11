/**
 * Enhanced Payment Service
 * Business logic for payment processing with queue integration
 * Refactored for Phase 2 queue integration
 */

import { Op } from "sequelize";
import Payment from "./payment.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import User from "../user/user.model.js";
import { NotFoundError, ValidationError, ConflictError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import paystackService from "../../integrations/paystack/paystack.service.js";
import cacheService from "../../config/redis.js";
import { v4 as uuidv4 } from "uuid";

// Queue imports
import { emailQueue, paymentQueue } from "../../queues/index.js";

class PaymentService {
    /**
     * Resolve user, enrollment, and course context for a payment
     */
    async resolveContext({ userId, enrollmentId, courseId, transaction }) {
        if (!userId) {
            throw new ValidationError("User ID is required");
        }

        let enrollment = null;
        let resolvedCourseId = courseId;

        if (enrollmentId) {
            enrollment = await Enrollment.findOne({
                where: { id: enrollmentId },
                transaction,
            });

            if (!enrollment) {
                throw new NotFoundError("Enrollment not found");
            }

            if (enrollment.userId !== userId) {
                throw new ValidationError("Enrollment does not belong to this user");
            }

            // Check if already paid
            if (enrollment.paymentStatus === 'completed') {
                throw new ConflictError("Enrollment already paid");
            }

            if (!resolvedCourseId) {
                resolvedCourseId = enrollment.courseId;
            }
        }

        if (!resolvedCourseId) {
            throw new ValidationError("Course ID or enrollment ID is required");
        }

        const [course, user] = await Promise.all([
            Course.findByPk(resolvedCourseId, { transaction }),
            User.findByPk(userId, { transaction }),
        ]);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        if (course.status !== 'active') {
            throw new ValidationError("Course is not available");
        }

        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (user.status !== 'active') {
            throw new ValidationError("User account is not active");
        }

        return {
            course,
            enrollment,
            user,
            courseId: resolvedCourseId,
            enrollmentId: enrollment?.id || enrollmentId || null,
        };
    }

    /**
     * Initialize payment with webhook backup
     * Enhanced with queue integration
     */
    async initialize({ userId, enrollmentId, courseId, transaction }) {
        const context = await this.resolveContext({
            userId,
            enrollmentId,
            courseId,
            transaction,
        });

        const { course, user } = context;
        let resolvedEnrollmentId = context.enrollmentId;
        let enrollment = context.enrollment;

        // Moodle Integration Check
        // Ensure user is not already enrolled in Moodle before taking payment
        if (course.moodleCourseId) {
            try {
                const moodleService = (await import("../../integrations/moodle/moodle.service.js")).default;
                if (moodleService.enabled) {
                    // Check if user exists in Moodle
                    const moodleUser = await moodleService.getUserByEmail(user.email);

                    if (moodleUser) {
                        // Check if enrolled
                        const completion = await moodleService.getCourseCompletion(course.moodleCourseId, moodleUser.id);
                        // Note: getCourseCompletion returns status, but we might need to check direct enrollment if completion is not enough
                        // For now, let's use the error handling of enrollUser or a specific check if available.
                        // Actually, let's use getEnrolledUsers filter if possible, or just proceed and handle duplicate enrollment gracefully later.
                        // But user specifically asked: "make sure they are not already enroled in the moodle before proceeding with the payment"

                        // A better way might be to check via core_enrol_get_users_courses
                        const userCourses = await moodleService.call('core_enrol_get_users_courses', { userid: moodleUser.id });
                        const isEnrolled = userCourses.some(c => c.id === course.moodleCourseId);

                        if (isEnrolled) {
                            throw new ConflictError("You are already enrolled in this course on the LMS.");
                        }
                    }
                }
            } catch (err) {
                // If Moodle check fails, we shouldn't block payment unless it's a critical conflict
                // But for "already enrolled" check, we should probably warn or block if we are sure.
                if (err instanceof ConflictError) throw err;
                logger.warn("Moodle pre-payment check failed", { error: err.message });
            }
        }

        // Create enrollment if not exists
        if (!resolvedEnrollmentId) {
            const enrollmentService = (await import("../enrollment/enrollment.service.js")).default;
            enrollment = await enrollmentService.createPending(userId, context.courseId, { transaction });
            resolvedEnrollmentId = enrollment.id;
        }

        // Handle free course
        if (course.isFree()) {
            const payment = await Payment.create(
                {
                    userId: user.id,
                    enrollmentId: resolvedEnrollmentId,
                    amount: 0,
                    currency: course.currency || "GHS",
                    paystackReference: `free_${uuidv4().replace(/-/g, "")}`,
                    status: "success",
                    paymentMethod: "free",
                    paidAt: new Date(),
                    metadata: {
                        course_id: context.courseId,
                        course_title: course.title,
                        enrollment_id: resolvedEnrollmentId,
                        free_enrollment: true,
                    },
                },
                { transaction }
            );

            // Queue enrollment completion (Phase 2)
            if (!transaction) {
                await paymentQueue.completeEnrollment(
                    resolvedEnrollmentId,
                    payment.paystackReference
                );
            }

            logger.info(`Free enrollment payment created: ${payment.paystackReference}`);

            return {
                payment: payment.toPublicJSON(),
                authorizationUrl: null,
                reference: payment.paystackReference,
                accessCode: null,
                enrollmentId: resolvedEnrollmentId,
                isFree: true,
            };
        }

        // Generate unique reference
        const reference = `ref_${uuidv4().replace(/-/g, "")}`;

        // Initialize with Paystack
        const paystackTransaction = await paystackService.initializeTransaction({
            email: user.email,
            amount: parseFloat(course.price),
            reference,
            callbackUrl: `${process.env.FRONTEND_URL}/dashboard/payments/verify`, // Ensure callback points to frontend verification page
            metadata: {
                user_id: user.id,
                enrollment_id: resolvedEnrollmentId,
                course_id: context.courseId,
                course_title: course.title,
                user_email: user.email,
                user_name: user.getFullName(),
            },
        });

        // Save payment record
        const payment = await Payment.create(
            {
                userId: user.id,
                enrollmentId: resolvedEnrollmentId,
                amount: course.price,
                currency: course.currency || "GHS",
                paystackReference: reference,
                paystackAccessCode: paystackTransaction.access_code,
                authorizationUrl: paystackTransaction.authorization_url,
                status: "pending",
                metadata: {
                    course_id: context.courseId,
                    course_title: course.title,
                },
            },
            { transaction }
        );

        // Queue webhook backup verification (Phase 2)
        // This ensures payment verification even if webhook fails
        if (!transaction) {
            await paymentQueue.verifyPaymentDelayed(reference, 5); // 5 minutes backup
        }

        logger.info(`Payment initialized: ${reference}`);

        return {
            payment: payment.toPublicJSON(),
            authorizationUrl: payment.authorizationUrl,
            reference: payment.paystackReference,
            accessCode: payment.paystackAccessCode,
            enrollmentId: resolvedEnrollmentId,
            isFree: false,
        };
    }

    /**
     * Verify payment (queued by Phase 2)
     * This method now just queues the verification
     */
    async verifyPayment(reference) {
        // Find payment
        const payment = await Payment.findOne({
            where: { paystackReference: reference },
            include: [{ model: User, as: 'user' }] // Include user for socket notification
        });

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        // If already successful, return immediately
        if (payment.status === 'success') {
            logger.info(`Payment already verified: ${reference}`);
            return {
                success: true,
                status: 'success',
                message: 'Payment already verified',
                paymentId: payment.id,
                enrollmentId: payment.enrollmentId,
            };
        }

        // Queue verification job (Phase 2)
        const job = await paymentQueue.verifyPayment(reference, payment.id);

        logger.info(`Payment verification queued: ${reference}`, { jobId: job.jobId });

        // Notify frontend that verification is in progress
        const { emitToUser } = await import("../../realtime/socket.js");
        if (payment.userId) {
            emitToUser(payment.userId, 'payment:verifying', {
                reference,
                message: 'Payment verification in progress...'
            });
        }

        return {
            success: true,
            queued: true,
            jobId: job.jobId,
            message: 'Payment verification in progress',
            paymentId: payment.id,
            enrollmentId: payment.enrollmentId,
        };
    }

    /**
     * Get payment status (for polling)
     * Enhanced with caching
     */
    async getPaymentStatus(reference) {
        // Try cache first
        const cacheKey = cacheService.buildKey('payment', 'status', reference);
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const payment = await Payment.findOne({
            where: { paystackReference: reference },
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    include: [
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'title', 'thumbnailUrl'],
                        },
                    ],
                },
            ],
        });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        const status = {
            reference: payment.paystackReference,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            paidAt: payment.paidAt,
            enrollmentId: payment.enrollmentId,
            enrollmentStatus: payment.enrollment?.enrollmentStatus || null,
            course: payment.enrollment?.course || null,
        };

        // Cache completed/failed payments for longer
        const ttl = ['success', 'failed', 'cancelled'].includes(payment.status) ? 3600 : 60;
        await cacheService.set(cacheKey, status, ttl);

        return status;
    }

    /**
     * Process webhook (queued by Phase 2)
     */
    async processWebhook(payload, signature) {
        // Validate signature
        const isValid = paystackService.validateWebhookSignature(payload, signature);

        if (!isValid) {
            logger.warn('Invalid webhook signature received');
            return { valid: false };
        }

        let parsed = payload;

        if (Buffer.isBuffer(payload)) {
            try {
                parsed = JSON.parse(payload.toString("utf8"));
            } catch (error) {
                throw new ValidationError("Invalid webhook payload");
            }
        } else if (typeof payload === "string") {
            try {
                parsed = JSON.parse(payload);
            } catch (error) {
                throw new ValidationError("Invalid webhook payload");
            }
        }

        if (!parsed?.event) {
            throw new ValidationError("Invalid webhook payload");
        }

        // Queue webhook processing (Phase 2)
        await paymentQueue.processWebhook(parsed.event, parsed.data || {});

        logger.info(`Webhook queued: ${parsed.event}`, { reference: parsed.data?.reference });

        return { valid: true, queued: true };
    }

    /**
     * Get user payment history with caching
     */
    async getPaymentHistory(userId, filters = {}) {
        const { page = 1, limit = 20, status } = filters;

        const where = { userId };
        if (status) {
            where.status = status;
        }

        const result = await Payment.paginate({
            page,
            limit,
            where,
            include: [
                {
                    model: Enrollment,
                    as: "enrollment",
                    include: [
                        {
                            model: Course,
                            as: "course",
                            attributes: ["id", "title", "thumbnailUrl", "slug"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return {
            payments: result.data.map((p) => p.toPublicJSON()),
            pagination: result.pagination,
        };
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(paymentId, userId = null) {
        const payment = await Payment.findByPk(paymentId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Enrollment,
                    as: "enrollment",
                    include: [
                        {
                            model: Course,
                            as: "course",
                        },
                    ],
                },
            ],
        });

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        if (userId && payment.userId !== userId) {
            throw new NotFoundError("Payment not found");
        }

        return payment.toPublicJSON();
    }

    /**
     * Get payment by reference
     */
    async getPaymentByReference(reference) {
        const payment = await Payment.findOne({
            where: { paystackReference: reference },
        });

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        return payment;
    }

    /**
     * Alias methods for compatibility
     */
    async getByUser(userId, filters = {}) {
        return this.getPaymentHistory(userId, filters);
    }

    async getById(paymentId, userId = null) {
        return this.getPaymentDetails(paymentId, userId);
    }

    /**
     * Get all payments (Admin) with caching
     */
    async getAll(filters = {}) {
        const { page = 1, limit = 50, status, startDate, endDate } = filters;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.createdAt = {
                ...(startDate && { [Op.gte]: new Date(startDate) }),
                ...(endDate && { [Op.lte]: new Date(endDate) }),
            };
        }

        const result = await Payment.paginate({
            page,
            limit,
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Enrollment,
                    as: "enrollment",
                    include: [{ model: Course, as: "course" }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return {
            payments: result.data.map((p) => p.toPublicJSON()),
            pagination: result.pagination,
        };
    }

    /**
     * Get revenue statistics (Admin) with caching
     */
    async getRevenueStats(period = "month") {
        const cacheKey = cacheService.buildKey('payments', 'stats', period);
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const { startDate, endDate } = this.resolveStatsRange(period);

        // Use createdAt for checking activity in the period
        const where = {
            createdAt: {
                [Op.between]: [startDate, endDate],
            },
        };

        // Aggregate by status
        const stats = await Payment.findAll({
            where,
            attributes: [
                'status',
                [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count'],
                [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']
            ],
            group: ['status'],
            raw: true,
        });

        // Process results
        let totalRevenue = 0;
        let successfulPayments = 0;
        let failedPayments = 0;
        let pendingPayments = 0;

        stats.forEach(stat => {
            const count = parseInt(stat.count, 10);
            const total = parseFloat(stat.total || 0);

            if (stat.status === 'success') {
                successfulPayments = count;
                totalRevenue = total;
            } else if (stat.status === 'failed') {
                failedPayments = count;
            } else if (stat.status === 'pending') {
                pendingPayments = count;
            }
        });

        const result = {
            period,
            startDate,
            endDate,
            totalRevenue,
            successfulPayments,
            failedPayments,
            pendingPayments,
        };

        // Cache for 10 minutes (shorter cache for admin dashboards)
        await cacheService.set(cacheKey, result, 600);

        return result;
    }

    /**
     * Resolve date range for stats
     */
    resolveStatsRange(period = "month") {
        const endDate = new Date();
        let startDate;

        switch (period) {
            case "day":
                startDate = new Date(endDate);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "week":
                startDate = new Date(endDate);
                startDate.setDate(endDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "month":
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                break;
            case "year":
                startDate = new Date(endDate.getFullYear(), 0, 1);
                break;
            default:
                throw new ValidationError("Invalid period. Use day, week, month, or year");
        }

        return { startDate, endDate };
    }

    /**
     * Get total revenue (Admin)
     */
    async getTotalRevenue() {
        const cacheKey = cacheService.buildKey('payments', 'total');
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const { QueryTypes } = await import("sequelize");

        const totals = await Payment.sequelize.query(
            `
            SELECT 
                currency,
                SUM(amount) as total,
                COUNT(*) as count
            FROM payments
            WHERE status = 'success'
            GROUP BY currency
            `,
            {
                type: QueryTypes.SELECT,
            }
        );

        // Cache for 10 minutes
        await cacheService.set(cacheKey, totals, 600);

        return totals;
    }

    /**
     * Retry failed payment
     */
    async retryPayment(paymentId, userId) {
        const payment = await Payment.findOne({
            where: { id: paymentId, userId, status: "failed" },
        });

        if (!payment) {
            throw new NotFoundError("Failed payment not found");
        }

        // Re-initialize payment
        return await this.initialize({
            userId: payment.userId,
            enrollmentId: payment.enrollmentId,
            courseId: payment.metadata?.course_id,
        });
    }

    /**
     * Cancel pending payment (Admin)
     */
    async cancelPayment(paymentId, adminId, reason) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        if (payment.status !== 'pending') {
            throw new ValidationError("Can only cancel pending payments");
        }

        await payment.update({
            status: 'cancelled',
            metadata: {
                ...payment.metadata,
                cancelled_by: adminId,
                cancelled_reason: reason,
                cancelled_at: new Date().toISOString(),
            }
        });

        // Invalidate cache
        await cacheService.delete(cacheService.buildKey('payment', 'status', payment.paystackReference));

        logger.info(`Payment ${paymentId} cancelled by admin ${adminId}`, { reason });

        return payment.toPublicJSON();
    }
}

export default new PaymentService();