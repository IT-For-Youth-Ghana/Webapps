import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { applicationsAPI } from '../utils/api.js'

/**
 * Applications Store
 * Handles student and company application workflows
 */
export const useApplicationsStore = defineStore('applications', () => {
  // State
  const loading = ref(false)
  const error = ref(null)

  // Student
  const myApplications = ref([])

  // Company
  const companyApplications = ref([])
  const companyFilters = ref({ status: '', job_id: '', page: 1, limit: 20 })

  // Computed
  const pendingCount = computed(() => myApplications.value.filter(a => a.status === 'pending').length)
  const groupedByStatus = computed(() => {
    return myApplications.value.reduce((acc, app) => {
      const key = app.status || 'unknown'
      acc[key] = acc[key] || []
      acc[key].push(app)
      return acc
    }, {})
  })

  // Actions - Student
  const fetchMyApplications = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await applicationsAPI.getMyApplications(params)
      myApplications.value = data?.data || data?.applications || []
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Failed to load applications'
      throw e
    } finally {
      loading.value = false
    }
  }

  const submitApplication = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await applicationsAPI.submitApplication(payload)
      // Optimistic append
      if (data?.data) myApplications.value.unshift(data.data)
      return data?.data
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Failed to submit application'
      throw e
    } finally {
      loading.value = false
    }
  }

  const withdrawApplication = async (id) => {
    loading.value = true
    error.value = null
    try {
      await applicationsAPI.withdrawApplication(id)
      myApplications.value = myApplications.value.filter(a => a._id !== id)
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Failed to withdraw application'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Actions - Company
  const fetchCompanyApplications = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = { ...companyFilters.value, ...filters }
      const { data } = await applicationsAPI.getJobApplications(params.job_id || 'all', params)
      companyApplications.value = data?.data || data?.applications || []
      companyFilters.value = params
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Failed to load applications'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (id, status, notes = '') => {
    loading.value = true
    error.value = null
    try {
      const { data } = await applicationsAPI.updateApplicationStatus(id, status, notes)
      const idx = companyApplications.value.findIndex(a => a._id === id)
      if (idx !== -1) companyApplications.value[idx] = { ...companyApplications.value[idx], ...data?.data }
      const sidx = myApplications.value.findIndex(a => a._id === id)
      if (sidx !== -1) myApplications.value[sidx] = { ...myApplications.value[sidx], ...data?.data }
      return data?.data
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Failed to update status'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    loading,
    error,
    myApplications,
    companyApplications,
    companyFilters,

    // computed
    pendingCount,
    groupedByStatus,

    // actions
    fetchMyApplications,
    submitApplication,
    withdrawApplication,
    fetchCompanyApplications,
    updateStatus
  }
})
