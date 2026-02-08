/**
 * SSO Integration Hooks
 * Handles single sign-on operations with external providers (e.g., Moodle)
 */

'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

/**
 * Hook for Moodle SSO login
 * POST /sso/moodle/login
 */
export interface MoodleSSORequest {
  moodleUserId?: string
  accessToken?: string
}

export interface SSOResponse {
  user: any
  token: string
  redirectUrl?: string
}

export function useMoodleSSOLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loginWithMoodle = useCallback(async (data?: MoodleSSORequest) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.post<SSOResponse>('/sso/moodle/login', data || {})

      // Store token
      localStorage.setItem('token', response.token)
      apiClient.setToken(response.token)

      return response
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { loginWithMoodle, isLoading, error }
}

/**
 * Hook for SSO logout
 * POST /sso/logout
 */
export function useSSOLogout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await apiClient.post('/sso/logout')

      // Clear stored credentials
      localStorage.removeItem('token')
      apiClient.setToken(null)

      return true
    } catch (err) {
      // Even if logout request fails, clear local storage
      localStorage.removeItem('token')
      apiClient.setToken(null)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { logout, isLoading, error }
}

/**
 * Hook for handling SSO callback (redirect from Moodle)
 * GET /sso/moodle/callback?code=...&state=...
 */
export function useSSOCallback() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleCallback = useCallback(async (code: string, state?: string) => {
    try {
      setIsProcessing(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('code', code)
      if (state) params.set('state', state)

      const response = await apiClient.get<SSOResponse>(`/sso/moodle/callback?${params}`)

      // Store token
      localStorage.setItem('token', response.token)
      apiClient.setToken(response.token)

      return response
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return { handleCallback, isProcessing, error }
}
