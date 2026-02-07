<!--
  Student Profile Page (Integrated)
  Manages student profile with backend integration
  Uses student store for state management
-->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStudentStore } from '../stores/student.js'
import { useAuthStore } from '../stores/auth.js'
import EducationForm from '../components/student/EducationForm.vue'
import ExperienceForm from '../components/student/ExperienceForm.vue'
import SkillsManager from '../components/student/SkillsManager.vue'
import CVUpload from '../components/student/CVUpload.vue'

const studentStore = useStudentStore()
const authStore = useAuthStore()

// UI State
const activeSection = ref(null) // 'education', 'experience', 'profile'
const editingEducationIndex = ref(null)
const editingExperienceIndex = ref(null)
const isEditingProfile = ref(false)

// Profile edit form
const profileForm = ref({
  first_name: '',
  last_name: '',
  bio: '',
  social_links: []
})

// Status options
const statusOptions = [
  { value: 'active', label: 'Active', description: 'Account active but not actively seeking' },
  { value: 'job_seeking', label: 'Job Seeking', description: 'Actively looking for opportunities' },
  { value: 'inactive', label: 'Inactive', description: 'Not available' }
]

// Computed
const isLoading = computed(() => studentStore.isLoading)
const isSaving = computed(() => studentStore.isSaving)
const profile = computed(() => studentStore.profile)
const fullName = computed(() => studentStore.fullName)
const profileCompletion = computed(() => studentStore.profileCompletion)

// Initialize
onMounted(async () => {
  if (!studentStore.isProfileLoaded) {
    await studentStore.fetchProfile()
  }
})

// Watch for profile changes to update form
watch(() => studentStore.profile, (newProfile) => {
  if (newProfile) {
    profileForm.value = {
      first_name: newProfile.first_name || '',
      last_name: newProfile.last_name || '',
      bio: newProfile.bio || '',
      social_links: [...(newProfile.social_links || [])]
    }
  }
}, { immediate: true })

// Profile Actions
const startEditingProfile = () => {
  isEditingProfile.value = true
}

const cancelEditingProfile = () => {
  isEditingProfile.value = false
  // Reset form to current profile data
  if (profile.value) {
    profileForm.value = {
      first_name: profile.value.first_name || '',
      last_name: profile.value.last_name || '',
      bio: profile.value.bio || '',
      social_links: [...(profile.value.social_links || [])]
    }
  }
}

const saveProfile = async () => {
  const result = await studentStore.updateProfile(profileForm.value)
  if (result.success) {
    isEditingProfile.value = false
  }
}

// Education Actions
const startAddEducation = () => {
  editingEducationIndex.value = null
  activeSection.value = 'education'
}

const startEditEducation = (index) => {
  editingEducationIndex.value = index
  activeSection.value = 'education'
}

const handleSaveEducation = async (educationData) => {
  let result
  if (editingEducationIndex.value !== null) {
    result = await studentStore.updateEducation(editingEducationIndex.value, educationData)
  } else {
    result = await studentStore.addEducation(educationData)
  }
  
  if (result.success) {
    activeSection.value = null
    editingEducationIndex.value = null
  }
}

const handleDeleteEducation = async () => {
  if (editingEducationIndex.value !== null) {
    const result = await studentStore.deleteEducation(editingEducationIndex.value)
    if (result.success) {
      activeSection.value = null
      editingEducationIndex.value = null
    }
  }
}

const handleCancelEducation = () => {
  activeSection.value = null
  editingEducationIndex.value = null
}

// Experience Actions
const startAddExperience = () => {
  editingExperienceIndex.value = null
  activeSection.value = 'experience'
}

const startEditExperience = (index) => {
  editingExperienceIndex.value = index
  activeSection.value = 'experience'
}

const handleSaveExperience = async (experienceData) => {
  let result
  if (editingExperienceIndex.value !== null) {
    result = await studentStore.updateExperience(editingExperienceIndex.value, experienceData)
  } else {
    result = await studentStore.addExperience(experienceData)
  }
  
  if (result.success) {
    activeSection.value = null
    editingExperienceIndex.value = null
  }
}

const handleDeleteExperience = async () => {
  if (editingExperienceIndex.value !== null) {
    const result = await studentStore.deleteExperience(editingExperienceIndex.value)
    if (result.success) {
      activeSection.value = null
      editingExperienceIndex.value = null
    }
  }
}

const handleCancelExperience = () => {
  activeSection.value = null
  editingExperienceIndex.value = null
}

// Status Actions
const handleStatusChange = async (newStatus) => {
  await studentStore.updateStatus(newStatus)
}

// Social Links Actions
const addSocialLink = () => {
  profileForm.value.social_links.push({ name: '', url: '' })
}

const removeSocialLink = (index) => {
  profileForm.value.social_links.splice(index, 1)
}

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return 'Present'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`
}
</script>

<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="isLoading && !profile" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="studentStore.error && !profile" class="error-container">
      <p class="error-message">{{ studentStore.error }}</p>
      <button @click="studentStore.fetchProfile" class="btn-primary">
        Try Again
      </button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="profile-content">
      <!-- Success/Error Messages -->
      <Transition name="fade">
        <div v-if="studentStore.successMessage" class="alert alert-success">
          {{ studentStore.successMessage }}
          <button @click="studentStore.clearMessages" class="alert-close">×</button>
        </div>
      </Transition>
      
      <Transition name="fade">
        <div v-if="studentStore.error" class="alert alert-error">
          {{ studentStore.error }}
          <button @click="studentStore.clearMessages" class="alert-close">×</button>
        </div>
      </Transition>

      <!-- Profile Header -->
      <section class="profile-header card">
        <div class="header-grid">
          <!-- Avatar -->
          <div class="avatar-section">
            <div class="avatar-container">
              <div class="avatar-placeholder">
                {{ getInitials(profile.first_name, profile.last_name) }}
              </div>
            </div>
            
            <!-- Profile Completion -->
            <div class="completion-badge">
              <div 
                class="completion-ring" 
                :style="{ '--percentage': profileCompletion + '%' }"
              >
                <span class="completion-value">{{ profileCompletion }}%</span>
              </div>
              <span class="completion-label">Complete</span>
            </div>
          </div>

          <!-- Profile Info -->
          <div class="info-section">
            <template v-if="!isEditingProfile">
              <h1 class="profile-name">{{ fullName || 'Complete Your Profile' }}</h1>
              <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
              <p v-else class="profile-bio placeholder">Add a bio to tell companies about yourself</p>
              
              <!-- Status Badge -->
              <div class="status-section">
                <label for="status-select" class="status-label">Status:</label>
                <select 
                  id="status-select"
                  :value="profile.status"
                  @change="handleStatusChange($event.target.value)"
                  class="status-select"
                  :disabled="isSaving"
                >
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Social Links -->
              <div v-if="profile.social_links?.length" class="social-links">
                <a 
                  v-for="link in profile.social_links" 
                  :key="link.name"
                  :href="link.url"
                  target="_blank"
                  class="social-link"
                >
                  {{ link.name }}
                </a>
              </div>

              <button @click="startEditingProfile" class="btn-secondary">
                Edit Profile
              </button>
            </template>

            <!-- Edit Mode -->
            <template v-else>
              <div class="edit-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input 
                      v-model="profileForm.first_name" 
                      type="text" 
                      class="form-input"
                      placeholder="First name"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input 
                      v-model="profileForm.last_name" 
                      type="text" 
                      class="form-input"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Bio</label>
                  <textarea 
                    v-model="profileForm.bio" 
                    class="form-textarea"
                    rows="4"
                    placeholder="Tell companies about yourself..."
                  ></textarea>
                </div>

                <!-- Social Links Edit -->
                <div class="form-group">
                  <label class="form-label">Social Links</label>
                  <div 
                    v-for="(link, index) in profileForm.social_links" 
                    :key="index"
                    class="social-link-row"
                  >
                    <input 
                      v-model="link.name" 
                      type="text" 
                      class="form-input"
                      placeholder="Platform (e.g., LinkedIn)"
                    />
                    <input 
                      v-model="link.url" 
                      type="url" 
                      class="form-input"
                      placeholder="URL"
                    />
                    <button 
                      @click="removeSocialLink(index)" 
                      class="btn-icon danger"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <button 
                    @click="addSocialLink" 
                    class="btn-text"
                    type="button"
                  >
                    + Add Link
                  </button>
                </div>

                <div class="form-actions">
                  <button 
                    @click="cancelEditingProfile" 
                    class="btn-secondary"
                    :disabled="isSaving"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="saveProfile" 
                    class="btn-primary"
                    :disabled="isSaving"
                  >
                    <span v-if="isSaving" class="loading-spinner small"></span>
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Two Column Layout -->
      <div class="two-column-layout">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Skills Section -->
          <section class="section-card card">
            <SkillsManager 
              :skills="studentStore.skillsList"
              :editable="true"
            />
          </section>

          <!-- CV Section -->
          <section class="section-card card">
            <CVUpload :cv-url="profile.cv_url" />
          </section>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Education Section -->
          <section class="section-card card">
            <div class="section-header">
              <h3 class="section-title">Education</h3>
              <button 
                v-if="activeSection !== 'education'"
                @click="startAddEducation" 
                class="btn-secondary small"
              >
                + Add
              </button>
            </div>

            <!-- Education Form -->
            <div v-if="activeSection === 'education'" class="section-form">
              <EducationForm 
                :education="editingEducationIndex !== null ? studentStore.educationList[editingEducationIndex] : null"
                :is-edit="editingEducationIndex !== null"
                :is-saving="isSaving"
                @save="handleSaveEducation"
                @cancel="handleCancelEducation"
                @delete="handleDeleteEducation"
              />
            </div>

            <!-- Education List -->
            <div v-else class="education-list">
              <div 
                v-for="(edu, index) in studentStore.educationList" 
                :key="index"
                class="education-item"
                @click="startEditEducation(index)"
              >
                <div class="edu-main">
                  <h4 class="edu-school">{{ edu.school }}</h4>
                  <p class="edu-qualification">{{ edu.qualification }} in {{ edu.field_of_study }}</p>
                </div>
                <div class="edu-dates">
                  {{ formatDate(edu.start_date) }} - {{ edu.is_current ? 'Present' : formatDate(edu.end_date) }}
                </div>
              </div>

              <p v-if="studentStore.educationList.length === 0" class="empty-state">
                No education added yet. Click "+ Add" to add your education.
              </p>
            </div>
          </section>

          <!-- Experience Section -->
          <section class="section-card card">
            <div class="section-header">
              <h3 class="section-title">Experience</h3>
              <button 
                v-if="activeSection !== 'experience'"
                @click="startAddExperience" 
                class="btn-secondary small"
              >
                + Add
              </button>
            </div>

            <!-- Experience Form -->
            <div v-if="activeSection === 'experience'" class="section-form">
              <ExperienceForm 
                :experience="editingExperienceIndex !== null ? studentStore.experienceList[editingExperienceIndex] : null"
                :is-edit="editingExperienceIndex !== null"
                :is-saving="isSaving"
                @save="handleSaveExperience"
                @cancel="handleCancelExperience"
                @delete="handleDeleteExperience"
              />
            </div>

            <!-- Experience List -->
            <div v-else class="experience-list">
              <div 
                v-for="(exp, index) in studentStore.experienceList" 
                :key="index"
                class="experience-item"
                @click="startEditExperience(index)"
              >
                <div class="exp-main">
                  <h4 class="exp-title">{{ exp.title }}</h4>
                  <p class="exp-company">{{ exp.company }} · {{ exp.location }}</p>
                  <p v-if="exp.description" class="exp-description">{{ exp.description }}</p>
                </div>
                <div class="exp-dates">
                  {{ formatDate(exp.start_date) }} - {{ exp.is_current ? 'Present' : formatDate(exp.end_date) }}
                </div>
              </div>

              <p v-if="studentStore.experienceList.length === 0" class="empty-state">
                No experience added yet. Click "+ Add" to add your work experience.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border-color, #e2e8f0);
  border-top-color: var(--color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-muted, #94a3b8);
}

.error-message {
  color: var(--color-danger, #ef4444);
}

/* Alerts */
.alert {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success, #22c55e);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger, #ef4444);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.7;
  color: inherit;
}

.alert-close:hover {
  opacity: 1;
}

/* Profile Header */
.profile-header {
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.header-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .header-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .avatar-section {
    justify-content: center;
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  width: 8rem;
  height: 8rem;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary, #3b82f6), var(--color-secondary, #8b5cf6));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.completion-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.completion-ring {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary, #3b82f6) 0% var(--percentage),
    var(--border-color, #e2e8f0) var(--percentage) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.completion-ring::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--card-background, white);
}

.completion-value {
  position: relative;
  z-index: 1;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.completion-label {
  font-size: 0.6875rem;
  color: var(--text-muted, #94a3b8);
}

/* Profile Info */
.info-section {
  flex: 1;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.profile-bio {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.profile-bio.placeholder {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
}

/* Status */
.status-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.status-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--card-background, white);
  cursor: pointer;
}

.status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Social Links */
.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.social-link {
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 6px;
  color: var(--color-primary, #3b82f6);
  font-size: 0.875rem;
  text-decoration: none;
  transition: background 0.2s;
}

.social-link:hover {
  background: var(--color-primary-light, #eff6ff);
}

/* Edit Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input,
.form-textarea {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.social-link-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.social-link-row .form-input {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark, #2563eb);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color, #e2e8f0);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover, #f8fafc);
}

.btn-secondary.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary, #3b82f6);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0;
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-icon.danger {
  color: var(--color-danger, #ef4444);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section Cards */
.section-card {
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-form {
  margin-top: 0.5rem;
}

/* Education & Experience Items */
.education-list,
.experience-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.education-item,
.experience-item {
  padding: 1rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.education-item:hover,
.experience-item:hover {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.edu-main,
.exp-main {
  flex: 1;
}

.edu-school,
.exp-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.edu-qualification,
.exp-company {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.exp-description {
  font-size: 0.8125rem;
  color: var(--text-muted, #94a3b8);
  margin: 0.5rem 0 0 0;
  line-height: 1.5;
}

.edu-dates,
.exp-dates {
  font-size: 0.8125rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.5rem;
}

.empty-state {
  color: var(--text-muted, #94a3b8);
  font-size: 0.875rem;
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

/* Card */
.card {
  background: var(--card-background, white);
  border-radius: 12px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
