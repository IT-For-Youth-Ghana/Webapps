/**
 * Sync Queue Service
 * Manages Moodle synchronization jobs and recurring tasks
 */

import queueManager from '../manager.js';
import { SYNC_JOBS } from '../processors/sync.processor.js';
import logger from '../../utils/logger.js';

class SyncQueue {
    get queue() {
        return queueManager.getQueue('sync');
    }

    /**
     * Add initial sync job (run once on startup)
     */
    async addInitialSyncJob() {
        try {
            const job = await this.queue.add(
                SYNC_JOBS.INITIAL_SYNC,
                {},
                {
                    priority: 10, // High priority
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: 10,
                    removeOnFail: 5,
                }
            );

            logger.info(`Initial sync job added: ${job.id}`);
            return job;
        } catch (error) {
            logger.error('Failed to add initial sync job', error);
            throw error;
        }
    }

    /**
     * Schedule periodic sync job (every minute)
     */
    async schedulePeriodicSync() {
        try {
            await this.queue.add(
                SYNC_JOBS.PERIODIC_SYNC,
                {},
                {
                    priority: 5,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 30000,
                    },
                    repeat: {
                        every: 60000, // Every 60 seconds (1 minute)
                        immediately: false,
                    },
                    removeOnComplete: 5,
                    removeOnFail: 3,
                }
            );

            logger.info('Periodic sync job scheduled (every 1 minute)');
        } catch (error) {
            logger.error('Failed to schedule periodic sync', error);
            throw error;
        }
    }

    /**
     * Add immediate user enrollment sync job
     */
    async addUserEnrollmentSyncJob(userId, courseId) {
        try {
            const job = await this.queue.add(
                SYNC_JOBS.SYNC_USER_ENROLLMENT,
                { userId, courseId },
                {
                    priority: 8, // High priority for immediate sync
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: 10,
                    removeOnFail: 5,
                }
            );

            logger.info(`User enrollment sync job added: ${job.id} (user: ${userId}, course: ${courseId})`);
            return job;
        } catch (error) {
            logger.error('Failed to add user enrollment sync job', error);
            throw error;
        }
    }

    /**
     * Add force sync jobs for manual/admin sync
     */
    async addForceSyncJobs() {
        try {
            const jobs = await Promise.all([
                this.queue.add(SYNC_JOBS.FORCE_SYNC_USERS, {}, {
                    priority: 6,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 10000 },
                    removeOnComplete: 5,
                    removeOnFail: 3,
                }),
                this.queue.add(SYNC_JOBS.FORCE_SYNC_COURSES, {}, {
                    priority: 6,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 10000 },
                    removeOnComplete: 5,
                    removeOnFail: 3,
                }),
                this.queue.add(SYNC_JOBS.FORCE_SYNC_ENROLLMENTS, {}, {
                    priority: 6,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 10000 },
                    removeOnComplete: 5,
                    removeOnFail: 3,
                }),
            ]);

            logger.info(`Force sync jobs added: ${jobs.map(j => j.id).join(', ')}`);
            return jobs;
        } catch (error) {
            logger.error('Failed to add force sync jobs', error);
            throw error;
        }
    }

    /**
     * Get sync queue stats
     */
    async getStats() {
        try {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                this.queue.getWaiting(),
                this.queue.getActive(),
                this.queue.getCompleted(),
                this.queue.getFailed(),
                this.queue.getDelayed(),
            ]);

            return {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                delayed: delayed.length,
                total: waiting.length + active.length + completed.length + failed.length + delayed.length,
            };
        } catch (error) {
            logger.error('Failed to get sync queue stats', error);
            return { error: error.message };
        }
    }

    /**
     * Clean up old completed jobs
     */
    async cleanOldJobs() {
        try {
            const completedJobs = await this.queue.getCompleted(0, 100);
            const failedJobs = await this.queue.getFailed(0, 100);

            const oldCompleted = completedJobs.filter(job =>
                Date.now() - job.finishedOn > 24 * 60 * 60 * 1000 // Older than 24 hours
            );

            const oldFailed = failedJobs.filter(job =>
                Date.now() - job.failedReason.timestamp > 7 * 24 * 60 * 60 * 1000 // Older than 7 days
            );

            await Promise.all([
                ...oldCompleted.map(job => job.remove()),
                ...oldFailed.map(job => job.remove()),
            ]);

            logger.info(`Cleaned up ${oldCompleted.length} old completed jobs and ${oldFailed.length} old failed jobs`);
        } catch (error) {
            logger.error('Failed to clean old sync jobs', error);
        }
    }
}

export default new SyncQueue();