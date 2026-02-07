/**
 * SSO Service
 * Generates and validates short-lived SSO tokens for Moodle/Incubator
 */

import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';
import User from '../../user/user.model.js';
import logger from '../../../utils/logger.js';
import { ValidationError, ServiceUnavailableError } from '../../../utils/errors.js';

const AUTH_PATH = '/auth/sso';
const VALID_TARGETS = new Set(['moodle', 'incubator']);

class SSOService {
    constructor() {
        this.secret = config.sso?.secret;
        this.expiresIn = config.sso?.expiresIn || '5m';
    }

    ensureConfigured() {
        if (!this.secret) {
            throw new ServiceUnavailableError('SSO is not configured');
        }
    }

    getTargetBaseUrl(target) {
        if (target === 'moodle') return config.moodle?.url;
        if (target === 'incubator') return config.incubator?.url;
        return null;
    }

    normalizeRedirect(redirect) {
        if (!redirect) return null;
        if (typeof redirect !== 'string') {
            throw new ValidationError('Redirect must be a string');
        }
        if (!redirect.startsWith('/')) {
            throw new ValidationError('Redirect must be a relative path');
        }
        return redirect;
    }

    buildPayload(user, target) {
        return {
            user_id: user.id,
            central_user_id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            moodle_user_id: user.moodleUserId || null,
            incubator_user_id: user.incubatorUserId || null,
            roles: [user.role],
            target,
        };
    }

    generateToken(user, target) {
        this.ensureConfigured();

        if (!VALID_TARGETS.has(target)) {
            throw new ValidationError('Invalid SSO target');
        }

        if (target === 'moodle' && !user.moodleUserId) {
            throw new ValidationError('Moodle account not linked');
        }

        const payload = this.buildPayload(user, target);
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    buildRedirectUrl(target, token, redirect) {
        const baseUrl = this.getTargetBaseUrl(target);
        if (!baseUrl) {
            throw new ServiceUnavailableError(`SSO target "${target}" is not configured`);
        }

        const url = new URL(AUTH_PATH, baseUrl);
        url.searchParams.set('token', token);

        if (redirect) {
            url.searchParams.set('redirect', redirect);
        }

        return url.toString();
    }

    async generateRedirect(user, target, redirect) {
        const normalizedRedirect = this.normalizeRedirect(redirect);
        const token = this.generateToken(user, target);
        const redirectUrl = this.buildRedirectUrl(target, token, normalizedRedirect);

        return {
            token,
            redirectUrl,
        };
    }

    async validateToken(token) {
        this.ensureConfigured();

        try {
            const payload = jwt.verify(token, this.secret);
            const userId = payload.user_id || payload.central_user_id || payload.id;

            if (!userId) {
                return { valid: false, reason: 'missing_user_id' };
            }

            const user = await User.findByPk(userId);
            if (!user || user.status !== 'active') {
                return { valid: false, reason: 'user_not_active' };
            }

            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    moodle_user_id: user.moodleUserId,
                    incubator_user_id: user.incubatorUserId,
                    roles: [user.role],
                },
            };
        } catch (error) {
            logger.warn('SSO token validation failed', { error: error.message });
            return { valid: false, reason: 'invalid_or_expired' };
        }
    }
}

export default new SSOService();
