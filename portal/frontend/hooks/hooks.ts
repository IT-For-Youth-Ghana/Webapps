/**
 * Custom Hooks
 * React hooks for fetching and mutating data from the API
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { getSocket } from '@/lib/realtime'
import type {
  Course,
  CourseFilters,
  PaginatedResponse,
  Enrollment,
  EnrollmentFilters,
  StudentProgress,
  UpdateProgressRequest,
  Payment,
  Notification,
  NotificationFilters,
  User,
} from '@/lib/types'

// ==========================================
// User Hooks
// ==========================================

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<User>('/users/profile')
      setProfile(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await apiClient.put<User>('/users/profile', updates)
    setProfile(updated)
    return updated
  }

  return { profile, isLoading, error, updateProfile, refetch: fetchProfile }
}

export function useNotifications(filters: NotificationFilters = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<Notification>['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.unreadOnly) params.set('unreadOnly', filters.unreadOnly.toString())

      const data = await apiClient.get<{
        notifications: Notification[]
        pagination: PaginatedResponse<Notification>['pagination']
      }>(`/users/notifications?${params}`)
      setNotifications(data.notifications)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [filters.page, filters.limit, filters.unreadOnly])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleNew = (notification: Notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id)
        if (exists) return prev
        const next = [notification, ...prev]
        if (filters.limit && next.length > filters.limit) {
          return next.slice(0, filters.limit)
        }
        return next
      })
    }

    const handleRead = ({ id }: { id: string }) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    }

    const handleReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }

    socket.on('notification:new', handleNew)
    socket.on('notification:read', handleRead)
    socket.on('notification:read-all', handleReadAll)

    return () => {
      socket.off('notification:new', handleNew)
      socket.off('notification:read', handleRead)
      socket.off('notification:read-all', handleReadAll)
    }
  }, [filters.limit])

  const markAsRead = async (notificationId: string) => {
    await apiClient.put(`/users/notifications/${notificationId}/read`)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = async () => {
    await apiClient.put('/users/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return {
    notifications,
    pagination,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  }
}

// ==========================================
// Course Hooks
// ==========================================

export function useCourses(filters: CourseFilters = {}) {
  const [courses, setCourses] = useState<Course[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.category) params.set('category', filters.category)
      if (filters.level) params.set('level', filters.level)
      if (filters.search) params.set('search', filters.search)
      if (filters.status) params.set('status', filters.status)

      const data = await apiClient.get<PaginatedResponse<Course>>(`/courses?${params}`)
      setCourses(data.data)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [filters.page, filters.limit, filters.category, filters.level, filters.search, filters.status])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return { courses, pagination, isLoading, error, refetch: fetchCourses }
}

export function useCourse(courseSlug: string | null) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCourse = useCallback(async () => {
    if (!courseSlug) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await apiClient.get<Course>(`/courses/${courseSlug}`)
      setCourse(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [courseSlug])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  return { course, isLoading, error, refetch: fetchCourse }
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.get<string[]>('/courses/categories')
        setCategories(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, isLoading, error }
}

// ==========================================
// Enrollment Hooks
// ==========================================

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

  const updateProgress = async (moduleId: string, data: UpdateProgressRequest) => {
    const updated = await apiClient.put<StudentProgress>(
      `/enrollments/${enrollmentId}/progress/${moduleId}`,
      data
    )
    await fetchEnrollment() // Refetch to get updated enrollment
    return updated
  }

  return { enrollment, isLoading, error, updateProgress, refetch: fetchEnrollment }
}

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

// ==========================================
// Payment Hooks
// ==========================================

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Payment[]>('/payments')
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

export function useInitializePayment() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initializePayment = async (enrollmentId: string) => {
    try {
      setIsInitializing(true)
      setError(null)
      const result = await apiClient.post<{ authorizationUrl: string; reference: string }>(
        '/payments/initialize',
        { enrollmentId }
      )
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
