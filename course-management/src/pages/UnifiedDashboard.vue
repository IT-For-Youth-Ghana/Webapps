<template>
  <div class="unified-dashboard">
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="welcome-title">
          Welcome back, {{ userStore.currentUser?.name || 'User' }}! 👋
        </h1>
        <p class="welcome-subtitle">
          You're currently logged in as <strong>{{ userStore.userRoleDisplay }}</strong>
        </p>
      </div>
      
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.totalCourses }}</div>
          <div class="stat-label">Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.totalStudents }}</div>
          <div class="stat-label">Students</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.avgRating }}</div>
          <div class="stat-label">Rating</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Quick Navigation -->
      <section class="quick-nav-section">
        <QuickNavigation />
      </section>

      <!-- Recent Activity -->
      <section class="activity-section">
        <div class="section-header">
          <h2 class="section-title">Recent Activity</h2>
          <button @click="refreshActivity" class="refresh-btn" :disabled="isRefreshing">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            Refresh
          </button>
        </div>

        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <svg v-if="activity.type === 'course'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <svg v-else-if="activity.type === 'assignment'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <svg v-else-if="activity.type === 'grade'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <svg v-else-if="activity.type === 'system'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M1 12h6m6 0h6"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-message">{{ activity.message }}</div>
              <div class="activity-meta">
                <span class="activity-role">{{ activity.role }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
            <div v-if="activity.action" class="activity-action">
              <router-link :to="activity.action.to" class="action-btn">
                {{ activity.action.label }}
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="quick-actions-grid">
          <button 
            v-for="action in quickActions" 
            :key="action.id"
            @click="handleQuickAction(action)"
            class="quick-action-btn"
            :class="action.type"
          >
            <!-- Plus Icon -->
            <svg v-if="action.icon === 'Plus'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            
            <!-- Upload Icon -->
            <svg v-else-if="action.icon === 'Upload'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            
            <!-- Document Icon -->
            <svg v-else-if="action.icon === 'Document'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            
            <!-- Users Icon -->
            <svg v-else-if="action.icon === 'Users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            
            <span>{{ action.label }}</span>
          </button>
        </div>
      </section>

      <!-- Role Information -->
      <section class="role-info-section">
        <div class="role-info-card">
          <h3>Current Role: {{ userStore.userRoleDisplay }}</h3>
          <p v-if="userStore.isAdmin">
            As an administrator, you have access to all features across the platform. You can manage users, courses, and view system analytics.
          </p>
          <p v-else-if="userStore.isTeacher">
            As a teacher, you can create and manage courses, grade assignments, and track student progress. Use the role switcher to experience other perspectives.
          </p>
          <p v-else-if="userStore.isStudent">
            As a student, you can enroll in courses, submit assignments, and track your learning progress. Try switching roles to explore teacher and admin features.
          </p>
          <div class="role-demo-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Demo Mode: Use the role switcher in the bottom-right corner to explore different user roles</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import QuickNavigation from '@shared/ui-components/components/QuickNavigation.vue'

const router = useRouter()
const userStore = useUserStore()

// Reactive state
const isRefreshing = ref(false)
const recentActivity = ref([])

// Mock dashboard stats
const dashboardStats = computed(() => {
  if (userStore.isAdmin) {
    return {
      totalCourses: 24,
      totalStudents: 487,
      avgRating: 4.8
    }
  } else if (userStore.isTeacher) {
    return {
      totalCourses: 8,
      totalStudents: 247,
      avgRating: 4.9
    }
  } else {
    return {
      totalCourses: 5,
      totalStudents: 0,
      avgRating: 0
    }
  }
})

// Quick actions based on role
const quickActions = computed(() => {
  const actions = []
  
  if (userStore.isAdmin || userStore.isTeacher) {
    actions.push(
      {
        id: 'create-course',
        label: 'Create Course',
        icon: 'Plus',
        type: 'primary',
        action: () => router.push('/teacher/create-course')
      },
      {
        id: 'manage-materials',
        label: 'Upload Materials',
        icon: 'Upload',
        type: 'secondary',
        action: () => router.push('/teacher/materials')
      },
      {
        id: 'create-assignment',
        label: 'New Assignment',
        icon: 'Document',
        type: 'secondary',
        action: () => router.push('/teacher/assignments')
      }
    )
  }
  
  if (userStore.isAdmin) {
    actions.push(
      {
        id: 'manage-users',
        label: 'Manage Users',
        icon: 'Users',
        type: 'admin',
        action: () => router.push('/admin/users')
      }
    )
  }
  
  return actions
})

// Methods
const refreshActivity = async () => {
  isRefreshing.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    loadRecentActivity()
  } finally {
    isRefreshing.value = false
  }
}

const loadRecentActivity = () => {
  const activities = []
  
  if (userStore.isAdmin || userStore.isTeacher) {
    activities.push(
      {
        id: 1,
        type: 'course',
        message: 'New student enrolled in Web Development Fundamentals',
        role: 'Teacher',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        action: {
          label: 'View Course',
          to: '/teacher/courses'
        }
      },
      {
        id: 2,
        type: 'assignment',
        message: '5 new assignment submissions need grading',
        role: 'Teacher',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: {
          label: 'Grade Now',
          to: '/teacher/grading'
        }
      }
    )
  }
  
  if (userStore.isStudent) {
    activities.push(
      {
        id: 3,
        type: 'grade',
        message: 'Your assignment was graded: 95/100',
        role: 'Student',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        action: {
          label: 'View Feedback',
          to: '/student/assignments'
        }
      }
    )
  }
  
  if (userStore.isAdmin) {
    activities.push(
      {
        id: 4,
        type: 'system',
        message: 'System performance: All services operational',
        role: 'Admin',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    )
  }
  
  recentActivity.value = activities.sort((a, b) => b.timestamp - a.timestamp)
}

const handleQuickAction = (action) => {
  action.action()
}

const getActivityIcon = (type) => {
  const icons = {
    course: 'CourseIcon',
    assignment: 'AssignmentIcon', 
    grade: 'GradeIcon',
    system: 'SystemIcon'
  }
  return icons[type] || 'InfoIcon'
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

// Lifecycle
onMounted(() => {
  loadRecentActivity()
})
</script>

<style scoped>
.unified-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.welcome-section {
  flex: 1;
}

.welcome-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.welcome-subtitle strong {
  color: var(--primary);
  font-weight: 600;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  min-width: 80px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.813rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.quick-nav-section {
  /* QuickNavigation handles its own styling */
}

.activity-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary);
  color: var(--primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--border-hover);
  transform: translateX(2px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.course {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.activity-icon.assignment {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.activity-icon.grade {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.activity-icon.system {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.activity-role {
  font-weight: 500;
}

.activity-action {
  flex-shrink: 0;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--primary-hover);
}

.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}

.quick-action-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.role-info-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.role-info-card {
  max-width: 600px;
}

.role-info-card h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.role-info-card p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.role-demo-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  color: var(--primary);
  font-size: 0.875rem;
}

.role-demo-note svg {
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .unified-dashboard {
    gap: 1.5rem;
  }
  
  .dashboard-header {
    padding: 1.5rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .header-stats {
    gap: 1rem;
  }
  
  .stat-card {
    min-width: 60px;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .activity-action {
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
    text-align: center;
    padding: 0.5rem 1rem;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .activity-section,
  .quick-actions-section,
  .role-info-section {
    padding: 1rem;
  }
  
  .role-demo-note {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
}
</style>