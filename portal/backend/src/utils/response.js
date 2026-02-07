/**
 * Standardized API Response Helpers
 */

/**
 * Send success response
 */
const successResponse = (res, { statusCode = 200, message = 'Success', data = null }) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Send error response
 */
const errorResponse = (res, { statusCode = 500, message = 'An error occurred', errors = null }) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

/**
 * Send paginated response
 */
const paginatedResponse = (res, { data, pagination, message = 'Success' }) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
    });
};

export { successResponse, errorResponse, paginatedResponse };
