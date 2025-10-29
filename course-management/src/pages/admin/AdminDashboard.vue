<template>
  <div class="unified-dashboard">
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="welcome-title">
          Welcome back, {{ userStore.currentUser?.name || 'Admin' }}!
        </h1>
        <p class="welcome-subtitle">
          You're currently logged in as <strong>System Administrator</strong>
        </p>
      </div>
      
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.totalCourses }}</div>
          <div class="stat-label">Total Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.systemHealth }}%</div>
          <div class="stat-label">System Health</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ dashboardStats.activeSessions }}</div>
          <div class="stat-label">Active Sessions</div>
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
          <h2 class="section-title">System Activity</h2>
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
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id" 
            class="activity-item"
            :class="activity.type"
          >
            <div class="activity-icon">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
            <div class="activity-status" :class="activity.status">
              {{ getActivityStatus(activity.status) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Admin Quick Actions -->
      <section class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Admin Quick Actions</h2>
        </div>

        <div class="quick-actions-grid">
          <button 
            v-for="action in quickActions" 
            :key="action.id"
            @click="executeAction(action)"
            class="quick-action-btn"
            :class="action.type"
          >
            <!-- User Management Icon -->
            <svg v-if="action.icon === 'Users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            
            <!-- Settings Icon -->
            <svg v-else-if="action.icon === 'Settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 8.04l4.24 4.24M20.46 15.96l-4.24-4.24M7.04 20.46l-4.24-4.24"/>
            </svg>
            
            <!-- Shield Icon -->
            <svg v-else-if="action.icon === 'Shield'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            
            <!-- Database Icon -->
            <svg v-else-if="action.icon === 'Database'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            
            <!-- Chart Icon -->
            <svg v-else-if="action.icon === 'Chart'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            
            <span>{{ action.label }}</span>
          </button>
        </div>
      </section>

      <!-- System Statistics -->
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Platform Statistics</h2>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card-detailed">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
              <div class="stat-trend positive">+{{ platformStats.userGrowth }}% this month</div>
            </div>
          </div>
          
          <div class="stat-card-detailed">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.totalCourses }}</div>
              <div class="stat-label">Active Courses</div>
              <div class="stat-trend positive">+{{ platformStats.courseGrowth }}% this month</div>
            </div>
          </div>
          
          <div class="stat-card-detailed">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.avgCompletionTime }}h</div>
              <div class="stat-label">Avg. Completion Time</div>
              <div class="stat-trend negative">-{{ platformStats.timeImprovement }}% vs last month</div>
            </div>
          </div>
          
          <div class="stat-card-detailed">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.successRate }}%</div>
              <div class="stat-label">Success Rate</div>
              <div class="stat-trend positive">+{{ platformStats.successImprovement }}% improvement</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Role Information -->
      <section class="role-info-section">
        <div class="role-info-card">
          <h3>Administrator Privileges</h3>
          <p>
            As a System Administrator, you have full access to all platform features. You can manage users, courses, system settings, and monitor platform health. Use your privileges responsibly to maintain the integrity and security of the learning platform.
          </p>
          <div class="role-demo-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Use the User Switcher (bottom-right) to experience other user perspectives</span>
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

// Mock admin dashboard stats
const dashboardStats = computed(() => ({
  totalUsers: 1247,
  totalCourses: 89,
  systemHealth: 98,
  activeSessions: 423
}))

// Mock platform statistics
const platformStats = ref({
  totalUsers: 1247,
  userGrowth: 12.5,
  totalCourses: 89,
  courseGrowth: 8.3,
  avgCompletionTime: 42,
  timeImprovement: 15.2,
  successRate: 94,
  successImprovement: 3.7
}))

// Admin quick actions
const quickActions = ref([
  {
    id: 'manage-users',
    label: 'Manage Users',
    icon: 'Users',
    type: 'primary',
    action: () => router.push('/admin/users')
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: 'Settings',
    type: 'secondary',
    action: () => console.log('Navigate to system settings')
  },
  {
    id: 'security-audit',
    label: 'Security Audit',
    icon: 'Shield',
    type: 'secondary',
    action: () => console.log('Navigate to security audit')
  },
  {
    id: 'database-backup',
    label: 'Database Backup',
    icon: 'Database',
    type: 'secondary',
    action: () => console.log('Navigate to database backup')
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'Chart',
    type: 'secondary',
    action: () => console.log('Navigate to analytics')
  }
])

// Mock recent activity
const recentActivity = ref([
  {
    id: 1,
    type: 'user',
    title: 'New User Registration',
    description: 'Student "Ama Boateng" registered from Accra',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    status: 'success'
  },
  {
    id: 2,
    type: 'course',
    title: 'Course Created',
    description: 'Teacher "Dr. Kofi Ansah" created "Advanced JavaScript"',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    status: 'success'
  },
  {
    id: 3,
    type: 'system',
    title: 'System Backup Completed',
    description: 'Automatic daily backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'success'
  },
  {
    id: 4,
    type: 'security',
    title: 'Security Alert',
    description: 'Multiple failed login attempts detected from Kumasi',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: 'warning'
  },
  {
    id: 5,
    type: 'performance',
    title: 'Performance Optimization',
    description: 'Database indexes optimized for faster queries',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: 'success'
  }
])

// Methods
const refreshActivity = async () => {
  isRefreshing.value = true
  // Simulate API call
  setTimeout(() => {
    isRefreshing.value = false
    console.log('Activity refreshed')
  }, 1000)
}

const executeAction = (action) => {
  action.action()
}

const getActivityIcon = (type) => {
  return ''
}

const getActivityStatus = (status) => {
  const statuses = {
    success: 'Active',
    warning: 'Warning',
    error: 'Error',
    info: 'Info'
  }
  return statuses[status] || 'Status'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Initialize activity on mount
onMounted(() => {
  console.log('Admin Dashboard mounted')
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}

.welcome-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  min-width: 100px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--interactive-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.quick-nav-section {
  grid-column: 1 / -1;
}

.activity-section {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--interactive-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--interactive-tertiary-hover);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.activity-status {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.quick-action-btn.primary {
  background: var(--interactive-primary);
  color: var(--text-inverse);
}

.quick-action-btn.primary:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.quick-action-btn.secondary {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.quick-action-btn.secondary:hover {
  background: var(--interactive-tertiary-hover);
  transform: translateY(-1px);
}

.stats-section {
  grid-column: 1 / -1;
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card-detailed {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
}

.stat-card-detailed:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.stat-trend.positive {
  color: var(--status-success-text);
}

.stat-trend.negative {
  color: var(--status-warning-text);
}

.role-info-section {
  grid-column: 1 / -1;
}

.role-info-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid var(--border-primary);
}

.role-info-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.role-info-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.role-demo-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--interactive-secondary);
  border-radius: 0.5rem;
  color: var(--interactive-primary);
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .header-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .header-stats {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-section h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>