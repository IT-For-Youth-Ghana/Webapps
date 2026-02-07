/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

import logger from '../utils/logger.js';
import {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
} from '../utils/errors.js';

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error
    logger.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.userId,
    });

    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message,
        }));
        error = new ValidationError('Validation failed', errors);
    }

    // Sequelize Unique Constraint Error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field';
        error = new ValidationError(`${field} already exists`);
    }

    // Sequelize Foreign Key Constraint Error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        error = new ValidationError('Invalid reference to related resource');
    }

    // Sequelize Database Error
    if (err.name === 'SequelizeDatabaseError') {
        error = new AppError('Database error occurred', 500);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = new UnauthorizedError('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = new UnauthorizedError('Token expired');
    }

    // Multer File Upload Errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            error = new ValidationError('File size too large');
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            error = new ValidationError('Too many files');
        } else {
            error = new ValidationError(err.message);
        }
    }

    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(error.errors && { errors: error.errors }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
            }),
        },
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncErrorHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
    errorHandler,
    notFoundHandler,
    asyncErrorHandler,
};