/**
 * Moodle Integration Service (FIXED VERSION)
 * Handles communication with Moodle LMS API (Moodle 5.0+)
 * Based on official Moodle Web Services REST API documentation
 * 
 * FIXES:
 * - Improved error handling for course completion API
 * - Proper role extraction from enrolled users
 * - Better fallback mechanisms
 */

import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { AppError, ServiceUnavailableError } from '../../utils/errors.js';

class MoodleService {
    constructor() {
        this.baseUrl = config.moodle?.url;
        this.token = config.moodle?.token;
        this.endpoint = this.baseUrl ? `${this.baseUrl}/webservice/rest/server.php` : null;
        this.enabled = config.moodle?.enabled || false;
    }

    /**
     * Check if Moodle integration is configured and enabled
     */
    ensureConfigured() {
        if (!this.enabled || !this.baseUrl || !this.token) {
            throw new ServiceUnavailableError('Moodle integration is not configured');
        }
    }

    /**
     * Make API call to Moodle with proper error handling
     */
    async call(wsfunction, params = {}) {
        this.ensureConfigured();

        try {
            const url = new URL(this.endpoint);
            url.searchParams.append('wstoken', this.token);
            url.searchParams.append('wsfunction', wsfunction);
            url.searchParams.append('moodlewsrestformat', 'json');

            // Add params to URL
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Moodle returns errors as objects with 'exception' field
            if (data?.exception) {
                throw new Error(data.message || data.exception);
            }

            // Check for error responses
            if (data?.errorcode) {
                throw new Error(data.message || data.errorcode);
            }

            return data;
        } catch (error) {
            logger.error('Moodle API call failed', { 
                wsfunction, 
                error: error.message,
                stack: error.stack 
            });
            
            // Re-throw as AppError for consistent error handling
            throw new AppError(
                `Moodle API error: ${error.message}`,
                502
            );
        }
    }

    /**
     * Get site info (useful for testing connection)
     */
    async getSiteInfo() {
        return await this.call('core_webservice_get_site_info');
    }

    /**
     * Get all courses from Moodle
     */
    async getCourses() {
        try {
            const courses = await this.call('core_course_get_courses');
            
            // Filter out site course (id = 1)
            const filteredCourses = courses.filter(course => course.id !== 1);
            
            logger.info(`Fetched ${filteredCourses.length} courses from Moodle`);
            return filteredCourses;
        } catch (error) {
            logger.error('Failed to fetch Moodle courses', { error: error.message });
            
            // Return empty array for graceful degradation
            return [];
        }
    }

    /**
     * Get course by Moodle ID
     */
    async getCourseById(courseId) {
        try {
            const courses = await this.call('core_course_get_courses_by_field', {
                'field': 'id',
                'value': courseId,
            });

            return courses?.courses?.[0] || null;
        } catch (error) {
            logger.error('Failed to fetch Moodle course', { courseId, error: error.message });
            return null;
        }
    }

    /**
     * Create user in Moodle
     */
    async createUser({ username, password, firstname, lastname, email }) {
        try {
            const users = await this.call('core_user_create_users', {
                'users[0][username]': username,
                'users[0][password]': password,
                'users[0][firstname]': firstname,
                'users[0][lastname]': lastname,
                'users[0][email]': email,
                'users[0][auth]': 'manual',
            });

            if (!users || users.length === 0) {
                throw new Error('No user returned from Moodle');
            }

            logger.info(`Moodle user created: ${username} (ID: ${users[0].id})`);
            
            return users[0]; // { id, username }
        } catch (error) {
            logger.error('Failed to create Moodle user', { 
                username, 
                email, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Update user in Moodle
     */
    async updateUser(userId, { firstname, lastname, email }) {
        try {
            const params = {
                'users[0][id]': userId,
            };

            if (firstname) params['users[0][firstname]'] = firstname;
            if (lastname) params['users[0][lastname]'] = lastname;
            if (email) params['users[0][email]'] = email;

            await this.call('core_user_update_users', params);

            logger.info(`Moodle user ${userId} updated`);
            return { success: true };
        } catch (error) {
            logger.error('Failed to update Moodle user', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Get all Moodle users (manual auth accounts)
     * FIXED: Returns users with proper error handling
     */
    async getAllMoodleUsers() {
        try {
            // Get users by auth method (manual accounts)
            const users = await this.call('core_user_get_users', {
                'criteria[0][key]': 'auth',
                'criteria[0][value]': 'manual',
            });

            return users.users || [];
        } catch (error) {
            logger.error('Failed to get all Moodle users', { error: error.message });
            return [];
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        try {
            const users = await this.call('core_user_get_users_by_field', {
                'field': 'email',
                'values[0]': email,
            });

            return users?.[0] || null;
        } catch (error) {
            logger.error('Failed to find Moodle user by email', { email });
            return null;
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const users = await this.call('core_user_get_users_by_field', {
                'field': 'id',
                'values[0]': userId,
            });

            return users?.[0] || null;
        } catch (error) {
            logger.error('Failed to find Moodle user by ID', { userId });
            return null;
        }
    }

    /**
     * Enroll user in a course
     * @param {number} userId - Moodle user ID
     * @param {number} courseId - Moodle course ID
     * @param {number} roleId - Role ID (5 = student, 3 = editing teacher, 4 = non-editing teacher)
     */
    async enrollUser(userId, courseId, roleId = 5) {
        try {
            await this.call('enrol_manual_enrol_users', {
                'enrolments[0][roleid]': roleId,
                'enrolments[0][userid]': userId,
                'enrolments[0][courseid]': courseId,
            });

            logger.info(`User ${userId} enrolled in Moodle course ${courseId} with role ${roleId}`);
            return { success: true };
        } catch (error) {
            logger.error('Failed to enroll user in Moodle', { 
                userId, 
                courseId, 
                roleId,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Unenroll user from a course
     */
    async unenrollUser(userId, courseId) {
        try {
            await this.call('enrol_manual_unenrol_users', {
                'enrolments[0][userid]': userId,
                'enrolments[0][courseid]': courseId,
            });

            logger.info(`User ${userId} unenrolled from Moodle course ${courseId}`);
            return { success: true };
        } catch (error) {
            logger.error('Failed to unenroll user from Moodle', { 
                userId, 
                courseId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get course completion status for a user
     * FIXED: Added proper error handling and fallback logic
     * 
     * Note: This function requires completion tracking to be enabled in Moodle
     * and the web service function to be available. If not available, returns
     * default not completed status.
     */
    async getCourseCompletion(courseId, userId) {
        try {
            const completion = await this.call('core_completion_get_course_completion_status', {
                'courseid': courseId,
                'userid': userId,
            });

            // Check different possible response structures
            if (completion?.completionstatus) {
                return {
                    completed: completion.completionstatus.completed || false,
                    timecompleted: completion.completionstatus.timecompleted || null,
                };
            }

            // Alternative structure
            if (completion?.completed !== undefined) {
                return {
                    completed: completion.completed || false,
                    timecompleted: completion.timecompleted || null,
                };
            }

            // If completion tracking is not enabled or not configured
            logger.warn('Course completion status returned unexpected structure', { 
                courseId, 
                userId,
                response: completion 
            });
            
            return { 
                completed: false, 
                timecompleted: null,
                warning: 'Completion tracking may not be enabled for this course'
            };

        } catch (error) {
            // Log the error but don't throw - completion tracking might not be enabled
            logger.warn('Failed to fetch Moodle course completion (may not be enabled)', { 
                userId, 
                courseId,
                error: error.message 
            });
            
            return { 
                completed: false, 
                timecompleted: null,
                error: 'Completion tracking unavailable'
            };
        }
    }

    /**
     * Get enrolled users for a course
     * FIXED: Properly extracts and returns role information
     * 
     * Returns users with their roles in the course
     */
    async getEnrolledUsers(courseId) {
        try {
            const users = await this.call('core_enrol_get_enrolled_users', {
                'courseid': courseId,
            });

            // The API returns users with a 'roles' array containing their course roles
            // Each role object has: roleid, name, shortname, sortorder
            // We'll process this to make it easier to use
            const processedUsers = (users || []).map(user => ({
                ...user,
                // Extract primary role (usually the first one)
                primaryRole: user.roles && user.roles.length > 0 ? {
                    id: user.roles[0].roleid,
                    name: user.roles[0].name,
                    shortname: user.roles[0].shortname
                } : null,
                // Keep all roles for reference
                allRoles: user.roles || []
            }));

            return processedUsers;
        } catch (error) {
            logger.error('Failed to fetch enrolled users', { courseId, error: error.message });
            return [];
        }
    }

    /**
     * Assign role to user
     */
    async assignRole(userId, roleId, contextId) {
        try {
            await this.call('core_role_assign_roles', {
                'assignments[0][roleid]': roleId,
                'assignments[0][userid]': userId,
                'assignments[0][contextid]': contextId,
            });

            logger.info(`Role ${roleId} assigned to user ${userId} in context ${contextId}`);
            return { success: true };
        } catch (error) {
            logger.error('Failed to assign role', { userId, roleId, contextId });
            throw error;
        }
    }

    /**
     * Test Moodle connection
     */
    async testConnection() {
        try {
            const siteInfo = await this.getSiteInfo();
            
            logger.info('Moodle connection successful', {
                sitename: siteInfo.sitename,
                username: siteInfo.username,
                moodleVersion: siteInfo.release,
            });

            return {
                success: true,
                sitename: siteInfo.sitename,
                version: siteInfo.release,
                username: siteInfo.username,
            };
        } catch (error) {
            logger.error('Moodle connection test failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Check if user exists in Moodle by email
     */
    async userExists(email) {
        const user = await this.getUserByEmail(email);
        return user !== null;
    }

    /**
     * Get or create user in Moodle
     */
    async getOrCreateUser({ username, password, firstname, lastname, email }) {
        // Check if user exists
        let user = await this.getUserByEmail(email);

        if (user) {
            logger.info(`Moodle user already exists: ${email} (ID: ${user.id})`);
            return user;
        }

        // Create user
        return await this.createUser({ username, password, firstname, lastname, email });
    }

    /**
     * Helper function to map Moodle role shortname to app role
     * @param {string} roleShortname - Moodle role shortname (student, editingteacher, teacher, etc.)
     * @returns {string} - App role (student, teacher, admin)
     */
    mapMoodleRoleToAppRole(roleShortname) {
        const roleMap = {
            'student': 'student',
            'editingteacher': 'teacher',
            'teacher': 'teacher',
            'manager': 'admin',
            'coursecreator': 'admin',
            'guest': 'student' // Map guest to student
        };

        return roleMap[roleShortname] || 'student';
    }
}

export default new MoodleService();