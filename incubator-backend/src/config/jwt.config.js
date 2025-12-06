/* eslint-disable no-undef */
/**
 * The JWT configuration file
 * This file defines the configuration settings for JWT (JSON Web Token)
 * It includes settings such as secret keys, expiration times, and algorithms
 */

import { JWT_EXPIRATION } from "../utils/constants.js";
import { isProduction } from "../utils/environment.js"; // You'll need to create this

// Validate required environment variables
const validateRequiredEnvVars = () => {
  const requiredVars = ['JWT_SECRET', 'JWT_ISSUER', 'JWT_AUDIENCE'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (isProduction() && missingVars.length > 0) {
    throw new Error(`Missing required JWT environment variables: ${missingVars.join(', ')}`);
  }
};

validateRequiredEnvVars();

export const JWT_CONFIG = {
  SECRET_KEY: process.env.JWT_SECRET || 'dev-jwt-secret-fallback-do-not-use-in-production',
  ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  
  // Token expiration settings
  EXPIRATION: {
    ACCESS_TOKEN: JWT_EXPIRATION?.ACCESS_TOKEN || '15m',
    REFRESH_TOKEN: JWT_EXPIRATION?.REFRESH_TOKEN || '7d',
    RESET_TOKEN: JWT_EXPIRATION?.RESET_TOKEN || '1h',
    VERIFICATION_TOKEN: JWT_EXPIRATION?.VERIFICATION_TOKEN || '24h',
  },

  // Security settings
  ISSUER: process.env.JWT_ISSUER || 'it-youth-talent-incubator',
  AUDIENCE: process.env.JWT_AUDIENCE || 'api.it-youth-talent-incubator.com',

  // Token options
  TOKEN_OPTIONS: {
    noTimestamp: false,             // Include issued at timestamp
  },

  // Refresh token rotation settings
  REFRESH_TOKEN_ROTATION: {
    enabled: process.env.JWT_REFRESH_ROTATION_ENABLED === 'true' || false,
    maxAge: process.env.JWT_REFRESH_MAX_AGE || '30d', // Maximum lifetime even with rotation
  },

  // Custom claims configuration
  CUSTOM_CLAIMS: {
    includeRole: true,
    includeStatus: process.env.JWT_INCLUDE_STATUS === 'true' || false,
    includeUserId: true,
    permissions: process.env.JWT_INCLUDE_PERMISSIONS === 'true' || false,
  },

  // Security headers and validation
  VALIDATION: {
    algorithms: ['HS256', 'RS256'], // Supported algorithms (fallback support)
    maxAge: '2h',                   // Maximum token age for verification
    ignoreExpiration: !isProduction,        // Never ignore expiration in production
  },
};