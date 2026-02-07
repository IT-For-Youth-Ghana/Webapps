<script setup>
/**
 * JobApplicationModal Component
 * Modal for submitting job applications with cover letter
 */
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { applicationsAPI, apiUtils } from '../../utils/api.js'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const authStore = useAuthStore()

// Form state
const coverLetter = ref('')
const additionalInfo = ref('')
const resumeUrl = ref('')
const useExistingResume = ref(true)

// UI state
const isSubmitting = ref(false)
const error = ref('')
const characterCount = computed(() => coverLetter.value.length)
const isValid = computed(() => {
  return coverLetter.value.length >= 50 && coverLetter.value.length <= 2000
})

// Get student's existing resume from auth store
const existingResume = computed(() => {
  return authStore.user?.student?.resume_url || authStore.user?.resume_url || null
})

// Company info
const companyName = computed(() => {
  if (typeof props.job?.company === 'object') {
    return props.job.company.company_name || props.job.company.name
  }
  return props.job?.company || 'Company'
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    coverLetter.value = ''
    additionalInfo.value = ''
    resumeUrl.value = ''
    useExistingResume.value = true
    error.value = ''
  }
})

const handleSubmit = async () => {
  if (!isValid.value) {
    error.value = 'Cover letter must be between 50 and 2000 characters'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const applicationData = {
      job_id: props.job._id,
      cover_letter: coverLetter.value.trim(),
    }

    // Add resume URL if provided or use existing
    if (useExistingResume.value && existingResume.value) {
      applicationData.resume_url = existingResume.value
    } else if (resumeUrl.value.trim()) {
      applicationData.resume_url = resumeUrl.value.trim()
    }

    // Add additional info if provided
    if (additionalInfo.value.trim()) {
      applicationData.additional_info = additionalInfo.value.trim()
    }

    const response = await applicationsAPI.submitApplication(applicationData)
    const result = apiUtils.unwrap(response)

    emit('success', result)
    handleClose()
  } catch (err) {
    console.error('Application submission error:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to submit application. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="handleClose" @keydown="handleKeydown" tabindex="-1">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <h2 class="modal-title">Apply for Position</h2>
              <p class="job-info">{{ job.title }} at {{ companyName }}</p>
            </div>
            <button @click="handleClose" class="close-btn" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- Error Message -->
            <div v-if="error" class="error-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- Cover Letter -->
            <div class="form-group">
              <label class="form-label">
                Cover Letter <span class="required">*</span>
              </label>
              <p class="form-hint">
                Tell {{ companyName }} why you're the perfect fit for this role.
                Highlight your relevant experience and what excites you about this opportunity.
              </p>
              <textarea
                v-model="coverLetter"
                class="form-textarea"
                :class="{ 'is-invalid': coverLetter.length > 0 && coverLetter.length < 50 }"
                placeholder="Dear Hiring Manager,

I am excited to apply for the position of..."
                rows="8"
                required
              ></textarea>
              <div class="character-count" :class="{ 'is-warning': characterCount < 50 || characterCount > 2000 }">
                {{ characterCount }} / 2000 characters
                <span v-if="characterCount < 50" class="count-hint">(minimum 50)</span>
              </div>
            </div>

            <!-- Resume Section -->
            <div class="form-group">
              <label class="form-label">Resume</label>

              <!-- Existing Resume Option -->
              <div v-if="existingResume" class="resume-option">
                <label class="radio-label">
                  <input type="radio" v-model="useExistingResume" :value="true" />
                  <span class="radio-custom"></span>
                  <div class="option-content">
                    <span class="option-title">Use existing resume from profile</span>
                    <span class="option-desc">Your uploaded resume will be attached</span>
                  </div>
                </label>
              </div>

              <div class="resume-option">
                <label class="radio-label">
                  <input type="radio" v-model="useExistingResume" :value="false" />
                  <span class="radio-custom"></span>
                  <div class="option-content">
                    <span class="option-title">{{ existingResume ? 'Use a different resume URL' : 'Provide resume URL' }}</span>
                    <span class="option-desc">Link to your resume (Google Drive, Dropbox, etc.)</span>
                  </div>
                </label>
              </div>

              <!-- Resume URL Input -->
              <div v-if="!useExistingResume" class="url-input-wrapper">
                <input
                  v-model="resumeUrl"
                  type="url"
                  class="form-input"
                  placeholder="https://drive.google.com/your-resume"
                />
              </div>
            </div>

            <!-- Additional Information -->
            <div class="form-group">
              <label class="form-label">Additional Information</label>
              <p class="form-hint">
                Any other details you'd like to share? (Optional)
              </p>
              <textarea
                v-model="additionalInfo"
                class="form-textarea small"
                placeholder="Available start date, salary expectations, or any other relevant information..."
                rows="3"
              ></textarea>
              <div class="character-count">
                {{ additionalInfo.length }} / 1000 characters
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" @click="handleClose" class="btn-secondary" :disabled="isSubmitting">
              Cancel
            </button>
            <button
              type="submit"
              @click="handleSubmit"
              class="btn-primary"
              :disabled="isSubmitting || !isValid"
            >
              <span v-if="isSubmitting" class="loading-spinner"></span>
              <span v-else>Submit Application</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: var(--bg-secondary, #161B22);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary, #30363d);
  background: var(--bg-tertiary, #21262D);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.job-info {
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  color: var(--text-secondary, #8fb2d6);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 8px;
  color: var(--text-secondary, #8fb2d6);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 1rem;
}

.close-btn:hover {
  background: var(--bg-elevated, #30363D);
  color: var(--text-primary, #ffffff);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 69, 58, 0.1);
  border: 1px solid rgba(255, 69, 58, 0.3);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: #FF453A;
  font-size: 0.9375rem;
}

.error-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 0.5rem;
}

.required {
  color: #FF453A;
}

.form-hint {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-muted, #6E7681);
  line-height: 1.5;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--bg-primary, #0D1117);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
  font-family: inherit;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--interactive-primary, #1b65b2);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.15);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted, #6E7681);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-textarea.small {
  min-height: 80px;
}

.form-textarea.is-invalid {
  border-color: #FF453A;
}

.character-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted, #6E7681);
}

.character-count.is-warning {
  color: #f59e0b;
}

.count-hint {
  color: #f59e0b;
}

/* Resume Options */
.resume-option {
  margin-bottom: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary, #0D1117);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label:hover {
  border-color: var(--border-hover, #484f58);
}

.radio-label input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary, #30363d);
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  margin-top: 2px;
  transition: all 0.2s;
}

.radio-label input:checked + .radio-custom {
  border-color: var(--interactive-primary, #1b65b2);
}

.radio-label input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  background: var(--interactive-primary, #1b65b2);
  border-radius: 50%;
}

.option-content {
  flex: 1;
}

.option-title {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
}

.option-desc {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-muted, #6E7681);
}

.url-input-wrapper {
  margin-top: 0.75rem;
  padding-left: 2.25rem;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-primary, #30363d);
  background: var(--bg-tertiary, #21262D);
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 140px;
}

.btn-primary {
  background: var(--interactive-primary, #1b65b2);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--interactive-primary-hover, #195aa5);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-primary, #30363d);
  color: var(--text-secondary, #8fb2d6);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-elevated, #30363D);
  color: var(--text-primary, #ffffff);
}

.btn-secondary:disabled {
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
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .modal-overlay {
    padding: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
  }
}
</style>
