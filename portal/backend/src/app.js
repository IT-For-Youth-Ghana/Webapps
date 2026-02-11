/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express from 'express';
import corsMiddleware from './middlewares/cors.middleware.js';
import loggerMiddleware from './middlewares/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { securityHeaders, compressionMiddleware, requestId, securityAudit } from './middlewares/security.middleware.js';
import routes from './routes/index.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';
import moodleService from './integrations/moodle/moodle.service.js';
import incubatorService from './integrations/incubator/incubator.service.js';

// Create Express app
const app = express();

/**
 * Trust proxy
 * Important for rate limiting and getting correct client IP
 */
app.set('trust proxy', 1);

/**
 * Request ID for tracing
 */
app.use(requestId);

/**
 * Security headers
 */
app.use(securityHeaders);

/**
 * Compression
 */
app.use(compressionMiddleware);

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
 * Security audit
 */
app.use(securityAudit);

/**
 * Rate Limiting
 */
if (config.rateLimit.enabled) {
    app.use(config.server.apiPrefix, apiRateLimiter);
}

/**
 * Health Check Endpoint
 */
app.get('/health', async (req, res) => {
    const health = {
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.env,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        pid: process.pid,
    };

    // Check database connection
    try {
        const { testConnection } = await import('./database/client.js');
        await testConnection();
        health.database = 'connected';
    } catch (error) {
        health.database = 'error';
        health.success = false;
        health.message = 'Database connection failed';
    }

    // Check Redis if enabled
    if (config.redis.enabled) {
        try {
            const { getRedisClient } = await import('./config/redis.js');
            const redis = getRedisClient();
            await redis.ping();
            health.redis = 'connected';
        } catch (error) {
            health.redis = 'error';
        }
    }

    const statusCode = health.success ? 200 : 503;
    res.status(statusCode).json(health);
});

/**
 * Detailed health check with integrations
 */
app.get('/health/detailed', async (req, res) => {
    const results = {
        success: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        integrations: {
            moodle: 'unconfigured',
            incubator: 'unconfigured',
            database: 'unknown',
            redis: 'unconfigured',
        },
        system: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            arch: process.arch,
        },
    };

    // Database check
    try {
        const { testConnection } = await import('./database/client.js');
        await testConnection();
        results.integrations.database = 'connected';
    } catch (error) {
        results.integrations.database = 'error';
        results.success = false;
    }

    // Redis check
    if (config.redis.enabled) {
        try {
            const { getRedisClient } = await import('./config/redis.js');
            const redis = getRedisClient();
            await redis.ping();
            results.integrations.redis = 'connected';
        } catch (error) {
            results.integrations.redis = 'error';
        }
    }

    // Moodle check
    if (config.moodle.enabled) {
        try {
            await moodleService.testConnection();
            results.integrations.moodle = 'connected';
        } catch (error) {
            results.integrations.moodle = 'error';
        }
    }

    // Incubator check
    if (config.incubator.enabled) {
        try {
            await incubatorService.testConnection();
            results.integrations.incubator = 'connected';
        } catch (error) {
            results.integrations.incubator = 'error';
        }
    }

    const statusCode = results.success ? 200 : 503;
    res.status(statusCode).json(results);
});

/**
 * Legacy integrations health check
 */
app.get('/health/integrations', async (req, res) => {
    const results = {
        moodle: 'unconfigured',
        incubator: 'unconfigured',
    };

    if (config.moodle.enabled) {
        try {
            await moodleService.testConnection();
            results.moodle = 'connected';
        } catch (error) {
            results.moodle = 'error';
        }
    }

    if (config.incubator.enabled) {
        try {
            await incubatorService.testConnection();
            results.incubator = 'connected';
        } catch (error) {
            results.incubator = 'error';
        }
    }

    res.json({ success: true, integrations: results });
});

app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

/**
 * API Documentation
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ITFY Portal API Docs',
}));

// Swagger JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
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