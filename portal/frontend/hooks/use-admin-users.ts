/**
 * Admin User Hooks
 * Hooks for admin user management operations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { User, UserStats, PaginationInfo } from "@/lib/types";

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.role) params.set("role", filters.role);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);

      const data = await apiClient.get<{
        users: User[];
        pagination: PaginationInfo;
      }>(`/users?${params.toString()}`);
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.role,
    filters.status,
    filters.search,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, pagination, isLoading, error, refetch: fetchUsers };
}

export function useAdminUserById(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<User>(`/users/${userId}`);
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
}

export function useAdminUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<UserStats>("/users/stats");
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useSuspendUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suspendUser = useCallback(async (userId: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.put(`/users/${userId}/suspend`, { reason });
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to suspend user");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { suspendUser, isLoading, error };
}

export function useActivateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.put(`/users/${userId}/activate`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to activate user");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { activateUser, isLoading, error };
}

export function useUpdateUserRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.put(`/users/${userId}`, { role });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateUserRole, isLoading, error };
}
