<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <h1 class="error-title">Verify Your Email</h1>
      <p class="error-message">
        Please verify your email address to access this feature.
        We sent a verification link to your email when you registered.
      </p>

      <div class="email-card">
        <div class="email-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
          </svg>
        </div>
        <span class="email-text">{{ userEmail }}</span>
      </div>

      <div class="actions-section">
        <button
          @click="resendVerification"
          class="btn btn-primary"
          :disabled="isResending || cooldown > 0"
        >
          <span v-if="isResending">Sending...</span>
          <span v-else-if="cooldown > 0">Resend in {{ cooldown }}s</span>
          <span v-else>Resend Verification Email</span>
        </button>

        <p v-if="message" :class="['message', messageType]">
          {{ message }}
        </p>
      </div>

      <div class="help-section">
        <h3>Didn't receive the email?</h3>
        <ul>
          <li>Check your spam or junk folder</li>
          <li>Make sure <strong>{{ userEmail }}</strong> is correct</li>
          <li>Add our email to your contacts</li>
          <li>Wait a few minutes and try again</li>
        </ul>
      </div>

      <div class="error-actions">
        <button @click="checkVerification" class="btn btn-secondary" :disabled="isChecking">
          <span v-if="isChecking">Checking...</span>
          <span v-else>I've Verified My Email</span>
        </button>
        <button @click="logout" class="btn btn-outline">
          Logout
        </button>
      </div>

      <p class="contact-info">
        Need help? <a href="mailto:support@talentincubator.com">Contact Support</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { authAPI } from '../../utils/api.js'
import { getHomeDashboard } from '../../router/index.js'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const authStore = useAuthStore()

const isResending = ref(false)
const isChecking = ref(false)
const cooldown = ref(0)
const message = ref('')
const messageType = ref('success')

let cooldownTimer = null

const userEmail = computed(() => authStore.user?.email || 'your email')

async function resendVerification() {
  if (isResending.value || cooldown.value > 0) return

  isResending.value = true
  message.value = ''

  try {
    await authAPI.resendVerification()
    message.value = 'Verification email sent! Check your inbox.'
    messageType.value = 'success'

    // Start cooldown
    cooldown.value = 60
    cooldownTimer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(cooldownTimer)
      }
    }, 1000)
  } catch (error) {
    message.value = error.response?.data?.message || 'Failed to send verification email. Please try again.'
    messageType.value = 'error'
  } finally {
    isResending.value = false
  }
}

async function checkVerification() {
  isChecking.value = true
  message.value = ''

  try {
    // Re-fetch user data to check verification status
    await authStore.initialize()

    if (authStore.isEmailVerified) {
      message.value = 'Email verified! Redirecting...'
      messageType.value = 'success'

      setTimeout(() => {
        router.push(getHomeDashboard())
      }, 1000)
    } else {
      message.value = 'Email not yet verified. Please check your inbox.'
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = 'Failed to check verification status.'
    messageType.value = 'error'
  } finally {
    isChecking.value = false
  }
}

async function logout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.error-container {
  text-align: center;
  max-width: 550px;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: v-bind('COLORS.primary');
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1rem;
  color: v-bind('COLORS.textLight');
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.email-card {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: v-bind('COLORS.background');
  border-radius: 50px;
  margin-bottom: 1.5rem;
}

.email-icon {
  width: 24px;
  height: 24px;
  color: v-bind('COLORS.primary');
}

.email-icon svg {
  width: 100%;
  height: 100%;
}

.email-text {
  font-weight: 500;
  color: v-bind('COLORS.text');
}

.actions-section {
  margin-bottom: 1.5rem;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.message.success {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.message.error {
  background: v-bind('COLORS.error + "15"');
  color: v-bind('COLORS.error');
}

.help-section {
  text-align: left;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: v-bind('COLORS.info + "10"');
  border-radius: 8px;
  border-left: 4px solid v-bind('COLORS.info');
}

.help-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('COLORS.text');
  margin-bottom: 0.5rem;
}

.help-section ul {
  margin: 0;
  padding-left: 1.25rem;
}

.help-section li {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
  margin-bottom: 0.25rem;
}

.help-section strong {
  color: v-bind('COLORS.text');
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: v-bind('COLORS.primary');
  color: white;
}

.btn-primary:hover:not(:disabled) {
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

.btn-outline {
  background: transparent;
  color: v-bind('COLORS.textLight');
  border: 1px solid v-bind('COLORS.border');
}

.btn-outline:hover {
  background: v-bind('COLORS.background');
  color: v-bind('COLORS.text');
}

.contact-info {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
  margin: 0;
}

.contact-info a {
  color: v-bind('COLORS.primary');
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .error-actions {
    flex-direction: column;
  }
}
</style>
