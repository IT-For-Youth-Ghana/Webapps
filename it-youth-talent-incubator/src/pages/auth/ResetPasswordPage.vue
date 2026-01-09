<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <img src="/logo/logo.svg" alt="IT Youth Talent Incubator" class="logo-image" />
          <span class="logo-text">IT Youth Talent</span>
        </router-link>
        <h1 class="page-title">Set New Password</h1>
        <p class="page-subtitle">Enter your new password below</p>
      </div>

      <form @submit.prevent="handleSubmit" class="reset-form">
        <div class="form-group">
          <label for="password">New Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter new password"
            :class="{ error: passwordError }"
          />
          <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
          <p class="field-hint">At least 8 characters with uppercase, lowercase, and numbers</p>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm new password"
            :class="{ error: confirmPasswordError }"
          />
          <span v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</span>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading">Resetting...</span>
          <span v-else>Reset Password</span>
        </button>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <div class="auth-footer">
        <p>
          <router-link to="/login">Back to Sign In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authAPI } from '../../utils/api.js'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const token = ref('')

onMounted(() => {
  token.value = route.query.token
  if (!token.value) {
    errorMessage.value = 'Invalid or missing reset token. Please request a new password reset.'
  }
})

function validateForm() {
  let isValid = true
  passwordError.value = ''
  confirmPasswordError.value = ''

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!password.value || !passwordRegex.test(password.value)) {
    passwordError.value = 'Password must be 8+ chars with uppercase, lowercase, and number'
    isValid = false
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return
  if (!token.value) {
    errorMessage.value = 'Invalid reset token'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authAPI.resetPassword({
      token: token.value,
      password: password.value
    })

    successMessage.value = 'Password reset successfully! Redirecting to login...'

    setTimeout(() => {
      router.push({ name: 'Login', query: { passwordReset: 'true' } })
    }, 2000)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to reset password. The link may have expired.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, v-bind('COLORS.background') 0%, #e8eef5 100%);
}

.auth-container {
  width: 100%;
  max-width: 450px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.logo-image {
  width: 48px;
  height: 48px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind('COLORS.primary');
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: v-bind('COLORS.textLight');
  margin: 0;
}

.reset-form {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('COLORS.text');
  margin-bottom: 0.375rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid v-bind('COLORS.border');
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: v-bind('COLORS.primary');
  box-shadow: 0 0 0 3px v-bind('COLORS.primary + "20"');
}

.form-group input.error {
  border-color: v-bind('COLORS.error');
}

.error-text {
  display: block;
  font-size: 0.75rem;
  color: v-bind('COLORS.error');
  margin-top: 0.25rem;
}

.field-hint {
  font-size: 0.75rem;
  color: v-bind('COLORS.textLight');
  margin: 0.25rem 0 0 0;
}

.btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: v-bind('COLORS.primary');
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: v-bind('COLORS.primaryDark');
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: v-bind('COLORS.error + "15"');
  color: v-bind('COLORS.error');
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.auth-footer a {
  color: v-bind('COLORS.primary');
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
