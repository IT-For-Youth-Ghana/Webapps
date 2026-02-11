/**
 * Admin Enrollment Hooks
 * Hooks for admin enrollment management operations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Enrollment, EnrollmentStats, PaginationInfo } from "@/lib/types";

export function useAdminEnrollmentStats() {
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<EnrollmentStats>(
        "/enrollments/admin/stats",
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch enrollment stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export interface CourseEnrollmentFilters {
  page?: number;
  limit?: number;
}

export function useCourseEnrollments(
  courseId: string | null,
  filters: CourseEnrollmentFilters = {},
) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));

      const data = await apiClient.get<{
        enrollments: Enrollment[];
        pagination: PaginationInfo;
      }>(`/enrollments/course/${courseId}?${params.toString()}`);
      setEnrollments(data.enrollments || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch course enrollments");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, filters.page, filters.limit]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    pagination,
    isLoading,
    error,
    refetch: fetchEnrollments,
  };
}
