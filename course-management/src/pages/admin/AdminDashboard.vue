<template>
  <div class="admin-dashboard fade-in">
    <div class="content-wrapper">
      <!-- Welcome Header -->
      <div class="quick-actions-section">
        <div class="section-header">
          <div class="welcome-section">
            <h2 class="section-title">Welcome back, {{ userStore.currentUser?.name || 'Admin' }}!</h2>
            <p class="welcome-subtitle">You're currently logged in as <strong>System Administrator</strong></p>
          </div>
          <button @click="refreshActivity" class="quick-action-btn" :disabled="isRefreshing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
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
      </div>

      <!-- System Overview Stats -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">System Overview</h2>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardStats.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardStats.totalCourses }}</div>
              <div class="stat-label">Total Courses</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🟢</div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardStats.systemHealth }}%</div>
              <div class="stat-label">System Health</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔄</div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardStats.activeSessions }}</div>
              <div class="stat-label">Active Sessions</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Statistics -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Platform Statistics</h2>
        </div>
        <div class="stats-grid detailed">
          <div class="stat-card detailed">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
              <div class="stat-trend positive">+{{ platformStats.userGrowth }}% this month</div>
            </div>
          </div>
          
          <div class="stat-card detailed">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.totalCourses }}</div>
              <div class="stat-label">Active Courses</div>
              <div class="stat-trend positive">+{{ platformStats.courseGrowth }}% this month</div>
            </div>
          </div>
          
          <div class="stat-card detailed">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.avgCompletionTime }}h</div>
              <div class="stat-label">Avg. Completion Time</div>
              <div class="stat-trend negative">-{{ platformStats.timeImprovement }}% vs last month</div>
            </div>
          </div>
          
          <div class="stat-card detailed">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-number">{{ platformStats.successRate }}%</div>
              <div class="stat-label">Success Rate</div>
              <div class="stat-trend positive">+{{ platformStats.successImprovement }}% improvement</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent System Activity -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Recent System Activity</h2>
        </div>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivity.slice(0, 5)" 
            :key="activity.id" 
            class="activity-item"
            :class="activity.type"
          >
            <div class="activity-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
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
      </div>

      <!-- Administrator Information -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Administrator Dashboard</h2>
        </div>
        <div class="role-info">
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const isRefreshing = ref(false)

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
    })

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
        id: 'manage-courses',
        label: 'Manage Courses',
        icon: 'Database',
        type: 'secondary',
        action: () => router.push('/admin/courses')
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
        id: 'analytics',
        label: 'Analytics',
        icon: 'Chart',
        type: 'secondary',
        action: () => router.push('/admin/analytics')
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
      },
      {
        id: 6,
        type: 'user',
        title: 'Teacher Account Approved',
        description: 'Teacher "Kwame Asante" account approved and activated',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        status: 'success'
      }
    ])

    // Methods
    const refreshActivity = async () => {
      isRefreshing.value = true
      // Simulate API call
      setTimeout(() => {
        isRefreshing.value = false
        console.log('Admin dashboard data refreshed')
      }, 1000)
    }

    const executeAction = (action) => {
      action.action()
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

    // Initialize on mount
    onMounted(() => {
      console.log('Admin Dashboard mounted')
      refreshActivity()
    })

    return {
      userStore,
      dashboardStats,
      platformStats,
      quickActions,
      recentActivity,
      isRefreshing,
      refreshActivity,
      executeAction,
      getActivityStatus,
      formatTime
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

/* Quick Actions Section */
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.welcome-section {
  flex: 1;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.welcome-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Quick Actions Grid */
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
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  justify-content: center;
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

.quick-action-btn.secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.quick-action-btn.secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stats-grid.detailed {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.stat-card.detailed {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
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

/* Activity List */
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
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.activity-icon {
  color: var(--text-secondary);
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
  font-size: 0.875rem;
  font-weight: 500;
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.activity-status.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.activity-status.warning {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.activity-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Role Info */
.role-info {
  color: var(--text-secondary);
  line-height: 1.6;
}

.role-demo-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--interactive-secondary);
  border-radius: 8px;
  color: var(--interactive-primary);
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>