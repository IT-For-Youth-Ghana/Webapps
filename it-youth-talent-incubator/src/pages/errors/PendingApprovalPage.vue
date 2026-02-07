<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon pending">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>

      <h1 class="error-title">Account Pending Approval</h1>
      <p class="error-message">
        Your account is currently being reviewed by our team.
        This usually takes 1-2 business days. We'll notify you via email
        once your account has been approved.
      </p>

      <div class="status-card">
        <div class="status-header">
          <span class="status-badge pending">Pending Review</span>
        </div>
        <div class="status-info">
          <div class="info-row">
            <span class="label">Account Type:</span>
            <span class="value">{{ accountType }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ userEmail }}</span>
          </div>
          <div class="info-row">
            <span class="label">Registered:</span>
            <span class="value">{{ registrationDate }}</span>
          </div>
        </div>
      </div>

      <div class="help-section">
        <h3>While you wait:</h3>
        <ul>
          <li>Make sure your email is verified</li>
          <li>Complete your company profile</li>
          <li>Check your spam folder for verification emails</li>
        </ul>
      </div>

      <div class="error-actions">
        <button @click="refreshStatus" class="btn btn-secondary" :disabled="isRefreshing">
          <span v-if="isRefreshing">Checking...</span>
          <span v-else>Refresh Status</span>
        </button>
        <button @click="logout" class="btn btn-primary">
          Logout
        </button>
      </div>

      <p class="contact-info">
        Questions? Contact us at <a href="mailto:support@talentincubator.com">support@talentincubator.com</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const authStore = useAuthStore()

const isRefreshing = ref(false)

const accountType = computed(() => {
  const role = authStore.userRole
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'
})

const userEmail = computed(() => authStore.user?.email || 'N/A')

const registrationDate = computed(() => {
  const date = authStore.user?.created_at
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

async function refreshStatus() {
  isRefreshing.value = true
  try {
    await authStore.initialize()

    // Check if status has changed
    if (!authStore.isPendingApproval) {
      router.push({ name: 'CompanyDashboard' })
    }
  } finally {
    isRefreshing.value = false
  }
}

async function logout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
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
}

.error-icon.pending {
  color: v-bind('COLORS.warning');
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

.status-card {
  background: v-bind('COLORS.background');
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.status-header {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.pending {
  background: v-bind('COLORS.warning + "20"');
  color: v-bind('COLORS.warning');
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row .label {
  color: v-bind('COLORS.textLight');
  font-size: 0.875rem;
}

.info-row .value {
  color: v-bind('COLORS.text');
  font-weight: 500;
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
  background: white;
  color: v-bind('COLORS.text');
  border: 1px solid v-bind('COLORS.border');
}

.btn-secondary:hover:not(:disabled) {
  background: v-bind('COLORS.background');
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
