<template>
  <div class="user-switcher" :class="{ 'is-open': isOpen }">
    <!-- Main Toggle Button -->
    <button 
      @click="toggleMenu" 
      class="switcher-toggle"
      :class="{ 'is-active': isOpen }"
      title="Switch User Role"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span class="switcher-badge">{{ userStore.userRoleDisplay.charAt(0) }}</span>
    </button>

    <!-- User Options Menu -->
    <transition name="slide-up">
      <div v-if="isOpen" class="switcher-menu">
        <div class="menu-header">
          <h4>Switch User Role</h4>
          <p class="current-user">Current: {{ userStore.userRoleDisplay }}</p>
        </div>
        
        <div class="user-options">
          <button 
            @click="switchToUser('student')"
            class="user-option"
            :class="{ 'is-active': userStore.isStudent }"
          >
            <div class="user-icon">👨‍🎓</div>
            <div class="user-info">
              <div class="user-name">Student</div>
              <div class="user-description">Access courses and assignments</div>
            </div>
            <div class="user-check" v-if="userStore.isStudent">✓</div>
          </button>

          <button 
            @click="switchToUser('teacher')"
            class="user-option"
            :class="{ 'is-active': userStore.isTeacher }"
          >
            <div class="user-icon">👨‍🏫</div>
            <div class="user-info">
              <div class="user-name">Teacher</div>
              <div class="user-description">Create courses and manage students</div>
            </div>
            <div class="user-check" v-if="userStore.isTeacher">✓</div>
          </button>

          <button 
            @click="switchToUser('admin')"
            class="user-option"
            :class="{ 'is-active': userStore.isAdmin }"
          >
            <div class="user-icon">👨‍💼</div>
            <div class="user-info">
              <div class="user-name">Administrator</div>
              <div class="user-description">Full system access</div>
            </div>
            <div class="user-check" v-if="userStore.isAdmin">✓</div>
          </button>
        </div>

        <div class="menu-footer">
          <button @click="logout" class="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay -->
    <div 
      v-if="isOpen" 
      @click="closeMenu" 
      class="switcher-overlay"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

const router = useRouter()
const userStore = useUserStore()
const isOpen = ref(false)

// Mock user data for different roles
const mockUsers = {
  student: {
    id: 1,
    name: 'Kwame Student',
    email: 'kwame.student@ityouth.com',
    role: 'student',
    avatar: null,
    modules: ['courses']
  },
  teacher: {
    id: 2,
    name: 'Dr. Yaa Teacher',
    email: 'yaa.teacher@ityouth.com',
    role: 'teacher',
    avatar: null,
    modules: ['courses', 'teaching']
  },
  admin: {
    id: 3,
    name: 'Admin User',
    email: 'admin@ityouth.com',
    role: 'admin',
    avatar: null,
    modules: ['courses', 'teaching', 'admin']
  }
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const switchToUser = async (role) => {
  try {
    // Set mock user data
    const mockUser = mockUsers[role]
    
    // Update user store with mock data
    userStore.currentUser = mockUser
    userStore.isLoading = false
    userStore.error = null
    
    // Close menu
    closeMenu()
    
    // Navigate to appropriate dashboard
    if (role === 'teacher' || role === 'admin') {
      router.push('/teacher/dashboard')
    } else {
      router.push('/student/dashboard')
    }
    
    console.log(`Switched to ${role} role:`, mockUser)
  } catch (error) {
    console.error('Error switching user:', error)
  }
}

const logout = async () => {
  try {
    await userStore.logout()
    closeMenu()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Close menu on ESC key
const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
})
</script>

<style scoped>
.user-switcher {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.switcher-toggle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--interactive-primary);
  border: 2px solid var(--bg-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}

.switcher-toggle:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.switcher-toggle.is-active {
  background: var(--status-error-text);
  transform: rotate(45deg);
}

.switcher-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: var(--brand-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--bg-primary);
  border: 2px solid var(--bg-primary);
}

.switcher-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  min-width: 280px;
}

.menu-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}

.menu-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.current-user {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.user-options {
  padding: 0.5rem;
}

.user-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.user-option:hover {
  background: var(--interactive-tertiary-hover);
}

.user-option.is-active {
  background: var(--interactive-secondary);
  color: var(--interactive-primary);
}

.user-icon {
  font-size: 1.5rem;
  width: 32px;
  text-align: center;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.user-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.user-option.is-active .user-description {
  opacity: 1;
}

.user-check {
  color: var(--status-success-text);
  font-weight: 600;
}

.menu-footer {
  padding: 0.5rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--status-error-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn:hover {
  background: var(--status-error);
  color: white;
}

.switcher-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: -1;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
  transform-origin: bottom right;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .user-switcher {
    bottom: 1rem;
    right: 1rem;
  }
  
  .switcher-toggle {
    width: 48px;
    height: 48px;
  }
  
  .switcher-menu {
    width: 280px;
    min-width: 240px;
  }
}
</style>