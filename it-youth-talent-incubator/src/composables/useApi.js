/**
 * API composable for handling HTTP requests
 * Provides a consistent interface for all API interactions
 */
import { ref, computed, readonly } from 'vue'
import { API_CONFIG, LOADING_STATES, ERROR_MESSAGES } from '../constants/app.js'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasData = computed(() => !!data.value)

  /**
   * Generic API request function
   * @param {string} url - API endpoint URL
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  const request = async (url, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status))
      }

      const result = await response.json()
      data.value = result
      return result

    } catch (err) {
      error.value = err.message || ERROR_MESSAGES.NETWORK
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * GET request
   */
  const get = (url, options = {}) => {
    return request(url, { method: 'GET', ...options })
  }

  /**
   * POST request
   */
  const post = (url, body, options = {}) => {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    })
  }

  /**
   * PUT request
   */
  const put = (url, body, options = {}) => {
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    })
  }

  /**
   * DELETE request
   */
  const del = (url, options = {}) => {
    return request(url, { method: 'DELETE', ...options })
  }

  /**
   * Get appropriate error message for HTTP status
   */
  const getErrorMessage = (status) => {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED
      case 403:
        return ERROR_MESSAGES.FORBIDDEN
      case 404:
        return ERROR_MESSAGES.NOT_FOUND
      case 422:
        return ERROR_MESSAGES.VALIDATION
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR
      default:
        return ERROR_MESSAGES.NETWORK
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset all state
   */
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    
    // Computed
    isLoading,
    hasError,
    hasData,
    
    // Methods
    get,
    post,
    put,
    delete: del,
    clearError,
    reset
  }
}