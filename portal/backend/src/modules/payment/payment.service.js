/**
 * Payment Service
 * Business logic for payment processing
 */

import { Op } from "sequelize";
import Payment from "./payment.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import User from "../user/user.model.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import paystackService from "../../integrations/paystack/paystack.service.js";
import emailService from "../shared/email/email.service.js";
import notificationService from "../shared/notification/notification.service.js";
import { v4 as uuidv4 } from "uuid";

class PaymentService {
    /**
     * Resolve user, enrollment, and course context for a payment
     */
    async resolveContext({ userId, enrollmentId, courseId }) {
        if (!userId) {
            throw new ValidationError("User ID is required");
        }

        let enrollment = null;
        let resolvedCourseId = courseId;

        if (enrollmentId) {
            enrollment = await Enrollment.findByPk(enrollmentId);
            if (!enrollment) {
                throw new NotFoundError("Enrollment not found");
            }
            if (enrollment.userId !== userId) {
                throw new ValidationError("Enrollment does not belong to this user");
            }
            if (!resolvedCourseId) {
                resolvedCourseId = enrollment.courseId;
            }
        }

        if (!resolvedCourseId) {
            throw new ValidationError("Course ID or enrollment ID is required");
        }

        const [course, user] = await Promise.all([
            Course.findByPk(resolvedCourseId),
            User.findByPk(userId),
        ]);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        if (!user) {
            throw new NotFoundError("User not found");
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
     * Initialize payment
     */
    async initialize({ userId, enrollmentId, courseId, transaction }) {
        const context = await this.resolveContext({
            userId,
            enrollmentId,
            courseId,
        });

        const { course, user } = context;

        // Check for free course
        if (course.isFree()) {
            // Create a free payment record
            const payment = await Payment.create(
                {
                    userId: user.id,
                    enrollmentId: context.enrollmentId,
                    amount: 0,
                    currency: course.currency || "GHS",
                    paystackReference: `free_${uuidv4().replace(/-/g, "")}`,
                    status: "success",
                    paymentMethod: "free",
                    paidAt: new Date(),
                    metadata: {
                        course_id: context.courseId,
                        course_title: course.title,
                        free_enrollment: true,
                    },
                },
                { transaction }
            );

            logger.info(`Free enrollment payment created: ${payment.paystackReference}`);

            return {
                payment: payment.toPublicJSON(),
                authorizationUrl: null,
                reference: payment.paystackReference,
                accessCode: null,
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
            callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
            metadata: {
                user_id: user.id,
                enrollment_id: context.enrollmentId,
                course_id: context.courseId,
                course_title: course.title,
            },
        });

        // Save payment record
        const payment = await Payment.create(
            {
                userId: user.id,
                enrollmentId: context.enrollmentId,
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

        logger.info(`Payment initialized: ${reference}`);

        return {
            payment: payment.toPublicJSON(),
            authorizationUrl: payment.authorizationUrl,
            reference: payment.paystackReference,
            accessCode: payment.paystackAccessCode,
            isFree: false,
        };
    }

    /**
     * Verify payment (after callback or webhook)
     */
    async verifyPayment(reference) {
        // Verify with Paystack
        const paystackData = await paystackService.verifyTransaction(reference);

        // Get payment record
        const payment = await Payment.findOne({
            where: { paystackReference: reference },
            include: [
                { model: User, as: "user" },
                {
                    model: Enrollment,
                    as: "enrollment",
                    include: [{ model: Course, as: "course" }],
                },
            ],
        });

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        // Already processed
        if (payment.status === "success") {
            return {
                success: true,
                status: "success",
                message: "Payment already verified",
                paymentId: payment.id,
                enrollmentId: payment.enrollmentId,
            };
        }

        // Update payment status
        const isSuccess = paystackData.status === "success";

        await payment.update({
            status: isSuccess ? "success" : "failed",
            paymentMethod: paystackData.channel || payment.paymentMethod,
            paidAt: isSuccess ? new Date(paystackData.paidAt || Date.now()) : null,
        });

        logger.info(`Payment verified: ${reference} - ${paystackData.status}`);

        // Complete enrollment if successful
        if (isSuccess && payment.enrollment) {
            const enrollmentService = (await import("../enrollment/enrollment.service.js")).default;
            await enrollmentService.completeEnrollment(payment.enrollmentId, reference);

            // Send receipt
            await emailService.sendPaymentReceipt(
                payment.user,
                payment,
                payment.enrollment.course
            );

            // Notify user
            await notificationService.notifyPaymentSuccess(
                payment.userId,
                payment.amount,
                payment.currency,
                payment.enrollment.course.title
            );
        } else if (!isSuccess && payment.enrollmentId) {
            await Enrollment.update(
                { paymentStatus: "failed" },
                { where: { id: payment.enrollmentId } }
            );
        }

        return {
            success: isSuccess,
            status: isSuccess ? "success" : "failed",
            amount: paystackData.amount,
            paymentId: payment.id,
            enrollmentId: payment.enrollmentId,
        };
    }

    /**
     * Verify Paystack webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        return paystackService.validateWebhookSignature(payload, signature);
    }

    /**
     * Process Paystack webhook payload (raw body or parsed object)
     */
    async processWebhook(payload, signature) {
        const isValid = this.verifyWebhookSignature(payload, signature);
        if (!isValid) {
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

        await this.handleWebhook(parsed.event, parsed.data || {});

        return { valid: true };
    }

    /**
     * Handle Paystack webhook
     */
    async handleWebhook(event, data) {
        logger.info(`Paystack webhook received: ${event}`);

        switch (event) {
            case "charge.success":
                await this.verifyPayment(data.reference);
                break;

            case "charge.failed":
                await this.markPaymentFailed(data.reference);
                break;

            default:
                logger.info(`Unhandled webhook event: ${event}`);
        }

        return { received: true };
    }

    /**
     * Mark payment as failed
     */
    async markPaymentFailed(reference) {
        const payment = await Payment.findOne({
            where: { paystackReference: reference },
        });

        if (!payment) {
            logger.warn(`Payment not found for failed webhook: ${reference}`);
            return;
        }

        await payment.update({ status: "failed" });

        // Update enrollment
        if (payment.enrollmentId) {
            await Enrollment.update(
                { paymentStatus: "failed" },
                { where: { id: payment.enrollmentId } }
            );
        }

        logger.info(`Payment marked as failed: ${reference}`);
    }

    /**
     * Get user payment history
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
                            attributes: ["id", "title", "thumbnailUrl"],
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
     * Get payments for a user (alias)
     */
    async getByUser(userId, filters = {}) {
        return this.getPaymentHistory(userId, filters);
    }

    /**
     * Get payment by ID (alias)
     */
    async getById(paymentId, userId = null) {
        return this.getPaymentDetails(paymentId, userId);
    }

    /**
     * Get all payments (Admin)
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
     * Get revenue statistics (Admin)
     */
    async getRevenueStats(period = "month") {
        const { startDate, endDate } = this.resolveStatsRange(period);
        const { QueryTypes } = await import("sequelize");

        const stats = await Payment.sequelize.query(
            `
      SELECT 
        DATE(paid_at) as date,
        COUNT(*) as payment_count,
        SUM(amount) as total_revenue,
        currency
      FROM payments
      WHERE status = 'success'
        AND paid_at BETWEEN :startDate AND :endDate
      GROUP BY DATE(paid_at), currency
      ORDER BY date DESC
      `,
            {
                replacements: { startDate, endDate },
                type: QueryTypes.SELECT,
            }
        );

        return {
            period,
            startDate,
            endDate,
            stats,
        };
    }

    /**
     * Get total revenue (Admin)
     */
    async getTotalRevenue() {
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
}

export default new PaymentService();
