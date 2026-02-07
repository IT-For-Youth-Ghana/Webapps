/**
 * JWT Utility for token generation and verification
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class JWTUtil {
    /**
     * Generate JWT token
     */
    generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    }

    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedError('Token has expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedError('Invalid token');
            }
            throw new UnauthorizedError('Token verification failed');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    decodeToken(token) {
        return jwt.decode(token);
    }

    /**
     * Generate refresh token (longer lived)
     */
    generateRefreshToken(payload) {
        return this.generateToken(payload, '30d');
    }
}

export default new JWTUtil();
