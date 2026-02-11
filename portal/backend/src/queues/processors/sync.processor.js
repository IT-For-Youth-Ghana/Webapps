/**
 * Sync Job Processors
 * Handles Moodle synchronization background tasks
 */

import moodleSyncService from '../../integrations/moodle/moodle-sync.service.js';
import logger from '../../utils/logger.js';

/**
 * Sync job types
 */
export const SYNC_JOBS = {
    INITIAL_SYNC: 'initial-sync',
    PERIODIC_SYNC: 'periodic-sync',
    SYNC_USER_ENROLLMENT: 'sync-user-enrollment',
    FORCE_SYNC_USERS: 'force-sync-users',
    FORCE_SYNC_COURSES: 'force-sync-courses',
    FORCE_SYNC_ENROLLMENTS: 'force-sync-enrollments',
};

/**
 * Main sync processor
 */
export const syncProcessor = async (job) => {
    const { name, data } = job;

    logger.info(`Processing sync job: ${name}`, {
        jobId: job.id,
        attemptsMade: job.attemptsMade,
    });

    try {
        await job.updateProgress(10);

        switch (name) {
            case SYNC_JOBS.INITIAL_SYNC:
                return await handleInitialSync(job);

            case SYNC_JOBS.PERIODIC_SYNC:
                return await handlePeriodicSync(job);

            case SYNC_JOBS.SYNC_USER_ENROLLMENT:
                return await handleSyncUserEnrollment(job, data);

            case SYNC_JOBS.FORCE_SYNC_USERS:
                return await handleForceSyncUsers(job);

            case SYNC_JOBS.FORCE_SYNC_COURSES:
                return await handleForceSyncCourses(job);

            case SYNC_JOBS.FORCE_SYNC_ENROLLMENTS:
                return await handleForceSyncEnrollments(job);

            default:
                throw new Error(`Unknown sync job type: ${name}`);
        }
    } catch (error) {
        logger.error(`Sync job failed: ${name}`, {
            jobId: job.id,
            error: error.message,
            stack: error.stack,
        });

        throw error;
    }
};

/**
 * Handle initial sync on server startup
 */
async function handleInitialSync(job) {
    logger.info('Starting initial Moodle sync job');

    await job.updateProgress(20);

    const result = await moodleSyncService.initialSync();

    await job.updateProgress(100);

    logger.info('Initial sync job completed', result);
    return result;
}

/**
 * Handle periodic sync job
 */
async function handlePeriodicSync(job) {
    logger.info('Starting periodic Moodle sync job');

    await job.updateProgress(20);

    const result = await moodleSyncService.periodicSync();

    await job.updateProgress(100);

    logger.info('Periodic sync job completed', result);
    return result;
}

/**
 * Handle immediate user enrollment sync
 */
async function handleSyncUserEnrollment(job, data) {
    const { userId, courseId } = data;

    logger.info(`Starting user enrollment sync: user ${userId} in course ${courseId}`);

    await job.updateProgress(30);

    const result = await moodleSyncService.syncUserEnrollmentOnRegistration(userId, courseId);

    await job.updateProgress(100);

    logger.info('User enrollment sync completed', { userId, courseId, result });
    return result;
}

/**
 * Handle force sync of all users
 */
async function handleForceSyncUsers(job) {
    logger.info('Starting force sync of users');

    await job.updateProgress(20);

    const result = await moodleSyncService.syncUsersFromMoodle();

    await job.updateProgress(100);

    logger.info('Force user sync completed', result);
    return result;
}

/**
 * Handle force sync of all courses
 */
async function handleForceSyncCourses(job) {
    logger.info('Starting force sync of courses');

    await job.updateProgress(20);

    const result = await moodleSyncService.syncCoursesFromMoodle();

    await job.updateProgress(100);

    logger.info('Force course sync completed', result);
    return result;
}

/**
 * Handle force sync of all enrollments
 */
async function handleForceSyncEnrollments(job) {
    logger.info('Starting force sync of enrollments');

    await job.updateProgress(20);

    const result = await moodleSyncService.syncEnrollmentsFromMoodle();

    await job.updateProgress(100);

    logger.info('Force enrollment sync completed', result);
    return result;
}