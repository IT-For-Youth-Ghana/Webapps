/**
 * API Client
 * Axios-based HTTP client with authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// Types
interface ApiError {
  success: false
  message: string
  errors?: any[]
}

interface ApiResponse<T = any> {
  success: true
  message: string
  data: T
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - attach token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue failed requests during refresh
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then(() => {
                return this.client(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = this.getRefreshToken()
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            // Refresh the token
            const { data } = await this.client.post<ApiResponse<{
              accessToken: string
              refreshToken: string
            }>>('/auth/refresh', {
              refreshToken,
            })

            // Store new tokens
            this.setToken(data.data.accessToken)
            this.setRefreshToken(data.data.refreshToken)

            // Retry all queued requests
            this.failedQueue.forEach(({ resolve }) => resolve())
            this.failedQueue = []

            // Retry original request
            return this.client(originalRequest)
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect to login
            this.failedQueue.forEach(({ reject }) => reject(refreshError))
            this.failedQueue = []
            this.clearAuth()
            
            // Redirect to login if we're in the browser
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', token)
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('refreshToken', token)
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Error normalization
  private normalizeError(error: AxiosError<ApiError>): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    if (error.message) {
      return new Error(error.message)
    }
    return new Error('An unexpected error occurred')
  }

  // Public methods
  async get<T = any>(url: string, config = {}): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data.data
  }

  async post<T = any>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async put<T = any>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async patch<T = any>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async delete<T = any>(url: string, config = {}): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data.data
  }

  // Auth helpers
  setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setToken(accessToken)
    this.setRefreshToken(refreshToken)
  }

  logout(): void {
    this.clearAuth()
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient