/**
 * Incubator Integration Service
 * Handles communication with the Incubator/Jobs platform (MongoDB-based)
 * Provides user management and skill syncing capabilities
 */

import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { AppError, ServiceUnavailableError, NotFoundError } from '../../utils/errors.js';

class IncubatorService {
    constructor() {
        this.baseUrl = config.incubator?.url;
        this.apiKey = config.incubator?.secret;
        this.enabled = config.incubator?.enabled || false;
    }

    /**
     * Check if Incubator integration is configured and enabled
     */
    ensureConfigured() {
        if (!this.enabled || !this.baseUrl || !this.apiKey) {
            throw new ServiceUnavailableError('Incubator integration is not configured');
        }
    }

    /**
     * Make API call to Incubator with proper error handling
     */
    async call(endpoint, method = 'GET', body = null) {
        this.ensureConfigured();

        try {
            const url = `${this.baseUrl}${endpoint}`;

            const options = {
                method,
                headers: {
                    'X-API-Key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || 
                    errorData.error || 
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            logger.error('Incubator API call failed', {
                endpoint,
                method,
                error: error.message,
                stack: error.stack,
            });

            // Re-throw as AppError for consistent error handling
            throw new AppError(
                `Incubator API error: ${error.message}`,
                502
            );
        }
    }

    /**
     * Create user in Incubator (via SSO)
     */
    async createUser({ email, firstName, lastName, centralUserId }) {
        try {
            const result = await this.call('/api/users/sso', 'POST', {
                email,
                firstName,
                lastName,
                centralUserId,
                authMethod: 'sso',
            });

            logger.info(`Incubator user created for central ID: ${centralUserId}`, {
                incubatorUserId: result._id || result.id,
                email,
            });

            return result;
        } catch (error) {
            logger.error('Failed to create Incubator user', {
                email,
                centralUserId,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get user by central ID
     */
    async getUserByCentralId(centralUserId) {
        try {
            const result = await this.call(`/api/users/central/${centralUserId}`, 'GET');
            return result;
        } catch (error) {
            // User not found is not necessarily an error
            if (error.message?.includes('not found') || error.message?.includes('404')) {
                logger.debug(`Incubator user not found for central ID: ${centralUserId}`);
                return null;
            }

            logger.error('Failed to fetch Incubator user', {
                centralUserId,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get user by Incubator ID
     */
    async getUserById(incubatorUserId) {
        try {
            const result = await this.call(`/api/users/${incubatorUserId}`, 'GET');
            return result;
        } catch (error) {
            if (error.message?.includes('not found') || error.message?.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(incubatorUserId, data) {
        try {
            const result = await this.call(`/api/users/${incubatorUserId}`, 'PATCH', data);

            logger.info(`Incubator user profile updated: ${incubatorUserId}`);

            return result;
        } catch (error) {
            logger.error('Failed to update Incubator user profile', {
                incubatorUserId,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Sync user skills from completed courses
     */
    async syncUserSkills(incubatorUserId, skills) {
        try {
            const result = await this.call(
                `/api/users/${incubatorUserId}/skills`,
                'PUT',
                { skills }
            );

            logger.info(`Skills synced for Incubator user: ${incubatorUserId}`, {
                skillCount: skills.length,
            });

            return result;
        } catch (error) {
            logger.error('Failed to sync skills', {
                incubatorUserId,
                skillCount: skills.length,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get available jobs
     */
    async getJobs(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const result = await this.call(`/api/jobs?${params.toString()}`, 'GET');

            return result;
        } catch (error) {
            logger.error('Failed to fetch jobs', { filters, error: error.message });
            return { jobs: [], total: 0 };
        }
    }

    /**
     * Get job by ID
     */
    async getJobById(jobId) {
        try {
            const result = await this.call(`/api/jobs/${jobId}`, 'GET');
            return result;
        } catch (error) {
            if (error.message?.includes('not found') || error.message?.includes('404')) {
                throw new NotFoundError('Job not found');
            }
            throw error;
        }
    }

    /**
     * Submit job application
     */
    async submitApplication(jobId, userId, applicationData) {
        try {
            const result = await this.call(`/api/jobs/${jobId}/apply`, 'POST', {
                userId,
                ...applicationData,
            });

            logger.info(`Job application submitted`, {
                jobId,
                userId,
                applicationId: result._id || result.id,
            });

            return result;
        } catch (error) {
            logger.error('Failed to submit job application', {
                jobId,
                userId,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get user applications
     */
    async getUserApplications(userId, filters = {}) {
        try {
            const params = new URLSearchParams({ userId, ...filters });
            const result = await this.call(`/api/applications?${params.toString()}`, 'GET');

            return result;
        } catch (error) {
            logger.error('Failed to fetch user applications', {
                userId,
                error: error.message,
            });
            return { applications: [], total: 0 };
        }
    }

    /**
     * Test Incubator connection
     */
    async testConnection() {
        try {
            // Attempt to call a simple endpoint
            const result = await this.call('/api/health', 'GET');

            logger.info('Incubator connection successful', {
                status: result.status || 'ok',
            });

            return {
                success: true,
                status: result.status || 'ok',
            };
        } catch (error) {
            logger.error('Incubator connection test failed', {
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get or create user in Incubator
     */
    async getOrCreateUser({ email, firstName, lastName, centralUserId }) {
        // Check if user exists
        let user = await this.getUserByCentralId(centralUserId);

        if (user) {
            logger.info(`Incubator user already exists for central ID: ${centralUserId}`);
            return user;
        }

        // Create user
        return await this.createUser({ email, firstName, lastName, centralUserId });
    }

    /**
     * Sync course completion to Incubator skills
     */
    async syncCourseCompletion(incubatorUserId, course, completionData = {}) {
        try {
            // Extract skills from course
            const skills = this.extractSkillsFromCourse(course);

            if (skills.length === 0) {
                logger.info(`No skills to sync for course: ${course.title}`);
                return { success: true, skillsSynced: 0 };
            }

            // Sync skills
            await this.syncUserSkills(incubatorUserId, skills);

            logger.info(`Course completion synced to Incubator`, {
                incubatorUserId,
                courseId: course.id,
                courseTitle: course.title,
                skillsSynced: skills.length,
            });

            return {
                success: true,
                skillsSynced: skills.length,
                skills,
            };
        } catch (error) {
            logger.error('Failed to sync course completion', {
                incubatorUserId,
                courseId: course.id,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Extract skills from course metadata
     * @private
     */
    extractSkillsFromCourse(course) {
        const skills = [];

        // Add course title as primary skill
        if (course.title) {
            skills.push({
                name: course.title,
                level: course.level || 'intermediate',
                source: 'course_completion',
                verified: true,
            });
        }

        // Add category as skill if available
        if (course.category) {
            skills.push({
                name: course.category,
                level: course.level || 'intermediate',
                source: 'course_completion',
                verified: true,
            });
        }

        return skills;
    }
}

export default new IncubatorService();