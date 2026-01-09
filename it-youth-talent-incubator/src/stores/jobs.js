/**
 * Jobs Store
 * Manages job listings state, search, filtering, and pagination
 *
 * @typedef {import('../types/api.types.js').Job} Job
 * @typedef {import('../types/api.types.js').JobType} JobType
 * @typedef {import('../types/api.types.js').ExperienceLevel} ExperienceLevel
 * @typedef {import('../types/api.types.js').JobStatus} JobStatus
 */

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { jobsAPI, apiUtils } from '../utils/api.js'

export const useJobsStore = defineStore('jobs', () => {
  // ===========================================
  // State
  // ===========================================

  /** @type {import('vue').Ref<Job[]>} */
  const jobs = ref([])

  /** @type {import('vue').Ref<Job[]>} */
  const featuredJobs = ref([])

  /** @type {import('vue').Ref<Job[]>} */
  const recentJobs = ref([])

  /** @type {import('vue').Ref<Job|null>} */
  const selectedJob = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isLoadingMore = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isLoadingJob = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null)

  // ===========================================
  // Pagination State
  // ===========================================

  /** @type {import('vue').Ref<number>} */
  const currentPage = ref(1)

  /** @type {import('vue').Ref<number>} */
  const totalPages = ref(1)

  /** @type {import('vue').Ref<number>} */
  const totalJobs = ref(0)

  /** @type {import('vue').Ref<number>} */
  const perPage = ref(12)

  /** @type {import('vue').Ref<boolean>} */
  const hasMore = ref(false)

  // ===========================================
  // Search & Filter State
  // ===========================================

  /** @type {import('vue').Ref<string>} */
  const searchQuery = ref('')

  /** @type {import('vue').Ref<Object>} */
  const filters = ref({
    /** @type {JobType|''} */
    job_type: '',
    /** @type {ExperienceLevel|''} */
    experience_level: '',
    /** @type {string} */
    location: '',
    /** @type {number|null} */
    salary_min: null,
    /** @type {number|null} */
    salary_max: null,
    /** @type {string[]} */
    skills: [],
    /** @type {'createdAt'|'salary'|'views'|'applications_count'} */
    sort_by: 'createdAt',
    /** @type {'asc'|'desc'} */
    sort_order: 'desc'
  })

  // ===========================================
  // Getters
  // ===========================================

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return (
      filters.value.job_type !== '' ||
      filters.value.experience_level !== '' ||
      filters.value.location !== '' ||
      filters.value.salary_min !== null ||
      filters.value.salary_max !== null ||
      filters.value.skills.length > 0 ||
      searchQuery.value !== ''
    )
  })

  /**
   * Count of active filters
   */
  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.job_type) count++
    if (filters.value.experience_level) count++
    if (filters.value.location) count++
    if (filters.value.salary_min || filters.value.salary_max) count++
    if (filters.value.skills.length > 0) count++
    if (searchQuery.value) count++
    return count
  })

  /**
   * Get pagination info
   */
  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    totalJobs: totalJobs.value,
    perPage: perPage.value,
    hasMore: hasMore.value,
    showing: {
      from: (currentPage.value - 1) * perPage.value + 1,
      to: Math.min(currentPage.value * perPage.value, totalJobs.value)
    }
  }))

  /**
   * Check if jobs list is empty
   */
  const isEmpty = computed(() => jobs.value.length === 0 && !isLoading.value)

  /**
   * Get unique locations from loaded jobs (for filter suggestions)
   */
  const availableLocations = computed(() => {
    const locations = new Set()
    jobs.value.forEach((job) => {
      if (job.location) locations.add(job.location)
    })
    return Array.from(locations).sort()
  })

  // ===========================================
  // Actions - Fetching Jobs
  // ===========================================

  /**
   * Build query params from current state
   * @returns {Object}
   */
  function buildQueryParams() {
    const params = {
      page: currentPage.value,
      limit: perPage.value,
      sort_by: filters.value.sort_by,
      sort_order: filters.value.sort_order
    }

    // Add search query
    if (searchQuery.value) {
      params.q = searchQuery.value
    }

    // Add filters
    if (filters.value.job_type) {
      params.job_type = filters.value.job_type
    }
    if (filters.value.experience_level) {
      params.experience_level = filters.value.experience_level
    }
    if (filters.value.location) {
      params.location = filters.value.location
    }
    if (filters.value.salary_min) {
      params.salary_min = filters.value.salary_min
    }
    if (filters.value.salary_max) {
      params.salary_max = filters.value.salary_max
    }
    if (filters.value.skills.length > 0) {
      params.skills = filters.value.skills.join(',')
    }

    return params
  }

  /**
   * Fetch jobs with current filters
   * @param {boolean} [reset=true] - Whether to reset to page 1
   * @returns {Promise<boolean>}
   */
  async function fetchJobs(reset = true) {
    if (reset) {
      currentPage.value = 1
      jobs.value = []
    }

    isLoading.value = true
    error.value = null

    try {
      const params = buildQueryParams()
      const response = await jobsAPI.listJobs(params)
      const result = apiUtils.unwrap(response)

      if (reset) {
        jobs.value = result.data || result.jobs || result || []
      } else {
        jobs.value = [...jobs.value, ...(result.data || result.jobs || result || [])]
      }

      // Update pagination info
      if (result.pagination) {
        totalPages.value = result.pagination.totalPages || 1
        totalJobs.value = result.pagination.total || jobs.value.length
        hasMore.value = currentPage.value < totalPages.value
      } else {
        totalJobs.value = jobs.value.length
        hasMore.value = false
      }

      return true
    } catch (err) {
      error.value = err.message || 'Failed to fetch jobs'
      console.error('[JobsStore] Error fetching jobs:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load more jobs (next page)
   * @returns {Promise<boolean>}
   */
  async function loadMore() {
    if (!hasMore.value || isLoadingMore.value) return false

    isLoadingMore.value = true
    currentPage.value++

    try {
      const params = buildQueryParams()
      const response = await jobsAPI.listJobs(params)
      const result = apiUtils.unwrap(response)

      const newJobs = result.data || result.jobs || result || []
      jobs.value = [...jobs.value, ...newJobs]

      // Update pagination
      if (result.pagination) {
        totalPages.value = result.pagination.totalPages || 1
        totalJobs.value = result.pagination.total || jobs.value.length
        hasMore.value = currentPage.value < totalPages.value
      } else {
        hasMore.value = false
      }

      return true
    } catch (err) {
      error.value = err.message || 'Failed to load more jobs'
      currentPage.value-- // Revert page increment on error
      return false
    } finally {
      isLoadingMore.value = false
    }
  }

  /**
   * Fetch featured jobs
   * @returns {Promise<boolean>}
   */
  async function fetchFeaturedJobs() {
    try {
      const response = await jobsAPI.getFeaturedJobs()
      const result = apiUtils.unwrap(response)
      featuredJobs.value = result.data || result.jobs || result || []
      return true
    } catch (err) {
      console.error('[JobsStore] Error fetching featured jobs:', err)
      return false
    }
  }

  /**
   * Fetch recent jobs
   * @param {number} [limit=6]
   * @returns {Promise<boolean>}
   */
  async function fetchRecentJobs(limit = 6) {
    try {
      const response = await jobsAPI.getRecentJobs({ limit })
      const result = apiUtils.unwrap(response)
      recentJobs.value = result.data || result.jobs || result || []
      return true
    } catch (err) {
      console.error('[JobsStore] Error fetching recent jobs:', err)
      return false
    }
  }

  /**
   * Fetch a single job by ID
   * @param {string} id - Job ID
   * @returns {Promise<Job|null>}
   */
  async function fetchJobById(id) {
    isLoadingJob.value = true
    error.value = null

    try {
      const response = await jobsAPI.getJobById(id)
      const result = apiUtils.unwrap(response)
      selectedJob.value = result.data || result.job || result
      return selectedJob.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch job details'
      console.error('[JobsStore] Error fetching job:', err)
      return null
    } finally {
      isLoadingJob.value = false
    }
  }

  /**
   * Fetch a single job by slug
   * @param {string} slug - Job slug
   * @returns {Promise<Job|null>}
   */
  async function fetchJobBySlug(slug) {
    isLoadingJob.value = true
    error.value = null

    try {
      const response = await jobsAPI.getJobBySlug(slug)
      const result = apiUtils.unwrap(response)
      selectedJob.value = result.data || result.job || result
      return selectedJob.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch job details'
      console.error('[JobsStore] Error fetching job:', err)
      return null
    } finally {
      isLoadingJob.value = false
    }
  }

  // ===========================================
  // Actions - Search & Filtering
  // ===========================================

  /**
   * Search jobs with query
   * @param {string} query
   * @returns {Promise<boolean>}
   */
  async function searchJobs(query) {
    searchQuery.value = query
    currentPage.value = 1
    return fetchJobs(true)
  }

  /**
   * Update a single filter
   * @param {string} key
   * @param {any} value
   */
  function setFilter(key, value) {
    if (key in filters.value) {
      filters.value[key] = value
    }
  }

  /**
   * Update multiple filters at once
   * @param {Partial<typeof filters.value>} newFilters
   */
  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Apply current filters (trigger fetch)
   * @returns {Promise<boolean>}
   */
  async function applyFilters() {
    currentPage.value = 1
    return fetchJobs(true)
  }

  /**
   * Clear all filters and search
   * @returns {Promise<boolean>}
   */
  async function clearFilters() {
    searchQuery.value = ''
    filters.value = {
      job_type: '',
      experience_level: '',
      location: '',
      salary_min: null,
      salary_max: null,
      skills: [],
      sort_by: 'createdAt',
      sort_order: 'desc'
    }
    currentPage.value = 1
    return fetchJobs(true)
  }

  /**
   * Clear only the search query
   */
  function clearSearch() {
    searchQuery.value = ''
  }

  /**
   * Add a skill to filter
   * @param {string} skill
   */
  function addSkillFilter(skill) {
    if (!filters.value.skills.includes(skill)) {
      filters.value.skills = [...filters.value.skills, skill]
    }
  }

  /**
   * Remove a skill from filter
   * @param {string} skill
   */
  function removeSkillFilter(skill) {
    filters.value.skills = filters.value.skills.filter((s) => s !== skill)
  }

  // ===========================================
  // Actions - Sorting
  // ===========================================

  /**
   * Set sort field
   * @param {'createdAt'|'salary'|'views'|'applications_count'} field
   */
  function setSortBy(field) {
    filters.value.sort_by = field
  }

  /**
   * Set sort order
   * @param {'asc'|'desc'} order
   */
  function setSortOrder(order) {
    filters.value.sort_order = order
  }

  /**
   * Toggle sort order
   */
  function toggleSortOrder() {
    filters.value.sort_order = filters.value.sort_order === 'asc' ? 'desc' : 'asc'
  }

  // ===========================================
  // Actions - Selection
  // ===========================================

  /**
   * Set selected job
   * @param {Job|null} job
   */
  function setSelectedJob(job) {
    selectedJob.value = job
  }

  /**
   * Clear selected job
   */
  function clearSelectedJob() {
    selectedJob.value = null
  }

  /**
   * Select job from list by ID
   * @param {string} id
   */
  function selectJobById(id) {
    const job = jobs.value.find((j) => j._id === id)
    if (job) {
      selectedJob.value = job
    }
  }

  // ===========================================
  // Actions - Utility
  // ===========================================

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  /**
   * Reset store to initial state
   */
  function $reset() {
    jobs.value = []
    featuredJobs.value = []
    recentJobs.value = []
    selectedJob.value = null
    isLoading.value = false
    isLoadingMore.value = false
    isLoadingJob.value = false
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalJobs.value = 0
    hasMore.value = false
    searchQuery.value = ''
    filters.value = {
      job_type: '',
      experience_level: '',
      location: '',
      salary_min: null,
      salary_max: null,
      skills: [],
      sort_by: 'createdAt',
      sort_order: 'desc'
    }
  }

  // ===========================================
  // Return Store
  // ===========================================

  return {
    // State
    jobs,
    featuredJobs,
    recentJobs,
    selectedJob,
    isLoading,
    isLoadingMore,
    isLoadingJob,
    error,

    // Pagination
    currentPage,
    totalPages,
    totalJobs,
    perPage,
    hasMore,

    // Search & Filters
    searchQuery,
    filters,

    // Getters
    hasActiveFilters,
    activeFiltersCount,
    paginationInfo,
    isEmpty,
    availableLocations,

    // Actions - Fetching
    fetchJobs,
    loadMore,
    fetchFeaturedJobs,
    fetchRecentJobs,
    fetchJobById,
    fetchJobBySlug,

    // Actions - Search & Filter
    searchJobs,
    setFilter,
    setFilters,
    applyFilters,
    clearFilters,
    clearSearch,
    addSkillFilter,
    removeSkillFilter,

    // Actions - Sorting
    setSortBy,
    setSortOrder,
    toggleSortOrder,

    // Actions - Selection
    setSelectedJob,
    clearSelectedJob,
    selectJobById,

    // Actions - Utility
    clearError,
    $reset
  }
})
