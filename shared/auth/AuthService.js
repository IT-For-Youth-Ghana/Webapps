/**
 * Shared Authentication Service
 * Used by both IT Incubator and Course Management Platform
 *
 * Features:
 * - JWT-based authentication
 * - Token management (access + refresh tokens)
 * - User profile management
 * - Module access control
 */

class AuthService {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.accessTokenKey = 'accessToken';
    this.refreshTokenKey = 'refreshToken';
    this.userKey = 'user';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and tokens
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      this.saveTokens(data.accessToken, data.refreshToken);
      this.saveUser(data.user);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and tokens
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      this.saveTokens(data.accessToken, data.refreshToken);
      this.saveUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        credentials: 'include',
      });

      // Clear local storage regardless of response
      this.clearAuth();

      if (!response.ok) {
        console.warn('Logout request failed, but local data cleared');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Get current user profile from backend
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            return this.getProfile();
          }
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      this.saveUser(data.user);

      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<boolean>} Success status
   */
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearAuth();
        return false;
      }

      const data = await response.json();
      this.saveTokens(data.accessToken, data.refreshToken);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const data = await response.json();
      this.saveUser(data.user);

      return data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<Object>} Response message
   */
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response message
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /**
   * Save tokens to localStorage
   */
  saveTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(this.accessTokenKey, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Save user data to localStorage
   */
  saveUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  /**
   * Get user data from localStorage
   */
  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // ============================================
  // MODULE ACCESS CONTROL
  // ============================================

  /**
   * Check if user has access to a specific module
   * @param {string} module - Module name ('incubator' or 'courses')
   * @returns {boolean}
   */
  hasModuleAccess(module) {
    const user = this.getUser();
    if (!user || !user.modules) {
      return false;
    }
    return user.modules.includes(module);
  }

  /**
   * Check if user has access to incubator module
   */
  hasIncubatorAccess() {
    return this.hasModuleAccess('incubator');
  }

  /**
   * Check if user has access to courses module
   */
  hasCoursesAccess() {
    return this.hasModuleAccess('courses');
  }

  /**
   * Get all accessible modules for current user
   */
  getAccessibleModules() {
    const user = this.getUser();
    return user?.modules || [];
  }

  // ============================================
  // ROLE MANAGEMENT
  // ============================================

  /**
   * Get current user role
   */
  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Check if user is a student
   */
  isStudent() {
    return this.hasRole('student');
  }

  /**
   * Check if user is a teacher
   */
  isTeacher() {
    return this.hasRole('teacher');
  }

  /**
   * Check if user is a company
   */
  isCompany() {
    return this.hasRole('company');
  }

  /**
   * Check if user is an admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }
}

export default AuthService;
