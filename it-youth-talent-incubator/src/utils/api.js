import axios from 'axios'

/**
 * @typedef {import('../types/api.types.js').ApiResponse} ApiResponse
 * @typedef {import('../types/api.types.js').PaginatedResponse} PaginatedResponse
 * @typedef {import('../types/api.types.js').User} User
 * @typedef {import('../types/api.types.js').Student} Student
 * @typedef {import('../types/api.types.js').Company} Company
 * @typedef {import('../types/api.types.js').Job} Job
 * @typedef {import('../types/api.types.js').Application} Application
 * @typedef {import('../types/api.types.js').LoginResponse} LoginResponse
 * @typedef {import('../types/api.types.js').AuthTokens} AuthTokens
 */

// ===========================================
// API Configuration
// ===========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000

/** @type {import('axios').AxiosInstance} */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookies for refresh tokens
})

// ===========================================
// Request Interceptor
// ===========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ===========================================
// Response Interceptor
// ===========================================
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 - Attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshResponse = await api.post('/auth/refresh')
        const { token } = refreshResponse.data.data

        if (token) {
          localStorage.setItem('authToken', token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`[API] Error:`, error.response?.data || error.message)
    }

    return Promise.reject(error)
  }
)

// ===========================================
// Auth API - /auth/*
// ===========================================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  refreshToken: () => api.post('/auth/refresh'),
  checkAuth: () => api.get('/auth/check'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  revokeAllTokens: () => api.post('/auth/revoke-all')
}

// ===========================================
// Student API - /users/students/*
// ===========================================
export const studentAPI = {
  // Profile
  getProfile: () => api.get('/users/students/me'),
  updateProfile: (profileData) => api.put('/users/students/me', profileData),

  // Education
  addEducation: (education) => api.post('/users/students/me/education', education),
  updateEducation: (index, education) => api.put(`/users/students/me/education/${index}`, education),
  deleteEducation: (index) => api.delete(`/users/students/me/education/${index}`),

  // Experience
  addExperience: (experience) => api.post('/users/students/me/experience', experience),
  updateExperience: (index, experience) => api.put(`/users/students/me/experience/${index}`, experience),
  deleteExperience: (index) => api.delete(`/users/students/me/experience/${index}`),

  // Skills
  updateSkills: (skills) => api.put('/users/students/me/skills', { skills }),

  // CV/Resume
  uploadCV: (formData) => api.post('/users/students/me/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCV: () => api.delete('/users/students/me/cv'),

  // Status
  updateStatus: (status) => api.put('/users/students/me/status', { status }),

  // Applications
  getApplications: () => api.get('/users/students/me/applications'),

  // Public student directory
  listStudents: (params = {}) => api.get('/users/students', { params }),
  getJobSeekingStudents: (params = {}) => api.get('/users/students/job-seeking', { params }),
  getStudentById: (id) => api.get(`/users/students/${id}`)
}

// ===========================================
// Company API - /users/companies/*
// ===========================================
export const companyAPI = {
  // Profile
  getProfile: () => api.get('/users/companies/me'),
  updateProfile: (profileData) => api.put('/users/companies/me', profileData),
  uploadLogo: (formData) => api.post('/users/companies/me/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Social Links
  updateSocialLinks: (links) => api.put('/users/companies/me/social-links', links),

  // Jobs
  getMyJobs: (params = {}) => api.get('/users/companies/me/jobs', { params }),
  getJobStats: () => api.get('/users/companies/me/jobs/stats'),
  getJobAnalytics: (jobId) => api.get(`/users/companies/me/jobs/${jobId}/analytics`),

  // Applications
  getApplications: (params = {}) => api.get('/users/companies/me/applications', { params }),
  getApplicationById: (id) => api.get(`/users/companies/me/applications/${id}`),
  updateApplicationStatus: (id, status, notes) => api.put(`/users/companies/me/applications/${id}/status`, { status, notes }),
  bulkUpdateApplications: (updates) => api.post('/users/companies/me/applications/bulk-update', updates),

  // Analytics
  getAnalytics: () => api.get('/users/companies/me/analytics'),

  // Team
  getTeamMembers: () => api.get('/users/companies/me/team'),
  inviteTeamMember: (data) => api.post('/users/companies/me/team/invite', data),

  // Preferences
  getPreferences: () => api.get('/users/companies/me/preferences'),
  updatePreferences: (preferences) => api.put('/users/companies/me/preferences', preferences),

  // Public company directory
  listCompanies: (params = {}) => api.get('/users/companies', { params }),
  getCompanyById: (id) => api.get(`/users/companies/${id}`)
}

// ===========================================
// Jobs API - /jobs/*
// ===========================================
export const jobsAPI = {
  // Public job listings
  listJobs: (params = {}) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getJobBySlug: (slug) => api.get(`/jobs/slug/${slug}`),

  // Featured & Discovery
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getRecentJobs: (params = {}) => api.get('/jobs/recent', { params }),
  getTrendingJobs: () => api.get('/jobs/trending'),

  // Search & Filter
  searchJobs: (query, params = {}) => api.get('/jobs/search', { params: { q: query, ...params } }),
  filterJobs: (filters) => api.get('/jobs/filter', { params: filters }),

  // Company job management (requires auth)
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  publishJob: (id) => api.post(`/jobs/${id}/publish`),
  closeJob: (id) => api.post(`/jobs/${id}/close`),

  // Company's own jobs
  getMyJobs: (params = {}) => api.get('/jobs/my-jobs', { params }),
  getMyJobStats: () => api.get('/jobs/my-jobs/stats')
}

// ===========================================
// Applications API - /applications/*
// ===========================================
export const applicationsAPI = {
  // Student actions
  submitApplication: (applicationData) => api.post('/applications', applicationData),
  getMyApplications: (params = {}) => api.get('/applications/me', { params }),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),

  // Company actions
  getJobApplications: (jobId, params = {}) => api.get(`/applications/jobs/${jobId}/applications`, { params }),
  updateApplicationStatus: (id, status, notes) => api.patch(`/applications/${id}/status`, { status, notes })
}

// ===========================================
// Admin API - /admin/* (to be implemented)
// ===========================================
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),

  // User management
  getUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Student management
  getStudents: (params = {}) => api.get('/users/students', { params }),
  approveStudent: (id) => api.post(`/users/students/${id}/approve`),
  rejectStudent: (id, reason) => api.post(`/users/students/${id}/reject`, { reason }),

  // Company management
  getCompanies: (params = {}) => api.get('/users/companies', { params }),
  approveCompany: (id) => api.post(`/users/companies/${id}/approve`),
  rejectCompany: (id, reason) => api.post(`/users/companies/${id}/reject`, { reason }),

  // Job management
  getAllJobs: (params = {}) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.post(`/jobs/${id}/approve`),
  rejectJob: (id, reason) => api.post(`/jobs/${id}/reject`, { reason }),

  // Application management
  getAllApplications: (params = {}) => api.get('/admin/applications', { params })
}

// ===========================================
// Utility Functions
// ===========================================
export const apiUtils = {
  /**
   * Unwrap API response to get the data
   * Handles different response formats from the backend
   * @param {Object} response - Axios response object
   * @returns {Object} The unwrapped data
   */
  unwrap: (response) => {
    // If response is already unwrapped data (not an axios response)
    if (!response?.data && !response?.status) {
      return response
    }
    // Axios wraps response in .data
    const data = response.data
    // Backend may wrap in { success: true, data: {...} }
    if (data?.success && data?.data !== undefined) {
      return data.data
    }
    // Or just return the data directly
    return data
  },

  /**
   * Set auth token in localStorage and axios headers
   */
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('authToken')
      delete api.defaults.headers.common['Authorization']
    }
  },

  /**
   * Clear all auth data
   */
  clearAuth: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  }
}

export default api
