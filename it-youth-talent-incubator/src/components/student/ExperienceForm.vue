<!--
  Experience Form Component
  Manages adding/editing work experience entries
  Integrates with student store
-->
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  /** @type {import('../../types/api.types.js').WorkExperience} */
  experience: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel', 'delete'])

// Form state
const form = ref({
  title: '',
  company: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: ''
})

// Initialize form with existing data if editing
watch(() => props.experience, (newVal) => {
  if (newVal) {
    form.value = {
      title: newVal.title || '',
      company: newVal.company || '',
      location: newVal.location || '',
      start_date: newVal.start_date ? new Date(newVal.start_date).toISOString().split('T')[0] : '',
      end_date: newVal.end_date ? new Date(newVal.end_date).toISOString().split('T')[0] : '',
      is_current: newVal.is_current || false,
      description: newVal.description || ''
    }
  }
}, { immediate: true })

// Clear end date when marking as current
watch(() => form.value.is_current, (isCurrent) => {
  if (isCurrent) {
    form.value.end_date = ''
  }
})

const isValid = computed(() => {
  return form.value.title.trim() !== '' &&
         form.value.company.trim() !== '' &&
         form.value.location.trim() !== '' &&
         form.value.start_date !== '' &&
         (form.value.is_current || form.value.end_date !== '')
})

const handleSubmit = () => {
  if (!isValid.value) return
  
  const experienceData = {
    title: form.value.title.trim(),
    company: form.value.company.trim(),
    location: form.value.location.trim(),
    start_date: form.value.start_date,
    end_date: form.value.is_current ? null : form.value.end_date,
    is_current: form.value.is_current,
    description: form.value.description.trim()
  }
  
  emit('save', experienceData)
}

const handleCancel = () => {
  emit('cancel')
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this experience entry?')) {
    emit('delete')
  }
}
</script>

<template>
  <div class="experience-form">
    <h4 class="form-title">{{ isEdit ? 'Edit Experience' : 'Add Experience' }}</h4>
    
    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Job Title -->
      <div class="form-group">
        <label for="title" class="form-label">
          Job Title <span class="required">*</span>
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="e.g., Frontend Developer"
          required
        />
      </div>

      <!-- Company -->
      <div class="form-group">
        <label for="company" class="form-label">
          Company <span class="required">*</span>
        </label>
        <input
          id="company"
          v-model="form.company"
          type="text"
          class="form-input"
          placeholder="e.g., Tech Startup Ghana"
          required
        />
      </div>

      <!-- Location -->
      <div class="form-group">
        <label for="location" class="form-label">
          Location <span class="required">*</span>
        </label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          class="form-input"
          placeholder="e.g., Accra, Ghana"
          required
        />
      </div>

      <!-- Date Row -->
      <div class="form-row">
        <div class="form-group">
          <label for="start_date" class="form-label">
            Start Date <span class="required">*</span>
          </label>
          <input
            id="start_date"
            v-model="form.start_date"
            type="date"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="end_date" class="form-label">
            End Date {{ form.is_current ? '' : '*' }}
          </label>
          <input
            id="end_date"
            v-model="form.end_date"
            type="date"
            class="form-input"
            :disabled="form.is_current"
            :required="!form.is_current"
          />
        </div>
      </div>

      <!-- Currently Working -->
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            v-model="form.is_current"
            type="checkbox"
            class="checkbox-input"
          />
          <span class="checkbox-text">I currently work here</span>
        </label>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="form-label">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-textarea"
          rows="4"
          placeholder="Describe your responsibilities and achievements..."
        ></textarea>
        <span class="form-hint">
          {{ form.description.length }}/500 characters
        </span>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="handleCancel"
          class="btn-secondary"
          :disabled="isSaving"
        >
          Cancel
        </button>
        
        <button
          v-if="isEdit"
          type="button"
          @click="handleDelete"
          class="btn-danger"
          :disabled="isSaving"
        >
          Delete
        </button>
        
        <button
          type="submit"
          class="btn-primary"
          :disabled="!isValid || isSaving"
        >
          <span v-if="isSaving" class="loading-spinner small"></span>
          {{ isSaving ? 'Saving...' : (isEdit ? 'Update' : 'Add') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.experience-form {
  background: var(--card-background, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: var(--color-danger, #ef4444);
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--input-background, #ffffff);
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: var(--bg-disabled, #f3f4f6);
  cursor: not-allowed;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
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

.checkbox-group {
  padding-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
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

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color, #e2e8f0);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover, #f8fafc);
}

.btn-danger {
  background: var(--color-danger, #ef4444);
  color: white;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
