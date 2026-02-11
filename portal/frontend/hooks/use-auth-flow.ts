/**
 * Authentication Flow Hooks
 * Handles multi-step registration and authentication processes
 */

'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

/**
 * Hook for starting registration process (Step 1)
 * POST /auth/register/start
 */
export interface StartRegistrationRequest {
  email: string
  firstName: string
  lastName: string
}

export function useStartRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const startRegistration = useCallback(async (data: StartRegistrationRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post('/auth/register/start', data)
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { startRegistration, isLoading, error }
}

/**
 * Hook for verifying email with code (Step 2)
 * POST /auth/register/verify
 */
export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface VerifyEmailResponse {
  tempToken: string
}

export function useVerifyEmail() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const verifyEmail = useCallback(async (data: VerifyEmailRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.post<VerifyEmailResponse>('/auth/register/verify', data)
      return response
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { verifyEmail, isLoading, error }
}

/**
 * Hook for completing registration (Step 3)
 * POST /auth/register/complete
 */
export interface CompleteRegistrationRequest {
  tempToken: string
  phone: string
  dateOfBirth: string
  courseId?: string
}

export interface CompleteRegistrationResponse {
  userId: string
  accessToken: string
  refreshToken: string
  user: any
  message: string
  paymentUrl?: string
  reference?: string
  isFree?: boolean
}

export function useCompleteRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const completeRegistration = useCallback(async (data: CompleteRegistrationRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.post<CompleteRegistrationResponse>(
        '/auth/register/complete',
        data
      )
      // Store tokens for automatic login
      apiClient.setAuthTokens(response.accessToken, response.refreshToken)
      return response
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { completeRegistration, isLoading, error }
}
