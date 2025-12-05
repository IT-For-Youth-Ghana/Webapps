export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
}

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
}

export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
  REMOTE: 'remote',
}

export const SKILL_CATEGORIES = {
  PROGRAMMING: 'Programming',
  DESIGN: 'Design',
  DATA: 'Data & Analytics',
  MARKETING: 'Marketing',
  PROJECT_MANAGEMENT: 'Project Management',
  COMMUNICATION: 'Communication',
  LANGUAGES: 'Languages',
}

export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: 'High School',
  DIPLOMA: 'Diploma',
  BACHELOR: "Bachelor's Degree",
  MASTER: "Master's Degree",
  PHD: 'PhD',
  CERTIFICATION: 'Professional Certification',
}

export const EXPERIENCE_LEVELS = {
  ENTRY: 'Entry Level (0-1 years)',
  JUNIOR: 'Junior (1-3 years)',
  MID: 'Mid Level (3-5 years)',
  SENIOR: 'Senior (5+ years)',
}

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Eastern',
  'Brong-Ahafo',
  'Western North',
  'Ahafo',
  'Bono East',
  'North East',
  'Savannah',
  'Oti',
]

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    PROFILE: '/student/profile',
    JOBS: '/student/jobs',
    APPLICATIONS: '/student/applications',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STUDENTS: '/admin/students',
    JOBS: '/admin/jobs',
    APPLICATIONS: '/admin/applications',
  },
}

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/token/refresh',
    RESET_PASSWORD: '/api/auth/reset-password',
    CURRENT_USER: '/api/auth/me',
  },
  USERS: {
    GET_PROFILE: '/api/users/me',
    UPDATE_PROFILE: (id) => `/api/users/${id}`,
    DEACTIVATE_PROFILE: (id) => `/api/users/${id}`,
    GET_STUDENTS: '/api/users/students', // Static URL
    GET_COMPANIES: '/api/users/companies',
    GET_ADMINS: '/api/users/admins',
    GET_USER: (id) => `/api/users/${id}`,
  },
  JOBS: {
    GET_JOBS: '/api/jobs', // Static URL
    GET_JOB: (id) => `/api/jobs/${id}`,
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,
    CREATE_JOB: '/api/jobs',
  },
  APPLICATIONS: {
    GET_APPLICATIONS: '/api/applications', // Static URL
    GET_STUDENT_APPLICATIONS: `/api/applications/student/`,
    GET_APPLICATION: (id) => `/api/applications/${id}`,
    APPLY_JOB: (jobId) => `/api/applications/${jobId}/apply`,
    UPDATE_APPLICATION: (id) => `/api/applications/${id}`,
    UPDATE_APPLICATION_STATUS: (id) => `/api/applications/${id}/status`,
  },
  ANALYTICS: {
    GET_DASHBOARD_STATS: '/api/analytics/dashboard',
    GET_USER_STATS: (userId) => `/api/analytics/users/${userId}`,
    GET_JOB_STATS: (jobId) => `/api/analytics/jobs/${jobId}`,
  },
}
