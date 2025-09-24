<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from './composables/useTheme.js'
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

// Theme management
const { currentTheme, theme } = useTheme()

// Authentication state - would come from external auth system
const userRole = ref('student') // 'student', 'admin', or 'company'
const userName = ref('Alex Johnson')
const isAuthenticated = ref(true)
const currentView = ref('dashboard')

// Demo mode for testing
const isDemoMode = ref(true)

// Navigation handler
const handleNavigation = (viewId) => {
  currentView.value = viewId
  console.log('Navigating to:', viewId)
}

// Logout handler
const handleLogout = () => {
  console.log('Logging out...')
  // In real app, this would redirect to main website
  window.location.href = 'https://itforyouthghana.org'
}

// Job application handler for student dashboard
const handleApplyToJob = (jobId) => {
  console.log('Applying to job:', jobId)
  // In real app, this would open application modal or navigate to application form
}

// Simulate authentication check on mount
onMounted(() => {
  // In real app, check authentication status and user role from main website
  console.log('🚀 IT Youth Talent Incubator Dashboard')
  console.log('User authenticated as:', userRole.value)
  
  if (isDemoMode.value) {
    console.log('Demo Mode: Switch between student/admin by changing userRole in code')
  }
})

// Demo functions to switch roles (remove in production)
const switchToRole = (role) => {
  userRole.value = role
  
  const names = {
    student: 'Alex Johnson',
    admin: 'Admin User',
    company: 'TechCorp Ghana'
  }
  userName.value = names[userRole.value]
  currentView.value = 'dashboard'
}

const switchRole = () => {
  const roles = ['student', 'admin', 'company']
  const currentIndex = roles.indexOf(userRole.value)
  const nextIndex = (currentIndex + 1) % roles.length
  switchToRole(roles[nextIndex])
}

// Make demo function available in console
window.switchRole = switchRole
</script>

<template>
  <div id="app">
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

    <!-- Demo Mode Indicator -->
    <div v-if="isDemoMode" class="demo-controls">
      <div class="demo-indicator">
        Demo Mode - {{ userRole }}
      </div>
      <div class="demo-buttons">
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
  background: #1b65b2;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(27, 101, 178, 0.25);
}

.role-switch-btn {
  background: #8fb2d6;
  color: #ffffff;
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
  background: #195aa5;
  transform: translateY(-1px);
  opacity: 1;
}

.role-switch-btn.active {
  background: #1b65b2;
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
}
</style>