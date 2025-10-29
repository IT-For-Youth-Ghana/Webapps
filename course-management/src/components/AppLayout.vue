<template>
  <div class="app-layout" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <!-- Main Navigation -->
    <nav class="universal-nav">
      <div class="nav-header">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <div class="brand-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5"/>
              </svg>
            </div>
            <span class="brand-text">IT Youth Ghana</span>
          </router-link>
        </div>

        <div class="nav-menu">
          <!-- Role-based Navigation -->
          <div class="nav-sections">
            <!-- Admin Navigation (Primary for admin users) -->
            <div v-if="userStore.isAdmin" class="nav-section">
              <h4 class="nav-section-title">Admin Portal</h4>
              <div class="nav-links">
                <router-link 
                  to="/admin/dashboard" 
                  class="nav-link"
                  :class="{ active: $route.name === 'AdminDashboard' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </router-link>
                <router-link 
                  to="/admin/users" 
                  class="nav-link"
                  :class="{ active: $route.name === 'AdminUsers' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Users
                </router-link>
                <router-link 
                  to="/admin/courses" 
                  class="nav-link"
                  :class="{ active: $route.name === 'AdminCourses' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Courses
                </router-link>
              </div>
            </div>

            <!-- Portal Dropdowns (for admin users) -->
            <div v-if="userStore.isAdmin" class="nav-section">
              <div class="portal-dropdowns">
                <!-- Student Portal Dropdown -->
                <div class="portal-dropdown" @mouseenter="showStudentMenu = true" @mouseleave="showStudentMenu = false">
                  <button class="dropdown-toggle">
                    Student Portal
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  <div v-show="showStudentMenu" class="dropdown-menu">
                    <router-link 
                      to="/student/dashboard" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'StudentDashboard' }"
                    >
                      Dashboard
                    </router-link>
                    <router-link 
                      to="/student/courses" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'StudentCourses' }"
                    >
                      My Courses
                    </router-link>
                    <router-link 
                      to="/student/assignments" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'StudentAssignments' }"
                    >
                      Assignments
                    </router-link>
                  </div>
                </div>

                <!-- Teacher Portal Dropdown -->
                <div class="portal-dropdown" @mouseenter="showTeacherMenu = true" @mouseleave="showTeacherMenu = false">
                  <button class="dropdown-toggle">
                    Teacher Portal
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  <div v-show="showTeacherMenu" class="dropdown-menu">
                    <router-link 
                      to="/teacher/dashboard" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'TeacherDashboard' }"
                    >
                      Dashboard
                    </router-link>
                    <router-link 
                      to="/teacher/courses" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'TeacherCourses' }"
                    >
                      My Courses
                    </router-link>
                    <router-link 
                      to="/teacher/create-course" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'CreateCourse' }"
                    >
                      Create Course
                    </router-link>
                    <router-link 
                      to="/teacher/assignments" 
                      class="dropdown-link"
                      :class="{ active: $route.name === 'TeacherAssignments' }"
                    >
                      Assignments
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student Navigation (when not admin) -->
            <div v-else-if="userStore.isStudent" class="nav-section">
              <h4 class="nav-section-title">Student Portal</h4>
              <div class="nav-links">
                <router-link 
                  to="/student/dashboard" 
                  class="nav-link"
                  :class="{ active: $route.name === 'StudentDashboard' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </router-link>
                <router-link 
                  to="/student/courses" 
                  class="nav-link"
                  :class="{ active: $route.name === 'StudentCourses' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  My Courses
                </router-link>
                <router-link 
                  to="/student/assignments" 
                  class="nav-link"
                  :class="{ active: $route.name === 'StudentAssignments' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Assignments
                </router-link>
              </div>
            </div>

            <!-- Teacher Navigation (when not admin) -->
            <div v-else-if="userStore.isTeacher" class="nav-section">
              <h4 class="nav-section-title">Teacher Portal</h4>
              <div class="nav-links">
                <router-link 
                  to="/teacher/dashboard" 
                  class="nav-link"
                  :class="{ active: $route.name === 'TeacherDashboard' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </router-link>
                <router-link 
                  to="/teacher/courses" 
                  class="nav-link"
                  :class="{ active: $route.name === 'TeacherCourses' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  My Courses
                </router-link>
                <router-link 
                  to="/teacher/create-course" 
                  class="nav-link"
                  :class="{ active: $route.name === 'CreateCourse' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Create Course
                </router-link>
                <router-link 
                  to="/teacher/assignments" 
                  class="nav-link"
                  :class="{ active: $route.name === 'TeacherAssignments' }"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  Assignments
                </router-link>
              </div>
            </div>
          </div>

          <!-- User Menu -->
          <div class="nav-user">
            <div v-if="userStore.isAuthenticated" class="user-menu">
              <div class="user-info">
                <div class="user-avatar">
                  <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" :alt="userStore.currentUser.name" />
                  <span v-else class="avatar-fallback">{{ userInitials }}</span>
                </div>
                <div class="user-details">
                  <span class="user-name">{{ userStore.currentUser?.name }}</span>
                  <span class="user-role">{{ userStore.userRoleDisplay }}</span>
                </div>
              </div>
              <button @click="logout" class="nav-link logout-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
            <div v-else class="guest-menu">
              <router-link to="/login" class="nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Page Content -->
        <div class="page-content">
          <slot />
        </div>
      </div>
    </main>

    <!-- Quick Action Buttons -->
    <div class="quick-actions">
      <button 
        @click="scrollToTop" 
        class="quick-action-btn scroll-top"
        :class="{ visible: showScrollTop }"
        title="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18,15 12,9 6,15"/>
        </svg>
      </button>
      
      <button 
        @click="toggleTheme" 
        class="quick-action-btn theme-toggle"
        title="Toggle theme"
      >
        <svg v-if="isDarkTheme" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Reactive state
const mobileMenuOpen = ref(false)
const showScrollTop = ref(false)
const isDarkTheme = ref(true)
const showStudentMenu = ref(false)
const showTeacherMenu = ref(false)

// Computed properties
const userInitials = computed(() => {
  if (!userStore.currentUser?.name) return 'U'
  return userStore.currentUser.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

// Methods
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleTheme = () => {
  const newTheme = isDarkTheme.value ? 'light' : 'dark'
  isDarkTheme.value = !isDarkTheme.value
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme: newTheme }
  }))
}

const logout = async () => {
  await userStore.logout()
  router.push('/')
}

// Lifecycle
onMounted(() => {
  // Handle scroll for scroll-to-top button
  const handleScroll = () => {
    showScrollTop.value = window.scrollY > 300
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'dark'
  isDarkTheme.value = savedTheme === 'dark'
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.universal-nav {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  transition: color 0.2s ease;
}

.brand-link:hover {
  color: var(--interactive-primary);
}

.brand-logo {
  color: var(--interactive-primary);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-sections {
  display: flex;
  gap: 2rem;
}

.portal-dropdowns {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.portal-dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--interactive-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  background: var(--interactive-tertiary-hover);
  border-color: var(--border-hover);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  padding: 0.5rem;
  margin-top: 0.25rem;
}

.dropdown-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-link:hover {
  background: var(--interactive-tertiary-hover);
  color: var(--text-primary);
}

.dropdown-link.active {
  background: var(--interactive-secondary);
  color: var(--interactive-primary);
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  padding: 0 0.75rem;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-link:hover {
  background: var(--interactive-tertiary-hover);
  color: var(--text-primary);
}

.nav-link.active {
  background: var(--interactive-secondary);
  color: var(--interactive-primary);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--interactive-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.logout-btn {
  color: var(--status-error-text) !important;
}

.logout-btn:hover {
  background: var(--status-error) !important;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
}

.page-content {
  min-height: calc(100vh - 200px);
}

.quick-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 50;
}

.quick-action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-lg);
}

.quick-action-btn:hover {
  background: var(--interactive-tertiary-hover);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.scroll-top {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.scroll-top.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-sections {
    gap: 1rem;
  }
  
  .nav-section-title {
    display: none;
  }
  
  .nav-links {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .nav-header {
    padding: 1rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
  
  .quick-actions {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>