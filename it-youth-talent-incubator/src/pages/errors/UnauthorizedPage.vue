<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>

      <h1 class="error-title">Access Denied</h1>
      <p class="error-message">
        You don't have permission to access this page.
        Please contact support if you believe this is an error.
      </p>

      <div class="error-details" v-if="userRole">
        <p>Your current role: <strong>{{ userRole }}</strong></p>
      </div>

      <div class="error-actions">
        <button @click="goBack" class="btn btn-secondary">
          Go Back
        </button>
        <button @click="goToDashboard" class="btn btn-primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { getHomeDashboard } from '../../router/index.js'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const authStore = useAuthStore()

const userRole = computed(() => authStore.userRole)

function goBack() {
  if (window.history.length > 2) {
    router.back()
  } else {
    goToDashboard()
  }
}

function goToDashboard() {
  router.push(getHomeDashboard())
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
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: v-bind('COLORS.error');
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

.error-details {
  padding: 1rem;
  background: v-bind('COLORS.background');
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.error-details p {
  margin: 0;
  color: v-bind('COLORS.textLight');
}

.error-details strong {
  color: v-bind('COLORS.primary');
  text-transform: capitalize;
}

.error-actions {
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

.btn-secondary:hover {
  background: v-bind('COLORS.border');
}

@media (max-width: 480px) {
  .error-actions {
    flex-direction: column;
  }
}
</style>
