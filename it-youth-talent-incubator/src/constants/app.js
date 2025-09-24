/**
 * Application-wide constants and configuration
 * Business logic constants, API endpoints, and app-specific settings
 */

// Application Information
export const APP_INFO = {
  NAME: 'IT Youth Talent Incubator',
  VERSION: '1.0.0',
  DESCRIPTION: 'Talent management platform for Ghana\'s IT youth'
}

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
}

// Navigation Routes
export const ROUTES = {
  DASHBOARD: 'dashboard',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  PROFILE: 'profile',
  STUDENTS: 'students',
  ANALYTICS: 'analytics'
}

// Application Status Types
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing', 
  INTERVIEW: 'interview',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
}

// Job Types
export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  REMOTE: 'Remote'
}

// Job Status
export const JOB_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  CLOSED: 'closed',
  EXPIRED: 'expired'
}

// Student Status
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  JOB_SEEKING: 'job_seeking',
  EMPLOYED: 'employed',
  INACTIVE: 'inactive'
}

// Skill Categories
export const SKILL_CATEGORIES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  FULLSTACK: 'fullstack',
  DESIGN: 'design',
  DATA: 'data',
  MOBILE: 'mobile',
  DEVOPS: 'devops'
}

// Ghana Locations
export const GHANA_LOCATIONS = [
  'Accra',
  'Kumasi', 
  'Tamale',
  'Cape Coast',
  'Ho',
  'Takoradi',
  'Sunyani',
  'Koforidua',
  'Remote'
]

// Salary Ranges (in GHS)
export const SALARY_RANGES = {
  ENTRY: '0-5k',
  JUNIOR: '5k-10k', 
  INTERMEDIATE: '10k-15k',
  SENIOR: '15k+'
}

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    RESUME: ['.pdf', '.doc', '.docx'],
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif'],
    DOCUMENT: ['.pdf', '.doc', '.docx', '.txt']
  },
  MAX_FILES: 5
}

// Form Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_COVER_LETTER_LENGTH: 100,
  MIN_MOTIVATION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_PROFILE_COMPLETENESS: 60
}

// Pagination Settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_LONG: 'DD MMMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY HH:mm',
  INPUT: 'YYYY-MM-DD',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
}

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches'
}

// API Configuration (placeholders for backend integration)
export const API_CONFIG = {
  BASE_URL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}

// API Endpoints (placeholders)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs',
    UPDATE: '/jobs/:id',
    DELETE: '/jobs/:id',
    APPLY: '/jobs/:id/apply'
  },
  APPLICATIONS: {
    LIST: '/applications',
    UPDATE: '/applications/:id',
    WITHDRAW: '/applications/:id/withdraw'
  },
  STUDENTS: {
    LIST: '/students',
    PROFILE: '/students/:id',
    UPDATE: '/students/:id'
  },
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    JOBS: '/analytics/jobs',
    APPLICATIONS: '/analytics/applications',
    STUDENTS: '/analytics/students'
  },
  UPLOAD: {
    FILE: '/upload/file',
    RESUME: '/upload/resume',
    AVATAR: '/upload/avatar'
  }
}

// Filter Options
export const JOB_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
  { value: 'expired', label: 'Expired' }
]

export const JOB_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Remote', label: 'Remote' }
]

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'interview', label: 'Interview' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  FILE_TYPE_NOT_ALLOWED: 'File type is not allowed.'
}