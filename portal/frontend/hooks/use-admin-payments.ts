/**
 * Admin Payment Hooks
 * Hooks for admin payment management and revenue stats
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Payment, PaginationInfo } from "@/lib/types";

export interface RevenueStats {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}

export interface AdminPaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function useAdminRevenueStats(period: string = "month") {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<RevenueStats>(
        `/payments/admin/stats?period=${period}`,
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch revenue stats");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useAdminAllPayments(filters: AdminPaymentFilters = {}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.status) params.set("status", filters.status);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const data = await apiClient.get<{
        payments: Payment[];
        pagination: PaginationInfo;
      }>(`/payments/admin/all?${params.toString()}`);
      setPayments(data.payments || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.startDate,
    filters.endDate,
  ]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, pagination, isLoading, error, refetch: fetchPayments };
}
