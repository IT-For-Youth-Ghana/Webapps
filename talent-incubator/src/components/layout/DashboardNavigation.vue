<script setup>
import { ref, computed } from 'vue'
import ThemeToggle from '../common/ThemeToggle.vue'

const props = defineProps({
  userRole: {
    type: String,
    required: true,
    validator: (value) => ['student', 'admin', 'company'].includes(value)
  },
  currentView: {
    type: String,
    default: 'dashboard'
  },
  userName: {
    type: String,
    default: 'User'
  }
})

const emit = defineEmits(['navigate', 'logout'])

const isMobileMenuOpen = ref(false)

const navigationItems = computed(() => {
  if (props.userRole === 'student') {
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { id: 'jobs', label: 'Browse Jobs', path: '/jobs' },
      { id: 'applications', label: 'My Applications', path: '/applications' },
      { id: 'profile', label: 'Profile', path: '/profile' }
    ]
  } else if (props.userRole === 'company') {
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { id: 'my-jobs', label: 'My Job Posts', path: '/my-jobs' },
      { id: 'applications', label: 'Applications', path: '/applications' }
    ]
  } else {
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { id: 'jobs', label: 'Manage Jobs', path: '/jobs' },
      { id: 'applications', label: 'Applications', path: '/applications' },
      { id: 'students', label: 'Students', path: '/students' },
      { id: 'analytics', label: 'Analytics', path: '/analytics' }
    ]
  }
})

const handleNavigation = (item) => {
  emit('navigate', item.id)
  isMobileMenuOpen.value = false
}

const handleLogout = () => {
  emit('logout')
  isMobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <nav class="dashboard-nav">
    <div class="nav-container">
      <!-- Brand Section -->
      <div class="nav-brand">
        <img src="/logo/logo.png" alt="Logo" class="brand-logo">
        <span class="brand-subtitle">{{ userRole === 'admin' ? 'Admin Portal' : userRole === 'company' ? 'Company Portal' : 'Student Portal' }}</span>
      </div>

      <!-- Desktop Navigation -->
      <div class="nav-menu desktop-menu">
        <div class="nav-items">
          <button
            v-for="item in navigationItems"
            :key="item.id"
            @click="handleNavigation(item)"
            :class="[
              'nav-item',
              { 'nav-item-active': currentView === item.id }
            ]"
          >
            {{ item.label }}
          </button>
        </div>

        <!-- User Menu -->
        <div class="user-menu">
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <div class="user-info">
            <div class="user-avatar">
              {{ userName.charAt(0).toUpperCase() }}
            </div>
            <div class="user-details mobile-hidden">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRole }}</span>
            </div>
          </div>
          <div class="user-dropdown">
            <button @click="handleLogout" class="logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-toggle" @click="toggleMobileMenu">
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-nav" :class="{ 'mobile-nav-open': isMobileMenuOpen }">
      <div class="mobile-nav-content">
        <div class="mobile-user-info">
          <div class="user-avatar large">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>

        <div class="mobile-nav-items">
          <button
            v-for="item in navigationItems"
            :key="item.id"
            @click="handleNavigation(item)"
            :class="[
              'mobile-nav-item',
              { 'mobile-nav-item-active': currentView === item.id }
            ]"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="mobile-nav-footer">
          <button @click="handleLogout" class="mobile-logout-btn">
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay" 
      @click="toggleMobileMenu"
    ></div>
  </nav>
</template>

<style scoped>
.dashboard-nav {
  background: var(--bg-secondary, rgba(22, 27, 34, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary, #30363D);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  height: 2.5rem;
  width: auto;
  object-fit: contain;
}

.brand-subtitle {
  font-size: 0.6875rem;
  color: var(--text-secondary, #8fb2d6);
  font-weight: 500;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: color 0.3s ease;
}

.desktop-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-item {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-disabled, #8B949E);
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-item:hover {
  background: var(--interactive-secondary-hover, rgba(143, 178, 214, 0.1));
  color: var(--text-primary, #ffffff);
}

.nav-item-active {
  background: var(--interactive-secondary, rgba(27, 101, 178, 0.1));
  color: var(--interactive-primary, #1b65b2);
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--interactive-primary, #1b65b2), var(--text-secondary, #8fb2d6));
  color: var(--text-inverse, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.user-avatar.large {
  width: 3rem;
  height: 3rem;
  font-size: 1.125rem;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  line-height: 1;
  transition: color 0.3s ease;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-disabled, #8B949E);
  text-transform: capitalize;
  line-height: 1;
  transition: color 0.3s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-tertiary, #21262D);
  border: 1px solid var(--border-primary, #30363D);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  min-width: 8rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.5rem);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--status-error-text, #FF453A);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.logout-btn:hover {
  background: var(--status-error, rgba(255, 69, 58, 0.1));
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.hamburger-line {
  width: 1.25rem;
  height: 2px;
  background: var(--text-disabled, #8B949E);
  border-radius: 1px;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(0.3125rem, 0.3125rem);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(0.3125rem, -0.3125rem);
}

.mobile-nav {
  position: fixed;
  top: 4rem;
  right: 0;
  width: 20rem;
  max-width: 90vw;
  height: calc(100vh - 4rem);
  background: var(--bg-secondary, #161B22);
  border-left: 1px solid var(--border-primary, #30363D);
  transform: translateX(100%);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  overflow-y: auto;
}

.mobile-nav-open {
  transform: translateX(0);
}

.mobile-nav-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.05));
  border-radius: 0.75rem;
  border: 1px solid var(--border-primary, #30363D);
}

.mobile-nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  background: none;
  border: none;
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-disabled, #8B949E);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav-item:hover {
  background: var(--interactive-secondary-hover, rgba(143, 178, 214, 0.1));
  color: var(--text-primary, #ffffff);
}

.mobile-nav-item-active {
  background: var(--interactive-secondary, rgba(27, 101, 178, 0.1));
  color: var(--interactive-primary, #1b65b2);
}

.mobile-nav-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary, #30363D);
}

.mobile-logout-btn {
  width: 100%;
  background: var(--status-error, rgba(255, 69, 58, 0.1));
  border: 1px solid var(--status-error-border, rgba(255, 69, 58, 0.2));
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--status-error-text, #FF453A);
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-logout-btn:hover {
  background: rgba(255, 69, 58, 0.15);
}

.mobile-overlay {
  position: fixed;
  top: 4rem;
  left: 0;
  width: 100vw;
  height: calc(100vh - 4rem);
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

@media (max-width: 1024px) {
  .desktop-menu {
    display: none;
  }
  
  .mobile-toggle {
    display: flex;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .mobile-nav {
    width: 100vw;
    max-width: none;
  }
}
</style>