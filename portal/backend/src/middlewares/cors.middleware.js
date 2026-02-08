/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing
 */

import cors from 'cors';
import config from '../config/index.js';

/**
 * CORS options configuration
 */
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        const allowedOrigins = config.cors.origin === '*' 
            ? [origin] 
            : config.cors.origins.map(o => o.trim());

        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
};

/**
 * Apply CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;