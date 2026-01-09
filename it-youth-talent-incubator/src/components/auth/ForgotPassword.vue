<!--
  Forgot Password Component
  Allows users to reset their password via email
-->
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

// Auth store
const authStore = useAuthStore()

// Emits for parent component navigation
const emit = defineEmits(['navigate'])

// Form data
const email = ref('')
const emailError = ref('')
const successMessage = ref('')
const errorMessage = ref('')

// Use store loading state
const isLoading = computed(() => authStore.isLoading)

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  // Reset messages
  emailError.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  authStore.clearError()

  // Validate email
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }

  const result = await authStore.forgotPassword(email.value)

  if (result.success) {
    successMessage.value =
      result.message || 'Password reset instructions have been sent to your email.'
    email.value = ''
  } else {
    errorMessage.value = result.message || 'Failed to send reset email. Please try again.'
  }
}

const goToLogin = () => {
  emit('navigate', 'login')
}
</script>

<template>
  <div>
    <h1>Reset Password</h1>
    <p class="subtitle">Enter your email address and we'll send you instructions to reset your password.</p>

    <div class="section-container">
      <h2>Forgot Password</h2>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-banner">
        <span class="success-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-banner">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Email Field -->
        <div class="form-row">
          <div class="form-field full-width">
            <label for="email" class="form-label">Email Address:</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :class="{ error: emailError }"
              placeholder="Enter your email address"
              required
            />
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-row">
          <button type="submit" class="btn-primary full-width" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            {{ isLoading ? 'Sending...' : 'Send Reset Instructions' }}
          </button>
        </div>
      </form>

      <!-- Back to Login -->
      <div class="form-footer">
        <p class="login-text">
          Remember your password?
          <button @click="goToLogin" class="link-button strong">Back to Login</button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.section-container h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #004dc5;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #004dc5;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}

/* Form Styles */
.form-row {
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
  width: 100%;
}

.form-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #004dc5;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(0, 77, 197, 0.1);
}

.form-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 4px;
}

/* Buttons */
.btn-primary {
  background-color: #004dc5;
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #003a94;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #a0c4ff;
  cursor: not-allowed;
}

.btn-primary.full-width {
  width: 100%;
}

.link-button {
  background: none;
  border: none;
  color: #004dc5;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.link-button:hover {
  color: #003a94;
}

.link-button.strong {
  font-weight: 600;
}

/* Messages */
.success-banner,
.error-banner {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-banner {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-banner {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

/* Footer */
.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.login-text {
  color: #666;
  font-size: 0.95rem;
}

/* Loading Spinner */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .section-container {
    padding: 16px;
    margin: 0 16px;
  }
}
</style>
