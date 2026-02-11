/**
 * Admin Course Hooks
 * Hooks for admin course management operations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Course, CourseStats } from "@/lib/types";

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  price: number;
  currency?: string;
  moodleCourseId?: number;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  isActive?: boolean;
}

export interface MoodleSyncResult {
  synced: number;
  updated: number;
  failed: number;
}

export function useAdminCourseStats() {
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<CourseStats>("/courses/admin/stats");
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch course stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useCreateCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = useCallback(async (data: CreateCourseRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const course = await apiClient.post<Course>("/courses", data);
      return course;
    } catch (err: any) {
      setError(err.message || "Failed to create course");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createCourse, isLoading, error };
}

export function useUpdateCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCourse = useCallback(
    async (courseId: string, data: UpdateCourseRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        const course = await apiClient.put<Course>(
          `/courses/${courseId}`,
          data,
        );
        return course;
      } catch (err: any) {
        setError(err.message || "Failed to update course");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateCourse, isLoading, error };
}

export function useDeleteCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.delete(`/courses/${courseId}`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete course");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteCourse, isLoading, error };
}

export function useSyncMoodle() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MoodleSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncMoodle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.post<MoodleSyncResult>(
        "/courses/sync-moodle",
      );
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to sync from Moodle");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { syncMoodle, result, isLoading, error };
}
