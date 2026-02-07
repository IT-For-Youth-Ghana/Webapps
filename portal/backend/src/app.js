/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express from 'express';
import corsMiddleware from './middlewares/cors.middleware.js';
import loggerMiddleware from './middlewares/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import routes from './routes/index.js';
import config from './config/index.js';
import logger from './utils/logger.js';

// Create Express app
const app = express();

/**
 * Trust proxy
 * Important for rate limiting and getting correct client IP
 */
app.set('trust proxy', 1);

/**
 * Body parsers
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * CORS
 */
app.use(corsMiddleware);

/**
 * HTTP Request Logger
 */
app.use(loggerMiddleware);

/**
 * Rate Limiting
 */
if (config.rateLimit.enabled) {
    app.use(config.server.apiPrefix, apiRateLimiter);
}

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.env,
    });
});

app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

/**
 * API Routes
 */
app.use(config.server.apiPrefix, routes);

/**
 * Welcome route
 */
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to ITFY Portal API',
        version: '1.0.0',
        documentation: `${config.frontend.url}/api-docs`,
    });
});

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Error Handler (must be last)
 */
app.use(errorHandler);

/**
 * Unhandled Promise Rejection Handler
 */
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    if (config.server.env === 'production') {
        // In production, we might want to gracefully shutdown
        process.exit(1);
    }
});

/**
 * Uncaught Exception Handler
 */
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Exit process as app is in undefined state
    process.exit(1);
});

export default app;