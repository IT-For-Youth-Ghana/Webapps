/**
 * Email Queue Service
 * High-level API for dispatching email jobs
 */

import queueManager from '../manager.js';
import { EMAIL_JOBS } from '../processors/email.processor.js';
import logger from '../../utils/logger.js';

class EmailQueueService {
    /**
     * Queue verification code email
     */
    async sendVerificationCode(email, code, firstName, options = {}) {
        try {
            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_VERIFICATION_CODE,
                { email, code, firstName },
                {
                    priority: 1, // High priority
                    ...options,
                }
            );

            logger.info('Verification code email queued', { jobId: job.id, email });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue verification code email', error);
            throw error;
        }
    }

    /**
     * Queue welcome email
     */
    async sendWelcomeEmail(userId, courseId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_WELCOME_EMAIL,
                { userId, courseId, autopassword: options.autoPassword || null },
                {
                    priority: 2,
                    ...options,
                }
            );

            logger.info('Welcome email queued', { jobId: job.id, userId, courseId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue welcome email', error);
            throw error;
        }
    }

    /**
     * Queue course enrollment email
     */
    async sendCourseEnrollmentEmail(userId, courseId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_COURSE_ENROLLMENT,
                { userId, courseId },
                {
                    priority: 1, // High priority for enrollment confirmations
                    ...options,
                }
            );

            logger.info('Course enrollment email queued', { jobId: job.id, userId, courseId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue course enrollment email', error);
            throw error;
        }
    }

    /**
     * Queue password reset email
     */
    async sendPasswordReset(email, resetToken, firstName, options = {}) {
        try {
            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_PASSWORD_RESET,
                { email, resetToken, firstName },
                {
                    priority: 1, // High priority
                    ...options,
                }
            );

            logger.info('Password reset email queued', { jobId: job.id, email });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue password reset email', error);
            throw error;
        }
    }

    /**
     * Queue payment receipt email
     */
    async sendPaymentReceipt(userId, paymentId, courseId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_PAYMENT_RECEIPT,
                { userId, paymentId, courseId },
                {
                    priority: 2,
                    ...options,
                }
            );

            logger.info('Payment receipt email queued', { jobId: job.id, userId, paymentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue payment receipt email', error);
            throw error;
        }
    }

    /**
     * Queue course completion email
     */
    async sendCourseCompletion(userId, courseId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_COURSE_COMPLETION,
                { userId, courseId },
                {
                    priority: 2,
                    ...options,
                }
            );

            logger.info('Course completion email queued', { jobId: job.id, userId, courseId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue course completion email', error);
            throw error;
        }
    }

    /**
     * Queue enrollment reminder email (scheduled)
     */
    async sendEnrollmentReminder(userId, courseId, delayDays = 7, options = {}) {
        try {
            const delayMs = delayDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_ENROLLMENT_REMINDER,
                { userId, courseId },
                {
                    priority: 5, // Lower priority for reminders
                    delay: delayMs,
                    ...options,
                }
            );

            logger.info('Enrollment reminder email scheduled', {
                jobId: job.id,
                userId,
                courseId,
                delayDays,
            });
            return { jobId: job.id, queued: true, scheduledIn: delayDays + ' days' };
        } catch (error) {
            logger.error('Failed to schedule enrollment reminder email', error);
            throw error;
        }
    }

    /**
     * Queue payment reminder email (scheduled)
     */
    async sendPaymentReminder(userId, enrollmentId, delayHours = 24, options = {}) {
        try {
            const delayMs = delayHours * 60 * 60 * 1000; // Convert hours to milliseconds

            const job = await queueManager.addJob(
                'email',
                EMAIL_JOBS.SEND_PAYMENT_REMINDER,
                { userId, enrollmentId },
                {
                    priority: 3,
                    delay: delayMs,
                    ...options,
                }
            );

            logger.info('Payment reminder email scheduled', {
                jobId: job.id,
                userId,
                enrollmentId,
                delayHours,
            });
            return { jobId: job.id, queued: true, scheduledIn: delayHours + ' hours' };
        } catch (error) {
            logger.error('Failed to schedule payment reminder email', error);
            throw error;
        }
    }

    /**
     * Cancel a scheduled email job
     */
    async cancelEmail(jobId) {
        try {
            const queue = queueManager.getQueue('email');
            const job = await queue.getJob(jobId);

            if (job) {
                await job.remove();
                logger.info('Email job cancelled', { jobId });
                return { cancelled: true };
            }

            return { cancelled: false, reason: 'Job not found' };
        } catch (error) {
            logger.error('Failed to cancel email job', error);
            throw error;
        }
    }

    /**
     * Get email job status
     */
    async getJobStatus(jobId) {
        try {
            const queue = queueManager.getQueue('email');
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
            logger.error('Failed to get email job status', error);
            throw error;
        }
    }

    /**
     * Retry a failed email job
     */
    async retryEmail(jobId) {
        try {
            const queue = queueManager.getQueue('email');
            const job = await queue.getJob(jobId);

            if (!job) {
                return { retried: false, reason: 'Job not found' };
            }

            await job.retry();
            logger.info('Email job retried', { jobId });
            return { retried: true };
        } catch (error) {
            logger.error('Failed to retry email job', error);
            throw error;
        }
    }
}

export default new EmailQueueService();
