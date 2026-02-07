/**
 * Custom Error Classes for Application
 */

class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}

class ServiceUnavailableError extends AppError {
    constructor(message = 'Service unavailable') {
        super(message, 503, false);
        this.name = 'ServiceUnavailableError';
    }
}

export {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    BadRequestError,
    ServiceUnavailableError,
};
