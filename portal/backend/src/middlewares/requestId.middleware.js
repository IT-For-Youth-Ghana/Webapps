/**
 * Request ID Middleware
 * Adds unique request IDs for tracing and debugging
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware for tracing
 */
export const requestId = (req, res, next) => {
  // Get request ID from header or generate new one
  const id = req.headers['x-request-id'] ||
             req.headers['x-correlation-id'] ||
             generateRequestId();

  // Attach to request object
  req.id = id;

  // Add to response headers
  res.setHeader('x-request-id', id);

  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  // Use timestamp + random for uniqueness
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current request ID from request object
 */
export const getRequestId = (req) => {
  return req.id || 'unknown';
};