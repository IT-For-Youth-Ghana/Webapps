<template>
  <div class="quick-navigation">
    <h3 class="nav-title">Quick Navigation</h3>
    
    <!-- Teacher Navigation -->
    <div v-if="userStore.isTeacher || userStore.isAdmin" class="nav-section">
      <h4 class="nav-section-title">Teacher Tools</h4>
      <div class="nav-grid">
        <router-link to="/teacher/dashboard" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Dashboard</div>
            <div class="nav-description">Overview and stats</div>
          </div>
        </router-link>

        <router-link to="/teacher/courses" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Courses</div>
            <div class="nav-description">Manage courses</div>
          </div>
        </router-link>

        <router-link to="/teacher/create-course" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Create Course</div>
            <div class="nav-description">New course</div>
          </div>
        </router-link>

        <router-link to="/teacher/materials" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13,2 13,9 20,9"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Materials</div>
            <div class="nav-description">Learning resources</div>
          </div>
        </router-link>

        <router-link to="/teacher/assignments" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Assignments</div>
            <div class="nav-description">Create & manage</div>
          </div>
        </router-link>

        <router-link to="/teacher/grading" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Grading</div>
            <div class="nav-description">Grade submissions</div>
          </div>
        </router-link>

        <router-link to="/teacher/analytics" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Analytics</div>
            <div class="nav-description">Performance data</div>
          </div>
        </router-link>

        <router-link to="/teacher/schedule" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Schedule</div>
            <div class="nav-description">Calendar & hours</div>
          </div>
        </router-link>

        <router-link to="/teacher/announcements" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Announcements</div>
            <div class="nav-description">News & updates</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Student Navigation -->
    <div v-if="userStore.isStudent || userStore.isAdmin" class="nav-section">
      <h4 class="nav-section-title">Student Tools</h4>
      <div class="nav-grid">
        <router-link to="/student/dashboard" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Dashboard</div>
            <div class="nav-description">My progress</div>
          </div>
        </router-link>

        <router-link to="/student/courses" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">My Courses</div>
            <div class="nav-description">Enrolled courses</div>
          </div>
        </router-link>

        <router-link to="/student/assignments" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Assignments</div>
            <div class="nav-description">Submit work</div>
          </div>
        </router-link>

        <router-link to="/student/progress" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Progress</div>
            <div class="nav-description">Track learning</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Admin Navigation -->
    <div v-if="userStore.isAdmin" class="nav-section">
      <h4 class="nav-section-title">Admin Tools</h4>
      <div class="nav-grid">
        <router-link to="/admin/dashboard" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Admin Dashboard</div>
            <div class="nav-description">System overview</div>
          </div>
        </router-link>

        <router-link to="/admin/users" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">User Management</div>
            <div class="nav-description">Manage accounts</div>
          </div>
        </router-link>

        <router-link to="/admin/courses" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Course Management</div>
            <div class="nav-description">All courses</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- General Tools -->
    <div class="nav-section">
      <h4 class="nav-section-title">General</h4>
      <div class="nav-grid">
        <router-link to="/" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Home</div>
            <div class="nav-description">Main page</div>
          </div>
        </router-link>

        <button @click="logout" class="nav-item logout-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div class="nav-content">
            <div class="nav-label">Logout</div>
            <div class="nav-description">Sign out</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.quick-navigation {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.nav-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--bg-primary);
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-item.router-link-active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.logout-item {
  border-color: var(--border-hover);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
  color: #dc2626;
}

.nav-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 6px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.nav-item:hover .nav-icon {
  color: var(--primary);
}

.nav-item.router-link-active .nav-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  margin-bottom: 0.125rem;
}

.nav-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.nav-item:hover .nav-description {
  opacity: 1;
}

.nav-item.router-link-active .nav-description {
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .quick-navigation {
    padding: 1rem;
  }
  
  .nav-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-item {
    padding: 0.625rem 0.75rem;
  }
  
  .nav-icon {
    width: 28px;
    height: 28px;
  }
  
  .nav-label {
    font-size: 0.813rem;
  }
  
  .nav-description {
    font-size: 0.688rem;
  }
}

@media (max-width: 640px) {
  .nav-grid {
    gap: 0.5rem;
  }
  
  .nav-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .nav-icon {
    width: 24px;
    height: 24px;
  }
}

/* Animation */
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}
</style>