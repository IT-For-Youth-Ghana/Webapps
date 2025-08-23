// Authentication Service
// Handles all authentication-related API calls and token management
//
// TODO for co-programmers:
// - Add input validation for all authentication methods
// - Implement secure token storage (consider HttpOnly cookies)
// - Add user session management
// - Implement automatic token refresh logic
// - Add multi-factor authentication support
// - Implement social login providers (Google, LinkedIn)
// - Add password strength validation
// - Implement account lockout after failed attempts
// - Add email verification flow
// - Implement remember me functionality with secure tokens

import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password })
    return response.data
  },

  async verifyToken() {
    const response = await api.get('/auth/verify')
    return response.data
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh')
    return response.data
  }
}