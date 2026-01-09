/**
 * Student Store
 * Manages student profile state, education, experience, skills, and CV
 *
 * @typedef {import('../types/api.types.js').Student} Student
 * @typedef {import('../types/api.types.js').Education} Education
 * @typedef {import('../types/api.types.js').WorkExperience} WorkExperience
 * @typedef {import('../types/api.types.js').SocialLink} SocialLink
 * @typedef {import('../types/api.types.js').StudentStatus} StudentStatus
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { studentAPI, apiUtils } from '../utils/api.js'
import { useAuthStore } from './auth.js'

export const useStudentStore = defineStore('student', () => {
  // ===========================================
  // State
  // ===========================================

  /** @type {import('vue').Ref<Student|null>} */
  const profile = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const isSaving = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null)

  /** @type {import('vue').Ref<string|null>} */
  const successMessage = ref(null)

  /** @type {import('vue').Ref<boolean>} */
  const isProfileLoaded = ref(false)

  // ===========================================
  // Getters
  // ===========================================

  const fullName = computed(() => {
    if (!profile.value) return ''
    return `${profile.value.first_name} ${profile.value.last_name}`.trim()
  })

  const hasCV = computed(() => !!profile.value?.cv_url)

  const skillsList = computed(() => profile.value?.skills || [])

  const educationList = computed(() => profile.value?.education || [])

  const experienceList = computed(() => profile.value?.work_experience || [])

  const socialLinks = computed(() => profile.value?.social_links || [])

  const status = computed(() => profile.value?.status || 'active')

  const isJobSeeking = computed(() => profile.value?.status === 'job_seeking')

  /**
   * Calculate profile completion percentage
   */
  const profileCompletion = computed(() => {
    if (!profile.value) return 0

    let completed = 0
    const total = 7

    // Basic info (first name, last name)
    if (profile.value.first_name && profile.value.last_name) completed++

    // Bio
    if (profile.value.bio && profile.value.bio.length > 20) completed++

    // At least one education entry
    if (profile.value.education?.length > 0) completed++

    // At least one experience entry
    if (profile.value.work_experience?.length > 0) completed++

    // At least 3 skills
    if (profile.value.skills?.length >= 3) completed++

    // CV uploaded
    if (profile.value.cv_url) completed++

    // Social links (at least one)
    if (profile.value.social_links?.length > 0) completed++

    return Math.round((completed / total) * 100)
  })

  // ===========================================
  // Actions
  // ===========================================

  /**
   * Clear messages
   */
  function clearMessages() {
    error.value = null
    successMessage.value = null
  }

  /**
   * Fetch student profile from API
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function fetchProfile() {
    isLoading.value = true
    error.value = null

    try {
      const response = await studentAPI.getProfile()

      if (response.data?.success) {
        profile.value = response.data.data
        isProfileLoaded.value = true

        // Also update auth store profile
        const authStore = useAuthStore()
        authStore.profile = response.data.data

        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to fetch profile')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch profile'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update student profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function updateProfile(profileData) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.updateProfile(profileData)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Profile updated successfully'

        // Update auth store profile
        const authStore = useAuthStore()
        authStore.profile = response.data.data

        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to update profile')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Education Actions
  // ===========================================

  /**
   * Add education entry
   * @param {Education} education
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function addEducation(education) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.addEducation(education)

      if (response.data?.success) {
        // Update local state with the returned profile
        profile.value = response.data.data
        successMessage.value = 'Education added successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to add education')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add education'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update education entry
   * @param {number} index - Index of education entry to update
   * @param {Education} education
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function updateEducation(index, education) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.updateEducation(index, education)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Education updated successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to update education')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update education'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete education entry
   * @param {number} index - Index of education entry to delete
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function deleteEducation(index) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.deleteEducation(index)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Education deleted successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to delete education')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete education'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Experience Actions
  // ===========================================

  /**
   * Add work experience entry
   * @param {WorkExperience} experience
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function addExperience(experience) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.addExperience(experience)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Experience added successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to add experience')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add experience'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update work experience entry
   * @param {number} index - Index of experience entry to update
   * @param {WorkExperience} experience
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function updateExperience(index, experience) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.updateExperience(index, experience)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Experience updated successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to update experience')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update experience'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete work experience entry
   * @param {number} index - Index of experience entry to delete
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function deleteExperience(index) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.deleteExperience(index)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Experience deleted successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to delete experience')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete experience'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Skills Actions
  // ===========================================

  /**
   * Update skills list
   * @param {string[]} skills
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function updateSkills(skills) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.updateSkills(skills)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Skills updated successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to update skills')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update skills'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Add a single skill
   * @param {string} skill
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function addSkill(skill) {
    const currentSkills = profile.value?.skills || []
    if (currentSkills.includes(skill)) {
      error.value = 'Skill already exists'
      return { success: false, message: 'Skill already exists' }
    }
    return updateSkills([...currentSkills, skill])
  }

  /**
   * Remove a single skill
   * @param {string} skill
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function removeSkill(skill) {
    const currentSkills = profile.value?.skills || []
    return updateSkills(currentSkills.filter(s => s !== skill))
  }

  // ===========================================
  // CV Actions
  // ===========================================

  /**
   * Upload CV/Resume
   * @param {File} file
   * @returns {Promise<{success: boolean, message?: string, url?: string}>}
   */
  async function uploadCV(file) {
    isSaving.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('cv', file)

      const response = await studentAPI.uploadCV(formData)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'CV uploaded successfully'
        return { success: true, url: response.data.data.cv_url }
      }

      throw new Error(response.data?.message || 'Failed to upload CV')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to upload CV'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete CV/Resume
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function deleteCV() {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.deleteCV()

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'CV deleted successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to delete CV')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete CV'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Status Actions
  // ===========================================

  /**
   * Update student status
   * @param {StudentStatus} newStatus
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async function updateStatus(newStatus) {
    isSaving.value = true
    error.value = null

    try {
      const response = await studentAPI.updateStatus(newStatus)

      if (response.data?.success) {
        profile.value = response.data.data
        successMessage.value = 'Status updated successfully'
        return { success: true }
      }

      throw new Error(response.data?.message || 'Failed to update status')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update status'
      error.value = message
      return { success: false, message }
    } finally {
      isSaving.value = false
    }
  }

  // ===========================================
  // Public Directory Actions
  // ===========================================

  /**
   * List students in public directory
   * @param {Object} params - Query params (page, limit, search, etc.)
   * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
   */
  async function listStudents(params = {}) {
    isLoading.value = true
    error.value = null

    try {
      const response = await studentAPI.listStudents(params)

      if (response.data?.success) {
        return { success: true, data: response.data.data }
      }

      throw new Error(response.data?.message || 'Failed to fetch students')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch students'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get job-seeking students
   * @param {Object} params - Query params
   * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
   */
  async function getJobSeekingStudents(params = {}) {
    isLoading.value = true
    error.value = null

    try {
      const response = await studentAPI.getJobSeekingStudents(params)

      if (response.data?.success) {
        return { success: true, data: response.data.data }
      }

      throw new Error(response.data?.message || 'Failed to fetch job-seeking students')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch job-seeking students'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get student by ID
   * @param {string} id
   * @returns {Promise<{success: boolean, data?: Student, message?: string}>}
   */
  async function getStudentById(id) {
    isLoading.value = true
    error.value = null

    try {
      const response = await studentAPI.getStudentById(id)

      if (response.data?.success) {
        return { success: true, data: response.data.data }
      }

      throw new Error(response.data?.message || 'Failed to fetch student')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch student'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset store state (on logout)
   */
  function $reset() {
    profile.value = null
    isLoading.value = false
    isSaving.value = false
    error.value = null
    successMessage.value = null
    isProfileLoaded.value = false
  }

  return {
    // State
    profile,
    isLoading,
    isSaving,
    error,
    successMessage,
    isProfileLoaded,

    // Getters
    fullName,
    hasCV,
    skillsList,
    educationList,
    experienceList,
    socialLinks,
    status,
    isJobSeeking,
    profileCompletion,

    // Actions
    clearMessages,
    fetchProfile,
    updateProfile,

    // Education
    addEducation,
    updateEducation,
    deleteEducation,

    // Experience
    addExperience,
    updateExperience,
    deleteExperience,

    // Skills
    updateSkills,
    addSkill,
    removeSkill,

    // CV
    uploadCV,
    deleteCV,

    // Status
    updateStatus,

    // Public directory
    listStudents,
    getJobSeekingStudents,
    getStudentById,

    // Reset
    $reset
  }
})
