<script setup>
/**
 * JobFormModal Component
 * Modal form for creating and editing job postings
 */
import { ref, computed, watch } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  job: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

// Form data
const formData = ref({
  title: '',
  description: '',
  requirements: '',
  responsibilities: '',
  location: '',
  employment_type: '',
  experience_level: '',
  salary_min: '',
  salary_max: '',
  salary_currency: 'GHS',
  skills: [],
  benefits: [],
  application_deadline: '',
  status: 'draft'
})

// Current skill/benefit input
const skillInput = ref('')
const benefitInput = ref('')

// Employment type options
const employmentTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
]

// Experience level options
const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior (1-2 years)' },
  { value: 'mid', label: 'Mid-level (3-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
  { value: 'lead', label: 'Lead / Manager' }
]

// Currency options
const currencies = ['GHS', 'USD', 'EUR', 'GBP']

// Watch for job prop changes (editing mode)
watch(
  () => props.job,
  (newJob) => {
    if (newJob) {
      formData.value = {
        title: newJob.title || '',
        description: newJob.description || '',
        requirements: newJob.requirements || '',
        responsibilities: newJob.responsibilities || '',
        location: newJob.location || '',
        employment_type: newJob.employment_type || '',
        experience_level: newJob.experience_level || '',
        salary_min: newJob.salary_min || '',
        salary_max: newJob.salary_max || '',
        salary_currency: newJob.salary_currency || 'GHS',
        skills: newJob.skills || [],
        benefits: newJob.benefits || [],
        application_deadline: newJob.application_deadline
          ? newJob.application_deadline.split('T')[0]
          : '',
        status: newJob.status || 'draft'
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Computed
const isEditing = computed(() => !!props.job?._id)
const modalTitle = computed(() => (isEditing.value ? 'Edit Job Posting' : 'Create Job Posting'))

const formattedSalary = computed(() => {
  if (!formData.value.salary_min && !formData.value.salary_max) return null
  const min = formData.value.salary_min ? Number(formData.value.salary_min).toLocaleString() : '0'
  const max = formData.value.salary_max ? Number(formData.value.salary_max).toLocaleString() : '0'
  return `${formData.value.salary_currency} ${min} - ${max}`
})

// Reset form
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    employment_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'GHS',
    skills: [],
    benefits: [],
    application_deadline: '',
    status: 'draft'
  }
  skillInput.value = ''
  benefitInput.value = ''
}

// Add skill
const addSkill = () => {
  const skill = skillInput.value.trim()
  if (skill && !formData.value.skills.includes(skill)) {
    formData.value.skills.push(skill)
    skillInput.value = ''
  }
}

// Remove skill
const removeSkill = (index) => {
  formData.value.skills.splice(index, 1)
}

// Add benefit
const addBenefit = () => {
  const benefit = benefitInput.value.trim()
  if (benefit && !formData.value.benefits.includes(benefit)) {
    formData.value.benefits.push(benefit)
    benefitInput.value = ''
  }
}

// Remove benefit
const removeBenefit = (index) => {
  formData.value.benefits.splice(index, 1)
}

// Handle close
const handleClose = () => {
  if (!props.saving) {
    emit('close')
  }
}

// Handle submit
const handleSubmit = () => {
  const payload = { ...formData.value }

  // Convert salary to numbers
  if (payload.salary_min) payload.salary_min = Number(payload.salary_min)
  if (payload.salary_max) payload.salary_max = Number(payload.salary_max)

  emit('submit', payload)
}

// Handle backdrop click
const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ modalTitle }}</h2>
            <button class="close-btn" @click="handleClose" :disabled="saving">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- Basic Info -->
            <div class="form-section">
              <h3 class="section-title">Basic Information</h3>

              <div class="form-group">
                <label class="form-label">Job Title *</label>
                <input
                  v-model="formData.title"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Senior Frontend Developer"
                  required
                  :disabled="saving"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Employment Type *</label>
                  <select
                    v-model="formData.employment_type"
                    class="form-select"
                    required
                    :disabled="saving"
                  >
                    <option value="">Select type</option>
                    <option v-for="type in employmentTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Experience Level *</label>
                  <select
                    v-model="formData.experience_level"
                    class="form-select"
                    required
                    :disabled="saving"
                  >
                    <option value="">Select level</option>
                    <option v-for="level in experienceLevels" :key="level.value" :value="level.value">
                      {{ level.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Location *</label>
                <input
                  v-model="formData.location"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Accra, Ghana or Remote"
                  required
                  :disabled="saving"
                />
              </div>
            </div>

            <!-- Salary -->
            <div class="form-section">
              <h3 class="section-title">Compensation</h3>

              <div class="salary-row">
                <div class="form-group currency-group">
                  <label class="form-label">Currency</label>
                  <select
                    v-model="formData.salary_currency"
                    class="form-select"
                    :disabled="saving"
                  >
                    <option v-for="curr in currencies" :key="curr" :value="curr">
                      {{ curr }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Min Salary</label>
                  <input
                    v-model="formData.salary_min"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                    :disabled="saving"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Max Salary</label>
                  <input
                    v-model="formData.salary_max"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                    :disabled="saving"
                  />
                </div>
              </div>

              <p v-if="formattedSalary" class="salary-preview">
                Salary Range: <strong>{{ formattedSalary }}</strong> per month
              </p>
            </div>

            <!-- Description -->
            <div class="form-section">
              <h3 class="section-title">Job Details</h3>

              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  placeholder="Describe the role, team, and what makes this opportunity exciting..."
                  rows="4"
                  required
                  :disabled="saving"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Responsibilities</label>
                <textarea
                  v-model="formData.responsibilities"
                  class="form-textarea"
                  placeholder="List the key responsibilities for this role..."
                  rows="4"
                  :disabled="saving"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Requirements</label>
                <textarea
                  v-model="formData.requirements"
                  class="form-textarea"
                  placeholder="List the required qualifications, skills, and experience..."
                  rows="4"
                  :disabled="saving"
                ></textarea>
              </div>
            </div>

            <!-- Skills -->
            <div class="form-section">
              <h3 class="section-title">Required Skills</h3>

              <div class="tag-input-group">
                <input
                  v-model="skillInput"
                  type="text"
                  class="form-input"
                  placeholder="Add a skill (e.g., JavaScript)"
                  @keydown.enter.prevent="addSkill"
                  :disabled="saving"
                />
                <button type="button" class="add-btn" @click="addSkill" :disabled="saving">
                  Add
                </button>
              </div>

              <div v-if="formData.skills.length" class="tags-list">
                <span v-for="(skill, index) in formData.skills" :key="index" class="tag">
                  {{ skill }}
                  <button type="button" @click="removeSkill(index)" :disabled="saving">×</button>
                </span>
              </div>
            </div>

            <!-- Benefits -->
            <div class="form-section">
              <h3 class="section-title">Benefits & Perks</h3>

              <div class="tag-input-group">
                <input
                  v-model="benefitInput"
                  type="text"
                  class="form-input"
                  placeholder="Add a benefit (e.g., Health insurance)"
                  @keydown.enter.prevent="addBenefit"
                  :disabled="saving"
                />
                <button type="button" class="add-btn" @click="addBenefit" :disabled="saving">
                  Add
                </button>
              </div>

              <div v-if="formData.benefits.length" class="tags-list">
                <span v-for="(benefit, index) in formData.benefits" :key="index" class="tag benefit-tag">
                  {{ benefit }}
                  <button type="button" @click="removeBenefit(index)" :disabled="saving">×</button>
                </span>
              </div>
            </div>

            <!-- Application Settings -->
            <div class="form-section">
              <h3 class="section-title">Application Settings</h3>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Application Deadline</label>
                  <input
                    v-model="formData.application_deadline"
                    type="date"
                    class="form-input"
                    :min="new Date().toISOString().split('T')[0]"
                    :disabled="saving"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select
                    v-model="formData.status"
                    class="form-select"
                    :disabled="saving"
                  >
                    <option value="draft">Draft (save for later)</option>
                    <option value="published">Published (visible to candidates)</option>
                  </select>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="cancel-btn" @click="handleClose" :disabled="saving">
              Cancel
            </button>
            <button type="button" class="submit-btn" @click="handleSubmit" :disabled="saving">
              <span v-if="saving" class="loading-spinner"></span>
              <span v-else>{{ isEditing ? 'Save Changes' : 'Create Job' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 720px;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4rem);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.MUTED');
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover:not(:disabled) {
  background: v-bind('COLORS.BACKGROUND.CARD');
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.25rem;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.salary-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
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
  min-height: 100px;
}

.salary-preview {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.salary-preview strong {
  color: v-bind('COLORS.STATUS.SUCCESS');
}

/* Tags */
.tag-input-group {
  display: flex;
  gap: 0.5rem;
}

.tag-input-group .form-input {
  flex: 1;
}

.add-btn {
  padding: 0 1rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: rgba(88, 166, 255, 0.15);
  border-radius: 6px;
  font-size: 0.8125rem;
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.benefit-tag {
  background: rgba(56, 161, 105, 0.15);
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.tag button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.7;
}

.tag button:hover:not(:disabled) {
  opacity: 1;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  flex-shrink: 0;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  border-color: v-bind('COLORS.TEXT.SECONDARY');
}

.submit-btn {
  padding: 0.75rem 1.5rem;
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

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 1rem;
  }

  .form-row,
  .salary-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
