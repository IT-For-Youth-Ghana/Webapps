/**
 * Form validation composable
 * Provides reusable form validation logic
 */
import { ref, computed, readonly } from 'vue'
import { VALIDATION, FILE_UPLOAD } from '../constants/app.js'

export function useFormValidation() {
  const errors = ref({})
  const touched = ref({})

  /**
   * Validation rules
   */
  const rules = {
    required: (value) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return 'This field is required'
      }
      return null
    },

    email: (value) => {
      if (!value) return null
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? null : 'Please enter a valid email address'
    },

    minLength: (min) => (value) => {
      if (!value) return null
      return value.length >= min ? null : `Minimum ${min} characters required`
    },

    maxLength: (max) => (value) => {
      if (!value) return null
      return value.length <= max ? null : `Maximum ${max} characters allowed`
    },

    password: (value) => {
      if (!value) return null
      if (value.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`
      }
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Password must contain at least one lowercase letter'
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Password must contain at least one uppercase letter'
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Password must contain at least one number'
      }
      return null
    },

    fileSize: (maxSize = FILE_UPLOAD.MAX_SIZE) => (file) => {
      if (!file) return null
      return file.size <= maxSize ? null : 'File size exceeds maximum limit'
    },

    fileType: (allowedTypes) => (file) => {
      if (!file) return null
      const extension = '.' + file.name.split('.').pop().toLowerCase()
      return allowedTypes.includes(extension) ? null : 'File type not allowed'
    },

    url: (value) => {
      if (!value) return null
      try {
        new URL(value)
        return null
      } catch {
        return 'Please enter a valid URL'
      }
    },

    phone: (value) => {
      if (!value) return null
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/
      return phoneRegex.test(value) ? null : 'Please enter a valid phone number'
    }
  }

  /**
   * Validate a single field
   */
  const validateField = (field, value, fieldRules = []) => {
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors.value[field] = error
        return false
      }
    }
    
    delete errors.value[field]
    return true
  }

  /**
   * Validate entire form
   */
  const validateForm = (formData, validationSchema) => {
    const isValid = true
    
    for (const [field, fieldRules] of Object.entries(validationSchema)) {
      const isFieldValid = validateField(field, formData[field], fieldRules)
      if (!isFieldValid) {
        isValid = false
      }
      touched.value[field] = true
    }
    
    return isValid
  }

  /**
   * Mark field as touched
   */
  const touchField = (field) => {
    touched.value[field] = true
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field) => {
    delete errors.value[field]
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errors.value = {}
    touched.value = {}
  }

  /**
   * Check if form has any errors
   */
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  /**
   * Get error for specific field
   */
  const getFieldError = (field) => {
    return touched.value[field] ? errors.value[field] : null
  }

  /**
   * Check if field has error
   */
  const hasFieldError = (field) => {
    return touched.value[field] && !!errors.value[field]
  }

  return {
    // State
    errors: readonly(errors),
    touched: readonly(touched),
    
    // Computed
    hasErrors,
    
    // Methods
    rules,
    validateField,
    validateForm,
    touchField,
    clearFieldError,
    clearErrors,
    getFieldError,
    hasFieldError
  }
}