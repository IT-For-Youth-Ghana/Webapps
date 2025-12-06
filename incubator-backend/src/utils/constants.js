/* eslint-disable no-undef */
/**
 * constants.js
 * Central hub for all app constants, error messages, and configurations
 * Ensures consistency, maintainability, and internationalization readiness
 */

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Pagination
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

// Roles & Statuses
export const ROLES = {
  ADMIN: "admin",
  COMPANY: "company",
  STUDENT: "student",
};

export const USER_STATUSES = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
  DELETED: "deleted",
};

// JWT & Security
export const JWT_EXPIRATION = {
  ACCESS_TOKEN: process.env.JWT_ACCESS_EXPIRY || "15m",
  REFRESH_TOKEN: process.env.JWT_REFRESH_EXPIRY || "7d",
  RESET_TOKEN: process.env.JWT_RESET_EXPIRY || "1h",
  VERIFICATION_TOKEN: process.env.JWT_VERIFY_EXPIRY || "24h",
};

export const SALT_ROUNDS = 10;
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_DURATION_MINUTES = 15;

// File Upload
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// Password Policy
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARACTERS: true,
};

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: "welcome_email",
  PASSWORD_RESET: "password_reset",
  PASSWORD_CHANGED: "password_changed",
  EMAIL_VERIFICATION: "email_verification",
  APPLICATION_RECEIVED: "application_received",
  APPLICATION_STATUS_UPDATE: "application_status_update",
  NEW_APPLICATION: "new_application",
  JOB_POSTED: "job_posted",
  ACCOUNT_APPROVED: "account_approved",
  ACCOUNT_REJECTED: "account_rejected",
  ACCOUNT_LOCKED: "account_locked",
};

// Cache & Performance
export const CACHE_TTL_SECONDS = 3600; // 1 hour
export const EXTERNAL_API_TIMEOUT_MS = 5000;
export const EXTERNAL_API_RETRY_ATTEMPTS = 3;
export const EXTERNAL_API_RETRY_DELAY_MS = 1000;

// Localization
export const SUPPORTED_LANGUAGES = ["en", "tw"]; // Twi for Ghana
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_TIME_ZONE = "Africa/Accra";
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

// Feature Flags
export const FEATURE_FLAGS = {
  NEW_DASHBOARD: true,
  JOB_MATCHING_AI: false,
  VIDEO_INTERVIEWS: false,
};

// ========================================
// ERROR MESSAGES (User-Friendly + Dev-Friendly)
// ========================================
export const ERROR_MESSAGES = {

  // === GENERAL ===
  INTERNAL_SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  SERVICE_UNAVAILABLE: "Service is temporarily unavailable. We're working on it!",
  INVALID_REQUEST: "Invalid request. Please check your input and try again.",
  MISSING_REQUIRED_FIELDS: "Some required fields are missing. Please fill them all.",

  // === AUTH ===
  INVALID_CREDENTIALS: "Incorrect email or password. Please try again.",
  INVALID_PASSWORD: "Password must contain uppercase, lowercase, number, and special character.",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
  ACCOUNT_LOCKED: "Too many failed attempts. Your account is locked for 15 minutes.",
  INVALID_TOKEN: "Invalid or expired token. Please request a new one.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You don't have permission for this resource.",

  // === USER ===
  USER_NOT_FOUND: "User not found. The account may have been deleted.",
  EMAIL_ALREADY_EXISTS: "This email is already registered. Try logging in.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_ROLE: "Invalid role selected. Must be student, company, or admin.",
  PROFILE_NOT_FOUND: "Profile not found. Please complete your profile.",
  PROFILE_INCOMPLETE: "Your profile is incomplete. Please fill in all required fields.",
  ACCOUNT_PENDING: "Your account is pending approval. We'll notify you soon!",
  ACCOUNT_REJECTED: "Your account was not approved. Contact support for details.",
  SKILLS_LIMIT_EXCEEDED: "You can select up to 10 skills only. Please adjust your selection.",

  // === PASSWORD ===
  WEAK_PASSWORD: "Password is too weak. Use at least 8 characters with uppercase, lowercase, number, and symbol.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match. Please confirm correctly.",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect.",

  // === FILE UPLOAD ===
  FILE_TOO_LARGE: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
  INVALID_FILE_TYPE: "Invalid file type. Only JPEG, PNG, PDF, and Word documents are allowed.",
  FILE_UPLOAD_FAILED: "Failed to upload file. Please try again.",

  // === JOB & APPLICATION ===
  JOB_NOT_FOUND: "Job posting not found. It may have been removed.",
  JOB_CLOSED: "This job is no longer accepting applications.",
  APPLICATION_EXISTS: "You have already applied for this job.",
  APPLICATION_NOT_FOUND: "Application not found.",
  CANNOT_APPLY_OWN_JOB: "You cannot apply to your own job posting.",
  RESUME_REQUIRED: "Please upload your resume to apply.",

  // === COMPANY ===
  COMPANY_NOT_FOUND: "Company profile not found.",
  COMPANY_NAME_EXISTS: "A company with this name already exists.",
  COMPANY_NAME_REQUIRED: "Company name is required.",
  INDUSTRY_REQUIRED: "Please select an industry for your company.",

  // === ADMIN ===
  ADMIN_ONLY: "This action is restricted to administrators only.",
  SUPER_ADMIN_REQUIRED: "Super admin privileges required.",

  // === VALIDATION ===
  INVALID_OBJECT_ID: "Invalid ID format. Please check and try again.",
  INVALID_DATE: "Invalid date format. Use YYYY-MM-DD.",
  INVALID_URL: "Please enter a valid URL (e.g., https://example.com).",
  INVALID_PAGE: "Invalid page number. Must be a positive integer.",
  INVALID_LIMIT: `Invalid limit. Must be between 1 and ${DEFAULT_PAGINATION.MAX_LIMIT}.`,

  // === NETWORK / EXTERNAL ===
  EXTERNAL_API_FAILED: "Failed to connect to external service. Please try again later.",
  EMAIL_SEND_FAILED: "Failed to send email. Please check your inbox or spam folder.",

  // === RATE LIMIT ===
  TOO_MANY_REQUESTS: "Too many requests. Please slow down and try again later.",
};

// ========================================
// PROFILE STATUSES
// ========================================
export const PROFILE_STATUSES = {
  UNDER_REVIEW: "review",
  APPROVED: "approved",
  REJECTED: "rejected",
  JOB_SEEKING: "job_seeking",
  NOT_JOB_SEEKING: "not_job_seeking",
  ACTIVE: "active",
  INACTIVE: "inactive",
};
// ========================================
// SUCCESS MESSAGES
// ========================================
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back! You're now logged in.",
  REGISTER_SUCCESS: "Account created! Please check your email to verify.",
  EMAIL_VERIFIED: "Email verified successfully! You can now log in.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_RESET: "Password reset successful. You can now log in.",
  APPLICATION_SUBMITTED: "Application submitted! We'll review it soon.",
  JOB_POSTED: "Job posted successfully!",
  ACCOUNT_APPROVED: "Congratulations! Your account has been approved.",
  FILE_UPLOADED: "File uploaded successfully.",
  ACCOUNT_DELETED: "Your account has been deleted.",
};

// ========================================
// API CONFIG
// ========================================
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;
export const SUPPORTED_API_VERSIONS = ["v1"];

// ========================================
// LOGGING
// ========================================
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
  VERBOSE: "verbose",
};

// ========================================
// SESSION & OTP
// ========================================
export const SESSION_TIMEOUT_MINUTES = 30;
export const OTP_EXPIRATION_MINUTES = 10;

// ========================================
// CURRENCY & LOCALIZATION (Ghana Focus)
// ========================================
export const CURRENCY_CODES = ["GHS", "USD"];
export const TIME_ZONES = ["Africa/Accra"];