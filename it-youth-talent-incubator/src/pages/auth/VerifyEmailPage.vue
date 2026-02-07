<template>
  <div class="verify-page">
    <div class="verify-container">
      <!-- Loading State -->
      <div v-if="isVerifying" class="verify-state">
        <div class="spinner"></div>
        <h2>Verifying your email...</h2>
        <p>Please wait while we verify your email address.</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="verify-state success">
        <div class="icon-circle success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified. You can now access all features of your account.</p>
        <button @click="goToLogin" class="btn btn-primary">
          Continue to Login
        </button>
      </div>

      <!-- Error State -->
      <div v-else class="verify-state error">
        <div class="icon-circle error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2>Verification Failed</h2>
        <p>{{ errorMessage }}</p>
        <div class="action-buttons">
          <button @click="resendVerification" class="btn btn-secondary" :disabled="isResending">
            <span v-if="isResending">Sending...</span>
            <span v-else>Resend Verification</span>
          </button>
          <button @click="goToLogin" class="btn btn-primary">
            Go to Login
          </button>
        </div>
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

const isVerifying = ref(true)
const isSuccess = ref(false)
const isResending = ref(false)
const errorMessage = ref('The verification link is invalid or has expired.')

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    isVerifying.value = false
    errorMessage.value = 'No verification token provided. Please check your email for the verification link.'
    return
  }

  try {
    await authAPI.verifyEmail(token)
    isSuccess.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'The verification link is invalid or has expired.'
  } finally {
    isVerifying.value = false
  }
})

async function resendVerification() {
  isResending.value = true
  try {
    await authAPI.resendVerification()
    errorMessage.value = 'A new verification email has been sent. Please check your inbox.'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to resend verification email.'
  } finally {
    isResending.value = false
  }
}

function goToLogin() {
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, v-bind('COLORS.background') 0%, #e8eef5 100%);
}

.verify-container {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.verify-state {
  text-align: center;
}

.verify-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin: 1.5rem 0 0.5rem 0;
}

.verify-state p {
  color: v-bind('COLORS.textLight');
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid v-bind('COLORS.background');
  border-top-color: v-bind('COLORS.primary');
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.icon-circle svg {
  width: 40px;
  height: 40px;
}

.icon-circle.success {
  background: v-bind('COLORS.success + "20"');
  color: v-bind('COLORS.success');
}

.icon-circle.error {
  background: v-bind('COLORS.error + "20"');
  color: v-bind('COLORS.error');
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: v-bind('COLORS.primary');
  color: white;
}

.btn-primary:hover {
  background: v-bind('COLORS.primaryDark');
  transform: translateY(-2px);
}

.btn-secondary {
  background: v-bind('COLORS.background');
  color: v-bind('COLORS.text');
  border: 1px solid v-bind('COLORS.border');
}

.btn-secondary:hover:not(:disabled) {
  background: v-bind('COLORS.border');
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
