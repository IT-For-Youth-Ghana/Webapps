// Authentication Service
// Re-exports authAPI and apiUtils from centralized API configuration
// Use authAPI for all authentication-related API calls
// Use apiUtils for token management and auth state

export { authAPI, apiUtils } from '../utils/api.js'

// Legacy export for backward compatibility
export const authService = {
  async login(credentials) {
    const { authAPI, apiUtils } = await import('../utils/api.js')
    const response = await authAPI.login(credentials)
    if (response.data?.data?.token) {
      apiUtils.setAuthToken(response.data.data.token)
    }
    return response.data
  },

  async register(userData) {
    const { authAPI } = await import('../utils/api.js')
    const response = await authAPI.register(userData)
    return response.data
  },

  async logout() {
    const { authAPI, apiUtils } = await import('../utils/api.js')
    try {
      const response = await authAPI.logout()
      return response.data
    } finally {
      apiUtils.clearAuth()
    }
  },

  async forgotPassword(email) {
    const { authAPI } = await import('../utils/api.js')
    const response = await authAPI.forgotPassword(email)
    return response.data
  },

  async resetPassword(token, password) {
    const { authAPI } = await import('../utils/api.js')
    const response = await authAPI.resetPassword(token, password)
    return response.data
  },

  async verifyToken() {
    const { authAPI } = await import('../utils/api.js')
    const response = await authAPI.checkAuth()
    return response.data
  },

  async refreshToken() {
    const { authAPI } = await import('../utils/api.js')
    const response = await authAPI.refreshToken()
    return response.data
  },

  async getCurrentUser() {
    const { authAPI } = await import('../utils/api.js')
    const response = await authAPI.getCurrentUser()
    return response.data
  }
}