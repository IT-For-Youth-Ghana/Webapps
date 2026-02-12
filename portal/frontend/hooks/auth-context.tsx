/**
 * Auth Context
 * React context for managing authentication state and user session
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { disconnectSocket } from '@/lib/realtime'
import type { User, LoginRequest, RegisterStartRequest, RegisterVerifyRequest, RegisterCompleteRequest } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  register: {
    start: (data: RegisterStartRequest) => Promise<void>
    verify: (data: RegisterVerifyRequest) => Promise<{ tempToken: string }>
    complete: (data: RegisterCompleteRequest) => Promise<{ paymentUrl?: string; reference?: string; isFree?: boolean }>
  }
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      if (!token) {
        setIsLoading(false)
        return
      }

      // Fetch current user
      const userData = await apiClient.get<User>('/auth/me')
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid auth
      apiClient.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post<{
        user: User
        token: string
        refreshToken?: string
      }>('/auth/login', credentials)

      // Store tokens
      apiClient.setAuthTokens(
        response.token,
        response.refreshToken || response.token
      )

      // Store user in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.user))
      }

      setUser(response.user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = useCallback(() => {
    apiClient.logout()
    setUser(null)
    disconnectSocket()
    
    // Clear user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }, [])

  const registerStart = async (data: RegisterStartRequest) => {
    await apiClient.post('/auth/register/start', data)
  }

  const registerVerify = async (data: RegisterVerifyRequest) => {
    const response = await apiClient.post<{
      success: boolean
      tempToken: string
      registrationData: any
    }>('/auth/register/verify', data)
    
    return { tempToken: response.tempToken }
  }

  const registerComplete = async (data: RegisterCompleteRequest) => {
    const response = await apiClient.post<{
      userId: string
      accessToken: string
      refreshToken: string
      user: User
      message: string
      paymentUrl?: string
      reference?: string
      isFree?: boolean
    }>('/auth/register/complete', data)

    // Store tokens for automatic login
    apiClient.setAuthTokens(response.accessToken, response.refreshToken)

    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    // Update auth state
    setUser(response.user)

    return {
      paymentUrl: response.paymentUrl,
      reference: response.reference,
      isFree: response.isFree,
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await apiClient.get<User>('/auth/me')
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register: {
      start: registerStart,
      verify: registerVerify,
      complete: registerComplete,
    },
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
