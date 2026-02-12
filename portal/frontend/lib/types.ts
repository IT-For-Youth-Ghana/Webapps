/**
 * API Types
 * TypeScript interfaces for API responses and data models
 */

import { UserSettings } from "@/hooks/use-user-settings";

// Base Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  role: "student" | "teacher" | "admin" | "super_admin";
  status: "active" | "inactive" | "suspended";
  emailVerified: boolean;
  profilePicture?: string;
  moodleUserId?: number;
  incubatorUserId?: string;
  // Location information
  city?: string;
  country?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterStartRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterVerifyRequest {
  email: string;
  code: string;
}

export interface RegisterVerifyResponse {
  success: boolean;
  tempToken: string;
  registrationData: {
    firstName: string;
    lastName: string;
  };
}

export interface RegisterCompleteRequest {
  tempToken: string;
  phone: string;
  dateOfBirth: string;
  courseId: string;
}

export interface RegisterCompleteResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  message: string;
  paymentUrl?: string;
  reference?: string;
  isFree?: boolean;
}

// Course Types
export interface Course {
  id: string;
  moodleCourseId?: number;
  slug?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  price: number;
  currency: string;
  duration?: number; // Duration in hours
  durationWeeks?: number; // Duration in weeks
  level: "beginner" | "intermediate" | "advanced";
  category?: string;
  thumbnailUrl?: string;
  status: "draft" | "active" | "inactive";
  enrollmentCount?: number;
  image?: string;
  rating?: number;
  objectives?: string[]; // Learning objectives
  requirements?: string[]; // Course requirements
  videoCount?: number; // Number of videos in the course
  resourceCount?: number; // Number of resources in the course
  teachers?: User[];
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  moodleModuleId?: number;
  title: string;
  description?: string;
  moduleType?: string;
  orderIndex: number;
  isRequired: boolean;
  lessons?: number; // Number of lessons in this module
  createdAt: string;
  updatedAt: string;
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  search?: string;
  status?: "draft" | "active" | "inactive";
}

// Enrollment Types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  paymentReference?: string;
  paymentStatus: "pending" | "completed" | "failed";
  enrollmentStatus: "pending" | "enrolled" | "completed" | "dropped";
  progressPercentage: number;
  enrolledAt?: string;
  completedAt?: string;
  lastAccessed?: string;
  course?: Course;
  user?: User;
  progressRecords?: StudentProgress[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  startedAt?: string;
  completedAt?: string;
  module?: CourseModule;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "enrolled" | "completed" | "dropped";
}

export interface UpdateProgressRequest {
  status?: "not_started" | "in_progress" | "completed";
  score?: number;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  enrollmentId: string;
  courseId: string;
  amount: number;
  currency: string;
  paystackReference: string;
  status: "pending" | "success" | "failed" | "cancelled";
  paymentMethod?: string;
  paidAt?: string;
  user?: User;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface InitializePaymentRequest {
  enrollmentId: string;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | "enrollment_success"
    | "course_completed"
    | "payment_success"
    | "system";
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// SSO Types
export interface SSOGenerateRequest {
  target: "moodle" | "incubator";
  redirect?: string;
}

export interface SSOGenerateResponse {
  redirectUrl: string;
}

export interface SSOValidateRequest {
  token: string;
}

export interface SSOValidateResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    moodle_user_id?: number;
    incubator_user_id?: string;
    roles: string[];
  };
  reason?: string;
}

// Statistics Types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  usersByRole: Record<string, number>;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  coursesByCategory: Record<string, number>;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
}

// Revenue/Payment Statistics
export interface RevenueStats {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}

// Queue Types
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

// Admin Filters
export interface AdminUserFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface AdminPaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Course CRUD Request Types
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
