<template>
  <header class="nav-header glass-card">
    <div class="nav-container">
      <!-- Logo & Brand -->
      <div class="nav-brand">
        <div class="logo">
          <span class="logo-icon">🚀</span>
          <span class="logo-text">
            {{ currentPlatform === 'incubator' ? 'Talent Incubator' : 'Course Management' }}
          </span>
        </div>
      </div>
      
      <!-- Platform Switcher -->
      <div class="platform-switcher">
        <button 
          class="platform-btn"
          :class="{ active: currentPlatform === 'incubator' }"
          @click="$emit('switch-platform', 'incubator')"
        >
          <span class="platform-icon">💼</span>
          <span class="platform-label">Jobs</span>
        </button>
        <button 
          class="platform-btn"
          :class="{ active: currentPlatform === 'courses' }"
          @click="$emit('switch-platform', 'courses')"
        >
          <span class="platform-icon">📚</span>
          <span class="platform-label">Courses</span>
        </button>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="nav-menu" :class="{ 'mobile-open': mobileMenuOpen }">
        <ul class="nav-list">
          <li v-for="item in navigationItems" :key="item.path">
            <a 
              :href="item.path"
              class="nav-link"
              :class="{ active: isCurrentPath(item.path) }"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <!-- User Actions -->
      <div class="user-actions">
        <!-- Theme Toggle -->
        <button 
          class="theme-toggle-btn btn btn-secondary"
          @click="$emit('toggle-theme')"
          :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        >
          <span class="theme-icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
        </button>
        
        <!-- User Menu -->
        <div class="user-menu" v-if="user" @click="toggleUserMenu">
          <button class="user-btn btn btn-secondary">
            <span class="user-avatar">{{ getUserInitials(user.name) }}</span>
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ formatRole(user.role) }}</span>
          </button>
          
          <div class="user-dropdown" v-if="userMenuOpen">
            <div class="user-info">
              <p class="user-email">{{ user.email }}</p>
              <p class="user-modules">Access: {{ getUserModules(user.modules).join(', ') }}</p>
            </div>
            <div class="user-actions-list">
              <a href="/profile" class="user-action-link">
                <span class="action-icon">👤</span>
                Profile
              </a>
              <a href="/settings" class="user-action-link">
                <span class="action-icon">⚙️</span>
                Settings
              </a>
              <button @click="logout" class="user-action-link logout-btn">
                <span class="action-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <!-- Login Button -->
        <a href="/login" class="btn btn-primary" v-else>
          Login
        </a>
      </div>
      
      <!-- Mobile Menu Toggle -->
      <button 
        class="mobile-nav-toggle"
        @click="toggleMobileMenu"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle navigation menu"
      >
        <span class="hamburger-line" v-if="!mobileMenuOpen"></span>
        <span class="close-icon" v-else>✕</span>
      </button>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'NavigationBar',
  props: {
    user: {
      type: Object,
      default: null
    },
    currentPlatform: {
      type: String,
      default: 'incubator'
    },
    theme: {
      type: String,
      default: 'dark'
    }
  },
  emits: ['toggle-theme', 'switch-platform'],
  setup(props) {
    const mobileMenuOpen = ref(false)
    const userMenuOpen = ref(false)
    
    // Navigation items based on platform
    const navigationItems = computed(() => {
      const baseUrl = props.currentPlatform === 'incubator' ? '/talent' : '/courses'
      
      if (props.currentPlatform === 'incubator') {
        return [
          { path: `${baseUrl}/dashboard`, label: 'Dashboard', icon: '📊' },
          { path: `${baseUrl}/jobs`, label: 'Jobs', icon: '💼' },
          { path: `${baseUrl}/applications`, label: 'Applications', icon: '📄' }
        ]
      } else {
        return [
          { path: `${baseUrl}/dashboard`, label: 'Dashboard', icon: '📊' },
          { path: `${baseUrl}/list`, label: 'Courses', icon: '📚' },
          { path: `${baseUrl}/progress`, label: 'Progress', icon: '📈' }
        ]
      }
    })
    
    // Check if current path
    const isCurrentPath = (path) => {
      return window.location.pathname === path
    }
    
    // Get user initials
    const getUserInitials = (name) => {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
    }
    
    // Format role for display
    const formatRole = (role) => {
      const roleMap = {
        student: 'Student',
        admin: 'Administrator',
        teacher: 'Instructor',
        company: 'Company'
      }
      return roleMap[role] || role
    }
    
    // Get user modules for display
    const getUserModules = (modules) => {
      const moduleMap = {
        incubator: 'Jobs',
        courses: 'Courses'
      }
      return modules.map(m => moduleMap[m] || m)
    }
    
    // Toggle mobile menu
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
      if (mobileMenuOpen.value) {
        userMenuOpen.value = false
      }
    }
    
    // Toggle user menu
    const toggleUserMenu = () => {
      userMenuOpen.value = !userMenuOpen.value
    }
    
    // Logout functionality
    const logout = async () => {
      try {
        // Clear local storage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        // Redirect to login
        window.location.href = '/login'
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    
    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        userMenuOpen.value = false
      }
      if (!event.target.closest('.nav-menu') && !event.target.closest('.mobile-nav-toggle')) {
        mobileMenuOpen.value = false
      }
    }
    
    return {
      mobileMenuOpen,
      userMenuOpen,
      navigationItems,
      isCurrentPath,
      getUserInitials,
      formatRole,
      getUserModules,
      toggleMobileMenu,
      toggleUserMenu,
      logout,
      handleClickOutside
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
@import '../styles/shared.css';

.nav-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  border-radius: 0;
  border-left: none;
  border-right: none;
  backdrop-filter: blur(15px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.nav-brand .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--brand-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.platform-switcher {
  display: flex;
  gap: 0.25rem;
  background: var(--glass-bg);
  padding: 0.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.platform-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.platform-btn.active {
  background: var(--brand-primary);
  color: white;
}

.platform-icon {
  font-size: 1rem;
}

.nav-menu {
  flex: 1;
  max-width: 400px;
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  background: var(--glass-bg);
  color: var(--brand-accent);
}

.nav-icon {
  font-size: 1.1rem;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle-btn {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--brand-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.user-name {
  font-weight: 600;
}

.user-role {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  min-width: 200px;
  backdrop-filter: blur(15px);
}

.user-info {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 1rem;
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.user-modules {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.user-action-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background 0.3s ease;
}

.user-action-link:hover {
  background: var(--bg-tertiary);
}

.logout-btn {
  width: 100%;
  border: none;
  background: none;
  color: #ef4444;
  cursor: pointer;
  text-align: left;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.mobile-nav-toggle {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.hamburger-line {
  width: 1.5rem;
  height: 2px;
  background: var(--text-primary);
  position: relative;
  transition: all 0.3s ease;
}

.hamburger-line::before,
.hamburger-line::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 2px;
  background: var(--text-primary);
  transition: all 0.3s ease;
}

.hamburger-line::before {
  top: -6px;
}

.hamburger-line::after {
  top: 6px;
}

.close-icon {
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0.75rem 1rem;
  }
  
  .nav-menu {
    position: fixed;
    top: 0;
    left: -100%;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--glass-border);
    transition: left 0.3s ease;
    z-index: 999;
  }
  
  .nav-menu.mobile-open {
    left: 0;
  }
  
  .nav-list {
    flex-direction: column;
    padding: 5rem 1rem 1rem;
  }
  
  .nav-link {
    padding: 1rem;
  }
  
  .user-actions {
    gap: 0.5rem;
  }
  
  .user-name,
  .user-role {
    display: none;
  }
  
  .mobile-nav-toggle {
    display: flex;
  }
  
  .platform-switcher {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-brand .logo-text {
    display: none;
  }
  
  .theme-toggle-btn {
    width: 2rem;
    height: 2rem;
  }
}

/* PWA Touch Optimizations */
@media (hover: none) {
  .platform-btn:active,
  .nav-link:active,
  .user-btn:active {
    background: var(--bg-tertiary);
  }
}
</style>