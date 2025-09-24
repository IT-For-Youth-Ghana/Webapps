<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  userRole: {
    type: String,
    default: 'guest'
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  currentRoute: {
    type: String,
    default: '/'
  }
})

const emit = defineEmits(['navigate', 'logout'])

const isMobileMenuOpen = ref(false)

const navigationItems = computed(() => {
  const baseItems = [
    { name: 'Home', path: '/', show: true },
    { name: 'About', path: '/about', show: !props.isAuthenticated }
  ]

  if (!props.isAuthenticated) {
    return [
      ...baseItems,
      { name: 'Login', path: '/login', show: true },
      { name: 'Register', path: '/register', show: true }
    ]
  }

  if (props.userRole === 'student') {
    return [
      { name: 'Dashboard', path: '/student/dashboard', show: true },
      { name: 'Browse Jobs', path: '/student/jobs', show: true },
      { name: 'My Applications', path: '/student/applications', show: true },
      { name: 'Profile', path: '/student/profile', show: true }
    ]
  }

  if (props.userRole === 'admin') {
    return [
      { name: 'Dashboard', path: '/admin/dashboard', show: true },
      { name: 'Manage Jobs', path: '/admin/jobs', show: true },
      { name: 'Applications', path: '/admin/applications', show: true },
      { name: 'Students', path: '/admin/students', show: true }
    ]
  }

  return baseItems
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleNavigation = (path) => {
  emit('navigate', path)
  isMobileMenuOpen.value = false
}

const handleLogout = () => {
  emit('logout')
  isMobileMenuOpen.value = false
}
</script>

<template>
  <nav class="navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <h1 class="brand-title">IT Youth Ghana</h1>
        <span class="brand-subtitle">Talent Incubator</span>
      </div>

      <div class="nav-menu" :class="{ 'mobile-open': isMobileMenuOpen }">
        <div class="nav-items">
          <button
            v-for="item in navigationItems.filter(item => item.show)"
            :key="item.path"
            @click="handleNavigation(item.path)"
            :class="[
              'nav-item',
              { 'nav-item-active': currentRoute === item.path }
            ]"
          >
            {{ item.name }}
          </button>
        </div>

        <div v-if="isAuthenticated" class="nav-user">
          <div class="user-menu">
            <button class="user-avatar">
              <div class="avatar-circle">
                {{ userRole === 'admin' ? 'A' : 'S' }}
              </div>
            </button>
            <div class="user-dropdown">
              <button @click="handleNavigation('/profile')" class="dropdown-item">
                Profile Settings
              </button>
              <button @click="handleLogout" class="dropdown-item logout">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <button class="mobile-toggle" @click="toggleMobileMenu">
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
      </button>
    </div>
  </nav>
</template>



<style scoped>
.navigation {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 122, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.nav-brand {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #007aff;
  margin: 0;
  line-height: 1;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  line-height: 1;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(0, 122, 255, 0.08);
  color: #007aff;
}

.nav-item-active {
  background: #007aff;
  color: white;
}

.nav-user {
  position: relative;
}

.user-menu {
  position: relative;
}

.user-avatar {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.avatar-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #007aff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid rgba(0, 122, 255, 0.1);
  transition: transform 0.2s ease;
}

.user-avatar:hover .avatar-circle {
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-width: 10rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.5rem);
  transition: all 0.2s ease;
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item:first-child {
  border-radius: 0.75rem 0.75rem 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 0.75rem 0.75rem;
}

.dropdown-item.logout {
  color: #ef4444;
  border-top: 1px solid #f3f4f6;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
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
  width: 1.5rem;
  height: 2px;
  background: #374151;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(0.375rem, 0.375rem);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(0.375rem, -0.375rem);
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 4rem;
    left: 0;
    width: 100%;
    background: white;
    flex-direction: column;
    gap: 0;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-menu.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-items {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .nav-item {
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
  }

  .nav-user {
    width: 100%;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .user-dropdown {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border: none;
    background: transparent;
  }
}
</style>
