<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ThemeToggle from '../common/ThemeToggle.vue'

const props = defineProps({
  userRole: {
    type: String,
    required: true,
    validator: (value) => ['student', 'admin', 'company'].includes(value)
  },
  userName: {
    type: String,
    default: 'User'
  },
  userAvatar: {
    type: String,
    default: ''
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['logout', 'search'])

const router = useRouter()
const route = useRoute()

// State
const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isScrolled = ref(false)
const searchQuery = ref('')
const isSearchFocused = ref(false)

// Navigation items based on role
const navigationItems = computed(() => {
  const items = {
    student: [
      { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: 'home' },
      { id: 'jobs', label: 'Browse Jobs', path: '/student/jobs', icon: 'briefcase' },
      { id: 'applications', label: 'Applications', path: '/student/applications', icon: 'file-text' },
      { id: 'profile', label: 'Profile', path: '/student/profile', icon: 'user' }
    ],
    company: [
      { id: 'dashboard', label: 'Dashboard', path: '/company/dashboard', icon: 'home' },
      { id: 'my-jobs', label: 'Job Posts', path: '/company/jobs', icon: 'briefcase' },
      { id: 'applications', label: 'Applications', path: '/company/applications', icon: 'users' }
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
      { id: 'jobs', label: 'Jobs', path: '/admin/jobs', icon: 'briefcase' },
      { id: 'applications', label: 'Applications', path: '/admin/applications', icon: 'file-text' },
      { id: 'students', label: 'Users', path: '/admin/users', icon: 'users' },
      { id: 'companies', label: 'Companies', path: '/admin/companies', icon: 'building' }
    ]
  }
  return items[props.userRole] || items.student
})

// Portal label based on role
const portalLabel = computed(() => {
  const labels = {
    student: 'Student Portal',
    company: 'Company Portal',
    admin: 'Admin Portal'
  }
  return labels[props.userRole] || 'Portal'
})

// Role badge color
const roleBadgeClass = computed(() => {
  const classes = {
    student: 'badge-student',
    company: 'badge-company',
    admin: 'badge-admin'
  }
  return classes[props.userRole] || 'badge-student'
})

// Check if nav item is active
const isActive = (path) => route.path === path

// Navigation handler
const handleNavigation = (item) => {
  router.push(item.path)
  isMobileMenuOpen.value = false
  isUserDropdownOpen.value = false
}

// Search handler
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
    // Could navigate to search results page
    // router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

// Logout handler
const handleLogout = () => {
  emit('logout')
  isMobileMenuOpen.value = false
  isUserDropdownOpen.value = false
}

// Toggle handlers
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isUserDropdownOpen.value = false
  }
}

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

// Close dropdown when clicking outside
const closeDropdowns = (event) => {
  const dropdown = document.querySelector('.user-menu-container')
  if (dropdown && !dropdown.contains(event.target)) {
    isUserDropdownOpen.value = false
  }
}

// Scroll handler for header background
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// Get user initials
const userInitials = computed(() => {
  if (!props.userName) return 'U'
  const parts = props.userName.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.userName.substring(0, 2).toUpperCase()
})

// Icon SVG paths
const iconPaths = {
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  building: 'M4 2h16a2 2 0 0 1 2 2v18H2V4a2 2 0 0 1 2-2z M9 22v-4h6v4 M8 6h.01 M16 6h.01 M12 6h.01 M12 10h.01 M12 14h.01 M16 10h.01 M16 14h.01 M8 10h.01 M8 14h.01'
}

const getIconPath = (iconName) => iconPaths[iconName] || iconPaths.home

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeDropdowns)
})
</script>

<template>
  <header class="app-header" :class="{ 'header-scrolled': isScrolled }">
    <div class="header-container">
      <!-- Brand Section -->
      <div class="brand-section">
        <router-link to="/" class="brand-link">
          <div class="brand-logo-wrapper">
            <img
              src="/logo/logo.png"
              alt="IT Youth Ghana"
              class="brand-logo"
            />
            <div class="brand-glow"></div>
          </div>
          <div class="brand-text">
            <span class="brand-name">IT Youth Ghana</span>
            <span class="brand-subtitle">{{ portalLabel }}</span>
          </div>
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <ul class="nav-list">
          <li v-for="item in navigationItems" :key="item.id">
            <button
              @click="handleNavigation(item)"
              class="nav-link"
              :class="{ 'nav-link-active': isActive(item.path) }"
            >
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="getIconPath(item.icon)" />
                </svg>
              </span>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="isActive(item.path)" class="nav-indicator"></span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Right Section -->
      <div class="header-actions">
        <!-- Search Bar (optional - can be toggled) -->
        <div class="search-wrapper" :class="{ 'search-focused': isSearchFocused }">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="search-input"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Theme Toggle -->
        <ThemeToggle class="header-theme-toggle" />

        <!-- Notifications -->
        <button class="notification-btn" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </button>

        <!-- User Menu -->
        <div class="user-menu-container">
          <button
            class="user-menu-trigger"
            @click.stop="toggleUserDropdown"
            :class="{ 'dropdown-open': isUserDropdownOpen }"
          >
            <div class="user-avatar" :class="roleBadgeClass">
              <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="avatar-image" />
              <span v-else class="avatar-initials">{{ userInitials }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role-label" :class="roleBadgeClass">{{ userRole }}</span>
            </div>
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- User Dropdown -->
          <transition name="dropdown">
            <div v-if="isUserDropdownOpen" class="user-dropdown">
              <div class="dropdown-header">
                <div class="dropdown-user-avatar" :class="roleBadgeClass">
                  <span>{{ userInitials }}</span>
                </div>
                <div class="dropdown-user-info">
                  <span class="dropdown-user-name">{{ userName }}</span>
                  <span class="dropdown-user-role" :class="roleBadgeClass">{{ userRole }}</span>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <div class="dropdown-menu">
                <button @click="handleNavigation({ path: `/${userRole}/profile` })" class="dropdown-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>View Profile</span>
                </button>
                <button @click="handleNavigation({ path: `/${userRole}/settings` })" class="dropdown-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Settings</span>
                </button>
              </div>

              <div class="dropdown-divider"></div>

              <button @click="handleLogout" class="dropdown-item dropdown-logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </transition>
        </div>

        <!-- Mobile Menu Toggle -->
        <button
          class="mobile-menu-toggle"
          @click="toggleMobileMenu"
          :class="{ 'menu-open': isMobileMenuOpen }"
          aria-label="Toggle menu"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="mobile-nav-overlay" @click="toggleMobileMenu">
        <nav class="mobile-nav" @click.stop>
          <div class="mobile-nav-header">
            <div class="mobile-user-section">
              <div class="mobile-user-avatar" :class="roleBadgeClass">
                <span>{{ userInitials }}</span>
              </div>
              <div class="mobile-user-info">
                <span class="mobile-user-name">{{ userName }}</span>
                <span class="mobile-user-role" :class="roleBadgeClass">{{ userRole }}</span>
              </div>
            </div>
            <button class="mobile-close-btn" @click="toggleMobileMenu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Mobile Search -->
          <div class="mobile-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="mobile-search-input"
              @keyup.enter="handleSearch"
            />
          </div>

          <ul class="mobile-nav-list">
            <li v-for="item in navigationItems" :key="item.id">
              <button
                @click="handleNavigation(item)"
                class="mobile-nav-link"
                :class="{ 'mobile-nav-link-active': isActive(item.path) }"
              >
                <span class="mobile-nav-label">{{ item.label }}</span>
                <svg v-if="isActive(item.path)" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </li>
          </ul>

          <div class="mobile-nav-footer">
            <div class="mobile-theme-section">
              <span>Theme</span>
              <ThemeToggle />
            </div>
            <button @click="handleLogout" class="mobile-logout-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* ========================================
   CSS Variables & Base Styles
   ======================================== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-secondary, rgba(22, 27, 34, 0.85));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary, rgba(48, 54, 61, 0.5));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-scrolled {
  background: var(--bg-secondary, rgba(22, 27, 34, 0.98));
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--border-primary, rgba(48, 54, 61, 0.3));
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* ========================================
   Brand Section
   ======================================== */
.brand-section {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.brand-link:hover {
  transform: translateY(-1px);
}

.brand-logo-wrapper {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  position: relative;
  z-index: 1;
}

.brand-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, var(--interactive-primary, #1b65b2), var(--accent-secondary, #8fb2d6));
  border-radius: 0.75rem;
  opacity: 0;
  filter: blur(8px);
  transition: opacity 0.3s ease;
  z-index: 0;
}

.brand-link:hover .brand-glow {
  opacity: 0.4;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.brand-subtitle {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--interactive-primary, #1b65b2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

/* ========================================
   Desktop Navigation
   ======================================== */
.desktop-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #8b949e);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  color: var(--text-primary, #ffffff);
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.05));
}

.nav-link-active {
  color: var(--interactive-primary, #1b65b2);
  background: var(--interactive-secondary, rgba(27, 101, 178, 0.1));
}

.nav-icon {
  width: 1.125rem;
  height: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-indicator {
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 2px;
  background: linear-gradient(90deg, var(--interactive-primary, #1b65b2), var(--accent-secondary, #8fb2d6));
  border-radius: 1px;
}

/* ========================================
   Header Actions (Right Side)
   ======================================== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Search */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-tertiary, rgba(33, 38, 45, 0.8));
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 0.5rem;
  padding: 0 0.75rem;
  transition: all 0.2s ease;
}

.search-wrapper:hover,
.search-focused {
  border-color: var(--interactive-primary, #1b65b2);
  background: var(--bg-tertiary, #21262d);
}

.search-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-disabled, #6e7681);
  flex-shrink: 0;
}

.search-input {
  width: 10rem;
  padding: 0.5rem 0.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--text-primary, #ffffff);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-disabled, #6e7681);
}

/* Theme Toggle */
.header-theme-toggle {
  flex-shrink: 0;
}

/* Notifications */
.notification-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: var(--bg-tertiary, rgba(33, 38, 45, 0.8));
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 0.5rem;
  color: var(--text-secondary, #8b949e);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-btn:hover {
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.08));
  color: var(--text-primary, #ffffff);
  border-color: var(--interactive-primary, #1b65b2);
}

.notification-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.25rem;
  background: var(--status-error, #ff453a);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(255, 69, 58, 0.3);
}

/* ========================================
   User Menu
   ======================================== */
.user-menu-container {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem 0.375rem 0.375rem;
  background: var(--bg-tertiary, rgba(33, 38, 45, 0.8));
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-trigger:hover,
.user-menu-trigger.dropdown-open {
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.08));
  border-color: var(--interactive-primary, #1b65b2);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.user-avatar.badge-student {
  background: linear-gradient(135deg, #1b65b2, #4a90d9);
}

.user-avatar.badge-company {
  background: linear-gradient(135deg, #2ea043, #56d364);
}

.user-avatar.badge-admin {
  background: linear-gradient(135deg, #9333ea, #c084fc);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  text-transform: uppercase;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  line-height: 1;
}

.user-role-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  line-height: 1;
}

.user-role-label.badge-student {
  background: rgba(27, 101, 178, 0.2);
  color: #58a6ff;
}

.user-role-label.badge-company {
  background: rgba(46, 160, 67, 0.2);
  color: #3fb950;
}

.user-role-label.badge-admin {
  background: rgba(147, 51, 234, 0.2);
  color: #c084fc;
}

.dropdown-arrow {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary, #8b949e);
  transition: transform 0.2s ease;
}

.dropdown-open .dropdown-arrow {
  transform: rotate(180deg);
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 16rem;
  background: var(--bg-elevated, #161b22);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 0.75rem;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px var(--border-primary, rgba(48, 54, 61, 0.2));
  overflow: hidden;
  z-index: 1001;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-tertiary, rgba(33, 38, 45, 0.5));
}

.dropdown-user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.dropdown-user-role {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  width: fit-content;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-primary, #30363d);
  margin: 0;
}

.dropdown-menu {
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #8b949e);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, #ffffff);
}

.dropdown-item svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.dropdown-logout {
  margin: 0.5rem;
  color: var(--status-error-text, #ff453a);
}

.dropdown-logout:hover {
  background: var(--status-error, rgba(255, 69, 58, 0.1));
  color: var(--status-error-text, #ff453a);
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.95);
}

/* ========================================
   Mobile Menu Toggle
   ======================================== */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 0.3125rem;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.5rem;
  background: var(--bg-tertiary, rgba(33, 38, 45, 0.8));
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.08));
  border-color: var(--interactive-primary, #1b65b2);
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: var(--text-secondary, #8b949e);
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-open .hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.menu-open .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.menu-open .hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ========================================
   Mobile Navigation
   ======================================== */
.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  top: 4rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.mobile-nav {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 20rem;
  height: 100%;
  background: var(--bg-secondary, #161b22);
  border-left: 1px solid var(--border-primary, #30363d);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--border-primary, #30363d);
}

.mobile-user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-user-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.mobile-user-role {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  width: fit-content;
}

.mobile-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--bg-tertiary, #21262d);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 0.5rem;
  color: var(--text-secondary, #8b949e);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-close-btn:hover {
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.08));
  color: var(--text-primary, #ffffff);
}

.mobile-close-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Mobile Search */
.mobile-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary, #21262d);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 0.5rem;
}

.mobile-search .search-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-disabled, #6e7681);
}

.mobile-search-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 0.9375rem;
  color: var(--text-primary, #ffffff);
  outline: none;
}

.mobile-search-input::placeholder {
  color: var(--text-disabled, #6e7681);
}

/* Mobile Nav List */
.mobile-nav-list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0.5rem 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary, #8b949e);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.mobile-nav-link:hover {
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, #ffffff);
}

.mobile-nav-link-active {
  background: var(--interactive-secondary, rgba(27, 101, 178, 0.1));
  color: var(--interactive-primary, #1b65b2);
}

.check-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--interactive-primary, #1b65b2);
}

/* Mobile Nav Footer */
.mobile-nav-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-primary, #30363d);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-theme-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #8b949e);
}

.mobile-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: var(--status-error, rgba(255, 69, 58, 0.1));
  border: 1px solid var(--status-error-border, rgba(255, 69, 58, 0.2));
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--status-error-text, #ff453a);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-logout-btn:hover {
  background: rgba(255, 69, 58, 0.15);
}

.mobile-logout-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Mobile Menu Animation */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-enter-active .mobile-nav,
.mobile-menu-leave-active .mobile-nav {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-nav,
.mobile-menu-leave-to .mobile-nav {
  transform: translateX(100%);
}

/* ========================================
   Responsive Styles
   ======================================== */
@media (max-width: 1024px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .search-wrapper {
    display: none;
  }

  .user-info {
    display: none;
  }

  .dropdown-arrow {
    display: none;
  }

  .user-menu-trigger {
    padding: 0.25rem;
    border-radius: 50%;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
    gap: 0.75rem;
  }

  .brand-text {
    display: none;
  }

  .notification-btn {
    display: none;
  }

  .header-theme-toggle {
    display: none;
  }
}

@media (max-width: 480px) {
  .mobile-nav {
    max-width: 100%;
  }
}
</style>
