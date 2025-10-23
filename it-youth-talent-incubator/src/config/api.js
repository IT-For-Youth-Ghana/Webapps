/**
 * API Configuration for IT Youth Talent Incubator
 */

import AuthService from '../../../shared/auth/AuthService';

// API Base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'IT Youth Talent Incubator',
  module: import.meta.env.VITE_APP_MODULE || 'incubator',
};

// File Upload Configuration
export const FILE_CONFIG = {
  maxSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880, // 5MB
  allowedTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ],
};

// Feature Flags
export const FEATURES = {
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
};

// Initialize Auth Service (singleton)
export const authService = new AuthService(API_BASE_URL);

/**
 * Create authenticated fetch wrapper
 * Automatically includes Authorization header
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = authService.getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await authService.refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      headers['Authorization'] = `Bearer ${authService.getAccessToken()}`;
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      // Refresh failed, redirect to login
      authService.clearAuth();
      window.location.href = '/login';
    }
  }

  return response;
};

/**
 * API Error Handler
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.message.includes('Failed to fetch')) {
    return {
      success: false,
      message: 'Unable to connect to server. Please check your connection.',
    };
  }

  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };
};

export default {
  API_BASE_URL,
  APP_CONFIG,
  FILE_CONFIG,
  FEATURES,
  authService,
  authenticatedFetch,
  handleApiError,
};
