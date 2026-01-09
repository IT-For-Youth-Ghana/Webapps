<script setup>
/**
 * CompanyProfileForm Component
 * Form for editing company profile information
 */
import { ref, computed, watch } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  profile: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'upload-logo'])

// Industry options
const industryOptions = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail & E-commerce',
  'Agriculture',
  'Construction',
  'Telecommunications',
  'Media & Entertainment',
  'Hospitality & Tourism',
  'Energy & Utilities',
  'Transportation & Logistics',
  'Professional Services',
  'Non-profit',
  'Government',
  'Other'
]

// Form data
const formData = ref({
  name: '',
  description: '',
  industry: '',
  website: '',
  location: '',
  company_size: '',
  founded_year: ''
})

// Logo file
const logoFile = ref(null)
const logoPreview = ref(null)

// Company size options
const companySizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
]

// Watch profile changes
watch(
  () => props.profile,
  (newProfile) => {
    if (newProfile) {
      formData.value = {
        name: newProfile.name || '',
        description: newProfile.description || '',
        industry: newProfile.industry || '',
        website: newProfile.website || '',
        location: newProfile.location || '',
        company_size: newProfile.company_size || '',
        founded_year: newProfile.founded_year || ''
      }
      logoPreview.value = newProfile.logo_url || null
    }
  },
  { immediate: true }
)

// Computed
const currentLogoUrl = computed(() => {
  return logoPreview.value || props.profile?.logo_url
})

const hasChanges = computed(() => {
  if (!props.profile) return false
  return (
    formData.value.name !== (props.profile.name || '') ||
    formData.value.description !== (props.profile.description || '') ||
    formData.value.industry !== (props.profile.industry || '') ||
    formData.value.website !== (props.profile.website || '') ||
    formData.value.location !== (props.profile.location || '') ||
    formData.value.company_size !== (props.profile.company_size || '') ||
    formData.value.founded_year !== (props.profile.founded_year || '') ||
    logoFile.value !== null
  )
})

// Handle logo selection
const handleLogoSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB')
    return
  }

  logoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Remove logo preview
const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = props.profile?.logo_url || null
}

// Submit form
const handleSubmit = async () => {
  // Upload logo first if changed
  if (logoFile.value) {
    emit('upload-logo', logoFile.value)
  }

  // Submit profile data
  emit('submit', { ...formData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="profile-form">
    <!-- Logo Section -->
    <div class="form-section">
      <h3 class="section-title">Company Logo</h3>
      <div class="logo-section">
        <div class="logo-preview">
          <img v-if="currentLogoUrl" :src="currentLogoUrl" alt="Company logo" />
          <div v-else class="logo-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        </div>
        <div class="logo-actions">
          <label class="upload-btn">
            <input
              type="file"
              accept="image/*"
              @change="handleLogoSelect"
              :disabled="saving"
              hidden
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Logo
          </label>
          <button
            v-if="logoFile"
            type="button"
            @click="removeLogo"
            class="remove-btn"
          >
            Remove
          </button>
          <p class="logo-hint">Recommended: 200x200px, PNG or JPG, max 5MB</p>
        </div>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="form-section">
      <h3 class="section-title">Basic Information</h3>

      <div class="form-group">
        <label for="name" class="form-label">Company Name *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="form-input"
          placeholder="Enter company name"
          required
          :disabled="saving"
        />
      </div>

      <div class="form-group">
        <label for="industry" class="form-label">Industry *</label>
        <select
          id="industry"
          v-model="formData.industry"
          class="form-select"
          required
          :disabled="saving"
        >
          <option value="">Select industry</option>
          <option v-for="industry in industryOptions" :key="industry" :value="industry">
            {{ industry }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="location" class="form-label">Location</label>
          <input
            id="location"
            v-model="formData.location"
            type="text"
            class="form-input"
            placeholder="e.g., Accra, Ghana"
            :disabled="saving"
          />
        </div>

        <div class="form-group">
          <label for="website" class="form-label">Website</label>
          <input
            id="website"
            v-model="formData.website"
            type="url"
            class="form-input"
            placeholder="https://example.com"
            :disabled="saving"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="company_size" class="form-label">Company Size</label>
          <select
            id="company_size"
            v-model="formData.company_size"
            class="form-select"
            :disabled="saving"
          >
            <option value="">Select size</option>
            <option v-for="size in companySizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="founded_year" class="form-label">Founded Year</label>
          <input
            id="founded_year"
            v-model="formData.founded_year"
            type="number"
            class="form-input"
            placeholder="e.g., 2020"
            min="1900"
            :max="new Date().getFullYear()"
            :disabled="saving"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Company Description *</label>
        <textarea
          id="description"
          v-model="formData.description"
          class="form-textarea"
          placeholder="Tell us about your company, mission, and culture..."
          rows="5"
          required
          :disabled="saving"
        ></textarea>
        <span class="char-count">{{ formData.description.length }} / 2000 characters</span>
      </div>
    </div>

    <!-- Submit -->
    <div class="form-actions">
      <button
        type="submit"
        class="submit-btn"
        :disabled="saving || loading || !hasChanges"
      >
        <span v-if="saving" class="loading-spinner"></span>
        <span v-else>Save Changes</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  margin: 0 0 1.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.logo-preview {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 2px dashed v-bind('COLORS.BACKGROUND.BORDER');
  flex-shrink: 0;
}

.logo-preview img {
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
  color: v-bind('COLORS.TEXT.MUTED');
}

.logo-placeholder svg {
  width: 40px;
  height: 40px;
}

.logo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.upload-btn svg {
  width: 16px;
  height: 16px;
}

.remove-btn {
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid v-bind('COLORS.STATUS.ERROR');
  border-radius: 6px;
  color: v-bind('COLORS.STATUS.ERROR');
  font-size: 0.8125rem;
  cursor: pointer;
  width: fit-content;
}

.logo-hint {
  margin: 0;
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

/* Form Groups */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.MUTED');
  text-align: right;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .logo-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
