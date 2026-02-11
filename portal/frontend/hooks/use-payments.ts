/**
 * Enhanced Payment Hooks
 * Provides socket.io-based payment verification with real-time status updates
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSocket } from "@/lib/realtime";
import { apiClient } from "@/lib/api-client";
import type { Payment } from "@/lib/types";

// ============================================
// Types
// ============================================

interface PaymentInitResponse {
  authorizationUrl: string | null;
  reference: string;
  accessCode: string | null;
  enrollmentId: string;
  isFree: boolean;
}

interface PaymentStatusResponse {
  success: boolean;
  status: "pending" | "success" | "failed";
  amount?: number;
  currency?: string;
  paymentId?: string;
  enrollmentId?: string;
  message?: string;
  metadata?: Record<string, any>;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaymentHistoryResponse {
  payments: Payment[];
  pagination: PaginationInfo;
}

interface PollingOptions {
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onSuccess?: (data: PaymentStatusResponse) => void;
  onFailure?: (data: PaymentStatusResponse) => void;
  onError?: (error: Error) => void;
}

export type {
  InitializePaymentRequest,
  InitializePaymentResponse,
} from "@/lib/types";

// ============================================
// Hook 1: Initialize Payment
// ============================================

interface UseInitializePaymentOptions {
  onSuccess?: (data: PaymentInitResponse) => void;
  onError?: (error: Error) => void;
}

export function useInitializePayment(options?: UseInitializePaymentOptions) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const initializePayment = useCallback(
    async (data: { courseId: string; enrollmentId?: string }) => {
      setIsInitializing(true);
      setError(null);

      try {
        const result = await apiClient.post<PaymentInitResponse>(
          "/payments/initialize",
          data,
        );

        // Call success callback if provided
        options?.onSuccess?.(result);

        // Handle free courses
        if (result.isFree) {
          toast.success("Free course! Enrollment complete.");
          router.push(
            `/dashboard/payment/verify?reference=${result.reference}`,
          );
          return result;
        }

        // Redirect to Paystack for paid courses
        if (result.authorizationUrl) {
          toast.loading("Redirecting to payment page...");
          window.location.href = result.authorizationUrl;
        }

        return result;
      } catch (err) {
        const customError = err as Error;
        console.error("Payment initialization error:", customError);
        toast.error(customError.message || "Failed to initialize payment");
        setError(customError);
        options?.onError?.(customError);
        throw customError;
      } finally {
        setIsInitializing(false);
      }
    },
    [router, options],
  );

  return {
    initializePayment,
    isInitializing,
    error,
  };
}

// ============================================
// Hook 2: Payment Status (Socket + Polling)
// ============================================

export function usePaymentStatus(
  reference: string | null,
  options: PollingOptions = {},
) {
  const {
    enabled = true,
    interval = 3000,
    maxAttempts = 40,
    onSuccess,
    onFailure,
    onError,
  } = options;

  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);

  const checkStatus = useCallback(async () => {
    if (!reference) {
      setIsLoading(false);
      return;
    }

    try {
      // Use apiClient instead of fetch for consistency and auth handling
      const result = await apiClient.get<PaymentStatusResponse>(
        `/payments/verify/${reference}`,
      );
      const statusData = result;

      setStatus(statusData);
      setAttempts((prev) => prev + 1);

      // Handle final states
      if (statusData.status === "success") {
        setIsLoading(false);
        onSuccess?.(statusData);
      } else if (statusData.status === "failed") {
        setIsLoading(false);
        onFailure?.(statusData);
      }

      return statusData;
    } catch (err) {
      const error = err as Error;
      console.error("Payment status check error:", error);
      setError(error);
      onError?.(error);
      return null;
    }
  }, [reference, onSuccess, onFailure, onError]);

  // Socket effect to listen for real-time updates
  useEffect(() => {
    if (!enabled || !reference) return;

    const socket = getSocket();
    if (!socket) return;

    const onPaymentUpdate = (data: any) => {
      // Check if the update is for this payment
      if (
        data.reference === reference ||
        (status?.paymentId && data.paymentId === status.paymentId)
      ) {
        // Trigger immediate check to get full details and ensure consistency
        checkStatus();
      }
    };

    socket.on("payment:verified", onPaymentUpdate);
    socket.on("payment:failed", onPaymentUpdate);
    socket.on("payment:success", onPaymentUpdate);

    return () => {
      socket.off("payment:verified", onPaymentUpdate);
      socket.off("payment:failed", onPaymentUpdate);
      socket.off("payment:success", onPaymentUpdate);
    };
  }, [enabled, reference, status?.paymentId, checkStatus]);

  // Polling effect (fallback)
  useEffect(() => {
    if (!enabled || !reference) {
      setIsLoading(false);
      return;
    }

    // Initial check
    checkStatus();

    // Stop polling if we've reached final state or max attempts
    if (
      !isLoading ||
      attempts >= maxAttempts ||
      status?.status === "success" ||
      status?.status === "failed"
    ) {
      return;
    }

    // Set up polling interval
    const pollInterval = setInterval(() => {
      if (attempts < maxAttempts && status?.status === "pending") {
        checkStatus();
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, [
    enabled,
    reference,
    interval,
    maxAttempts,
    attempts,
    status?.status,
    isLoading,
    checkStatus,
  ]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setAttempts(0);
    setError(null);
    setIsLoading(true);
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    isLoading,
    error,
    attempts,
    maxAttempts,
    refresh,
  };
}

// ============================================
// Hook 3: Verify Payment (Legacy compatibility)
// ============================================

export function useVerifyPayment() {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayment = useCallback(async (reference: string) => {
    setIsVerifying(true);
    try {
      const result = await apiClient.get<PaymentStatusResponse>(
        `/payments/verify/${reference}`,
      );
      return result;
    } catch (error) {
      const err = error as Error;
      console.error("Payment verification error:", err);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    verifyPayment,
    isVerifying,
  };
}

// ============================================
// Hook 4: Payment History / List
// ============================================

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<any>("/payments/history");
      const paymentsList: Payment[] = Array.isArray(data)
        ? data
        : data && Array.isArray(data.payments)
          ? data.payments
          : [];
      setPayments(paymentsList);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, isLoading, error, refetch: fetchPayments };
}

// ============================================
// Hook 5: Payment Details
// ============================================

export function usePaymentDetails(paymentId: string | null) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await apiClient.get<Payment>(`/payments/${paymentId}`);
      setPayment(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  return { payment, isLoading, error, refetch: fetchPayment };
}

// ============================================
// Hook 6: Retry Payment
// ============================================

export function useRetryPayment() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const retryPayment = useCallback(async (paymentId: string) => {
    setIsRetrying(true);
    setError(null);
    try {
      const result = await apiClient.post<PaymentInitResponse>(
        `/payments/retry/${paymentId}`,
        {},
      );

      // If retry returns a new auth URL, redirect
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return true;
      }
      return false;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  return { retryPayment, isLoading: isRetrying, error };
}
