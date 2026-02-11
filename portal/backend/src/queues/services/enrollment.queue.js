/**
 * Enrollment Queue Service
 * High-level API for dispatching enrollment-related jobs
 */

import queueManager from '../manager.js';
import { ENROLLMENT_JOBS } from '../processors/enrollment.processor.js';
import logger from '../../utils/logger.js';

class EnrollmentQueueService {
    /**
     * Queue Moodle enrollment sync
     */
    async syncMoodleEnrollment(userId, courseId, enrollmentId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.SYNC_MOODLE_ENROLLMENT,
                { userId, courseId, enrollmentId },
                {
                    priority: 2,
                    ...options,
                }
            );

            logger.info('Moodle enrollment sync queued', { jobId: job.id, enrollmentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue Moodle enrollment sync', error);
            throw error;
        }
    }

    /**
     * Queue Incubator profile sync
     */
    async syncIncubatorProfile(userId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.SYNC_INCUBATOR_PROFILE,
                { userId },
                {
                    priority: 3,
                    ...options,
                }
            );

            logger.info('Incubator profile sync queued', { jobId: job.id, userId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue Incubator profile sync', error);
            throw error;
        }
    }

    /**
     * Queue Moodle account creation
     */
    async createMoodleAccount(userId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.CREATE_MOODLE_ACCOUNT,
                { userId },
                {
                    priority: 2,
                    attempts: 5, // Retry more for account creation
                    ...options,
                }
            );

            logger.info('Moodle account creation queued', { jobId: job.id, userId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue Moodle account creation', error);
            throw error;
        }
    }

    /**
     * Queue Incubator account creation
     */
    async createIncubatorAccount(userId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.CREATE_INCUBATOR_ACCOUNT,
                { userId },
                {
                    priority: 3,
                    attempts: 5,
                    ...options,
                }
            );

            logger.info('Incubator account creation queued', { jobId: job.id, userId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue Incubator account creation', error);
            throw error;
        }
    }

    /**
     * Queue progress initialization
     */
    async initializeProgress(enrollmentId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.INITIALIZE_PROGRESS,
                { enrollmentId },
                {
                    priority: 2,
                    ...options,
                }
            );

            logger.info('Progress initialization queued', { jobId: job.id, enrollmentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue progress initialization', error);
            throw error;
        }
    }

    /**
     * Queue progress calculation
     */
    async calculateProgress(enrollmentId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.CALCULATE_PROGRESS,
                { enrollmentId },
                {
                    priority: 4,
                    ...options,
                }
            );

            logger.info('Progress calculation queued', { jobId: job.id, enrollmentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue progress calculation', error);
            throw error;
        }
    }

    /**
     * Queue course completion sync to Incubator
     */
    async syncCourseCompletion(enrollmentId, options = {}) {
        try {
            const job = await queueManager.addJob(
                'enrollment',
                ENROLLMENT_JOBS.SYNC_COURSE_COMPLETION,
                { enrollmentId },
                {
                    priority: 3,
                    ...options,
                }
            );

            logger.info('Course completion sync queued', { jobId: job.id, enrollmentId });
            return { jobId: job.id, queued: true };
        } catch (error) {
            logger.error('Failed to queue course completion sync', error);
            throw error;
        }
    }

    /**
     * Get enrollment job status
     */
    async getJobStatus(jobId) {
        try {
            const queue = queueManager.getQueue('enrollment');
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
            logger.error('Failed to get enrollment job status', error);
            throw error;
        }
    }

    /**
     * Cancel an enrollment job
     */
    async cancelJob(jobId) {
        try {
            const queue = queueManager.getQueue('enrollment');
            const job = await queue.getJob(jobId);

            if (job) {
                await job.remove();
                logger.info('Enrollment job cancelled', { jobId });
                return { cancelled: true };
            }

            return { cancelled: false, reason: 'Job not found' };
        } catch (error) {
            logger.error('Failed to cancel enrollment job', error);
            throw error;
        }
    }
}

export default new EnrollmentQueueService();
