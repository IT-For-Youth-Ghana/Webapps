/**
 * Payment Hooks
 * Hooks for payment processing and history
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Payment } from '@/lib/types'

/**
 * Hook for fetching payment history
 * GET /payments
 */
export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Payment[]>('/payments/history')
      setPayments(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return { payments, isLoading, error, refetch: fetchPayments }
}

/**
 * Hook for initializing payment
 * POST /payments/initialize
 */
export interface InitializePaymentRequest {
  enrollmentId?: string
  courseId: string
}

export interface InitializePaymentResponse {
  authorizationUrl: string | null
  reference: string
  isFree?: boolean
  enrollmentId?: string
}

export function useInitializePayment() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initializePayment = async (data: InitializePaymentRequest) => {
    try {
      setIsInitializing(true)
      setError(null)
      const result = await apiClient.post<InitializePaymentResponse>('/payments/initialize', data)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsInitializing(false)
    }
  }

  return { initializePayment, isInitializing, error }
}

/**
 * Hook for verifying payment
 * GET /payments/verify/:reference
 */
export function useVerifyPayment() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const verifyPayment = async (reference: string) => {
    try {
      setIsVerifying(true)
      setError(null)
      const result = await apiClient.get(`/payments/verify/${reference}`)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsVerifying(false)
    }
  }

  return { verifyPayment, isVerifying, error }
}

/**
 * Hook for retrying a failed payment
 * POST /payments/:id/retry
 */
export function useRetryPayment() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const retryPayment = async (paymentId: string) => {
    try {
      setIsRetrying(true)
      setError(null)
      const result = await apiClient.post(`/payments/${paymentId}/retry`)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsRetrying(false)
    }
  }

  return { retryPayment, isRetrying, error }
}

/**
 * Hook for fetching payment details
 * GET /payments/:id
 */
export function usePaymentDetails(paymentId: string | null) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPaymentDetails = useCallback(async () => {
    if (!paymentId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await apiClient.get<Payment>(`/payments/${paymentId}`)
      setPayment(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [paymentId])

  useEffect(() => {
    fetchPaymentDetails()
  }, [fetchPaymentDetails])

  return { payment, isLoading, error, refetch: fetchPaymentDetails }
}
