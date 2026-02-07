<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <img src="/logo/logo.svg" alt="IT Youth Talent Incubator" class="logo-image" />
          <span class="logo-text">IT Youth Talent</span>
        </router-link>
      </div>

      <LoginForm
        @login-success="handleLoginSuccess"
        @navigate="handleNavigate"
      />

      <div class="auth-footer">
        <p>
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import LoginForm from '../../components/auth/LoginForm.vue'
import { getHomeDashboard } from '../../router/index.js'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const route = useRoute()

function handleLoginSuccess() {
  // Redirect to intended destination or dashboard
  const redirectPath = route.query.redirect
  if (redirectPath) {
    router.push(redirectPath)
  } else {
    router.push(getHomeDashboard())
  }
}

function handleNavigate(destination) {
  switch (destination) {
    case 'register':
      router.push({ name: 'Register' })
      break
    case 'forgot-password':
      router.push({ name: 'ForgotPassword' })
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
