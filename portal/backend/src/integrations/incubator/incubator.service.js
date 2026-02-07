/**
 * Incubator Integration Service
 * Handles communication with the Incubator/Jobs platform (MongoDB-based)
 */

import logger from '../../utils/logger.js';

const INCUBATOR_API_URL = process.env.INCUBATOR_API_URL;
const INCUBATOR_API_KEY = process.env.INCUBATOR_API_KEY;

class IncubatorService {
    constructor() {
        this.baseUrl = INCUBATOR_API_URL;
        this.apiKey = INCUBATOR_API_KEY;
    }

    /**
     * Make API call to Incubator
     */
    async callApi(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: {
                    'X-API-Key': this.apiKey,
                    'Content-Type': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Incubator API error');
            }

            return await response.json();
        } catch (error) {
            logger.error('Incubator API call failed', { endpoint, error: error.message });
            throw error;
        }
    }

    /**
     * Create user in Incubator (via SSO)
     */
    async createUser({ email, firstName, lastName, centralUserId }) {
        try {
            const result = await this.callApi('/api/users/sso', 'POST', {
                email,
                firstName,
                lastName,
                centralUserId,
                authMethod: 'sso',
            });

            logger.info(`Incubator user created for central ID: ${centralUserId}`);

            return result;
        } catch (error) {
            logger.error('Failed to create Incubator user', { email, centralUserId, error: error.message });
            throw error;
        }
    }

    /**
     * Get user by central ID
     */
    async getUserByCentralId(centralUserId) {
        try {
            const result = await this.callApi(`/api/users/central/${centralUserId}`);
            return result;
        } catch (error) {
            // User not found is not necessarily an error
            if (error.message?.includes('not found')) {
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
            const result = await this.callApi(`/api/users/${incubatorUserId}`, 'PATCH', data);
            logger.info(`Incubator user profile updated: ${incubatorUserId}`);
            return result;
        } catch (error) {
            logger.error('Failed to update Incubator user profile', { incubatorUserId, error: error.message });
            throw error;
        }
    }

    /**
     * Sync user skills from completed courses
     */
    async syncUserSkills(incubatorUserId, skills) {
        try {
            const result = await this.callApi(`/api/users/${incubatorUserId}/skills`, 'PUT', { skills });
            logger.info(`Skills synced for Incubator user: ${incubatorUserId}`);
            return result;
        } catch (error) {
            logger.error('Failed to sync skills', { incubatorUserId, error: error.message });
            throw error;
        }
    }

    /**
     * Get available jobs
     */
    async getJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.callApi(`/api/jobs?${params.toString()}`);
    }

    /**
     * Submit job application
     */
    async submitApplication(jobId, userId, applicationData) {
        return await this.callApi(`/api/jobs/${jobId}/apply`, 'POST', {
            userId,
            ...applicationData,
        });
    }
}

export default new IncubatorService();
