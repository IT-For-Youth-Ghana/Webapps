<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <h2 class="logo-text">Ghana LMS</h2>
      </div>
      <button class="sidebar-close" @click="$emit('close')" aria-label="Close sidebar">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="nav-section-title">Main</h3>
        <ul class="nav-links">
          <li v-for="link in mainNavigation" :key="link.path">
            <router-link 
              :to="link.path" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path.startsWith(link.path) }"
            >
              <component :is="link.icon" class="nav-icon" />
              <span class="nav-text">{{ link.label }}</span>
              <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div v-if="courseNavigation.length > 0" class="nav-section">
        <h3 class="nav-section-title">Courses</h3>
        <ul class="nav-links">
          <li v-for="link in courseNavigation" :key="link.path">
            <router-link 
              :to="link.path" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path.startsWith(link.path) }"
            >
              <component :is="link.icon" class="nav-icon" />
              <span class="nav-text">{{ link.label }}</span>
              <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div v-if="adminNavigation.length > 0" class="nav-section">
        <h3 class="nav-section-title">Administration</h3>
        <ul class="nav-links">
          <li v-for="link in adminNavigation" :key="link.path">
            <router-link 
              :to="link.path" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path.startsWith(link.path) }"
            >
              <component :is="link.icon" class="nav-icon" />
              <span class="nav-text">{{ link.label }}</span>
              <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">
          <span>{{ userInitials }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRoleLabel }}</div>
        </div>
      </div>
    </div>
  </aside>
  
  <div v-if="isOpen" class="sidebar-overlay" @click="$emit('close')"></div>
</template>

<script>
import { computed } from 'vue'
import { useUserStore } from '@shared/stores/user.store.js'
import { 
  HomeIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  ChatBubbleLeftIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'DashboardSidebar',
  components: {
    HomeIcon,
    BookOpenIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    UserGroupIcon,
    CogIcon,
    BellIcon,
    ChatBubbleLeftIcon
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    userRole: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const userStore = useUserStore()
    
    const userName = computed(() => userStore.currentUser?.name || 'User')
    const userInitials = computed(() => {
      const name = userName.value
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    })
    
    const userRoleLabel = computed(() => {
      const roleLabels = {
        'student': 'Student',
        'teacher': 'Teacher',
        'admin': 'Administrator'
      }
      return roleLabels[props.userRole] || 'User'
    })
    
    const mainNavigation = computed(() => {
      const baseNav = [
        {
          path: `/${props.userRole}/dashboard`,
          label: 'Dashboard',
          icon: 'HomeIcon'
        }
      ]
      
      if (props.userRole === 'student') {
        return [
          ...baseNav,
          {
            path: '/student/courses',
            label: 'My Courses',
            icon: 'BookOpenIcon'
          },
          {
            path: '/student/assignments',
            label: 'Assignments',
            icon: 'DocumentTextIcon',
            badge: '3'
          },
          {
            path: '/student/progress',
            label: 'Progress',
            icon: 'ChartBarIcon'
          },
          {
            path: '/student/calendar',
            label: 'Calendar',
            icon: 'CalendarIcon'
          }
        ]
      }
      
      if (props.userRole === 'teacher') {
        return [
          ...baseNav,
          {
            path: '/teacher/courses',
            label: 'Course Management',
            icon: 'BookOpenIcon'
          },
          {
            path: '/teacher/assignments',
            label: 'Assignments & Grading',
            icon: 'DocumentTextIcon'
          },
          {
            path: '/teacher/materials',
            label: 'Learning Materials',
            icon: 'AcademicCapIcon'
          },
          {
            path: '/teacher/analytics',
            label: 'Analytics',
            icon: 'ChartBarIcon'
          },
          {
            path: '/teacher/schedule',
            label: 'Schedule',
            icon: 'CalendarIcon'
          }
        ]
      }
      
      return baseNav
    })
    
    const courseNavigation = computed(() => {
      if (props.userRole === 'teacher') {
        return [
          {
            path: '/teacher/create-course',
            label: 'Create Course',
            icon: 'BookOpenIcon'
          }
        ]
      }
      return []
    })
    
    const adminNavigation = computed(() => {
      if (props.userRole === 'admin') {
        return [
          {
            path: '/admin/users',
            label: 'User Management',
            icon: 'UserGroupIcon'
          },
          {
            path: '/admin/courses',
            label: 'Course Oversight',
            icon: 'BookOpenIcon'
          },
          {
            path: '/admin/settings',
            label: 'System Settings',
            icon: 'CogIcon'
          }
        ]
      }
      return []
    })
    
    return {
      userName,
      userInitials,
      userRoleLabel,
      mainNavigation,
      courseNavigation,
      adminNavigation
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.sidebar-close:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding: 0 0.75rem;
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 0.25rem;
  position: relative;
}

.nav-link:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.nav-link-active {
  background: var(--interactive-secondary);
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.nav-badge {
  background: var(--status-error-text);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (min-width: 1024px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: none;
  }
  
  .sidebar-close {
    display: none;
  }
}
</style>