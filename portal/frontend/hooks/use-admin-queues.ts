/**
 * Admin Queue Hooks
 * Hooks for admin queue monitoring and management
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface QueueHealth {
  status: string;
  queues: Record<string, { status: string; connected: boolean }>;
}

export interface QueueStat {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface QueueJob {
  id: string;
  name: string;
  data: Record<string, any>;
  status: string;
  attempts: number;
  failedReason?: string;
  processedOn?: string;
  finishedOn?: string;
  timestamp: string;
}

export function useQueueHealth() {
  const [health, setHealth] = useState<QueueHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<QueueHealth>("/admin/queues/health");
      setHealth(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch queue health");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { health, isLoading, error, refetch: fetchHealth };
}

export function useQueueStats() {
  const [stats, setStats] = useState<QueueStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<QueueStat[] | Record<string, QueueStat>>(
        "/admin/queues/stats",
      );
      setStats(Array.isArray(data) ? data : Object.values(data));
    } catch (err: any) {
      setError(err.message || "Failed to fetch queue stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useQueueJobs(
  queueName: string | null,
  status: string = "waiting",
  start: number = 0,
  end: number = 10,
) {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!queueName) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<QueueJob[]>(
        `/admin/queues/${queueName}/jobs?status=${status}&start=${start}&end=${end}`,
      );
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch queue jobs");
    } finally {
      setIsLoading(false);
    }
  }, [queueName, status, start, end]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, isLoading, error, refetch: fetchJobs };
}

export function useQueueActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryJob = useCallback(async (queueName: string, jobId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post(`/admin/queues/${queueName}/job/${jobId}/retry`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to retry job");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeJob = useCallback(async (queueName: string, jobId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.delete(`/admin/queues/${queueName}/job/${jobId}`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to remove job");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseQueue = useCallback(async (queueName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post(`/admin/queues/${queueName}/pause`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to pause queue");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resumeQueue = useCallback(async (queueName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post(`/admin/queues/${queueName}/resume`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to resume queue");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanQueue = useCallback(
    async (queueName: string, grace?: number, status?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await apiClient.post(`/admin/queues/${queueName}/clean`, {
          grace,
          status,
        });
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to clean queue");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const retryAllFailed = useCallback(
    async (queueName: string, limit?: number) => {
      try {
        setIsLoading(true);
        setError(null);
        await apiClient.post(`/admin/queues/${queueName}/jobs/retry-failed`, {
          limit,
        });
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to retry failed jobs");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    retryJob,
    removeJob,
    pauseQueue,
    resumeQueue,
    cleanQueue,
    retryAllFailed,
    isLoading,
    error,
  };
}
