/**
 * Enrollment Hooks
 * Hooks for course enrollment and progress management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Enrollment, PaginatedResponse } from '@/lib/types'

export interface EnrollmentFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'active' | 'completed' | 'dropped'
}

export interface UpdateProgressRequest {
  completedLessons?: number
  completedQuizzes?: number
  progressPercentage?: number
  [key: string]: any
}

/**
 * Hook for fetching user's enrollments
 * GET /enrollments?status=...
 */
export function useMyEnrollments(filters: EnrollmentFilters = {}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.status) params.set('status', filters.status)

      const data = await apiClient.get<PaginatedResponse<Enrollment>>(`/enrollments?${params}`)
      setEnrollments(data.data)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [filters.page, filters.limit, filters.status])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  return { enrollments, pagination, isLoading, error, refetch: fetchEnrollments }
}

/**
 * Hook for fetching single enrollment details
 * GET /enrollments/:id
 * PUT /enrollments/:id/progress/:moduleId
 * PUT /enrollments/:id/drop
 */
export function useEnrollment(enrollmentId: string | null) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEnrollment = useCallback(async () => {
    if (!enrollmentId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await apiClient.get<Enrollment>(`/enrollments/${enrollmentId}`)
      setEnrollment(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [enrollmentId])

  useEffect(() => {
    fetchEnrollment()
  }, [fetchEnrollment])

  const updateProgress = async (moduleId: string, progressData: UpdateProgressRequest) => {
    const updated = await apiClient.put(
      `/enrollments/${enrollmentId}/progress/${moduleId}`,
      progressData
    )
    await fetchEnrollment() // Refetch to get updated enrollment
    return updated
  }

  const dropCourse = async () => {
    await apiClient.put(`/enrollments/${enrollmentId}/drop`)
    await fetchEnrollment()
  }

  return { enrollment, isLoading, error, updateProgress, dropCourse, refetch: fetchEnrollment }
}

/**
 * Hook for enrolling in a course
 * POST /enrollments
 */
export function useEnroll() {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const enroll = async (courseId: string) => {
    try {
      setIsEnrolling(true)
      setError(null)
      const result = await apiClient.post<Enrollment>('/enrollments', { courseId })
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsEnrolling(false)
    }
  }

  return { enroll, isEnrolling, error }
}

/**
 * Hook for getting enrollment certificate
 * GET /enrollments/:id/certificate
 */
export function useGetCertificate(enrollmentId: string | null) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getCertificate = async () => {
    if (!enrollmentId) return

    try {
      setIsLoading(true)
      const response = await apiClient.get(`/enrollments/${enrollmentId}/certificate`)
      return response
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { getCertificate, isLoading, error }
}
