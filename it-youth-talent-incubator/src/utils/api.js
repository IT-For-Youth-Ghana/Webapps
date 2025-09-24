import axios from 'axios'

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
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getCurrentUser: () => api.get('/auth/me')
}

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (profileData) => api.put('/student/profile', profileData),
  getJobs: (filters = {}) => api.get('/jobs', { params: filters }),
  getJob: (id) => api.get(`/jobs/${id}`),
  applyForJob: (jobId, applicationData) => api.post(`/jobs/${jobId}/apply`, applicationData),
  getApplications: () => api.get('/student/applications'),
  getApplication: (id) => api.get(`/student/applications/${id}`)
}

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getStudents: (filters = {}) => api.get('/admin/students', { params: filters }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getJobs: (filters = {}) => api.get('/admin/jobs', { params: filters }),
  createJob: (jobData) => api.post('/admin/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/admin/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getApplications: (filters = {}) => api.get('/admin/applications', { params: filters }),
  updateApplicationStatus: (id, status) => api.put(`/admin/applications/${id}/status`, { status })
}

export default api