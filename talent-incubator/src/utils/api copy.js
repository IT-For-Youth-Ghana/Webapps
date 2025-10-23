import axios from 'axios'
import { ENDPOINTS } from './constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post(ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(ENDPOINTS.AUTH.REGISTER, userData),
  logout: () => api.post(ENDPOINTS.AUTH.LOGOUT),
  forgotPassword: (email) => api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (token, password) => api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
  getCurrentUser: () => api.get(ENDPOINTS.AUTH.CURRENT_USER)
}

export const studentAPI = {
  getProfile: () => api.get(ENDPOINTS.USERS.GET_PROFILE),
  updateProfile: (profileData) => api.put(ENDPOINTS.USERS.UPDATE_PROFILE(profileData.id), profileData),
  getJobs: (filters = {}) => api.get(ENDPOINTS.JOBS.GET_JOBS, { params: filters }),
  getJob: (id) => api.get(ENDPOINTS.JOBS.GET_JOB(id)),
  applyForJob: (jobId, applicationData) => api.post(ENDPOINTS.APPLICATIONS.APPLY_JOB(jobId), applicationData),
  getApplications: () => api.get(ENDPOINTS.APPLICATIONS.GET_STUDENT_APPLICATIONS),
  getApplication: (id) => api.get(ENDPOINTS.APPLICATIONS.GET_APPLICATION(id))
}

export const adminAPI = {
  getDashboardStats: () => api.get(ENDPOINTS.ANALYTICS.GET_DASHBOARD_STATS()),

  getStudents: (filters = {}) => api.get(ENDPOINTS.USERS.GET_STUDENTS, { params: filters }),
  getStudent: (id) => api.get(ENDPOINTS.USERS.GET_USER(id)),
  updateStudent: (id, data) => api.put(ENDPOINTS.USERS.UPDATE_PROFILE(id), data),
  deleteStudent: (id) => api.delete(ENDPOINTS.USERS.DEACTIVATE_PROFILE(id)),
  getJobs: (filters = {}) => api.get(ENDPOINTS.JOBS.GET_JOBS, { params: filters }),
  createJob: (jobData) => api.post(ENDPOINTS.JOBS.CREATE_JOB, jobData),
  updateJob: (id, jobData) => api.put(ENDPOINTS.JOBS.UPDATE_JOB(id), jobData),
  deleteJob: (id) => api.delete(ENDPOINTS.JOBS.DELETE_JOB(id)),
  getApplications: (filters = {}) => api.get(ENDPOINTS.APPLICATIONS.GET_APPLICATIONS, { params: filters }),
  updateApplicationStatus: (id, status) => api.put(ENDPOINTS.APPLICATIONS.UPDATE_APPLICATION_STATUS(id), { status })
}

export default api
