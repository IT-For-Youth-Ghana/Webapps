/**
 * Payment Job Processors
 * Handles payment verification, enrollment completion, and payment-related background tasks
 */

import { Op } from 'sequelize';
import Payment from '../../modules/payment/payment.model.js';
import Enrollment from '../../modules/enrollment/enrollment.model.js';
import User from '../../modules/user/user.model.js';
import Course from '../../modules/course/course.model.js';
import paystackService from '../../integrations/paystack/paystack.service.js';
import enrollmentService from '../../modules/enrollment/enrollment.service.js';
import logger from '../../utils/logger.js';

/**
 * Payment job types
 */
export const PAYMENT_JOBS = {
    VERIFY_PAYMENT: 'verify-payment',
    COMPLETE_ENROLLMENT: 'complete-enrollment',
    POLL_PENDING_PAYMENTS: 'poll-pending-payments',
    RETRY_FAILED_ENROLLMENT: 'retry-failed-enrollment',
    CLEANUP_ABANDONED_PAYMENTS: 'cleanup-abandoned-payments',
    PROCESS_WEBHOOK: 'process-webhook',
};

/**
 * Main payment processor
 * Routes to specific handlers based on job name
 */
export const paymentProcessor = async (job) => {
    const { name, data } = job;

    logger.info(`Processing payment job: ${name}`, {
        jobId: job.id,
        attemptsMade: job.attemptsMade,
    });

    try {
        await job.updateProgress(10);

        switch (name) {
            case PAYMENT_JOBS.VERIFY_PAYMENT:
                return await handleVerifyPayment(job, data);

            case PAYMENT_JOBS.COMPLETE_ENROLLMENT:
                return await handleCompleteEnrollment(job, data);

            case PAYMENT_JOBS.POLL_PENDING_PAYMENTS:
                return await handlePollPendingPayments(job, data);

            case PAYMENT_JOBS.RETRY_FAILED_ENROLLMENT:
                return await handleRetryFailedEnrollment(job, data);

            case PAYMENT_JOBS.CLEANUP_ABANDONED_PAYMENTS:
                return await handleCleanupAbandonedPayments(job, data);

            case PAYMENT_JOBS.PROCESS_WEBHOOK:
                return await handleProcessWebhook(job, data);

            default:
                throw new Error(`Unknown payment job type: ${name}`);
        }
    } catch (error) {
        logger.error(`Payment job failed: ${name}`, {
            jobId: job.id,
            error: error.message,
            stack: error.stack,
        });

        throw error; // Re-throw to trigger retry
    }
};

/**
 * Verify payment with Paystack
 */
async function handleVerifyPayment(job, data) {
    const { reference, paymentId } = data;

    await job.updateProgress(20);

    // Get payment record
    const payment = await Payment.findOne({
        where: paymentId ? { id: paymentId } : { paystackReference: reference },
        include: [
            { model: User, as: 'user' },
            { model: Enrollment, as: 'enrollment' },
        ],
    });

    if (!payment) {
        throw new Error(`Payment not found: ${reference || paymentId}`);
    }

    // Skip if already verified
    if (payment.status === 'success') {
        logger.info(`Payment already verified: ${payment.paystackReference}`);
        return {
            success: true,
            status: 'already_verified',
            paymentId: payment.id,
        };
    }

    await job.updateProgress(40);

    // Verify with Paystack
    const paystackData = await paystackService.verifyTransaction(payment.paystackReference);

    await job.updateProgress(60);

    const isSuccess = paystackData.status === 'success';

    // Update payment status
    await payment.update({
        status: isSuccess ? 'success' : 'failed',
        paymentMethod: paystackData.channel || payment.paymentMethod,
        paidAt: isSuccess ? new Date(paystackData.paidAt || Date.now()) : null,
    });

    // Notify frontend via WebSocket
    try {
        const { emitToUser } = await import('../../realtime/socket.js');
        if (payment.userId) {
            if (isSuccess) {
                emitToUser(payment.userId, 'payment:verified', {
                    reference: payment.paystackReference,
                    paymentId: payment.id,
                    status: 'success',
                    message: 'Payment verified successfully!'
                });
            } else {
                emitToUser(payment.userId, 'payment:failed', {
                    reference: payment.paystackReference,
                    paymentId: payment.id,
                    status: 'failed',
                    message: 'Payment verification failed.'
                });
            }
        }
    } catch (wsError) {
        logger.warn('Failed to emit payment WebSocket event', wsError);
    }

    await job.updateProgress(80);

    // If successful, queue enrollment completion
    if (isSuccess && payment.enrollmentId) {
        const queueManager = (await import('../manager.js')).default;
        await queueManager.addJob(
            'payment',
            PAYMENT_JOBS.COMPLETE_ENROLLMENT,
            {
                enrollmentId: payment.enrollmentId,
                paymentReference: payment.paystackReference,
            },
            { priority: 1 }
        );
    }

    await job.updateProgress(100);

    logger.info(`Payment verification complete: ${payment.paystackReference}`, {
        status: payment.status,
        enrollmentId: payment.enrollmentId,
    });

    return {
        success: isSuccess,
        status: payment.status,
        paymentId: payment.id,
        enrollmentId: payment.enrollmentId,
    };
}

/**
 * Complete enrollment after successful payment
 */
async function handleCompleteEnrollment(job, data) {
    const { enrollmentId, paymentReference } = data;

    await job.updateProgress(20);

    const enrollment = await Enrollment.findByPk(enrollmentId, {
        include: [
            { model: User, as: 'user' },
            { model: Course, as: 'course' },
        ],
    });

    if (!enrollment) {
        throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    // Skip if already completed
    if (enrollment.enrollmentStatus === 'enrolled' || enrollment.enrollmentStatus === 'completed') {
        logger.info(`Enrollment already completed: ${enrollmentId}`);
        return {
            success: true,
            status: 'already_completed',
            enrollmentId,
        };
    }

    await job.updateProgress(40);

    // Complete the enrollment (this handles Moodle/Incubator account creation)
    await enrollmentService.completeEnrollment(enrollmentId, paymentReference);

    await job.updateProgress(80);

    // Queue course enrollment confirmation email
    const emailQueue = (await import('../services/email.queue.js')).default;
    await emailQueue.sendCourseEnrollmentEmail(enrollment.userId, enrollment.courseId);

    await job.updateProgress(100);

    logger.info(`Enrollment completed successfully: ${enrollmentId}`);

    return {
        success: true,
        enrollmentId,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
    };
}

/**
 * Poll pending payments (scheduled job)
 * Checks for payments that may have succeeded but webhook didn't fire
 */
async function handlePollPendingPayments(job, data) {
    const { olderThanMinutes = 15, limit = 50 } = data;

    await job.updateProgress(10);

    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    // Find pending payments older than cutoff
    const pendingPayments = await Payment.findAll({
        where: {
            status: 'pending',
            createdAt: {
                [Op.lt]: cutoffTime,
            },
        },
        limit,
        order: [['createdAt', 'ASC']],
    });

    logger.info(`Polling ${pendingPayments.length} pending payments`);

    await job.updateProgress(30);

    const results = {
        total: pendingPayments.length,
        verified: 0,
        failed: 0,
        stillPending: 0,
    };

    // Queue verification for each payment
    const queueManager = (await import('../manager.js')).default;

    for (const payment of pendingPayments) {
        try {
            // Queue verification job
            await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.VERIFY_PAYMENT,
                {
                    paymentId: payment.id,
                    reference: payment.paystackReference,
                },
                { priority: 2 }
            );

            results.verified++;
        } catch (error) {
            logger.error(`Failed to queue verification for payment ${payment.id}`, error);
            results.failed++;
        }
    }

    await job.updateProgress(100);

    logger.info('Pending payment polling complete', results);

    return results;
}

/**
 * Retry failed enrollment completion
 */
async function handleRetryFailedEnrollment(job, data) {
    const { enrollmentId } = data;

    await job.updateProgress(20);

    const enrollment = await Enrollment.findByPk(enrollmentId, {
        include: [
            { model: Payment, as: 'payment' },
        ],
    });

    if (!enrollment) {
        throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    if (!enrollment.payment || enrollment.payment.status !== 'success') {
        throw new Error(`Payment not successful for enrollment: ${enrollmentId}`);
    }

    await job.updateProgress(40);

    // Retry enrollment completion
    await enrollmentService.completeEnrollment(
        enrollmentId,
        enrollment.payment.paystackReference
    );

    await job.updateProgress(80);

    // Queue course enrollment confirmation email if not sent
    const emailQueue = (await import('../services/email.queue.js')).default;
    await emailQueue.sendCourseEnrollmentEmail(enrollment.userId, enrollment.courseId);

    await job.updateProgress(100);

    logger.info(`Enrollment retry successful: ${enrollmentId}`);

    return {
        success: true,
        enrollmentId,
    };
}

/**
 * Cleanup abandoned payments (scheduled job)
 * Marks old pending payments as cancelled
 */
async function handleCleanupAbandonedPayments(job, data) {
    const { olderThanHours = 72, limit = 100 } = data;

    await job.updateProgress(10);

    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    // Find abandoned payments
    const abandonedPayments = await Payment.findAll({
        where: {
            status: 'pending',
            createdAt: {
                [Op.lt]: cutoffTime,
            },
        },
        limit,
    });

    logger.info(`Cleaning up ${abandonedPayments.length} abandoned payments`);

    await job.updateProgress(30);

    let cleaned = 0;

    for (const payment of abandonedPayments) {
        try {
            await payment.update({ status: 'cancelled' });
            cleaned++;
        } catch (error) {
            logger.error(`Failed to cancel payment ${payment.id}`, error);
        }
    }

    await job.updateProgress(80);

    // Also cleanup associated pending enrollments
    await Enrollment.update(
        { enrollmentStatus: 'dropped', paymentStatus: 'failed' },
        {
            where: {
                enrollmentStatus: 'pending',
                paymentStatus: 'pending',
                createdAt: {
                    [Op.lt]: cutoffTime,
                },
            },
        }
    );

    await job.updateProgress(100);

    logger.info('Abandoned payment cleanup complete', {
        total: abandonedPayments.length,
        cleaned,
    });

    return {
        total: abandonedPayments.length,
        cleaned,
    };
}

/**
 * Process Paystack webhook (async processing)
 */
async function handleProcessWebhook(job, data) {
    const { event, webhookData } = data;

    await job.updateProgress(30);

    logger.info(`Processing webhook: ${event}`, { reference: webhookData?.reference });

    switch (event) {
        case 'charge.success': {
            // Queue payment verification
            const queueManager = (await import('../manager.js')).default;
            await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.VERIFY_PAYMENT,
                {
                    reference: webhookData.reference,
                },
                { priority: 1 }
            );
            break;
        }

        case 'charge.failed': {
            // Update payment status
            const payment = await Payment.findOne({
                where: { paystackReference: webhookData.reference },
            });

            if (payment) {
                await payment.update({ status: 'failed' });

                // Update enrollment
                if (payment.enrollmentId) {
                    await Enrollment.update(
                        { paymentStatus: 'failed' },
                        { where: { id: payment.enrollmentId } }
                    );
                }
            }
            break;
        }

        default:
            logger.info(`Unhandled webhook event: ${event}`);
    }

    await job.updateProgress(100);

    return {
        success: true,
        event,
        reference: webhookData?.reference,
    };
}
