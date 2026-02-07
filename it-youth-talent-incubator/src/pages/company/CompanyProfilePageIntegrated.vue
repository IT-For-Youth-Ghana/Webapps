<script setup>
/**
 * CompanyProfilePageIntegrated
 * Company profile management page with full editing capabilities
 */
import { ref, computed, onMounted } from 'vue'
import { useCompanyStore } from '../../stores/company.js'
import { useAuthStore } from '../../stores/auth.js'
import CompanyProfileForm from '../../components/company/CompanyProfileForm.vue'
import { COLORS } from '../../constants/colors.js'

const companyStore = useCompanyStore()
const authStore = useAuthStore()

// State
const activeSection = ref('profile')
const savingProfile = ref(false)
const savingLogo = ref(false)
const savingSocials = ref(false)

// Social links form
const socialLinks = ref({
  linkedin: '',
  twitter: '',
  facebook: '',
  instagram: '',
  website: ''
})

// Computed
const profile = computed(() => companyStore.profile)
const loading = computed(() => companyStore.loading)
const error = computed(() => companyStore.error)
const profileCompletion = computed(() => companyStore.profileCompletion)

// Section options
const sections = [
  { id: 'profile', label: 'Company Profile', icon: 'building' },
  { id: 'social', label: 'Social Links', icon: 'link' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
]

// Lifecycle
onMounted(async () => {
  await companyStore.fetchProfile()
  // Initialize social links from profile
  if (profile.value?.social_links) {
    socialLinks.value = { ...socialLinks.value, ...profile.value.social_links }
  }
})

// Handle profile submit
const handleProfileSubmit = async (data) => {
  savingProfile.value = true
  try {
    await companyStore.updateProfile(data)
  } finally {
    savingProfile.value = false
  }
}

// Handle logo upload
const handleLogoUpload = async (file) => {
  savingLogo.value = true
  try {
    await companyStore.uploadLogo(file)
  } finally {
    savingLogo.value = false
  }
}

// Handle social links submit
const handleSocialLinksSubmit = async () => {
  savingSocials.value = true
  try {
    await companyStore.updateSocialLinks(socialLinks.value)
  } finally {
    savingSocials.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">Company Profile</h1>
          <p class="page-subtitle">Manage your company information and settings</p>
        </div>
        <div class="profile-completion">
          <span class="completion-label">Profile Completion</span>
          <div class="completion-bar">
            <div class="completion-fill" :style="{ width: profileCompletion + '%' }"></div>
          </div>
          <span class="completion-value">{{ profileCompletion }}%</span>
        </div>
      </div>
    </header>

    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <button
            v-for="section in sections"
            :key="section.id"
            :class="['nav-item', { active: activeSection === section.id }]"
            @click="activeSection = section.id"
          >
            <svg v-if="section.icon === 'building'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
              <line x1="8" y1="6" x2="8" y2="6.01" />
              <line x1="16" y1="6" x2="16" y2="6.01" />
              <line x1="12" y1="6" x2="12" y2="6.01" />
              <line x1="8" y1="10" x2="8" y2="10.01" />
              <line x1="16" y1="10" x2="16" y2="10.01" />
              <line x1="12" y1="10" x2="12" y2="10.01" />
              <line x1="8" y1="14" x2="8" y2="14.01" />
              <line x1="16" y1="14" x2="16" y2="14.01" />
              <line x1="12" y1="14" x2="12" y2="14.01" />
            </svg>
            <svg v-else-if="section.icon === 'link'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <svg v-else-if="section.icon === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{{ section.label }}</span>
          </button>
        </nav>

        <!-- Company Preview Card -->
        <div class="preview-card">
          <div class="preview-logo">
            <img v-if="profile?.logo_url" :src="profile.logo_url" :alt="profile.name" />
            <div v-else class="logo-placeholder">
              {{ profile?.name?.[0] || 'C' }}
            </div>
          </div>
          <h3 class="preview-name">{{ profile?.name || 'Company Name' }}</h3>
          <p class="preview-industry">{{ profile?.industry || 'Industry' }}</p>
          <p v-if="profile?.location" class="preview-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {{ profile.location }}
          </p>
        </div>
      </aside>

      <!-- Main Section Content -->
      <main class="main-content">
        <!-- Loading State -->
        <div v-if="loading && !profile" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Loading profile...</span>
        </div>

        <!-- Profile Section -->
        <section v-else-if="activeSection === 'profile'" class="content-section">
          <h2 class="section-title">Company Information</h2>
          <p class="section-description">
            Update your company details to attract the best talent
          </p>
          <CompanyProfileForm
            :profile="profile"
            :loading="loading"
            :saving="savingProfile || savingLogo"
            @submit="handleProfileSubmit"
            @upload-logo="handleLogoUpload"
          />
        </section>

        <!-- Social Links Section -->
        <section v-else-if="activeSection === 'social'" class="content-section">
          <h2 class="section-title">Social Links</h2>
          <p class="section-description">
            Add your social media links to help candidates learn more about your company
          </p>

          <form @submit.prevent="handleSocialLinksSubmit" class="social-form">
            <div class="form-card">
              <div class="social-input-group">
                <label class="social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </label>
                <input
                  v-model="socialLinks.linkedin"
                  type="url"
                  class="form-input"
                  placeholder="https://linkedin.com/company/your-company"
                  :disabled="savingSocials"
                />
              </div>

              <div class="social-input-group">
                <label class="social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </label>
                <input
                  v-model="socialLinks.twitter"
                  type="url"
                  class="form-input"
                  placeholder="https://x.com/your-company"
                  :disabled="savingSocials"
                />
              </div>

              <div class="social-input-group">
                <label class="social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </label>
                <input
                  v-model="socialLinks.facebook"
                  type="url"
                  class="form-input"
                  placeholder="https://facebook.com/your-company"
                  :disabled="savingSocials"
                />
              </div>

              <div class="social-input-group">
                <label class="social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </label>
                <input
                  v-model="socialLinks.instagram"
                  type="url"
                  class="form-input"
                  placeholder="https://instagram.com/your-company"
                  :disabled="savingSocials"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="savingSocials">
                <span v-if="savingSocials" class="loading-spinner small"></span>
                <span v-else>Save Social Links</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Settings Section -->
        <section v-else-if="activeSection === 'settings'" class="content-section">
          <h2 class="section-title">Settings</h2>
          <p class="section-description">
            Manage your account preferences and notifications
          </p>

          <div class="settings-cards">
            <!-- Notifications -->
            <div class="settings-card">
              <div class="settings-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <h3>Notifications</h3>
              </div>
              <div class="settings-options">
                <label class="toggle-option">
                  <span>Email notifications for new applications</span>
                  <input type="checkbox" checked />
                  <span class="toggle-switch"></span>
                </label>
                <label class="toggle-option">
                  <span>Weekly summary reports</span>
                  <input type="checkbox" checked />
                  <span class="toggle-switch"></span>
                </label>
                <label class="toggle-option">
                  <span>Application status updates</span>
                  <input type="checkbox" />
                  <span class="toggle-switch"></span>
                </label>
              </div>
            </div>

            <!-- Privacy -->
            <div class="settings-card">
              <div class="settings-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <h3>Privacy</h3>
              </div>
              <div class="settings-options">
                <label class="toggle-option">
                  <span>Show company in public listings</span>
                  <input type="checkbox" checked />
                  <span class="toggle-switch"></span>
                </label>
                <label class="toggle-option">
                  <span>Allow candidates to message directly</span>
                  <input type="checkbox" checked />
                  <span class="toggle-switch"></span>
                </label>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="settings-card danger">
              <div class="settings-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <h3>Danger Zone</h3>
              </div>
              <p class="danger-text">
                Once you delete your company profile, there is no going back. Please be certain.
              </p>
              <button class="danger-btn">Delete Company Profile</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-title {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.page-subtitle {
  margin: 0;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.profile-completion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.completion-label {
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
  white-space: nowrap;
}

.completion-bar {
  width: 120px;
  height: 6px;
  background: v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 3px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: v-bind('COLORS.STATUS.SUCCESS');
  transition: width 0.3s;
}

.completion-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('COLORS.STATUS.SUCCESS');
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid v-bind('COLORS.STATUS.ERROR');
  border-radius: 10px;
  color: v-bind('COLORS.STATUS.ERROR');
  margin-bottom: 1.5rem;
}

.error-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Page Content Layout */
.page-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: v-bind('COLORS.BACKGROUND.CARD');
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.nav-item.active {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.nav-item svg {
  width: 20px;
  height: 20px;
}

/* Preview Card */
.preview-card {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.preview-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  overflow: hidden;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
}

.preview-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind('COLORS.BRAND.PRIMARY');
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.preview-name {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.preview-industry {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.preview-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0;
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.preview-location svg {
  width: 14px;
  height: 14px;
}

/* Main Content */
.main-content {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-top-color: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Content Section */
.content-section {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 16px;
  padding: 1.5rem 2rem;
}

.section-title {
  margin: 0 0 0.375rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.section-description {
  margin: 0 0 1.5rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

/* Social Links Form */
.social-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.social-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.social-label svg {
  width: 18px;
  height: 18px;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Settings Cards */
.settings-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-card {
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.25rem;
}

.settings-card.danger {
  border-color: v-bind('COLORS.STATUS.ERROR');
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.settings-header svg {
  width: 20px;
  height: 20px;
  color: v-bind('COLORS.TEXT.MUTED');
}

.settings-card.danger .settings-header svg {
  color: v-bind('COLORS.STATUS.ERROR');
}

.settings-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
}

.toggle-option span:first-of-type {
  font-size: 0.9375rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.toggle-option input {
  position: absolute;
  opacity: 0;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  transition: background 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-option input:checked + .toggle-switch {
  background: v-bind('COLORS.BRAND.PRIMARY');
}

.toggle-option input:checked + .toggle-switch::after {
  transform: translateX(20px);
}

.danger-text {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.danger-btn {
  padding: 0.625rem 1rem;
  background: transparent;
  border: 1px solid v-bind('COLORS.STATUS.ERROR');
  border-radius: 8px;
  color: v-bind('COLORS.STATUS.ERROR');
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover {
  background: v-bind('COLORS.STATUS.ERROR');
  color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .preview-card {
    display: none;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-completion {
    justify-content: space-between;
  }

  .content-section {
    padding: 1rem 1.25rem;
  }
}
</style>
