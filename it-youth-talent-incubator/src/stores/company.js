/**
 * Company Store
 * Manages company profile state, jobs, applications, and analytics
 *
 * @typedef {import('../types/api.types.js').Company} Company
 * @typedef {import('../types/api.types.js').Job} Job
 * @typedef {import('../types/api.types.js').Application} Application
 * @typedef {import('../types/api.types.js').SocialLink} SocialLink
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { companyAPI, jobsAPI, apiUtils } from '../utils/api.js'
import { useAuthStore } from './auth.js'

export const useCompanyStore = defineStore('company', () => {
  // ===========================================
  // State
  // ===========================================

  /** @type {import('vue').Ref<Company|null>} */
  const profile = ref(null)

  /** @type {import('vue').Ref<Job[]>} */
  const jobs = ref([])

  /** @type {import('vue').Ref<Application[]>} */
  const applications = ref([])

  /** @type {import('vue').Ref<Object|null>} */
  const jobStats = ref(null)

  /** @type {import('vue').Ref<Object|null>} */
  const analytics = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isSaving = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isLoadingJobs = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isLoadingApplications = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null)

  /** @type {import('vue').Ref<string|null>} */
  const successMessage = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isProfileLoaded = ref(false)

  // ===========================================
  // Jobs Pagination State
  // ===========================================

  /** @type {import('vue').Ref<number>} */
  const jobsPage = ref(1)

  /** @type {import('vue').Ref<number>} */
  const jobsTotalPages = ref(1)

  /** @type {import('vue').Ref<number>} */
  const jobsTotal = ref(0)

  // ===========================================
  // Applications Pagination State
  // ===========================================

  /** @type {import('vue').Ref<number>} */
  const applicationsPage = ref(1)

  /** @type {import('vue').Ref<number>} */
  const applicationsTotalPages = ref(1)

  /** @type {import('vue').Ref<number>} */
  const applicationsTotal = ref(0)

  // ===========================================
  // Getters
  // ===========================================

  const companyName = computed(() => profile.value?.name || '')

  const hasLogo = computed(() => !!profile.value?.logo_url)

  const socialLinks = computed(() => profile.value?.social_links || [])

  const activeJobs = computed(() =>
    jobs.value.filter((job) => job.status === 'published')
  )

  const draftJobs = computed(() =>
    jobs.value.filter((job) => job.status === 'draft')
  )

  const closedJobs = computed(() =>
    jobs.value.filter((job) => job.status === 'closed')
  )

  const pendingApplications = computed(() =>
    applications.value.filter((app) => app.status === 'pending')
  )

  const reviewingApplications = computed(() =>
    applications.value.filter((app) => app.status === 'reviewing')
  )

  const shortlistedApplications = computed(() =>
    applications.value.filter((app) => app.status === 'shortlisted')
  )

  /**
   * Calculate profile completion percentage
   */
  const profileCompletion = computed(() => {
    if (!profile.value) return 0

    let completed = 0
    const total = 6

    // Company name
    if (profile.value.name) completed++

    // Description
    if (profile.value.description && profile.value.description.length > 20) completed++

    // Industry
    if (profile.value.industry) completed++

    // Website
    if (profile.value.website) completed++

    // Logo
    if (profile.value.logo_url) completed++

    // Social links (at least one)
    if (profile.value.social_links?.length > 0) completed++

    return Math.round((completed / total) * 100)
  })

  // ===========================================
  // Actions - Profile
  // ===========================================

  /**
   * Clear messages
   */
  function clearMessages() {
    error.value = null
    successMessage.value = null
  }

  /**
   * Fetch company profile
   * @returns {Promise<boolean>}
   */
  async function fetchProfile() {
    if (isProfileLoaded.value && profile.value) {
      return true
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await companyAPI.getProfile()
      const result = apiUtils.unwrap(response)
      profile.value = result.data || result.company || result
      isProfileLoaded.value = true
      return true
    } catch (err) {
      error.value = err.message || 'Failed to fetch company profile'
      console.error('[CompanyStore] Error fetching profile:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update company profile
   * @param {Object} profileData
   * @returns {Promise<boolean>}
   */
  async function updateProfile(profileData) {
    isSaving.value = true
    error.value = null
    successMessage.value = null

    try {
      const response = await companyAPI.updateProfile(profileData)
      const result = apiUtils.unwrap(response)
      profile.value = { ...profile.value, ...(result.data || result.company || result) }
      successMessage.value = 'Profile updated successfully'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update profile'
      console.error('[CompanyStore] Error updating profile:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Upload company logo
   * @param {File} file
   * @returns {Promise<string|null>} Logo URL or null on failure
   */
  async function uploadLogo(file) {
    isSaving.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await companyAPI.uploadLogo(formData)
      const result = apiUtils.unwrap(response)
      const logoUrl = result.logo_url || result.url

      if (profile.value) {
        profile.value.logo_url = logoUrl
      }

      successMessage.value = 'Logo uploaded successfully'
      return logoUrl
    } catch (err) {
      error.value = err.message || 'Failed to upload logo'
      console.error('[CompanyStore] Error uploading logo:', err)
      return null
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update social links
   * @param {SocialLink[]} links
   * @returns {Promise<boolean>}
   */
  async function updateSocialLinks(links) {
    isSaving.value = true
    error.value = null

    try {
      const response = await companyAPI.updateSocialLinks(links)
      const result = apiUtils.unwrap(response)

      if (profile.value) {
        profile.value.social_links = result.social_links || links
      }

      successMessage.value = 'Social links updated successfully'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update social links'
      console.error('[CompanyStore] Error updating social links:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Actions - Jobs
  // ===========================================

  /**
   * Fetch company's jobs
   * @param {Object} [params]
   * @returns {Promise<boolean>}
   */
  async function fetchJobs(params = {}) {
    isLoadingJobs.value = true
    error.value = null

    try {
      const response = await companyAPI.getMyJobs({
        page: jobsPage.value,
        limit: 10,
        ...params
      })
      const result = apiUtils.unwrap(response)

      jobs.value = result.data || result.jobs || result || []

      // Update pagination
      if (result.pagination) {
        jobsTotalPages.value = result.pagination.totalPages || 1
        jobsTotal.value = result.pagination.total || jobs.value.length
      }

      return true
    } catch (err) {
      error.value = err.message || 'Failed to fetch jobs'
      console.error('[CompanyStore] Error fetching jobs:', err)
      return false
    } finally {
      isLoadingJobs.value = false
    }
  }

  /**
   * Fetch job statistics
   * @returns {Promise<boolean>}
   */
  async function fetchJobStats() {
    try {
      const response = await companyAPI.getJobStats()
      const result = apiUtils.unwrap(response)
      jobStats.value = result.data || result.stats || result
      return true
    } catch (err) {
      console.error('[CompanyStore] Error fetching job stats:', err)
      return false
    }
  }

  /**
   * Create a new job
   * @param {Object} jobData
   * @returns {Promise<Job|null>}
   */
  async function createJob(jobData) {
    isSaving.value = true
    error.value = null

    try {
      const response = await jobsAPI.createJob(jobData)
      const result = apiUtils.unwrap(response)
      const newJob = result.data || result.job || result

      // Add to local jobs list
      jobs.value = [newJob, ...jobs.value]
      jobsTotal.value++

      successMessage.value = 'Job created successfully'
      return newJob
    } catch (err) {
      error.value = err.message || 'Failed to create job'
      console.error('[CompanyStore] Error creating job:', err)
      return null
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update a job
   * @param {string} jobId
   * @param {Object} jobData
   * @returns {Promise<boolean>}
   */
  async function updateJob(jobId, jobData) {
    isSaving.value = true
    error.value = null

    try {
      const response = await jobsAPI.updateJob(jobId, jobData)
      const result = apiUtils.unwrap(response)
      const updatedJob = result.data || result.job || result

      // Update in local jobs list
      const index = jobs.value.findIndex((j) => j._id === jobId)
      if (index !== -1) {
        jobs.value[index] = { ...jobs.value[index], ...updatedJob }
      }

      successMessage.value = 'Job updated successfully'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update job'
      console.error('[CompanyStore] Error updating job:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete a job
   * @param {string} jobId
   * @returns {Promise<boolean>}
   */
  async function deleteJob(jobId) {
    isSaving.value = true
    error.value = null

    try {
      await jobsAPI.deleteJob(jobId)

      // Remove from local jobs list
      jobs.value = jobs.value.filter((j) => j._id !== jobId)
      jobsTotal.value--

      successMessage.value = 'Job deleted successfully'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete job'
      console.error('[CompanyStore] Error deleting job:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Publish a job
   * @param {string} jobId
   * @returns {Promise<boolean>}
   */
  async function publishJob(jobId) {
    isSaving.value = true
    error.value = null

    try {
      const response = await jobsAPI.publishJob(jobId)
      const result = apiUtils.unwrap(response)

      // Update in local jobs list
      const index = jobs.value.findIndex((j) => j._id === jobId)
      if (index !== -1) {
        jobs.value[index] = {
          ...jobs.value[index],
          status: 'published',
          published_at: new Date().toISOString()
        }
      }

      successMessage.value = 'Job published successfully'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to publish job'
      console.error('[CompanyStore] Error publishing job:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Close a job
   * @param {string} jobId
   * @returns {Promise<boolean>}
   */
  async function closeJob(jobId) {
    isSaving.value = true
    error.value = null

    try {
      const response = await jobsAPI.closeJob(jobId)
      const result = apiUtils.unwrap(response)

      // Update in local jobs list
      const index = jobs.value.findIndex((j) => j._id === jobId)
      if (index !== -1) {
        jobs.value[index] = {
          ...jobs.value[index],
          status: 'closed',
          closed_at: new Date().toISOString()
        }
      }

      successMessage.value = 'Job closed successfully'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to close job'
      console.error('[CompanyStore] Error closing job:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Actions - Applications
  // ===========================================

  /**
   * Fetch applications for company's jobs
   * @param {Object} [params]
   * @returns {Promise<boolean>}
   */
  async function fetchApplications(params = {}) {
    isLoadingApplications.value = true
    error.value = null

    try {
      const response = await companyAPI.getApplications({
        page: applicationsPage.value,
        limit: 20,
        ...params
      })
      const result = apiUtils.unwrap(response)

      applications.value = result.data || result.applications || result || []

      // Update pagination
      if (result.pagination) {
        applicationsTotalPages.value = result.pagination.totalPages || 1
        applicationsTotal.value = result.pagination.total || applications.value.length
      }

      return true
    } catch (err) {
      error.value = err.message || 'Failed to fetch applications'
      console.error('[CompanyStore] Error fetching applications:', err)
      return false
    } finally {
      isLoadingApplications.value = false
    }
  }

  /**
   * Update application status
   * @param {string} applicationId
   * @param {string} status
   * @param {string} [notes]
   * @returns {Promise<boolean>}
   */
  async function updateApplicationStatus(applicationId, status, notes = '') {
    isSaving.value = true
    error.value = null

    try {
      const response = await companyAPI.updateApplicationStatus(applicationId, status, notes)
      const result = apiUtils.unwrap(response)

      // Update in local applications list
      const index = applications.value.findIndex((a) => a._id === applicationId)
      if (index !== -1) {
        applications.value[index] = {
          ...applications.value[index],
          status,
          reviewed_at: new Date().toISOString()
        }
      }

      successMessage.value = 'Application status updated'
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update application status'
      console.error('[CompanyStore] Error updating application status:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Bulk update applications
   * @param {Array<{id: string, status: string}>} updates
   * @returns {Promise<boolean>}
   */
  async function bulkUpdateApplications(updates) {
    isSaving.value = true
    error.value = null

    try {
      await companyAPI.bulkUpdateApplications(updates)

      // Update local applications
      updates.forEach(({ id, status }) => {
        const index = applications.value.findIndex((a) => a._id === id)
        if (index !== -1) {
          applications.value[index] = {
            ...applications.value[index],
            status
          }
        }
      })

      successMessage.value = `${updates.length} applications updated`
      return true
    } catch (err) {
      error.value = err.message || 'Failed to update applications'
      console.error('[CompanyStore] Error bulk updating applications:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Actions - Analytics
  // ===========================================

  /**
   * Fetch company analytics
   * @returns {Promise<boolean>}
   */
  async function fetchAnalytics() {
    try {
      const response = await companyAPI.getAnalytics()
      const result = apiUtils.unwrap(response)
      analytics.value = result.data || result.analytics || result
      return true
    } catch (err) {
      console.error('[CompanyStore] Error fetching analytics:', err)
      return false
    }
  }

  // ===========================================
  // Actions - Utility
  // ===========================================

  /**
   * Refresh all company data
   * @returns {Promise<void>}
   */
  async function refreshAll() {
    await Promise.all([
      fetchProfile(),
      fetchJobs(),
      fetchJobStats(),
      fetchApplications(),
      fetchAnalytics()
    ])
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  /**
   * Clear success message
   */
  function clearSuccessMessage() {
    successMessage.value = null
  }

  /**
   * Reset store to initial state
   */
  function $reset() {
    profile.value = null
    jobs.value = []
    applications.value = []
    jobStats.value = null
    analytics.value = null
    isLoading.value = false
    isSaving.value = false
    isLoadingJobs.value = false
    isLoadingApplications.value = false
    error.value = null
    successMessage.value = null
    isProfileLoaded.value = false
    jobsPage.value = 1
    jobsTotalPages.value = 1
    jobsTotal.value = 0
    applicationsPage.value = 1
    applicationsTotalPages.value = 1
    applicationsTotal.value = 0
  }

  // ===========================================
  // Return Store
  // ===========================================

  return {
    // State
    profile,
    jobs,
    applications,
    jobStats,
    analytics,
    isLoading,
    isSaving,
    isLoadingJobs,
    isLoadingApplications,
    error,
    successMessage,
    isProfileLoaded,

    // Pagination
    jobsPage,
    jobsTotalPages,
    jobsTotal,
    applicationsPage,
    applicationsTotalPages,
    applicationsTotal,

    // Getters
    companyName,
    hasLogo,
    socialLinks,
    activeJobs,
    draftJobs,
    closedJobs,
    pendingApplications,
    reviewingApplications,
    shortlistedApplications,
    profileCompletion,

    // Actions - Profile
    clearMessages,
    fetchProfile,
    updateProfile,
    uploadLogo,
    updateSocialLinks,

    // Actions - Jobs
    fetchJobs,
    fetchJobStats,
    createJob,
    updateJob,
    deleteJob,
    publishJob,
    closeJob,

    // Actions - Applications
    fetchApplications,
    updateApplicationStatus,
    bulkUpdateApplications,

    // Actions - Analytics
    fetchAnalytics,

    // Actions - Utility
    refreshAll,
    clearError,
    clearSuccessMessage,
    $reset
  }
})
