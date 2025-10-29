<template>
  <div class="app-layout" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <!-- Universal Navigation -->
    <UniversalNavigation />
    
    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Breadcrumb Navigation -->
        <nav v-if="showBreadcrumbs" class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
              <router-link 
                v-if="crumb.to && index < breadcrumbs.length - 1"
                :to="crumb.to" 
                class="breadcrumb-link"
              >
                {{ crumb.label }}
              </router-link>
              <span v-else class="breadcrumb-current">
                {{ crumb.label }}
              </span>
            </li>
          </ol>
        </nav>

        <!-- Page Content -->
        <div class="page-content">
          <slot />
        </div>
      </div>
    </main>

    <!-- Quick Action Buttons (Floating) -->
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

    <!-- Mobile Overlay -->
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-overlay" 
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user.store.js'
import UniversalNavigation from '../components/UniversalNavigation.vue'

const route = useRoute()
const userStore = useUserStore()

// Reactive state
const mobileMenuOpen = ref(false)
const showScrollTop = ref(false)
const isDarkTheme = ref(false)

// Computed properties
const showBreadcrumbs = computed(() => {
  // Don't show breadcrumbs on dashboard pages or login
  const noBreadcrumbRoutes = ['Home', 'Login', 'StudentDashboard', 'TeacherDashboard', 'AdminDashboard']
  return !noBreadcrumbRoutes.includes(route.name)
})

const breadcrumbs = computed(() => {
  const crumbs = []
  
  // Add base breadcrumb
  if (userStore.isAdmin) {
    crumbs.push({ label: 'Admin Portal', to: '/admin/dashboard' })
  } else if (userStore.isTeacher) {
    crumbs.push({ label: 'Teacher Portal', to: '/teacher/dashboard' })
  } else if (userStore.isStudent) {
    crumbs.push({ label: 'Student Portal', to: '/student/dashboard' })
  }
  
  // Add section-specific breadcrumbs
  if (route.path.startsWith('/teacher')) {
    if (route.name !== 'TeacherDashboard') {
      crumbs.push({ label: 'Teacher Dashboard', to: '/teacher/dashboard' })
    }
    
    const teacherPages = {
      'TeacherCourses': { label: 'Course Management', to: '/teacher/courses' },
      'CreateCourse': { label: 'Create Course', to: '/teacher/create-course' },
      'EditCourse': { label: 'Edit Course', to: null },
      'TeacherMaterials': { label: 'Learning Materials', to: '/teacher/materials' },
      'TeacherAssignments': { label: 'Assignments', to: '/teacher/assignments' },
      'TeacherGrading': { label: 'Grading Center', to: '/teacher/grading' },
      'TeacherAnalytics': { label: 'Analytics', to: '/teacher/analytics' },
      'TeacherSchedule': { label: 'Schedule', to: '/teacher/schedule' },
      'TeacherAnnouncements': { label: 'Announcements', to: '/teacher/announcements' }
    }
    
    if (teacherPages[route.name]) {
      crumbs.push(teacherPages[route.name])
    }
  }
  
  if (route.path.startsWith('/student')) {
    if (route.name !== 'StudentDashboard') {
      crumbs.push({ label: 'Student Dashboard', to: '/student/dashboard' })
    }
    
    const studentPages = {
      'StudentCourses': { label: 'My Courses', to: '/student/courses' },
      'StudentAssignments': { label: 'My Assignments', to: '/student/assignments' },
      'StudentProgress': { label: 'My Progress', to: '/student/progress' }
    }
    
    if (studentPages[route.name]) {
      crumbs.push(studentPages[route.name])
    }
  }
  
  if (route.path.startsWith('/admin')) {
    if (route.name !== 'AdminDashboard') {
      crumbs.push({ label: 'Admin Dashboard', to: '/admin/dashboard' })
    }
    
    const adminPages = {
      'AdminUsers': { label: 'User Management', to: '/admin/users' },
      'AdminCourses': { label: 'Course Management', to: '/admin/courses' }
    }
    
    if (adminPages[route.name]) {
      crumbs.push(adminPages[route.name])
    }
  }
  
  return crumbs
})

// Methods
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

// Watch for route changes to close mobile menu
watch(route, () => {
  closeMobileMenu()
})

// Lifecycle
onMounted(() => {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkTheme.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background: var(--bg-primary);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 0.75rem;
  color: var(--text-secondary);
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

/* Page Content */
.page-content {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Quick Actions */
.quick-actions {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 900;
}

.quick-action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-action-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-top {
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.scroll-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.theme-toggle {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu-open .mobile-overlay {
  opacity: 1;
  visibility: visible;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .breadcrumb-nav {
    margin-bottom: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .breadcrumb {
    white-space: nowrap;
  }
  
  .quick-actions {
    bottom: 1rem;
    left: 1rem;
    gap: 0.5rem;
  }
  
  .quick-action-btn {
    width: 40px;
    height: 40px;
  }
  
  .quick-action-btn svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 640px) {
  .content-wrapper {
    padding: 0.75rem;
  }
  
  .breadcrumb {
    font-size: 0.813rem;
  }
  
  .breadcrumb-item:not(:last-child)::after {
    margin: 0 0.5rem;
  }
  
  .quick-actions {
    flex-direction: row;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
}

/* Theme Support */
[data-theme="dark"] .quick-action-btn {
  background: var(--bg-primary);
  border-color: var(--border-hover);
}

[data-theme="dark"] .quick-action-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
}

/* Print Styles */
@media print {
  .quick-actions {
    display: none;
  }
  
  .breadcrumb-nav {
    display: none;
  }
  
  .content-wrapper {
    padding: 0;
    max-width: none;
  }
}
</style>