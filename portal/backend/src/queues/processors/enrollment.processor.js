/**
 * Enrollment Job Processors
 * Handles enrollment-related background tasks
 */

import Enrollment from '../../modules/enrollment/enrollment.model.js';
import StudentProgress from '../../modules/enrollment/student-progress.model.js';
import User from '../../modules/user/user.model.js';
import Course from '../../modules/course/course.model.js';
import CourseModule from '../../modules/course/course-module.model.js';
import moodleService from '../../integrations/moodle/moodle.service.js';
import incubatorService from '../../integrations/incubator/incubator.service.js';
import logger from '../../utils/logger.js';

/**
 * Enrollment job types
 */
export const ENROLLMENT_JOBS = {
    SYNC_MOODLE_ENROLLMENT: 'sync-moodle-enrollment',
    SYNC_INCUBATOR_PROFILE: 'sync-incubator-profile',
    CREATE_MOODLE_ACCOUNT: 'create-moodle-account',
    CREATE_INCUBATOR_ACCOUNT: 'create-incubator-account',
    INITIALIZE_PROGRESS: 'initialize-progress',
    CALCULATE_PROGRESS: 'calculate-progress',
    SYNC_COURSE_COMPLETION: 'sync-course-completion',
};

/**
 * Main enrollment processor
 */
export const enrollmentProcessor = async (job) => {
    const { name, data } = job;

    logger.info(`Processing enrollment job: ${name}`, {
        jobId: job.id,
        attemptsMade: job.attemptsMade,
    });

    try {
        await job.updateProgress(10);

        switch (name) {
            case ENROLLMENT_JOBS.SYNC_MOODLE_ENROLLMENT:
                return await handleSyncMoodleEnrollment(job, data);

            case ENROLLMENT_JOBS.SYNC_INCUBATOR_PROFILE:
                return await handleSyncIncubatorProfile(job, data);

            case ENROLLMENT_JOBS.CREATE_MOODLE_ACCOUNT:
                return await handleCreateMoodleAccount(job, data);

            case ENROLLMENT_JOBS.CREATE_INCUBATOR_ACCOUNT:
                return await handleCreateIncubatorAccount(job, data);

            case ENROLLMENT_JOBS.INITIALIZE_PROGRESS:
                return await handleInitializeProgress(job, data);

            case ENROLLMENT_JOBS.CALCULATE_PROGRESS:
                return await handleCalculateProgress(job, data);

            case ENROLLMENT_JOBS.SYNC_COURSE_COMPLETION:
                return await handleSyncCourseCompletion(job, data);

            default:
                throw new Error(`Unknown enrollment job type: ${name}`);
        }
    } catch (error) {
        logger.error(`Enrollment job failed: ${name}`, {
            jobId: job.id,
            error: error.message,
            stack: error.stack,
        });

        throw error;
    }
};

/**
 * Sync enrollment to Moodle
 */
async function handleSyncMoodleEnrollment(job, data) {
    const { userId, courseId, enrollmentId } = data;

    await job.updateProgress(20);

    const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
    ]);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (!course) {
        throw new Error(`Course not found: ${courseId}`);
    }

    if (!course.moodleCourseId) {
        logger.info(`Course ${courseId} has no Moodle ID, skipping sync`);
        return { success: true, skipped: true, reason: 'no_moodle_course_id' };
    }

    await job.updateProgress(40);

    // Create Moodle account if needed
    if (!user.moodleUserId) {
        try {
            const moodleUser = await moodleService.getOrCreateUser({
                username: `${user.email.split('@')[0]}_${user.id}`,
                password: user.tempPassword || 'TempPass123!',
                firstname: user.firstName,
                lastname: user.lastName,
                email: user.email,
            });

            await user.update({ moodleUserId: moodleUser.id });
            logger.info(`Moodle account created for user ${userId}: ${moodleUser.id}`);
        } catch (error) {
            logger.error('Failed to create Moodle account', error);
            throw error;
        }
    }

    await job.updateProgress(70);

    // Enroll in Moodle course
    try {
        await moodleService.enrollUser(user.moodleUserId, course.moodleCourseId);
        logger.info(`User ${userId} enrolled in Moodle course ${course.moodleCourseId}`);
    } catch (error) {
        logger.error('Failed to enroll in Moodle', error);
        throw error;
    }

    await job.updateProgress(100);

    // Notify frontend via WebSocket
    try {
        const { emitToUser } = await import('../../realtime/socket.js');
        emitToUser(userId, 'enrollment:moodle-synced', {
            courseId,
            moodleCourseId: course.moodleCourseId,
            status: 'synced',
            message: 'Moodle access ready!'
        });
    } catch (wsError) {
        logger.warn('Failed to emit Moodle sync WebSocket event', wsError);
    }

    return {
        success: true,
        userId,
        courseId,
        moodleUserId: user.moodleUserId,
        moodleCourseId: course.moodleCourseId,
    };
}

/**
 * Sync profile to Incubator
 */
async function handleSyncIncubatorProfile(job, data) {
    const { userId } = data;

    await job.updateProgress(20);

    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    await job.updateProgress(40);

    // Create or update Incubator account
    try {
        if (!user.incubatorUserId) {
            const incubatorUser = await incubatorService.createUser({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                centralUserId: user.id,
            });

            await user.update({ incubatorUserId: incubatorUser._id || incubatorUser.id });
            logger.info(`Incubator account created for user ${userId}`);
        } else {
            await incubatorService.updateUserProfile(user.incubatorUserId, {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
            logger.info(`Incubator profile updated for user ${userId}`);
        }
    } catch (error) {
        logger.error('Failed to sync Incubator profile', error);
        throw error;
    }

    await job.updateProgress(100);

    return {
        success: true,
        userId,
        incubatorUserId: user.incubatorUserId,
    };
}

/**
 * Create Moodle account (standalone)
 */
async function handleCreateMoodleAccount(job, data) {
    const { userId } = data;

    await job.updateProgress(20);

    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (user.moodleUserId) {
        logger.info(`User ${userId} already has Moodle account: ${user.moodleUserId}`);
        return {
            success: true,
            alreadyExists: true,
            moodleUserId: user.moodleUserId,
        };
    }

    await job.updateProgress(50);

    try {
        const moodleUser = await moodleService.createUser({
            username: `${user.email.split('@')[0]}_${user.id}`,
            password: user.tempPassword || 'TempPass123!',
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
        });

        await user.update({ moodleUserId: moodleUser.id });

        await job.updateProgress(100);

        logger.info(`Moodle account created for user ${userId}: ${moodleUser.id}`);

        return {
            success: true,
            userId,
            moodleUserId: moodleUser.id,
        };
    } catch (error) {
        logger.error('Failed to create Moodle account', error);
        throw error;
    }
}

/**
 * Create Incubator account (standalone)
 */
async function handleCreateIncubatorAccount(job, data) {
    const { userId } = data;

    await job.updateProgress(20);

    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (user.incubatorUserId) {
        logger.info(`User ${userId} already has Incubator account`);
        return {
            success: true,
            alreadyExists: true,
            incubatorUserId: user.incubatorUserId,
        };
    }

    await job.updateProgress(50);

    try {
        const incubatorUser = await incubatorService.createUser({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            centralUserId: user.id,
        });

        await user.update({ incubatorUserId: incubatorUser._id || incubatorUser.id });

        await job.updateProgress(100);

        logger.info(`Incubator account created for user ${userId}`);

        return {
            success: true,
            userId,
            incubatorUserId: incubatorUser._id || incubatorUser.id,
        };
    } catch (error) {
        logger.error('Failed to create Incubator account', error);
        throw error;
    }
}

/**
 * Initialize progress records for enrollment
 */
async function handleInitializeProgress(job, data) {
    const { enrollmentId } = data;

    await job.updateProgress(20);

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (!enrollment) {
        throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    await job.updateProgress(40);

    // Get all modules for the course
    const modules = await CourseModule.findAll({
        where: { courseId: enrollment.courseId },
        order: [['orderIndex', 'ASC']],
    });

    await job.updateProgress(60);

    let initialized = 0;

    // Create progress record for each module
    for (const module of modules) {
        await StudentProgress.findOrCreate({
            where: {
                enrollmentId,
                moduleId: module.id,
            },
            defaults: {
                status: 'not_started',
            },
        });
        initialized++;
    }

    await job.updateProgress(100);

    logger.info(`Progress initialized for enrollment ${enrollmentId}`, {
        moduleCount: modules.length,
        initialized,
    });

    return {
        success: true,
        enrollmentId,
        moduleCount: modules.length,
        initialized,
    };
}

/**
 * Recalculate enrollment progress
 */
async function handleCalculateProgress(job, data) {
    const { enrollmentId } = data;

    await job.updateProgress(20);

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (!enrollment) {
        throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    await job.updateProgress(40);

    // Get all modules and progress
    const totalModules = await CourseModule.count({
        where: { courseId: enrollment.courseId },
    });

    const completedModules = await StudentProgress.count({
        where: {
            enrollmentId,
            status: 'completed',
        },
    });

    await job.updateProgress(70);

    const progressPercentage = totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    const updateData = {
        progressPercentage,
        lastAccessed: new Date(),
    };

    // Auto-complete if 100%
    if (progressPercentage === 100 && enrollment.enrollmentStatus !== 'completed') {
        updateData.enrollmentStatus = 'completed';
        updateData.completedAt = new Date();

        // Queue course completion tasks
        const emailQueue = (await import('../services/email.queue.js')).default;
        await emailQueue.sendCourseCompletion(enrollment.userId, enrollment.courseId);

        // Queue Incubator skill sync
        const queueManager = (await import('../manager.js')).default;
        await queueManager.addJob(
            'enrollment',
            ENROLLMENT_JOBS.SYNC_COURSE_COMPLETION,
            { enrollmentId },
            { priority: 3 }
        );
    }

    await enrollment.update(updateData);

    await job.updateProgress(100);

    logger.info(`Progress calculated for enrollment ${enrollmentId}`, {
        totalModules,
        completedModules,
        progressPercentage,
    });

    return {
        success: true,
        enrollmentId,
        totalModules,
        completedModules,
        progressPercentage,
        completed: progressPercentage === 100,
    };
}

/**
 * Sync course completion to Incubator (for skills)
 */
async function handleSyncCourseCompletion(job, data) {
    const { enrollmentId } = data;

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

    if (!enrollment.user.incubatorUserId) {
        logger.info(`User ${enrollment.userId} has no Incubator account, skipping sync`);
        return { success: true, skipped: true, reason: 'no_incubator_account' };
    }

    await job.updateProgress(50);

    try {
        await incubatorService.syncCourseCompletion(
            enrollment.user.incubatorUserId,
            enrollment.course,
            {
                completedAt: enrollment.completedAt,
                progressPercentage: enrollment.progressPercentage,
            }
        );

        await job.updateProgress(100);

        logger.info(`Course completion synced to Incubator for enrollment ${enrollmentId}`);

        return {
            success: true,
            enrollmentId,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
        };
    } catch (error) {
        logger.error('Failed to sync course completion to Incubator', error);
        throw error;
    }
}
