/**
 * Password Management Hooks
 * Handles password reset and change operations
 */

'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

/**
 * Hook for requesting password reset
 * POST /auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string
}

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [success, setSuccess] = useState(false)

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)
      await apiClient.post('/auth/forgot-password', data)
      setSuccess(true)
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { forgotPassword, isLoading, error, success }
}

/**
 * Hook for resetting password with token
 * POST /auth/reset-password
 */
export interface ResetPasswordRequest {
  token: string
  password: string
  passwordConfirm: string
}

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post('/auth/reset-password', data)
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { resetPassword, isLoading, error }
}

/**
 * Hook for changing password (when authenticated)
 * POST /auth/change-password
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
}

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [success, setSuccess] = useState(false)

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)
      await apiClient.post('/auth/change-password', data)
      setSuccess(true)
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { changePassword, isLoading, error, success }
}

/**
 * Hook for refreshing authentication token
 * POST /auth/refresh
 */
export interface RefreshTokenResponse {
  token: string
}

export function useRefreshToken() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh')
      // Update stored token
      localStorage.setItem('accessToken', response.token)
      return response.token
    } catch (err) {
      setError(err as Error)
      // Token refresh failed, user should login again
      localStorage.removeItem('accessToken')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { refreshToken, isLoading, error }
}
