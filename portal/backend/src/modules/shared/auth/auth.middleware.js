/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens and attaching user to request
 */

import jwtUtil from './jwt.util.js';
import User from '../../user/user.model.js';
import { UnauthorizedError, ForbiddenError } from '../../../utils/errors.js';
import logger from '../../../utils/logger.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwtUtil.verifyToken(token);

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Check if user is active
        if (user.status !== 'active') {
            throw new UnauthorizedError('Account is inactive');
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        logger.error('Authentication failed', { error: error.message });
        next(error);
    }
};

/**
 * Check if user has required role
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwtUtil.verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (user && user.status === 'active') {
            req.user = user;
            req.userId = user.id;
        }

        next();
    } catch (error) {
        // If optional auth fails, just continue without user
        next();
    }
};

/**
 * Verify temp token (used during registration)
 */
export const verifyTempToken = (req, res, next) => {
    try {
        const { tempToken } = req.body;

        if (!tempToken) {
            throw new UnauthorizedError('Temp token required');
        }

        const decoded = jwtUtil.verifyToken(tempToken);

        if (!decoded.temp) {
            throw new UnauthorizedError('Invalid temp token');
        }

        req.tempTokenData = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user owns the resource
 */
export const checkOwnership = (getUserIdFromParams) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            const resourceUserId = getUserIdFromParams(req);

            // Admin can access any resource
            if (req.user.isAdmin()) {
                return next();
            }

            // Check ownership
            if (req.user.id !== resourceUserId) {
                throw new ForbiddenError('You do not have access to this resource');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default {
    authenticate,
    authorize,
    requireRole: authorize,
    optionalAuth,
    verifyTempToken,
    checkOwnership,
};

// Named export for requireRole (alias for authorize)
export const requireRole = authorize;