/**
 * Security Middleware
 * Adds security headers, compression, and other security measures
 */

import helmet from 'helmet';
import compression from 'compression';
import config from '../config/index.js';

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.paystack.co", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Paystack integration
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Compression middleware
 */
export const compressionMiddleware = compression({
  level: 6, // Good balance between compression and performance
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Use compression filter function
    return compression.filter(req, res);
  },
});

/**
 * Request ID middleware for tracing
 */
export const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] ||
             req.headers['x-correlation-id'] ||
             generateRequestId();

  req.id = id;
  res.setHeader('x-request-id', id);

  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Security audit middleware
 */
export const securityAudit = (req, res, next) => {
  // Log suspicious activities in production
  if (config.server.env === 'production') {
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /<script/i,  // XSS attempts
      /union.*select/i,  // SQL injection
      /eval\(/i,  // Code injection
    ];

    const checkString = `${req.url} ${JSON.stringify(req.body || {})} ${JSON.stringify(req.query || {})}`;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        // Log security event (you might want to send to monitoring service)
        console.warn(`[SECURITY] Suspicious request detected: ${req.method} ${req.url} from ${req.ip}`);
        break;
      }
    }
  }

  next();
};