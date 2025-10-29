<template>
  <header class="dashboard-header">
    <div class="header-left">
      <button 
        class="sidebar-toggle"
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle sidebar"
      >
        <Bars3Icon class="w-6 h-6" />
      </button>
      
      <div class="header-title">
        <h1 class="title-text">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="subtitle-text">{{ pageSubtitle }}</p>
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-actions">
        <!-- Quick Search -->
        <div class="search-container">
          <div class="search-box" :class="{ 'search-active': searchActive }">
            <MagnifyingGlassIcon class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search courses, materials..."
              class="search-input"
              @focus="searchActive = true"
              @blur="searchActive = false"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <!-- Notifications -->
        <div class="notification-container">
          <button 
            class="header-button"
            @click="showNotifications = !showNotifications"
            aria-label="Notifications"
          >
            <BellIcon class="w-6 h-6" />
            <span v-if="unreadCount > 0" class="notification-badge">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>
          
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="dropdown-header">
              <h3>Notifications</h3>
              <button 
                v-if="unreadCount > 0"
                class="mark-read-btn"
                @click="markAllAsRead"
              >
                Mark all as read
              </button>
            </div>
            
            <div class="notifications-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
                @click="markAsRead(notification.id)"
              >
                <div class="notification-icon">
                  <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>
                <div class="notification-content">
                  <p class="notification-title">{{ notification.title }}</p>
                  <p class="notification-message">{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
              
              <div v-if="notifications.length === 0" class="no-notifications">
                <BellIcon class="w-12 h-12 opacity-30" />
                <p>No notifications</p>
              </div>
            </div>
            
            <div class="dropdown-footer">
              <router-link to="/notifications" class="view-all-link">
                View all notifications
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="user-menu-container">
          <button 
            class="user-menu-trigger"
            @click="showUserMenu = !showUserMenu"
            aria-label="User menu"
          >
            <div class="user-avatar">
              <span>{{ userInitials }}</span>
            </div>
            <ChevronDownIcon class="w-4 h-4" />
          </button>
          
          <div v-if="showUserMenu" class="user-menu-dropdown">
            <div class="user-info">
              <div class="user-avatar-large">
                <span>{{ userInitials }}</span>
              </div>
              <div class="user-details">
                <p class="user-name">{{ userName }}</p>
                <p class="user-email">{{ userEmail }}</p>
                <span class="user-role-badge">{{ userRoleLabel }}</span>
              </div>
            </div>
            
            <div class="menu-divider"></div>
            
            <nav class="user-menu-nav">
              <router-link to="/profile" class="menu-item">
                <UserCircleIcon class="w-5 h-5" />
                <span>Profile Settings</span>
              </router-link>
              
              <router-link to="/preferences" class="menu-item">
                <CogIcon class="w-5 h-5" />
                <span>Preferences</span>
              </router-link>
              
              <router-link to="/help" class="menu-item">
                <QuestionMarkCircleIcon class="w-5 h-5" />
                <span>Help & Support</span>
              </router-link>
            </nav>
            
            <div class="menu-divider"></div>
            
            <button class="menu-item logout-button" @click="$emit('logout')">
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'DashboardHeader',
  components: {
    Bars3Icon,
    MagnifyingGlassIcon,
    BellIcon,
    ChevronDownIcon,
    UserCircleIcon,
    CogIcon,
    QuestionMarkCircleIcon,
    ArrowRightOnRectangleIcon,
    BookOpenIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
  },
  props: {
    userRole: {
      type: String,
      required: true
    },
    notifications: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-sidebar', 'logout'],
  setup(props) {
    const route = useRoute()
    const userStore = useUserStore()
    
    const searchQuery = ref('')
    const searchActive = ref(false)
    const showNotifications = ref(false)
    const showUserMenu = ref(false)
    
    const userName = computed(() => userStore.currentUser?.name || 'User')
    const userEmail = computed(() => userStore.currentUser?.email || '')
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
    
    const pageTitle = computed(() => {
      const pageTitles = {
        'dashboard': 'Dashboard',
        'courses': 'Courses',
        'assignments': 'Assignments',
        'materials': 'Learning Materials',
        'analytics': 'Analytics',
        'schedule': 'Schedule',
        'progress': 'Progress',
        'calendar': 'Calendar',
        'users': 'User Management',
        'settings': 'Settings'
      }
      
      const pathSegments = route.path.split('/').filter(Boolean)
      const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard'
      return pageTitles[lastSegment] || 'Dashboard'
    })
    
    const pageSubtitle = computed(() => {
      const subtitles = {
        'dashboard': 'Welcome back! Here\'s what\'s happening in your learning journey.',
        'courses': 'Manage and explore your learning content',
        'assignments': 'Track assignments and submissions',
        'analytics': 'Monitor learning progress and engagement'
      }
      
      const pathSegments = route.path.split('/').filter(Boolean)
      const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard'
      return subtitles[lastSegment]
    })
    
    const unreadCount = computed(() => {
      return props.notifications.filter(n => !n.read).length
    })
    
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        console.log('Searching for:', searchQuery.value)
      }
    }
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-container')) {
        showNotifications.value = false
      }
      if (!event.target.closest('.user-menu-container')) {
        showUserMenu.value = false
      }
    }
    
    const markAsRead = (notificationId) => {
      // Implement mark as read functionality
      console.log('Mark as read:', notificationId)
    }
    
    const markAllAsRead = () => {
      // Implement mark all as read functionality
      console.log('Mark all as read')
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        'course': 'BookOpenIcon',
        'assignment': 'DocumentTextIcon',
        'warning': 'ExclamationTriangleIcon',
        'info': 'InformationCircleIcon'
      }
      return icons[type] || 'InformationCircleIcon'
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return `${Math.floor(diff / 86400000)}d ago`
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      searchQuery,
      searchActive,
      showNotifications,
      showUserMenu,
      userName,
      userEmail,
      userInitials,
      userRoleLabel,
      pageTitle,
      pageSubtitle,
      unreadCount,
      handleSearch,
      markAsRead,
      markAllAsRead,
      getNotificationIcon,
      formatTime
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.header-title {
  min-width: 0;
}

.title-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.subtitle-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  margin-top: 0.25rem;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--form-bg);
  border: 1px solid var(--form-border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  min-width: 300px;
  transition: all 0.2s ease;
}

.search-active {
  border-color: var(--form-border-focus);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-tertiary);
  margin-right: 0.5rem;
}

.search-input {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  flex: 1;
}

.search-input::placeholder {
  color: var(--form-placeholder);
}

.notification-container,
.user-menu-container {
  position: relative;
}

.header-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  position: relative;
}

.header-button:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: var(--status-error-text);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-dropdown,
.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  min-width: 320px;
  max-height: 400px;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--brand-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mark-read-btn:hover {
  color: var(--brand-accent);
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: var(--interactive-tertiary);
}

.notification-item.unread {
  background: var(--interactive-secondary);
}

.notification-icon {
  color: var(--brand-primary);
  margin-top: 0.125rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.notification-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.notification-time {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

.dropdown-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-primary);
  text-align: center;
}

.view-all-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: var(--brand-accent);
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.user-menu-trigger:hover {
  background: var(--interactive-tertiary);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.user-avatar-large {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin: 0 0 0.5rem 0;
}

.user-role-badge {
  display: inline-block;
  background: var(--interactive-secondary);
  color: var(--brand-primary);
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.menu-divider {
  height: 1px;
  background: var(--border-primary);
  margin: 0.5rem 0;
}

.user-menu-nav {
  padding: 0.5rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
}

.menu-item:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.logout-button {
  color: var(--status-error-text);
}

.logout-button:hover {
  background: var(--status-error);
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }
  
  .search-box {
    min-width: 200px;
  }
  
  .title-text {
    font-size: 1.25rem;
  }
  
  .subtitle-text {
    display: none;
  }
  
  .notifications-dropdown,
  .user-menu-dropdown {
    min-width: 280px;
  }
}

@media (min-width: 1024px) {
  .sidebar-toggle {
    display: none;
  }
}
</style>