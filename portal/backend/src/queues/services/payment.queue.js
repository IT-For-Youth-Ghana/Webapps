/**
 * Payment Queue Service
 * High-level API for dispatching payment-related jobs
 */

import queueManager from '../manager.js';
import { PAYMENT_JOBS } from '../processors/payment.processor.js';
import logger from '../../utils/logger.js';

class PaymentQueueService {
    /**
     * Queue payment verification
     */
    async verifyPayment(reference, paymentId = null, options = {}) {
        try {
            const job = await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.VERIFY_PAYMENT,
                { reference, paymentId },
                {
                    priority: 1, // High priority
                    ...options,
                }
            );

            logger.info('Payment verification queued', { jobId: job.id, reference });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue payment verification', error);
            throw error;
        }
    }

    /**
     * Queue enrollment completion
     */
    async completeEnrollment(enrollmentId, paymentReference, options = {}) {
        try {
            const job = await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.COMPLETE_ENROLLMENT,
                { enrollmentId, paymentReference },
                {
                    priority: 1, // High priority
                    ...options,
                }
            );

            logger.info('Enrollment completion queued', { jobId: job.id, enrollmentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue enrollment completion', error);
            throw error;
        }
    }

    /**
     * Queue webhook processing
     */
    async processWebhook(event, webhookData, options = {}) {
        try {
            const job = await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.PROCESS_WEBHOOK,
                { event, webhookData },
                {
                    priority: 2,
                    ...options,
                }
            );

            logger.info('Webhook processing queued', { jobId: job.id, event });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue webhook processing', error);
            throw error;
        }
    }

    /**
     * Queue retry for failed enrollment
     */
    async retryFailedEnrollment(enrollmentId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.RETRY_FAILED_ENROLLMENT,
                { enrollmentId },
                {
                    priority: 3,
                    ...options,
                }
            );

            logger.info('Enrollment retry queued', { jobId: job.id, enrollmentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue enrollment retry', error);
            throw error;
        }
    }

    /**
     * Schedule pending payment polling (recurring)
     */
    async schedulePendingPaymentPolling() {
        try {
            // Run every 15 minutes
            const job = await queueManager.addRepeatable(
                'payment',
                PAYMENT_JOBS.POLL_PENDING_PAYMENTS,
                { olderThanMinutes: 15, limit: 50 },
                '*/15 * * * *', // Every 15 minutes
                {
                    priority: 5,
                    jobId: 'poll-pending-payments', // Unique ID prevents duplicates
                }
            );

            logger.info('Pending payment polling scheduled', { jobId: job.id });
            return { jobId: job.id, scheduled: true };
        } catch (error) {
            logger.error('Failed to schedule pending payment polling', error);
            throw error;
        }
    }

    /**
     * Schedule abandoned payment cleanup (recurring)
     */
    async scheduleAbandonedPaymentCleanup() {
        try {
            // Run daily at 2 AM
            const job = await queueManager.addRepeatable(
                'payment',
                PAYMENT_JOBS.CLEANUP_ABANDONED_PAYMENTS,
                { olderThanHours: 72, limit: 100 },
                '0 2 * * *', // Daily at 2 AM
                {
                    priority: 10,
                    jobId: 'cleanup-abandoned-payments',
                }
            );

            logger.info('Abandoned payment cleanup scheduled', { jobId: job.id });
            return { jobId: job.id, scheduled: true };
        } catch (error) {
            logger.error('Failed to schedule abandoned payment cleanup', error);
            throw error;
        }
    }

    /**
     * Verify payment with delay (for webhook backup)
     */
    async verifyPaymentDelayed(reference, delayMinutes = 5, options = {}) {
        try {
            const delayMs = delayMinutes * 60 * 1000;

            const job = await queueManager.addJob(
                'payment',
                PAYMENT_JOBS.VERIFY_PAYMENT,
                { reference },
                {
                    priority: 3,
                    delay: delayMs,
                    ...options,
                }
            );

            logger.info('Delayed payment verification queued', {
                jobId: job.id,
                reference,
                delayMinutes,
            });
            return { jobId: job.id, queued: true, delayMinutes };
        } catch (error) {
            logger.error('Failed to queue delayed payment verification', error);
            throw error;
        }
    }

    /**
     * Get payment job status
     */
    async getJobStatus(jobId) {
        try {
            const queue = queueManager.getQueue('payment');
            const job = await queue.getJob(jobId);

            if (!job) {
                return { found: false };
            }

            const state = await job.getState();
            const progress = job.progress;

            return {
                found: true,
                id: job.id,
                name: job.name,
                state,
                progress,
                attemptsMade: job.attemptsMade,
                failedReason: job.failedReason,
                finishedOn: job.finishedOn,
                processedOn: job.processedOn,
                data: job.data,
            };
        } catch (error) {
            logger.error('Failed to get payment job status', error);
            throw error;
        }
    }

    /**
     * Cancel a pending payment job
     */
    async cancelJob(jobId) {
        try {
            const queue = queueManager.getQueue('payment');
            const job = await queue.getJob(jobId);

            if (job) {
                await job.remove();
                logger.info('Payment job cancelled', { jobId });
                return { cancelled: true };
            }

            return { cancelled: false, reason: 'Job not found' };
        } catch (error) {
            logger.error('Failed to cancel payment job', error);
            throw error;
        }
    }
}

export default new PaymentQueueService();
