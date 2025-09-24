<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  job: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close'])

const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 3

const formData = ref({
  title: '',
  company: '',
  location: '',
  type: 'Full-time',
  salary: '',
  deadline: '',
  status: 'draft',
  description: '',
  requirements: [''],
  responsibilities: [''],
  benefits: ['']
})

const locationOptions = ['Accra', 'Kumasi', 'Tamale', 'Cape Coast', 'Ho', 'Remote']
const typeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote']
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' }
]

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.title && formData.value.company && formData.value.location
    case 2:
      return formData.value.description.length >= 50 && 
             formData.value.requirements.some(req => req.trim().length > 0)
    case 3:
      return formData.value.deadline && formData.value.salary
    default:
      return true
  }
})

const addListItem = (listName) => {
  formData.value[listName].push('')
}

const removeListItem = (listName, index) => {
  if (formData.value[listName].length > 1) {
    formData.value[listName].splice(index, 1)
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const submitData = {
      ...formData.value,
      requirements: formData.value.requirements.filter(req => req.trim().length > 0),
      responsibilities: formData.value.responsibilities.filter(resp => resp.trim().length > 0),
      benefits: formData.value.benefits.filter(benefit => benefit.trim().length > 0),
      updatedAt: new Date().toISOString()
    }
    
    emit('submit', submitData)
  } catch (error) {
    console.error('Error submitting job:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
}

watch(() => props.job, (newJob) => {
  if (newJob) {
    formData.value = {
      ...newJob,
      requirements: [...newJob.requirements] || [''],
      responsibilities: [...newJob.responsibilities] || [''],
      benefits: [...newJob.benefits] || ['']
    }
  } else {
    formData.value = {
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      deadline: '',
      status: 'draft',
      description: '',
      requirements: [''],
      responsibilities: [''],
      benefits: ['']
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <h2 class="modal-title">
            {{ job ? 'Edit Job Posting' : 'Create New Job Posting' }}
          </h2>
          <p class="modal-subtitle">
            {{ job ? 'Update job details and requirements' : 'Fill in the details for the new job posting' }}
          </p>
        </div>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <div class="progress-bar">
        <div class="progress-steps">
          <div
            v-for="step in totalSteps"
            :key="step"
            :class="[
              'progress-step',
              { 'active': step === currentStep, 'completed': step < currentStep }
            ]"
          >
            <span class="step-number">{{ step }}</span>
            <span class="step-label">
              {{ step === 1 ? 'Basic Info' : step === 2 ? 'Description' : 'Details' }}
            </span>
          </div>
        </div>
        <div class="progress-line">
          <div 
            class="progress-fill" 
            :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="modal-body">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 1" class="step-content">
          <h3 class="step-title">Basic Information</h3>
          <p class="step-description">Enter the basic details for this job posting.</p>
          
          <div class="form-row">
            <div class="form-group">
              <label for="title" class="form-label">Job Title *</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="e.g., Frontend Developer"
                required
              >
            </div>

            <div class="form-group">
              <label for="company" class="form-label">Company *</label>
              <input
                id="company"
                v-model="formData.company"
                type="text"
                class="form-input"
                placeholder="e.g., TechCorp Ghana"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="location" class="form-label">Location *</label>
              <select
                id="location"
                v-model="formData.location"
                class="form-select"
                required
              >
                <option value="">Select Location</option>
                <option v-for="location in locationOptions" :key="location" :value="location">
                  {{ location }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="type" class="form-label">Job Type *</label>
              <select
                id="type"
                v-model="formData.type"
                class="form-select"
                required
              >
                <option v-for="type in typeOptions" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="salary" class="form-label">Salary Range</label>
            <input
              id="salary"
              v-model="formData.salary"
              type="text"
              class="form-input"
              placeholder="e.g., GHS 5,000 - 8,000"
            >
          </div>
        </div>

        <!-- Step 2: Description & Requirements -->
        <div v-if="currentStep === 2" class="step-content">
          <h3 class="step-title">Job Description & Requirements</h3>
          <p class="step-description">Provide detailed information about the role.</p>
          
          <div class="form-group">
            <label for="description" class="form-label">Job Description *</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              rows="4"
              placeholder="Describe the role, what the candidate will be doing, and what makes this opportunity exciting..."
              required
            ></textarea>
            <div class="char-counter">
              {{ formData.description.length }} characters
              <span v-if="formData.description.length < 50" class="min-requirement">
                (minimum 50 characters)
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Requirements *</label>
            <div class="list-inputs">
              <div
                v-for="(requirement, index) in formData.requirements"
                :key="index"
                class="list-item"
              >
                <input
                  v-model="formData.requirements[index]"
                  type="text"
                  class="form-input"
                  placeholder="e.g., React, JavaScript, 2+ years experience"
                >
                <button
                  v-if="formData.requirements.length > 1"
                  @click="removeListItem('requirements', index)"
                  class="remove-btn"
                  type="button"
                >
                  Remove
                </button>
              </div>
              <button
                @click="addListItem('requirements')"
                class="add-btn"
                type="button"
              >
                Add Requirement
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Key Responsibilities</label>
            <div class="list-inputs">
              <div
                v-for="(responsibility, index) in formData.responsibilities"
                :key="index"
                class="list-item"
              >
                <input
                  v-model="formData.responsibilities[index]"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Develop user-facing features"
                >
                <button
                  v-if="formData.responsibilities.length > 1"
                  @click="removeListItem('responsibilities', index)"
                  class="remove-btn"
                  type="button"
                >
                  Remove
                </button>
              </div>
              <button
                @click="addListItem('responsibilities')"
                class="add-btn"
                type="button"
              >
                Add Responsibility
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Additional Details -->
        <div v-if="currentStep === 3" class="step-content">
          <h3 class="step-title">Additional Details</h3>
          <p class="step-description">Set the deadline, benefits, and publication status.</p>
          
          <div class="form-row">
            <div class="form-group">
              <label for="deadline" class="form-label">Application Deadline *</label>
              <input
                id="deadline"
                v-model="formData.deadline"
                type="date"
                class="form-input"
                :min="new Date().toISOString().split('T')[0]"
                required
              >
            </div>

            <div class="form-group">
              <label for="status" class="form-label">Status</label>
              <select
                id="status"
                v-model="formData.status"
                class="form-select"
              >
                <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Benefits & Perks</label>
            <div class="list-inputs">
              <div
                v-for="(benefit, index) in formData.benefits"
                :key="index"
                class="list-item"
              >
                <input
                  v-model="formData.benefits[index]"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Health Insurance, Flexible Hours"
                >
                <button
                  v-if="formData.benefits.length > 1"
                  @click="removeListItem('benefits', index)"
                  class="remove-btn"
                  type="button"
                >
                  Remove
                </button>
              </div>
              <button
                @click="addListItem('benefits')"
                class="add-btn"
                type="button"
              >
                Add Benefit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="btn-secondary"
          >
            Previous
          </button>
          
          <div class="main-actions">
            <button @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            
            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              :disabled="!canProceedToNext"
              class="btn-primary"
            >
              Next Step
            </button>
            
            <button
              v-else
              @click="submitForm"
              :disabled="!canProceedToNext || isSubmitting"
              class="btn-primary"
            >
              <span v-if="isSubmitting" class="loading-spinner"></span>
              {{ isSubmitting ? 'Saving...' : (job ? 'Update Job' : 'Create Job') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #30363D;
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #8B949E;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 150ms ease;
}

.close-btn:hover {
  color: #F0F6FC;
}

.progress-bar {
  padding: 1.5rem;
  border-bottom: 1px solid #30363D;
  position: relative;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #30363D;
  color: #8B949E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 250ms ease;
}

.progress-step.active .step-number {
  background: #007AFF;
  color: white;
}

.progress-step.completed .step-number {
  background: #32D74B;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #8B949E;
  text-align: center;
  font-weight: 500;
}

.progress-step.active .step-label {
  color: #F0F6FC;
}

.progress-line {
  position: absolute;
  top: 2.25rem;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: #30363D;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: #007AFF;
  transition: width 500ms ease;
}

.modal-body {
  padding: 1.5rem;
  min-height: 24rem;
}

.step-content {
  animation: fadeIn 300ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.5rem 0;
}

.step-description {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  transition: all 250ms ease;
  resize: vertical;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  background: #161B22;
}

.form-textarea {
  min-height: 6rem;
  font-family: inherit;
}

.char-counter {
  font-size: 0.75rem;
  color: #8B949E;
  margin-top: 0.25rem;
  text-align: right;
}

.min-requirement {
  color: #FF9F0A;
}

.list-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.list-item .form-input {
  flex: 1;
}

.remove-btn {
  background: rgba(255, 69, 58, 0.1);
  border: 1px solid rgba(255, 69, 58, 0.2);
  color: #FF453A;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;
}

.remove-btn:hover {
  background: rgba(255, 69, 58, 0.2);
}

.add-btn {
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  color: #007AFF;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 150ms ease;
  align-self: flex-start;
}

.add-btn:hover {
  background: rgba(0, 122, 255, 0.2);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #30363D;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .main-actions {
    justify-content: stretch;
  }

  .main-actions button {
    flex: 1;
  }

  .list-item {
    flex-direction: column;
    align-items: stretch;
  }

  .remove-btn {
    align-self: flex-end;
    width: fit-content;
  }
}
</style>