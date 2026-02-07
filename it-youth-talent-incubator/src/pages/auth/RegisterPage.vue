<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <img src="/logo/logo.svg" alt="IT Youth Talent Incubator" class="logo-image" />
          <span class="logo-text">IT Youth Talent</span>
        </router-link>
        <h1 class="page-title">Create Your Account</h1>
        <p class="page-subtitle">Choose your account type to get started</p>
      </div>

      <div class="account-types">
        <router-link to="/register/student" class="account-card">
          <div class="card-icon student">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h3>Student</h3>
          <p>Looking for internships and job opportunities</p>
          <span class="card-arrow">→</span>
        </router-link>

        <router-link to="/register/company" class="account-card">
          <div class="card-icon company">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3>Company</h3>
          <p>Looking to hire talented students</p>
          <span class="card-arrow">→</span>
        </router-link>
      </div>

      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link to="/login">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { COLORS } from '../../constants/colors.js'
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
  max-width: 600px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
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
  font-size: 2rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: v-bind('COLORS.textLight');
  margin: 0;
}

.account-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.account-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.account-card:hover .card-arrow {
  transform: translateX(4px);
  opacity: 1;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.card-icon svg {
  width: 32px;
  height: 32px;
}

.card-icon.student {
  background: v-bind('COLORS.primary + "15"');
  color: v-bind('COLORS.primary');
}

.card-icon.company {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.account-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin: 0 0 0.5rem 0;
}

.account-card p {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.card-arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 1.25rem;
  color: v-bind('COLORS.primary');
  opacity: 0;
  transition: all 0.2s ease;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
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

@media (max-width: 480px) {
  .account-types {
    grid-template-columns: 1fr;
  }
}
</style>
