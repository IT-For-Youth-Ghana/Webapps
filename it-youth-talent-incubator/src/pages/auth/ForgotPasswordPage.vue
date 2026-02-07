<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <img src="/logo/logo.svg" alt="IT Youth Talent Incubator" class="logo-image" />
          <span class="logo-text">IT Youth Talent</span>
        </router-link>
        <h1 class="page-title">Reset Password</h1>
        <p class="page-subtitle">Enter your email to receive a password reset link</p>
      </div>

      <ForgotPassword
        @reset-success="handleResetSuccess"
        @navigate="handleNavigate"
      />

      <div class="auth-footer">
        <p>
          Remember your password?
          <router-link to="/login">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ForgotPassword from '../../components/auth/ForgotPassword.vue'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()

function handleResetSuccess() {
  // Show success state - component handles this internally
}

function handleNavigate(destination) {
  switch (destination) {
    case 'login':
      router.push({ name: 'Login' })
      break
    default:
      router.push({ name: 'Home' })
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

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.auth-footer p {
  color: v-bind('COLORS.textLight');
  font-size: 0.875rem;
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
