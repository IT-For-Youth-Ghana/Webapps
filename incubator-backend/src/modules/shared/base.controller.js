/**
 * Base Controller Class
 * 
 * Provides common functionality for all controllers:
 * - Request/response handling
 * - Error normalization
 * - Validation
 * - Pagination
 * - Response formatting
 * - Async error catching
 * 
 * All feature controllers should extend this class
 */

import { AsyncLocalStorage } from "async_hooks";
import {
  sendSuccessResponse,
  sendErrorResponse,
  paginationResponse,
} from "../../utils/helpers/response.helpers";
import {
  HTTP_STATUS_CODES,
  ERROR_MESSAGES,
  DEFAULT_PAGINATION,
} from "../../utils/constants";

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * @abstract
 * @class BaseController
 */
class BaseController {
  /**
   * @param {Object} services - Injected services (e.g., { user: userService })
   * @param {Object} [options] - Optional configuration
   */
  constructor(services = {}, options = {}) {
    if (new.target === BaseController) {
      throw new Error(
        "BaseController is abstract and cannot be instantiated directly"
      );
    }

    this.services = { ...services };
    this.options = {
      enableLogging: true,
      enableMetrics: false,
      ...options,
    };

    // Bind context methods
    this.runInContext = this.runInContext.bind(this);
    this.getContext = this.getContext.bind(this);
  }

  // ========================================
  // 1. CONTEXT & TRACING
  // ========================================

  /**
   * Run a handler within async context (for request ID, user, etc.)
   * @param {Object} context - { requestId, userId, action, etc. }
   * @param {Function} callback - Async handler function
   * @returns {Promise<any>}
   */
  runInContext(context, callback) {
    return asyncLocalStorage.run(context, callback);
  }

  /**
   * Get current async context
   * @returns {Object|null}
   */
  getContext() {
    return asyncLocalStorage.getStore() || null;
  }

  // ========================================
  // 2. SERVICE ACCESS
  // ========================================

  /**
   * Get service by name
   * @param {string} name - Service name
   * @returns {any}
   * @throws {Error} If service not found
   */
  service(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(
        `Service '${name}' not injected into ${this.constructor.name}`
      );
    }
    return service;
  }

  // ========================================
  // 3. REQUEST HELPERS
  // ========================================

  /**
   * Extract pagination params from request query
   * @param {Object} req - Express request
   * @returns {{ page: number, limit: number }}
   */
  getPagination(req) {
    const page = parseInt(req.query.page, 10) || DEFAULT_PAGINATION.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || DEFAULT_PAGINATION.LIMIT,
      DEFAULT_PAGINATION.MAX_LIMIT
    );

    return { page, limit };
  }

  /**
   * Extract filters from request query
   * @param {Object} req - Express request
   * @param {string[]} allowedFields - Allowed filter fields
   * @returns {Object}
   */
  getFilters(req, allowedFields = []) {
    const filters = {};

    allowedFields.forEach((field) => {
      if (req.query[field] !== undefined) {
        filters[field] = req.query[field];
      }
    });

    return filters;
  }

  /**
   * Extract sort params from request query
   * @param {Object} req - Express request
   * @param {string} [defaultSort='-created_at'] - Default sort field
   * @returns {Object}
   */
  getSort(req, defaultSort = "-created_at") {
    const sortParam = req.query.sort || defaultSort;
    const sort = {};

    sortParam.split(",").forEach((field) => {
      if (field.startsWith("-")) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });

    return sort;
  }

  /**
   * Extract select fields from request query
   * @param {Object} req - Express request
   * @returns {string|null}
   */
  getSelect(req) {
    return req.query.select || null;
  }

  /**
   * Get authenticated user from request
   * @param {Object} req - Express request
   * @returns {Object|null}
   */
  getUser(req) {
    return req.user || null;
  }

  /**
   * Check if user is authenticated
   * @param {Object} req - Express request
   * @returns {boolean}
   */
  isAuthenticated(req) {
    return !!req.user;
  }

  /**
   * Check if user has specific role
   * @param {Object} req - Express request
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  hasRole(req, role) {
    return req.user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {Object} req - Express request
   * @param {string[]} roles - Roles to check
   * @returns {boolean}
   */
  hasAnyRole(req, roles) {
    return req.user && roles.includes(req.user.role);
  }

  // ========================================
  // 4. RESPONSE HELPERS
  // ========================================

  /**
   * Send success response
   * @param {Object} res - Express response
   * @param {any} data - Response data
   * @param {string} [message='Success'] - Success message
   * @param {number} [statusCode=200] - HTTP status code
   */
  success(res, data, message = "Success", statusCode = HTTP_STATUS_CODES.OK) {
    return sendSuccessResponse(res, data, message, statusCode);
  }

  /**
   * Send created response (201)
   * @param {Object} res - Express response
   * @param {any} data - Created resource data
   * @param {string} [message='Created successfully'] - Success message
   */
  created(res, data, message = "Created successfully") {
    return sendSuccessResponse(res, data, message, HTTP_STATUS_CODES.CREATED);
  }

  /**
   * Send no content response (204)
   * @param {Object} res - Express response
   */
  noContent(res) {
    return res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response
   * @param {Array} data - Data array
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} totalItems - Total items count
   */
  paginated(res, data, page, limit, totalItems) {
    return paginationResponse(res, data, page, limit, totalItems);
  }

  /**
   * Send error response
   * @param {Object} res - Express response
   * @param {Error|string} error - Error object or message
   * @param {string} [message] - User-friendly message
   * @param {number} [statusCode=500] - HTTP status code
   */
  error(
    res,
    error,
    message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  ) {
    return sendErrorResponse(res, error, message, statusCode);
  }

  /**
   * Send bad request error (400)
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  badRequest(res, message = ERROR_MESSAGES.INVALID_REQUEST) {
    return sendErrorResponse(
      res,
      new Error(message),
      message,
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  /**
   * Send unauthorized error (401)
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  unauthorized(res, message = ERROR_MESSAGES.UNAUTHORIZED) {
    return sendErrorResponse(
      res,
      new Error(message),
      message,
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
  }

  /**
   * Send forbidden error (403)
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  forbidden(res, message = ERROR_MESSAGES.FORBIDDEN) {
    return sendErrorResponse(
      res,
      new Error(message),
      message,
      HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  /**
   * Send not found error (404)
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  notFound(res, message = ERROR_MESSAGES.USER_NOT_FOUND) {
    return sendErrorResponse(
      res,
      new Error(message),
      message,
      HTTP_STATUS_CODES.NOT_FOUND
    );
  }

  /**
   * Send conflict error (409)
   * @param {Object} res - Express response
   * @param {string} message - Error message
   */
  conflict(res, message = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
    return sendErrorResponse(
      res,
      new Error(message),
      message,
      HTTP_STATUS_CODES.CONFLICT
    );
  }

  /**
   * Send validation error (422)
   * @param {Object} res - Express response
   * @param {string|Object} errors - Validation errors
   */
  validationError(res, errors) {
    return res.status(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).json({
      status: "error",
      message: "Validation failed",
      errors: typeof errors === "string" ? { message: errors } : errors,
    });
  }

  // ========================================
  // 5. ASYNC ERROR WRAPPER
  // ========================================

  /**
   * Wrap async controller method to catch errors
   * @param {Function} fn - Async controller method
   * @returns {Function} Wrapped function
   * 
   * @example
   * async create(req, res) {
   *   // No try-catch needed!
   *   const result = await this.service('user').create(req.body);
   *   return this.created(res, result);
   * }
   * 
   * // In routes:
   * router.post('/', controller.asyncHandler(controller.create));
   */
  asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn.call(this, req, res, next);
      } catch (error) {
        this.handleError(req, res, error);
      }
    };
  }

  /**
   * Handle errors and send appropriate response
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Error} error - Error object
   */
  handleError(req, res, error) {
    this.log("error", {
      action: req.originalUrl,
      method: req.method,
      error: error.message,
      stack: error.stack,
    });

    // Determine status code and message based on error type
    let statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    if (error.message.includes("not found") || error.message.includes("Not found")) {
      statusCode = HTTP_STATUS_CODES.NOT_FOUND;
      message = error.message;
    } else if (error.message.includes("Validation failed")) {
      statusCode = HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY;
      message = error.message;
    } else if (error.message.includes("Duplicate") || error.message.includes("already exists")) {
      statusCode = HTTP_STATUS_CODES.CONFLICT;
      message = error.message;
    } else if (error.message.includes("Unauthorized") || error.message.includes("Invalid credentials")) {
      statusCode = HTTP_STATUS_CODES.UNAUTHORIZED;
      message = error.message;
    } else if (error.message.includes("Forbidden") || error.message.includes("permission")) {
      statusCode = HTTP_STATUS_CODES.FORBIDDEN;
      message = error.message;
    }

    return sendErrorResponse(res, error, message, statusCode);
  }

  // ========================================
  // 6. LOGGING
  // ========================================

  /**
   * Log action with context
   * @param {string} level - Log level (info, warn, error)
   * @param {Object} meta - Metadata
   */
  log(level, meta = {}) {
    if (!this.options.enableLogging) return;

    const context = this.getContext() || {};
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      controller: this.constructor.name,
      ...context,
      ...meta,
    };

    // In production, use Winston or Pino
    console.log(JSON.stringify(logEntry));
  }

  // ========================================
  // 7. VALIDATION
  // ========================================

  /**
   * Validate request body against schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} - Validated data
   * @throws {Error} - Validation error
   */
  validate(data, schema) {
    if (!schema || !schema.validate) {
      throw new Error("Invalid validation schema provided");
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join("; ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    return value;
  }

  // ========================================
  // 8. COMMON CRUD PATTERNS
  // ========================================

  /**
   * Generic list handler with pagination and filters
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {string} serviceName - Service to use
   * @param {string} [method='listAll'] - Service method name
   * @param {string[]} [allowedFilters=[]] - Allowed filter fields
   */
  async handleList(req, res, serviceName, method = "listAll", allowedFilters = []) {
    const { page, limit } = this.getPagination(req);
    const filters = this.getFilters(req, allowedFilters);
    const sort = this.getSort(req);
    const select = this.getSelect(req);

    const result = await this.service(serviceName)[method](
      filters,
      { page, limit },
      { sort, select }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.paginated(
      res,
      result.data.data,
      result.data.metadata.page,
      result.data.metadata.limit,
      result.data.metadata.total
    );
  }

  /**
   * Generic get by ID handler
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {string} serviceName - Service to use
   * @param {string} [method='getById'] - Service method name
   */
  async handleGetById(req, res, serviceName, method = "getById") {
    const { id } = req.params;

    const result = await this.service(serviceName)[method](id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  }

  /**
   * Generic create handler
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {string} serviceName - Service to use
   * @param {string} [method='create'] - Service method name
   */
  async handleCreate(req, res, serviceName, method = "create") {
    const result = await this.service(serviceName)[method](req.body);

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      if (result.error.message.includes("already exists")) {
        return this.conflict(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.created(res, result.data);
  }

  /**
   * Generic update handler
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {string} serviceName - Service to use
   * @param {string} [method='update'] - Service method name
   */
  async handleUpdate(req, res, serviceName, method = "update") {
    const { id } = req.params;

    const result = await this.service(serviceName)[method](id, req.body);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, result.error.message);
      }
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Updated successfully");
  }

  /**
   * Generic delete handler
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {string} serviceName - Service to use
   * @param {string} [method='delete'] - Service method name
   */
  async handleDelete(req, res, serviceName, method = "delete") {
    const { id } = req.params;

    const result = await this.service(serviceName)[method](id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Deleted successfully");
  }
}

export default BaseController;