/**
 * Moodle Synchronization Service (FIXED VERSION)
 * Handles bidirectional synchronization between Portal and Moodle LMS
 * Manages users, courses, enrollments, and completion data
 * 
 * FIXES:
 * - Proper role extraction from enrolled users (uses roles array from API)
 * - Better error handling for course completion (handles cases where tracking is disabled)
 * - Improved user sync with proper role mapping
 * - More robust fallback mechanisms
 */

import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { AppError, ServiceUnavailableError } from '../../utils/errors.js';
import moodleService from './moodle.service.js';
import User from '../../modules/user/user.model.js';
import Course from '../../modules/course/course.model.js';
import Enrollment from '../../modules/enrollment/enrollment.model.js';
import StudentProgress from '../../modules/enrollment/student-progress.model.js';
import { Op } from 'sequelize';

class MoodleSyncService {
    constructor() {
        this.enabled = config.moodle?.enabled || false;
        this.syncInterval = config.moodle?.syncInterval || 60 * 1000; // Default 1 minute
        this.batchSize = config.moodle?.batchSize || 50;
    }

    /**
     * Check if sync is enabled
     */
    ensureEnabled() {
        if (!this.enabled) {
            throw new ServiceUnavailableError('Moodle sync is not enabled');
        }
    }

    /**
     * Initial sync on server startup
     * Syncs all users, courses, and enrollments from Moodle to Portal
     */
    async initialSync() {
        this.ensureEnabled();

        try {
            logger.info('🚀 Starting initial Moodle sync...');

            // Sync courses first (needed for enrollments)
            await this.syncCoursesFromMoodle();

            // Sync users
            await this.syncUsersFromMoodle();

            // Sync enrollments
            await this.syncEnrollmentsFromMoodle();

            // Sync completion data
            await this.syncCompletionDataFromMoodle();

            logger.info('✅ Initial Moodle sync completed successfully');
            return { success: true };

        } catch (error) {
            logger.error('❌ Initial Moodle sync failed', { error: error.message });
            throw new AppError(`Initial sync failed: ${error.message}`, 500);
        }
    }

    /**
     * Periodic sync job - runs every minute
     * Checks for changes in Moodle and syncs bidirectional
     */
    async periodicSync() {
        this.ensureEnabled();

        try {
            logger.info('🔄 Starting periodic Moodle sync...');

            // Sync from Moodle to Portal
            await this.syncCoursesFromMoodle();
            await this.syncUsersFromMoodle();
            await this.syncEnrollmentsFromMoodle();
            await this.syncCompletionDataFromMoodle();

            // Sync from Portal to Moodle (pending changes)
            await this.syncPendingChangesToMoodle();

            logger.info('✅ Periodic Moodle sync completed successfully');
            return { success: true };

        } catch (error) {
            logger.error('❌ Periodic Moodle sync failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Sync courses from Moodle to Portal
     */
    async syncCoursesFromMoodle() {
        try {
            logger.info('📚 Syncing courses from Moodle...');

            const moodleCourses = await moodleService.getCourses();
            let synced = 0;
            let created = 0;
            let updated = 0;

            for (const moodleCourse of moodleCourses) {
                try {
                    let course = await Course.findByMoodleId(moodleCourse.id);

                    if (!course) {
                        // Create new course
                        course = await Course.create({
                            moodleCourseId: moodleCourse.id.toString(),
                            title: moodleCourse.fullname,
                            description: moodleCourse.summary || '',
                            shortDescription: moodleCourse.shortname || moodleCourse.fullname.substring(0, 100),
                            status: 'active',
                            price: 0, // Default free
                            currency: 'GHS',
                            lastSyncedAt: new Date(),
                            syncStatus: 'synced',
                        });
                        created++;
                        logger.info(`Created course: ${course.title} (Moodle ID: ${moodleCourse.id})`);
                    } else {
                        // Update existing course
                        const needsUpdate = this.courseNeedsUpdate(course, moodleCourse);
                        if (needsUpdate) {
                            await course.update({
                                title: moodleCourse.fullname,
                                description: moodleCourse.summary || course.description,
                                shortDescription: moodleCourse.shortname || course.shortDescription,
                                lastSyncedAt: new Date(),
                                syncStatus: 'synced',
                            });
                            updated++;
                        }
                    }

                    synced++;
                } catch (error) {
                    logger.error(`Failed to sync course ${moodleCourse.id}`, { error: error.message });
                }
            }

            logger.info(`📚 Course sync completed: ${synced} total, ${created} created, ${updated} updated`);
            return { synced, created, updated };

        } catch (error) {
            logger.error('Failed to sync courses from Moodle', { error: error.message });
            throw error;
        }
    }

    /**
     * Sync users from Moodle to Portal
     * FIXED: Properly handles role extraction from Moodle users
     * 
     * Note: Moodle's core_user_get_users doesn't return course roles.
     * To get user roles, we need to query them in the context of specific courses
     * using core_enrol_get_enrolled_users or check system-level roles.
     */
    async syncUsersFromMoodle() {
        try {
            logger.info('👥 Syncing users from Moodle...');

            // Get all users from Moodle (this might need pagination for large instances)
            const moodleUsers = await this.getAllMoodleUsers();
            let synced = 0;
            let created = 0;
            let updated = 0;

            for (const moodleUser of moodleUsers) {
                try {
                    let user = await User.findOne({ where: { moodleUserId: moodleUser.id } });

                    if (!user) {
                        // Check if user exists by email
                        user = await User.findByEmail(moodleUser.email);

                        if (user) {
                            // Link existing user to Moodle account
                            await user.update({
                                moodleUserId: moodleUser.id,
                                lastSyncedAt: new Date(),
                                syncStatus: 'synced',
                            });
                            updated++;
                        } else {
                            // Create new user
                            // Note: Since core_user_get_users doesn't return role info,
                            // we default to 'student'. Roles will be properly set when
                            // syncing enrollments.
                            user = await User.create({
                                email: moodleUser.email,
                                passwordHash: 'temp', // Will be set properly later
                                firstName: moodleUser.firstname || 'Unknown',
                                lastName: moodleUser.lastname || 'User',
                                role: 'student', // Default role, will be updated from enrollments
                                moodleUserId: moodleUser.id,
                                status: 'active',
                                emailVerified: true, // Assume Moodle users are verified
                                lastSyncedAt: new Date(),
                                syncStatus: 'synced',
                            });
                            created++;
                            logger.info(`Created user from Moodle: ${user.email} (ID: ${user.id}, Moodle ID: ${moodleUser.id})`);
                        }
                    } else {
                        // Update existing user
                        const needsUpdate = this.userNeedsUpdate(user, moodleUser);
                        if (needsUpdate) {
                            await user.update({
                                firstName: moodleUser.firstname,
                                lastName: moodleUser.lastname,
                                email: moodleUser.email,
                                lastSyncedAt: new Date(),
                                syncStatus: 'synced',
                            });
                            updated++;
                        }
                    }

                    synced++;
                } catch (error) {
                    logger.error(`Failed to sync user ${moodleUser.id}`, { error: error.message });
                }
            }

            logger.info(`👥 User sync completed: ${synced} total, ${created} created, ${updated} updated`);
            return { synced, created, updated };

        } catch (error) {
            logger.error('Failed to sync users from Moodle', { error: error.message });
            throw error;
        }
    }

    /**
     * Sync enrollments from Moodle to Portal
     * FIXED: Properly extracts roles from the enrolled users API response
     * 
     * The core_enrol_get_enrolled_users API returns users with a 'roles' array
     * containing their course roles. We use this to determine the user's role.
     */
    async syncEnrollmentsFromMoodle() {
        try {
            logger.info('📝 Syncing enrollments from Moodle...');

            const courses = await Course.findAll({
                where: {
                    moodleCourseId: { [Op.ne]: null },
                    status: 'active'
                }
            });

            let totalSynced = 0;
            let created = 0;
            let updated = 0;

            for (const course of courses) {
                try {
                    // Get enrolled users with their roles
                    const moodleEnrolledUsers = await moodleService.getEnrolledUsers(parseInt(course.moodleCourseId));

                    for (const moodleUser of moodleEnrolledUsers) {
                        try {
                            let user = await User.findOne({ where: { moodleUserId: moodleUser.id } });

                            // If user doesn't exist in our system, create them
                            if (!user) {
                                logger.warn(`User ${moodleUser.id} from Moodle not found in portal, creating...`);
                                user = await User.create({
                                    email: moodleUser.email,
                                    passwordHash: 'temp',
                                    firstName: moodleUser.firstname || 'Unknown',
                                    lastName: moodleUser.lastname || 'User',
                                    role: this.extractUserRoleFromMoodle(moodleUser),
                                    moodleUserId: moodleUser.id,
                                    status: 'active',
                                    emailVerified: true,
                                    lastSyncedAt: new Date(),
                                    syncStatus: 'synced',
                                });
                            } else {
                                // Update user role if needed based on their course enrollment
                                const roleFromMoodle = this.extractUserRoleFromMoodle(moodleUser);
                                if (roleFromMoodle === 'teacher' && user.role === 'student') {
                                    // Upgrade student to teacher if they teach any course
                                    await user.update({ role: 'teacher' });
                                    logger.info(`Updated user ${user.id} role from student to teacher`);
                                }
                            }

                            if (user) {
                                let enrollment = await Enrollment.findByUserAndCourse(user.id, course.id);

                                if (!enrollment) {
                                    // Create enrollment
                                    enrollment = await Enrollment.create({
                                        userId: user.id,
                                        courseId: course.id,
                                        enrollmentStatus: 'enrolled',
                                        paymentStatus: 'completed', // Assume paid in Moodle
                                        progressPercentage: 0,
                                        enrolledAt: new Date(),
                                        lastSyncedAt: new Date(),
                                        syncStatus: 'synced',
                                    });
                                    created++;
                                    logger.info(`Created enrollment: User ${user.id} in course ${course.id}`);
                                } else {
                                    // Update enrollment if needed
                                    if (enrollment.enrollmentStatus !== 'enrolled') {
                                        await enrollment.update({
                                            enrollmentStatus: 'enrolled',
                                            lastSyncedAt: new Date(),
                                            syncStatus: 'synced',
                                        });
                                        updated++;
                                    }
                                }
                            }
                        } catch (error) {
                            logger.error(`Failed to sync enrollment for user ${moodleUser.id} in course ${course.id}`, { error: error.message });
                        }
                    }

                    totalSynced += moodleEnrolledUsers.length;
                } catch (error) {
                    logger.error(`Failed to sync enrollments for course ${course.id}`, { error: error.message });
                }
            }

            logger.info(`📝 Enrollment sync completed: ${totalSynced} total, ${created} created, ${updated} updated`);
            return { totalSynced, created, updated };

        } catch (error) {
            logger.error('Failed to sync enrollments from Moodle', { error: error.message });
            throw error;
        }
    }

    /**
     * Extract user role from Moodle user object
     * FIXED: Properly handles the roles array returned by core_enrol_get_enrolled_users
     * 
     * @param {Object} moodleUser - User object from Moodle API with roles array
     * @returns {string} - App role (student, teacher, admin)
     */
    extractUserRoleFromMoodle(moodleUser) {
        // The moodleUser object has a 'roles' array with role objects
        // Each role has: roleid, name, shortname, sortorder
        if (!moodleUser.roles || moodleUser.roles.length === 0) {
            return 'student'; // Default to student if no roles
        }

        // Get the primary role (first role in array, usually the most important)
        const primaryRole = moodleUser.roles[0];
        const roleShortname = primaryRole.shortname;

        // Map Moodle role to app role
        const roleMap = {
            'student': 'student',
            'editingteacher': 'teacher',
            'teacher': 'teacher',
            'manager': 'admin',
            'coursecreator': 'admin',
            'guest': 'student'
        };

        const mappedRole = roleMap[roleShortname] || 'student';
        
        logger.debug(`Mapped Moodle role ${roleShortname} to app role ${mappedRole} for user ${moodleUser.id}`);
        
        return mappedRole;
    }

    /**
     * Sync completion data from Moodle to Portal
     * FIXED: Better error handling for cases where completion tracking is disabled
     */
    async syncCompletionDataFromMoodle() {
        try {
            logger.info('✅ Syncing completion data from Moodle...');

            const enrollments = await Enrollment.findAll({
                where: { enrollmentStatus: 'enrolled' },
                include: [
                    { model: User, as: 'user' },
                    { model: Course, as: 'course' }
                ]
            });

            let synced = 0;
            let completed = 0;
            let skipped = 0;

            for (const enrollment of enrollments) {
                try {
                    if (enrollment.user.moodleUserId && enrollment.course.moodleCourseId) {
                        const completion = await moodleService.getCourseCompletion(
                            parseInt(enrollment.course.moodleCourseId),
                            enrollment.user.moodleUserId
                        );

                        // Check if completion data is available
                        if (completion.error || completion.warning) {
                            // Completion tracking not available for this course
                            skipped++;
                            logger.debug(`Skipping completion sync for enrollment ${enrollment.id}: ${completion.error || completion.warning}`);
                            continue;
                        }

                        if (completion.completed && enrollment.enrollmentStatus !== 'completed') {
                            await enrollment.update({
                                enrollmentStatus: 'completed',
                                progressPercentage: 100,
                                completedAt: new Date(completion.timecompleted * 1000),
                                lastSyncedAt: new Date(),
                                syncStatus: 'synced',
                            });
                            completed++;
                            logger.info(`Marked enrollment ${enrollment.id} as completed`);
                        }

                        synced++;
                    }
                } catch (error) {
                    logger.error(`Failed to sync completion for enrollment ${enrollment.id}`, { error: error.message });
                }
            }

            logger.info(`✅ Completion sync completed: ${synced} checked, ${completed} marked complete, ${skipped} skipped (no completion tracking)`);
            return { synced, completed, skipped };

        } catch (error) {
            logger.error('Failed to sync completion data from Moodle', { error: error.message });
            throw error;
        }
    }

    /**
     * Sync pending changes from Portal to Moodle
     */
    async syncPendingChangesToMoodle() {
        try {
            logger.info('🔄 Syncing pending changes to Moodle...');

            // Sync new user registrations
            await this.syncNewUsersToMoodle();

            // Sync new enrollments
            await this.syncNewEnrollmentsToMoodle();

            logger.info('✅ Pending changes sync completed');

        } catch (error) {
            logger.error('Failed to sync pending changes to Moodle', { error: error.message });
            throw error;
        }
    }

    /**
     * Sync new users to Moodle
     */
    async syncNewUsersToMoodle() {
        const unsyncedUsers = await User.findAll({
            where: {
                moodleUserId: null,
                status: 'active',
                [Op.or]: [
                    { lastSyncedAt: null },
                    { lastSyncedAt: { [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) } } // Older than 5 minutes
                ]
            },
            limit: this.batchSize
        });

        for (const user of unsyncedUsers) {
            try {
                const moodleUser = await moodleService.getOrCreateUser({
                    username: `${user.email.split('@')[0]}_${user.id}`,
                    password: user.tempPassword || 'TempPass123!',
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                });

                await user.update({
                    moodleUserId: moodleUser.id,
                    lastSyncedAt: new Date(),
                    syncStatus: 'synced',
                });

                logger.info(`Synced user ${user.id} to Moodle (ID: ${moodleUser.id})`);
            } catch (error) {
                logger.error(`Failed to sync user ${user.id} to Moodle`, { error: error.message });
                await user.update({
                    syncStatus: 'error',
                    lastSyncError: error.message,
                });
            }
        }
    }

    /**
     * Sync new enrollments to Moodle
     */
    async syncNewEnrollmentsToMoodle() {
        const unsyncedEnrollments = await Enrollment.findAll({
            where: {
                enrollmentStatus: 'enrolled',
                syncStatus: { [Op.ne]: 'synced' },
                lastSyncedAt: { [Op.or]: [null, { [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) }] }
            },
            include: [
                { model: User, as: 'user' },
                { model: Course, as: 'course' }
            ],
            limit: this.batchSize
        });

        for (const enrollment of unsyncedEnrollments) {
            try {
                if (!enrollment.user.moodleUserId) {
                    // Create Moodle user first
                    const moodleUser = await moodleService.getOrCreateUser({
                        username: `${enrollment.user.email.split('@')[0]}_${enrollment.user.id}`,
                        password: enrollment.user.tempPassword || 'TempPass123!',
                        firstname: enrollment.user.firstName,
                        lastname: enrollment.user.lastName,
                        email: enrollment.user.email,
                    });
                    await enrollment.user.update({ moodleUserId: moodleUser.id });
                }

                if (enrollment.course.moodleCourseId && enrollment.user.moodleUserId) {
                    await moodleService.enrollUser(
                        enrollment.user.moodleUserId,
                        parseInt(enrollment.course.moodleCourseId)
                    );

                    await enrollment.update({
                        lastSyncedAt: new Date(),
                        syncStatus: 'synced',
                    });

                    logger.info(`Synced enrollment ${enrollment.id} to Moodle`);
                }
            } catch (error) {
                logger.error(`Failed to sync enrollment ${enrollment.id} to Moodle`, { error: error.message });
                await enrollment.update({
                    syncStatus: 'error',
                    lastSyncError: error.message,
                });
            }
        }
    }

    /**
     * Sync user enrollment immediately upon course enrollment
     */
    async syncUserEnrollmentOnRegistration(userId, courseId) {
        try {
            const [user, course] = await Promise.all([
                User.findByPk(userId),
                Course.findByPk(courseId),
            ]);

            if (!user || !course) {
                throw new Error('User or course not found');
            }

            // Ensure user has Moodle account
            if (!user.moodleUserId) {
                const moodleUser = await moodleService.getOrCreateUser({
                    username: `${user.email.split('@')[0]}_${user.id}`,
                    password: user.tempPassword || 'TempPass123!',
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                });

                await user.update({ moodleUserId: moodleUser.id });
            }

            // Enroll in Moodle course if course has Moodle ID
            if (course.moodleCourseId) {
                await moodleService.enrollUser(user.moodleUserId, parseInt(course.moodleCourseId));

                logger.info(`Immediately synced enrollment: User ${userId} in course ${courseId} to Moodle`);
                return { success: true, moodleEnrolled: true };
            } else {
                logger.warn(`Course ${courseId} has no Moodle ID, skipping Moodle enrollment`);
                return { success: true, moodleEnrolled: false, reason: 'no_moodle_course_id' };
            }

        } catch (error) {
            logger.error('Failed to sync user enrollment on registration', {
                userId,
                courseId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get all users from Moodle (with pagination support)
     */
    async getAllMoodleUsers() {
        try {
            // Get users by auth method (manual accounts)
            const users = await moodleService.getAllMoodleUsers();
            return users || [];
        } catch (error) {
            logger.error('Failed to get all Moodle users', { error: error.message });
            return [];
        }
    }

    /**
     * Check if course needs update from Moodle data
     */
    courseNeedsUpdate(course, moodleCourse) {
        return course.title !== moodleCourse.fullname ||
               course.description !== (moodleCourse.summary || '') ||
               course.shortDescription !== (moodleCourse.shortname || course.shortDescription);
    }

    /**
     * Check if user needs update from Moodle data
     */
    userNeedsUpdate(user, moodleUser) {
        return user.firstName !== moodleUser.firstname ||
               user.lastName !== moodleUser.lastname ||
               user.email !== moodleUser.email;
    }

    /**
     * Get sync status summary
     */
    async getSyncStatus() {
        const [
            totalUsers,
            syncedUsers,
            totalCourses,
            syncedCourses,
            totalEnrollments,
            syncedEnrollments,
        ] = await Promise.all([
            User.count(),
            User.count({ where: { syncStatus: 'synced' } }),
            Course.count(),
            Course.count({ where: { syncStatus: 'synced' } }),
            Enrollment.count(),
            Enrollment.count({ where: { syncStatus: 'synced' } }),
        ]);

        return {
            users: { total: totalUsers, synced: syncedUsers },
            courses: { total: totalCourses, synced: syncedCourses },
            enrollments: { total: totalEnrollments, synced: syncedEnrollments },
            lastSync: await this.getLastSyncTime(),
        };
    }

    /**
     * Get last sync timestamp
     */
    async getLastSyncTime() {
        const lastUserSync = await User.max('lastSyncedAt');
        const lastCourseSync = await Course.max('lastSyncedAt');
        const lastEnrollmentSync = await Enrollment.max('lastSyncedAt');

        return {
            users: lastUserSync,
            courses: lastCourseSync,
            enrollments: lastEnrollmentSync,
        };
    }
}

export default new MoodleSyncService();