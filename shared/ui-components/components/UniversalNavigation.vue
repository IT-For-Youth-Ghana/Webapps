<template>
  <nav class="universal-nav">
    <!-- Main Navigation -->
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
          <!-- Student Navigation -->
          <div v-if="userStore.isStudent || userStore.isAdmin" class="nav-section">
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
              <router-link 
                to="/student/progress" 
                class="nav-link"
                :class="{ active: $route.name === 'StudentProgress' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Progress
              </router-link>
            </div>
          </div>

          <!-- Teacher Navigation -->
          <div v-if="userStore.isTeacher || userStore.isAdmin" class="nav-section">
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
                Course Management
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
                to="/teacher/materials" 
                class="nav-link"
                :class="{ active: $route.name === 'TeacherMaterials' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13,2 13,9 20,9"/>
                  <line x1="13" y1="13" x2="7" y2="13"/>
                  <line x1="13" y1="17" x2="7" y2="17"/>
                </svg>
                Materials
              </router-link>
              <router-link 
                to="/teacher/assignments" 
                class="nav-link"
                :class="{ active: $route.name === 'TeacherAssignments' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Assignments
              </router-link>
              <router-link 
                to="/teacher/grading" 
                class="nav-link"
                :class="{ active: $route.name === 'TeacherGrading' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Grading Center
              </router-link>
              <router-link 
                to="/teacher/analytics" 
                class="nav-link"
                :class="{ active: $route.name === 'TeacherAnalytics' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Analytics
              </router-link>
              <router-link 
                to="/teacher/schedule" 
                class="nav-link"
                :class="{ active: $route.name === 'TeacherSchedule' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Schedule
              </router-link>
              <router-link 
                to="/teacher/announcements" 
                class="nav-link"
                :class="{ active: $route.name === 'TeacherAnnouncements' }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
                </svg>
                Announcements
              </router-link>
            </div>
          </div>

          <!-- Admin Navigation -->
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
                Admin Dashboard
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
                User Management
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
                Course Management
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div class="nav-user">
        <div class="user-info">
          <div class="user-avatar">
            {{ userStore.currentUser?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ userStore.currentUser?.name || 'Guest' }}</div>
            <div class="user-role">{{ userStore.userRoleDisplay }}</div>
          </div>
        </div>
        <div class="user-actions">
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
    </div>

    <!-- Mobile Menu Toggle -->
    <button @click="toggleMobileMenu" class="mobile-menu-toggle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  </nav>

  <!-- Role Switcher (Fixed Bottom Right) -->
  <div class="role-switcher">
    <div class="role-switcher-content">
      <div class="current-role">
        <span class="role-label">Current Role:</span>
        <span class="role-value">{{ userStore.userRoleDisplay }}</span>
      </div>
      <div class="role-buttons">
        <button 
          @click="switchRole('student')"
          :class="['role-btn', { active: userStore.userRole === 'student' }]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Student
        </button>
        <button 
          @click="switchRole('teacher')"
          :class="['role-btn', { active: userStore.userRole === 'teacher' }]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          Teacher
        </button>
        <button 
          @click="switchRole('admin')"
          :class="['role-btn', { active: userStore.userRole === 'admin' }]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Admin
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.store.js'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const switchRole = (role) => {
  userStore.switchRole(role)
  
  // Redirect to appropriate dashboard based on new role
  switch (role) {
    case 'admin':
      router.push('/admin/dashboard')
      break
    case 'teacher':
      router.push('/teacher/dashboard')
      break
    case 'student':
      router.push('/student/dashboard')
      break
    default:
      router.push('/')
  }
}

const toggleMobileMenu = () => {
  // Implement mobile menu toggle logic
  console.log('Toggle mobile menu')
}
</script>

<style scoped>
.universal-nav {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 64px;
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
  font-size: 1.125rem;
}

.brand-logo {
  color: var(--primary);
}

.brand-text {
  color: var(--text-primary);
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-sections {
  display: flex;
  gap: 3rem;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-section-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-link.active {
  background: var(--primary);
  color: white;
}

.nav-link svg {
  flex-shrink: 0;
}

.nav-user {
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.logout-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.mobile-menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
}

/* Role Switcher */
.role-switcher {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.role-switcher-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-role {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}

.role-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.role-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary);
}

.role-buttons {
  display: flex;
  gap: 0.5rem;
}

.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 60px;
}

.role-btn:hover {
  background: var(--bg-primary);
  border-color: var(--primary);
  color: var(--primary);
}

.role-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.role-btn svg {
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-sections {
    gap: 2rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-section {
    align-items: center;
  }
}

@media (max-width: 768px) {
  .nav-header {
    padding: 0 1rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .nav-user {
    gap: 0.5rem;
  }
  
  .user-details {
    display: none;
  }
  
  .role-switcher {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem;
  }
  
  .role-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .role-btn {
    flex-direction: row;
    justify-content: center;
    min-width: auto;
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 640px) {
  .brand-text {
    display: none;
  }
  
  .logout-btn span {
    display: none;
  }
  
  .current-role {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .role-label {
    display: none;
  }
}
</style>