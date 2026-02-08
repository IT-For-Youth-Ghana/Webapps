/**
 * SSO Service
 * Generates and validates JWT tokens for seamless login to Moodle/Incubator
 * Implements secure token-based SSO with proper validation
 */

import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';
import User from '../../user/user.model.js';
import logger from '../../../utils/logger.js';
import { ValidationError, UnauthorizedError, ServiceUnavailableError } from '../../../utils/errors.js';

const SSO_AUTH_PATH = '/auth/sso';
const VALID_TARGETS = new Set(['moodle', 'incubator']);

class SSOService {
    constructor() {
        this.secret = config.sso?.secret;
        this.expiresIn = config.sso?.expiresIn || '5m';
        this.issuer = config.frontend?.url || 'https://portal.itforyouthghana.org';
    }

    /**
     * Ensure SSO is configured
     */
    ensureConfigured() {
        if (!this.secret) {
            throw new ServiceUnavailableError('SSO is not configured. Please set SSO_SECRET in environment variables.');
        }
    }

    /**
     * Get target system base URL
     */
    getTargetBaseUrl(target) {
        if (target === 'moodle') {
            return config.moodle?.url;
        }
        if (target === 'incubator') {
            return config.incubator?.url;
        }
        return null;
    }

    /**
     * Validate and normalize redirect path
     */
    normalizeRedirect(redirect) {
        if (!redirect) return null;

        if (typeof redirect !== 'string') {
            throw new ValidationError('Redirect must be a string');
        }

        // Must be relative path for security
        if (!redirect.startsWith('/')) {
            throw new ValidationError('Redirect must be a relative path (start with /)');
        }

        // Prevent open redirect
        if (redirect.includes('//') || redirect.includes('\\')) {
            throw new ValidationError('Invalid redirect path');
        }

        return redirect;
    }

    /**
     * Build JWT payload for SSO token
     */
    buildPayload(user, target) {
        const payload = {
            // Standard JWT claims
            iss: this.issuer,                    // Issuer
            aud: this.getTargetBaseUrl(target),  // Audience
            sub: user.email,                      // Subject (user identifier)
            
            // Custom claims
            user_id: user.id,
            central_user_id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            full_name: user.getFullName(),
            role: user.role,
            roles: [user.role],
            
            // External system IDs
            moodle_user_id: user.moodleUserId || null,
            incubator_user_id: user.incubatorUserId || null,
            
            // Target system
            target,
            
            // Issued at
            iat: Math.floor(Date.now() / 1000),
        };

        return payload;
    }

    /**
     * Generate SSO JWT token
     */
    generateToken(user, target) {
        this.ensureConfigured();

        // Validate target
        if (!VALID_TARGETS.has(target)) {
            throw new ValidationError(`Invalid SSO target. Must be one of: ${[...VALID_TARGETS].join(', ')}`);
        }

        // Validate Moodle user exists for Moodle target
        if (target === 'moodle' && !user.moodleUserId) {
            throw new ValidationError('Moodle account not linked. Please complete enrollment first.');
        }

        // Build payload
        const payload = this.buildPayload(user, target);

        // Sign token with expiration
        const token = jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
            algorithm: 'HS256',
        });

        logger.info(`SSO token generated for user ${user.id} to ${target}`);

        return token;
    }

    /**
     * Build redirect URL with SSO token
     */
    buildRedirectUrl(target, token, redirect = null) {
        const baseUrl = this.getTargetBaseUrl(target);

        if (!baseUrl) {
            throw new ServiceUnavailableError(`SSO target "${target}" is not configured`);
        }

        try {
            const url = new URL(SSO_AUTH_PATH, baseUrl);
            url.searchParams.set('token', token);

            if (redirect) {
                url.searchParams.set('redirect', redirect);
            }

            return url.toString();
        } catch (error) {
            throw new ValidationError(`Invalid base URL for ${target}: ${baseUrl}`);
        }
    }

    /**
     * Generate SSO token and redirect URL
     * @param {Object} user - User object from database
     * @param {string} target - Target system (moodle, incubator)
     * @param {string} redirect - Optional redirect path after login
     */
    async generateRedirect(user, target, redirect = null) {
        // Normalize redirect
        const normalizedRedirect = this.normalizeRedirect(redirect);

        // Generate token
        const token = this.generateToken(user, target);

        // Build redirect URL
        const redirectUrl = this.buildRedirectUrl(target, token, normalizedRedirect);

        logger.info(`SSO redirect generated: user=${user.id}, target=${target}`);

        return {
            token,
            redirectUrl,
            expiresIn: this.expiresIn,
        };
    }

    /**
     * Validate SSO token
     * Used by Moodle/Incubator to verify incoming tokens
     */
    async validateToken(token) {
        this.ensureConfigured();

        try {
            // Verify and decode token
            const payload = jwt.verify(token, this.secret, {
                algorithms: ['HS256'],
            });

            // Extract user ID
            const userId = payload.user_id || payload.central_user_id || payload.id;

            if (!userId) {
                return {
                    valid: false,
                    reason: 'missing_user_id',
                    message: 'Token does not contain user ID',
                };
            }

            // Get user from database
            const user = await User.findByPk(userId);

            if (!user) {
                return {
                    valid: false,
                    reason: 'user_not_found',
                    message: 'User not found',
                };
            }

            // Check if user is active
            if (user.status !== 'active') {
                return {
                    valid: false,
                    reason: 'user_not_active',
                    message: 'User account is not active',
                };
            }

            // Token is valid
            logger.info(`SSO token validated successfully for user ${user.id}`);

            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    full_name: user.getFullName(),
                    moodle_user_id: user.moodleUserId,
                    incubator_user_id: user.incubatorUserId,
                    role: user.role,
                    roles: [user.role],
                },
            };
        } catch (error) {
            logger.warn('SSO token validation failed', {
                error: error.name,
                message: error.message,
            });

            // Determine reason
            let reason = 'invalid_or_expired';
            if (error.name === 'TokenExpiredError') {
                reason = 'token_expired';
            } else if (error.name === 'JsonWebTokenError') {
                reason = 'invalid_token';
            }

            return {
                valid: false,
                reason,
                message: error.message,
            };
        }
    }

    /**
     * Generate Moodle login URL with SSO token
     * Convenience method for Moodle-specific SSO
     */
    async generateMoodleLoginUrl(user, courseId = null) {
        // Validate Moodle is configured
        if (!config.moodle?.url) {
            throw new ServiceUnavailableError('Moodle is not configured');
        }

        // Build redirect path (course page if specified)
        let redirect = null;
        if (courseId) {
            redirect = `/course/view.php?id=${courseId}`;
        }

        // Generate redirect
        const result = await this.generateRedirect(user, 'moodle', redirect);

        return result.redirectUrl;
    }

    /**
     * Generate Incubator login URL with SSO token
     * Convenience method for Incubator-specific SSO
     */
    async generateIncubatorLoginUrl(user, redirect = null) {
        // Validate Incubator is configured
        if (!config.incubator?.url) {
            throw new ServiceUnavailableError('Incubator is not configured');
        }

        // Generate redirect
        const result = await this.generateRedirect(user, 'incubator', redirect);

        return result.redirectUrl;
    }

    /**
     * Decode token without verification (for debugging)
     */
    decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get token expiration time
     */
    getTokenExpiration(token) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) {
            return null;
        }

        return new Date(decoded.exp * 1000);
    }
}

export default new SSOService();