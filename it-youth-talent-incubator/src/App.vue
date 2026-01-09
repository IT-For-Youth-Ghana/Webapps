<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTheme } from './composables/useTheme.js'
import { useAuthStore } from './stores/auth.js'

// Components
import DashboardNavigation from './components/layout/DashboardNavigation.vue'
import StudentDashboard from './pages/StudentDashboard.vue'
import AdminDashboard from './pages/AdminDashboard.vue'
import CompanyDashboard from './pages/CompanyDashboard.vue'
import StudentJobsPage from './pages/StudentJobsPageComplete.vue'
import AdminJobsPage from './pages/AdminJobsPageComplete.vue'
import StudentApplicationsPage from './pages/StudentApplicationsPageComplete.vue'
import StudentProfilePage from './pages/StudentProfilePage.vue'
import AdminApplicationsPage from './pages/AdminApplicationsPageComplete.vue'
import AdminStudentsPage from './pages/AdminStudentsPage.vue'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.vue'
import CompanyMyJobPosts from './pages/company/MyJobPosts.vue'
import CompanyApplications from './pages/company/Applications.vue'
import LoginForm from './components/auth/LoginForm.vue'
import RegisterForm from './components/auth/RegisterForm.vue'
import ForgotPassword from './components/auth/ForgotPassword.vue'

// Theme management
const { currentTheme, theme } = useTheme()

// Auth store
const authStore = useAuthStore()

// Computed auth state from store
const userRole = computed(() => authStore.userRole || 'student')
const userName = computed(() => authStore.userName || 'Guest')
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAuthLoading = computed(() => authStore.isLoading && !authStore.isInitialized)

// View state
const currentView = ref('dashboard')
const authView = ref('login') // 'login', 'register', 'forgot-password'

// Demo mode for testing (can be disabled in production)
const isDemoMode = ref(import.meta.env.DEV)

// Navigation handler
const handleNavigation = (viewId) => {
  currentView.value = viewId
  console.log('Navigating to:', viewId)
}

// Auth navigation handler
const handleAuthNavigation = (view) => {
  authView.value = view
}

// Login success handler
const handleLoginSuccess = ({ user, role }) => {
  console.log('Login successful:', user?.email, 'Role:', role)
  currentView.value = 'dashboard'
}

// Register success handler
const handleRegisterSuccess = ({ email }) => {
  console.log('Registration successful for:', email)
  authView.value = 'login'
}

// Logout handler
const handleLogout = async () => {
  console.log('Logging out...')
  await authStore.logout()
  currentView.value = 'dashboard'
  authView.value = 'login'
}

// Job application handler for student dashboard
const handleApplyToJob = (jobId) => {
  console.log('Applying to job:', jobId)
  // In real app, this would open application modal or navigate to application form
}

// Initialize auth on mount
onMounted(async () => {
  console.log('🚀 IT Youth Talent Incubator Dashboard')

  // Initialize auth store (checks for existing session)
  await authStore.initialize()

  if (authStore.isAuthenticated) {
    console.log('User authenticated as:', authStore.userRole)
  } else {
    console.log('No active session - showing login')
  }

  if (isDemoMode.value) {
    console.log('Demo Mode: Use demo controls to switch roles')
  }
})

// Demo functions to switch roles (remove in production)
const switchToRole = async (role) => {
  // In demo mode, simulate different user roles
  // This modifies the store directly for testing purposes
  if (isDemoMode.value) {
    const mockUsers = {
      student: {
        _id: 'demo-student-1',
        email: 'student@demo.com',
        role: 'student',
        status: 'approved',
        is_active: true,
        email_verified: true
      },
      admin: {
        _id: 'demo-admin-1',
        email: 'admin@demo.com',
        role: 'admin',
        status: 'approved',
        is_active: true,
        email_verified: true
      },
      company: {
        _id: 'demo-company-1',
        email: 'company@demo.com',
        role: 'company',
        status: 'approved',
        is_active: true,
        email_verified: true
      }
    }

    const mockProfiles = {
      student: { first_name: 'Alex', last_name: 'Johnson' },
      admin: { first_name: 'Admin', last_name: 'User' },
      company: { name: 'TechCorp Ghana' }
    }

    // Update store state directly for demo
    authStore.user = mockUsers[role]
    authStore.profile = mockProfiles[role]
    authStore.isAuthenticated = true
    currentView.value = 'dashboard'
  }
}

const switchRole = () => {
  const roles = ['student', 'admin', 'company']
  const currentIndex = roles.indexOf(userRole.value)
  const nextIndex = (currentIndex + 1) % roles.length
  switchToRole(roles[nextIndex])
}

// Make demo function available in console
if (import.meta.env.DEV) {
  window.switchRole = switchRole
  window.authStore = authStore
}
</script>

<template>
  <div id="app">
    <!-- Loading State -->
    <div v-if="isAuthLoading" class="auth-loading">
      <div class="loading-spinner-large">⟳</div>
      <p>Loading...</p>
    </div>

    <!-- Auth Forms (Not Authenticated) -->
    <template v-else-if="!isAuthenticated">
      <div class="auth-container">
        <div class="auth-header">
          <img src="/logo/itfy-logo.png" alt="IT For Youth Ghana" class="auth-logo" />
          <h1>IT Youth Talent Incubator</h1>
        </div>

        <LoginForm
          v-if="authView === 'login'"
          @login-success="handleLoginSuccess"
          @navigate="handleAuthNavigation"
        />

        <RegisterForm
          v-else-if="authView === 'register'"
          @register-success="handleRegisterSuccess"
          @navigate="handleAuthNavigation"
        />

        <ForgotPassword v-else-if="authView === 'forgot-password'" @navigate="handleAuthNavigation" />
      </div>
    </template>

    <!-- Authenticated App -->
    <template v-else>
      <!-- Navigation -->
      <DashboardNavigation
        :user-role="userRole"
        :current-view="currentView"
        :user-name="userName"
        @navigate="handleNavigation"
        @logout="handleLogout"
      />

      <!-- Main Content -->
      <main class="main-content">
        <!-- Student Dashboard -->
        <StudentDashboard
          v-if="userRole === 'student' && currentView === 'dashboard'"
          :current-view="currentView"
          @navigate="handleNavigation"
          @apply-to-job="handleApplyToJob"
        />

        <!-- Admin Dashboard -->
        <AdminDashboard
          v-else-if="userRole === 'admin' && currentView === 'dashboard'"
          :current-view="currentView"
          @navigate="handleNavigation"
        />

        <!-- Company Dashboard -->
        <CompanyDashboard
          v-else-if="userRole === 'company' && currentView === 'dashboard'"
          :current-view="currentView"
          @navigate="handleNavigation"
        />

        <!-- Student Jobs Page -->
        <div v-if="userRole === 'student' && currentView === 'jobs'" class="page-container">
          <div class="page-header">
            <h1 class="page-title">Student Jobs (Loading...)</h1>
            <p class="page-subtitle">Job search interface will load here</p>
          </div>
          <StudentJobsPage />
        </div>

      <!-- Student Applications Page -->
      <StudentApplicationsPage
        v-else-if="userRole === 'student' && currentView === 'applications'"
      />

      <!-- Student Profile Page -->
      <StudentProfilePage
        v-else-if="userRole === 'student' && currentView === 'profile'"
      />

      <!-- Admin Jobs Page -->
      <div v-else-if="userRole === 'admin' && currentView === 'jobs'" class="page-container">
        <div class="page-header">
          <h1 class="page-title">Admin Jobs (Loading...)</h1>
          <p class="page-subtitle">Job management interface will load here</p>
        </div>
        <AdminJobsPage />
      </div>

      <!-- Admin Applications Page -->
      <AdminApplicationsPage
        v-else-if="userRole === 'admin' && currentView === 'applications'"
      />

      <!-- Admin Students Page -->
      <AdminStudentsPage
        v-else-if="userRole === 'admin' && currentView === 'students'"
      />

      <!-- Admin Analytics Page -->
      <AdminAnalyticsPage
        v-else-if="userRole === 'admin' && currentView === 'analytics'"
      />

      <!-- Company My Job Posts Page -->
      <CompanyMyJobPosts
        v-else-if="userRole === 'company' && currentView === 'my-jobs'"
      />

      <!-- Company Applications Page -->
      <CompanyApplications
        v-else-if="userRole === 'company' && currentView === 'applications'"
      />
      </main>
    </template>

    <!-- Demo Mode Indicator (visible in both auth and app views) -->
    <div v-if="isDemoMode" class="demo-controls">
      <div class="demo-indicator">
        Demo Mode - {{ isAuthenticated ? userRole : 'Not logged in' }}
      </div>
      <div v-if="isAuthenticated" class="demo-buttons">
        <button
          @click="switchToRole('student')"
          class="role-switch-btn"
          :class="{ active: userRole === 'student' }"
        >
          Student
        </button>
        <button
          @click="switchToRole('admin')"
          class="role-switch-btn"
          :class="{ active: userRole === 'admin' }"
        >
          Admin
        </button>
        <button
          @click="switchToRole('company')"
          class="role-switch-btn"
          :class="{ active: userRole === 'company' }"
        >
          Company
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@import url('./styles/global.css');

#app {
  min-height: 100vh;
  background: var(--bg-primary, #0D1117);
  color: var(--text-primary, #ffffff);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  min-height: calc(100vh - 4rem);
}

.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary, #8fb2d6);
  margin: 0;
}

.page-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.placeholder-content {
  text-align: center;
  padding: 3rem;
  background: var(--bg-secondary, #161B22);
  border: 1px solid var(--border-primary, #30363D);
  border-radius: 1rem;
  max-width: 32rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.placeholder-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 1rem;
}

.placeholder-content p {
  color: var(--text-secondary, #8fb2d6);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.demo-controls {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 1001;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demo-indicator {
  background: var(--interactive-primary, #1b65b2);
  color: var(--text-inverse, #ffffff);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(27, 101, 178, 0.25);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.role-switch-btn {
  background: var(--text-secondary, #8fb2d6);
  color: var(--text-inverse, #ffffff);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(143, 178, 214, 0.25);
  opacity: 0.7;
}

.role-switch-btn:hover {
  background: var(--interactive-primary-hover, #195aa5);
  transform: translateY(-1px);
  opacity: 1;
}

.role-switch-btn.active {
  background: var(--interactive-primary, #1b65b2);
  opacity: 1;
  box-shadow: 0 4px 12px rgba(27, 101, 178, 0.4);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .placeholder-content {
    padding: 2rem 1.5rem;
  }

  .demo-controls {
    bottom: 0.5rem;
    right: 0.5rem;
  }

  .auth-container {
    padding: 1rem;
  }
}

/* Auth Loading State */
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.loading-spinner-large {
  font-size: 3rem;
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

/* Auth Container */
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-primary, #0d1117) 0%, var(--bg-secondary, #161b22) 100%);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  border-radius: 12px;
}

.auth-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}
</style>
