/**
 * Course Hooks
 * Hooks for browsing and managing courses
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Course, PaginatedResponse } from '@/lib/types'

export interface CourseFilters {
  page?: number
  limit?: number
  category?: string
  level?: string
  search?: string
  status?: string
}

/**
 * Hook for fetching list of courses
 * GET /courses?page=1&limit=20&category=...&level=...&search=...
 */
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

/**
 * Hook for fetching a single course details
 * GET /courses/:slug
 */
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

/**
 * Hook for fetching course categories
 * GET /courses/categories
 */
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

/**
 * Hook for fetching popular courses
 * GET /courses/popular
 */
export function usePopularCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.get<Course[]>('/courses/popular')
        setCourses(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularCourses()
  }, [])

  return { courses, isLoading, error }
}
