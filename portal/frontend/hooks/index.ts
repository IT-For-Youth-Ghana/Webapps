/**
 * Hooks Index
 * Re-exports all hooks from individual files for backward compatibility
 */

'use client'

// Auth Context
export { useAuth, AuthProvider } from './auth-context'

// User hooks
export { useProfile, useNotifications } from './use-user'
export type { NotificationFilters, Notification } from '@/lib/types'

// Course hooks
export { useCourses, useCourse, useCategories, usePopularCourses } from './use-courses'
export type { CourseFilters } from './use-courses'

// Enrollment hooks
export { useMyEnrollments, useEnrollment, useEnroll, useGetCertificate } from './use-enrollments'
export type { EnrollmentFilters, UpdateProgressRequest } from './use-enrollments'

// Payment hooks
export {
  usePayments,
  useInitializePayment,
  useVerifyPayment,
  useRetryPayment,
  usePaymentDetails,
} from './use-payments'
export type { InitializePaymentRequest, InitializePaymentResponse } from './use-payments'

// Authentication Flow hooks (Multi-step registration)
export { useStartRegistration, useVerifyEmail, useCompleteRegistration } from './use-auth-flow'
export type {
  StartRegistrationRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
} from './use-auth-flow'

// Password Management hooks
export {
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useRefreshToken,
} from './use-password'
export type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenResponse,
} from './use-password'

// SSO Integration hooks
export { useMoodleSSOLogin, useSSOLogout, useSSOCallback } from './use-sso'
export type { MoodleSSORequest, SSOResponse } from './use-sso'
