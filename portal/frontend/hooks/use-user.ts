/**
 * User Hooks
 * Hooks for user profile and account management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { getSocket } from '@/lib/realtime'
import type { User, Notification, NotificationFilters, PaginationInfo } from '@/lib/types'

/**
 * Hook for fetching and updating user profile
 * GET /users/profile
 * PUT /users/profile
 */
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

/**
 * Hook for fetching notifications
 * GET /users/notifications
 * PUT /users/notifications/:id/read
 * PUT /users/notifications/read-all
 */
export function useNotifications(filters: NotificationFilters = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
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
        pagination: PaginationInfo
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
