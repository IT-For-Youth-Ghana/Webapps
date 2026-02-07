/**
 * Logger Middleware
 * Logs HTTP requests using Morgan
 */

import morgan from 'morgan';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Morgan stream to Winston
 */
const stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

/**
 * Skip logging for health check endpoints
 */
const skip = (req, res) => {
    const skipPaths = ['/health', '/api/health', '/ping'];
    return skipPaths.includes(req.path);
};

/**
 * Morgan format based on environment
 */
const format = config.server.env === 'production' 
    ? 'combined' 
    : 'dev';

/**
 * Custom token for user ID
 */
morgan.token('user-id', (req) => {
    return req.userId || 'anonymous';
});

/**
 * Custom format with user ID
 */
const customFormat = ':method :url :status :res[content-length] - :response-time ms - User: :user-id';

/**
 * Logger middleware
 */
export const loggerMiddleware = morgan(
    config.server.env === 'development' ? 'dev' : customFormat,
    { stream, skip }
);

export default loggerMiddleware;