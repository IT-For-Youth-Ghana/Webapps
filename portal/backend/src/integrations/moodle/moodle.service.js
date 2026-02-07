/**
 * Moodle Integration Service
 * Handles communication with Moodle LMS API
 */

import logger from '../../utils/logger.js';

const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

class MoodleService {
    constructor() {
        this.baseUrl = `${MOODLE_URL}/webservice/rest/server.php`;
        this.token = MOODLE_TOKEN;
    }

    /**
     * Make API call to Moodle
     */
    async callApi(wsfunction, params = {}) {
        try {
            const url = new URL(this.baseUrl);
            url.searchParams.append('wstoken', this.token);
            url.searchParams.append('wsfunction', wsfunction);
            url.searchParams.append('moodlewsrestformat', 'json');

            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await fetch(url.toString());
            const data = await response.json();

            if (data.exception) {
                throw new Error(data.message || 'Moodle API error');
            }

            return data;
        } catch (error) {
            logger.error('Moodle API call failed', { wsfunction, error: error.message });
            throw error;
        }
    }

    /**
     * Get all courses from Moodle
     */
    async getCourses() {
        try {
            const courses = await this.callApi('core_course_get_courses');
            logger.info(`Fetched ${courses.length} courses from Moodle`);
            return courses;
        } catch (error) {
            logger.error('Failed to fetch Moodle courses', error);
            // Return empty array for graceful degradation
            return [];
        }
    }

    /**
     * Get course by ID
     */
    async getCourseById(courseId) {
        const courses = await this.callApi('core_course_get_courses', {
            'options[ids][0]': courseId,
        });
        return courses[0] || null;
    }

    /**
     * Create user in Moodle
     */
    async createUser({ username, password, firstname, lastname, email }) {
        try {
            const result = await this.callApi('core_user_create_users', {
                'users[0][username]': username,
                'users[0][password]': password,
                'users[0][firstname]': firstname,
                'users[0][lastname]': lastname,
                'users[0][email]': email,
            });

            logger.info(`Moodle user created: ${username}`);
            return result[0];
        } catch (error) {
            logger.error('Failed to create Moodle user', { username, error: error.message });
            throw error;
        }
    }

    /**
     * Enroll user in a course
     */
    async enrollUser(userId, courseId, roleId = 5) {
        // roleId 5 = student role in Moodle
        try {
            await this.callApi('enrol_manual_enrol_users', {
                'enrolments[0][roleid]': roleId,
                'enrolments[0][userid]': userId,
                'enrolments[0][courseid]': courseId,
            });

            logger.info(`User ${userId} enrolled in Moodle course ${courseId}`);
            return { success: true };
        } catch (error) {
            logger.error('Failed to enroll user in Moodle', { userId, courseId, error: error.message });
            throw error;
        }
    }

    /**
     * Get user's course progress
     */
    async getUserCourseProgress(userId, courseId) {
        try {
            const progress = await this.callApi('core_completion_get_course_completion_status', {
                courseid: courseId,
                userid: userId,
            });
            return progress;
        } catch (error) {
            logger.error('Failed to fetch Moodle progress', { userId, courseId });
            return null;
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        try {
            const users = await this.callApi('core_user_get_users', {
                'criteria[0][key]': 'email',
                'criteria[0][value]': email,
            });
            return users.users?.[0] || null;
        } catch (error) {
            logger.error('Failed to find Moodle user by email', { email });
            return null;
        }
    }
}

export default new MoodleService();
