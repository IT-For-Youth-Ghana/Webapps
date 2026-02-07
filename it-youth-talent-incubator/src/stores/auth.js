/**
 * Authentication Store
 * Manages user authentication state, login/logout, and session persistence
 *
 * @typedef {import('../types/api.types.js').User} User
 * @typedef {import('../types/api.types.js').Student} Student
 * @typedef {import('../types/api.types.js').Company} Company
 * @typedef {import('../types/api.types.js').LoginCredentials} LoginCredentials
 * @typedef {import('../types/api.types.js').RegisterData} RegisterData
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authAPI, apiUtils } from '../utils/api.js'

export const useAuthStore = defineStore('auth', () => {
  // ===========================================
  // State
  // ===========================================

  /** @type {import('vue').Ref<User|null>} */
  const user = ref(null)

  /** @type {import('vue').Ref<Student|Company|null>} */
  const profile = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isAuthenticated = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isInitialized = ref(false)

  // ===========================================
  // Getters
  // ===========================================

  const userRole = computed(() => user.value?.role || null)
  const isStudent = computed(() => user.value?.role === 'student')
  const isCompany = computed(() => user.value?.role === 'company')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEmailVerified = computed(() => user.value?.email_verified || false)
  const isPendingApproval = computed(() => user.value?.status === 'pending')

  const userName = computed(() => {
    if (!user.value) return ''
    if (profile.value) {
      // Student profile
      if ('first_name' in profile.value) {
        return `${profile.value.first_name} ${profile.value.last_name}`
      }
      // Company profile
      if ('name' in profile.value) {
        return profile.value.name
      }
    }
    return user.value.email
  })

  // ===========================================
  // Actions
  // ===========================================

  /**
   * Initialize auth state from localStorage
   * Call this on app startup
   */
  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('user')

      if (token && savedUser) {
        // Restore user from localStorage
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true

        // Verify token is still valid and get fresh user data
        try {
          const response = await authAPI.getCurrentUser()
          if (response.data?.success) {
            user.value = response.data.data.user
            profile.value = response.data.data.profile || null
            localStorage.setItem('user', JSON.stringify(user.value))
          }
        } catch (verifyError) {
          // Token invalid, clear auth
          console.warn('Token verification failed:', verifyError)
          await logout()
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      await logout()
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Login with email and password
   * @param {LoginCredentials} credentials
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function login(credentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.login(credentials)

      if (response.data?.success) {
        const { user: userData, tokens, profile: profileData } = response.data.data

        // Store token
        apiUtils.setAuthToken(tokens.accessToken)

        // Update state
        user.value = userData
        profile.value = profileData || null
        isAuthenticated.value = true

        // Persist to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        if (profileData) {
          localStorage.setItem('profile', JSON.stringify(profileData))
        }

        return { success: true }
      }

      throw new Error(response.data?.message || 'Login failed')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register a new user
   * @param {RegisterData} userData
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function register(userData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)

      if (response.data?.success) {
        // Registration successful - user needs to verify email
        return {
          success: true,
          message: response.data.message || 'Registration successful! Please check your email to verify your account.'
        }
      }

      throw new Error(response.data?.message || 'Registration failed')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout the current user
   */
  async function logout() {
    isLoading.value = true

    try {
      // Call logout API (ignore errors - we're logging out anyway)
      await authAPI.logout().catch(() => {})
    } finally {
      // Clear all auth state
      user.value = null
      profile.value = null
      isAuthenticated.value = false
      error.value = null

      // Clear localStorage
      apiUtils.clearAuth()
      localStorage.removeItem('profile')

      isLoading.value = false
    }
  }

  /**
   * Request password reset email
   * @param {string} email
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function forgotPassword(email) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.forgotPassword(email)

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || 'Password reset email sent! Please check your inbox.'
        }
      }

      throw new Error(response.data?.message || 'Failed to send reset email')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send reset email'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} password
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function resetPassword(token, password) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.resetPassword(token, password)

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || 'Password reset successful! You can now login.'
        }
      }

      throw new Error(response.data?.message || 'Password reset failed')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Password reset failed'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email with token
   * @param {string} token
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function verifyEmail(token) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.verifyEmail(token)

      if (response.data?.success) {
        // Update user's email_verified status
        if (user.value) {
          user.value.email_verified = true
          localStorage.setItem('user', JSON.stringify(user.value))
        }

        return {
          success: true,
          message: response.data.message || 'Email verified successfully!'
        }
      }

      throw new Error(response.data?.message || 'Email verification failed')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Email verification failed'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend verification email
   * @param {string} email
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function resendVerification(email) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.resendVerification(email)

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || 'Verification email sent!'
        }
      }

      throw new Error(response.data?.message || 'Failed to resend verification email')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to resend verification email'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change password for logged in user
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function changePassword(currentPassword, newPassword) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      })

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || 'Password changed successfully!'
        }
      }

      throw new Error(response.data?.message || 'Failed to change password')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to change password'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user profile in store (call after profile updates)
   * @param {Student|Company} newProfile
   */
  function updateProfile(newProfile) {
    profile.value = newProfile
    localStorage.setItem('profile', JSON.stringify(newProfile))
  }

  /**
   * Clear any error message
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,

    // Getters
    userRole,
    isStudent,
    isCompany,
    isAdmin,
    isEmailVerified,
    isPendingApproval,
    userName,

    // Actions
    initialize,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    updateProfile,
    clearError
  }
})
