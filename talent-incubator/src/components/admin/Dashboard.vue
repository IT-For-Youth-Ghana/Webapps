<!-- 
🚀 IT Youth Talent Incubator - Admin Dashboard Component

PURPOSE: The main administrative dashboard that provides a comprehensive overview of the
platform's performance and enables quick access to key administrative functions.

WHAT IT DOES:
- Displays key system statistics (students, applications, jobs, acceptance rates)
- Shows monthly growth metrics and trends
- Provides quick action buttons for common admin tasks
- Lists recent platform activities and system events
- Displays real-time system status monitoring
- Offers an at-a-glance view of platform health

FOR CO-PROGRAMMERS:
- Stats data is stored in `stats` ref (lines 9-16) - connect to real API
- Recent activities list in `recentActivities` ref (lines 19-55) - fetch from activity log API
- Quick actions are defined in `quickActions` array (lines 58-63) - implement navigation
- System status indicators show mock data - integrate with monitoring services
- All cards use hover effects and responsive grid layouts
- Activity types: 'application', 'job', 'student' with corresponding icons and colors

KEY FEATURES:
- 6 statistical overview cards with color-coded themes
- 4 quick action buttons for common admin tasks
- Real-time activity feed with timestamps
- System status monitoring for database, email, storage, API
- Fully responsive design with mobile-optimized layouts
- Consistent styling with other admin components
-->
<script setup>
import { ref } from 'vue'

// Dashboard statistics
const stats = ref({
  totalStudents: 247,
  totalApplications: 186,
  pendingApplications: 43,
  activeJobs: 12,
  acceptedApplications: 28,
  monthlyGrowth: 15.3
})

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    type: 'application',
    message: 'New application from Kwame Asante for Frontend Developer position',
    time: '5 minutes ago',
    status: 'pending'
  },
  {
    id: 2,
    type: 'job',
    message: 'TechCorp Ghana posted a new job: Backend Developer',
    time: '2 hours ago',
    status: 'active'
  },
  {
    id: 3,
    type: 'student',
    message: 'Ama Serwaa completed her profile',
    time: '4 hours ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'application',
    message: 'Application approved for Kofi Mensah - Data Analyst position',
    time: '1 day ago',
    status: 'approved'
  },
  {
    id: 5,
    type: 'job',
    message: 'Mobile Developer position deadline extended',
    time: '2 days ago',
    status: 'updated'
  }
])

// Quick actions
const quickActions = [
  { id: 1, title: 'Add New Job', icon: '💼', action: 'addJob', color: 'blue' },
  { id: 2, title: 'Review Applications', icon: '📋', action: 'reviewApps', color: 'orange' },
  { id: 3, title: 'Manage Students', icon: '👥', action: 'manageStudents', color: 'green' },
  { id: 4, title: 'Generate Reports', icon: '📊', action: 'reports', color: 'purple' }
]

const handleQuickAction = (action) => {
  console.log('Quick action clicked:', action)
  // TODO: Implement navigation based on action type:
  // - 'addJob': Navigate to JobForm component
  // - 'reviewApps': Navigate to ApplicationsTable component
  // - 'manageStudents': Navigate to StudentList component  
  // - 'reports': Navigate to reports/analytics page
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'application': return '📝'
    case 'job': return '💼'
    case 'student': return '👤'
    default: return '📄'
  }
}

const getActivityColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b'
    case 'approved': return '#10b981'
    case 'active': return '#3b82f6'
    case 'completed': return '#8b5cf6'
    case 'updated': return '#6b7280'
    default: return '#6b7280'
  }
}
</script>

<template>
  <div>
    <h1>Admin Dashboard</h1>
    <p class="subtitle">Welcome to the IT Youth Talent Incubator Admin Panel</p>
    
    <!-- Statistics Cards -->
    <div class="section-container">
      <h2>Overview Statistics</h2>
      
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalStudents }}</div>
            <div class="stat-label">Total Students</div>
          </div>
        </div>
        
        <div class="stat-card secondary">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalApplications }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.pendingApplications }}</div>
            <div class="stat-label">Pending Applications</div>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">💼</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.activeJobs }}</div>
            <div class="stat-label">Active Jobs</div>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.acceptedApplications }}</div>
            <div class="stat-label">Accepted Applications</div>
          </div>
        </div>
        
        <div class="stat-card growth">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.monthlyGrowth }}%</div>
            <div class="stat-label">Monthly Growth</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-container">
      <h2>Quick Actions</h2>
      
      <div class="actions-grid">
        <button 
          v-for="action in quickActions" 
          :key="action.id"
          @click="handleQuickAction(action.action)"
          :class="['action-card', action.color]"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-title">{{ action.title }}</div>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="section-container">
      <h2>Recent Activity</h2>
      
      <div class="activity-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id" 
          class="activity-item"
        >
          <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
          <div class="activity-content">
            <div class="activity-message">{{ activity.message }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
          <div 
            class="activity-status" 
            :style="{ backgroundColor: getActivityColor(activity.status) }"
          ></div>
        </div>
      </div>
      
      <div class="activity-footer">
        <button class="btn-secondary">View All Activities</button>
      </div>
    </div>

    <!-- System Status -->
    <div class="section-container">
      <h2>System Status</h2>
      
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">Database</div>
          <div class="status-indicator online"></div>
          <div class="status-text">Online</div>
        </div>
        
        <div class="status-item">
          <div class="status-label">Email Service</div>
          <div class="status-indicator online"></div>
          <div class="status-text">Online</div>
        </div>
        
        <div class="status-item">
          <div class="status-label">File Storage</div>
          <div class="status-indicator online"></div>
          <div class="status-text">Online</div>
        </div>
        
        <div class="status-item">
          <div class="status-label">API Gateway</div>
          <div class="status-indicator warning"></div>
          <div class="status-text">Slow Response</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container - same as ApplicationForm */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 77, 197, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-color);
}

.stat-card.primary { --card-color: #004dc5; }
.stat-card.secondary { --card-color: #6b7280; }
.stat-card.warning { --card-color: #f59e0b; }
.stat-card.success { --card-color: #10b981; }
.stat-card.info { --card-color: #3b82f6; }
.stat-card.growth { --card-color: #8b5cf6; }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 77, 197, 0.15);
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

/* Quick Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  background: #ffffff;
  border: 2px solid rgba(0, 77, 197, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 77, 197, 0.15);
  border-color: var(--action-color);
}

.action-card.blue { --action-color: #3b82f6; }
.action-card.orange { --action-color: #f59e0b; }
.action-card.green { --action-color: #10b981; }
.action-card.purple { --action-color: #8b5cf6; }

.action-icon {
  font-size: 32px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  position: relative;
}

.activity-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
}

.activity-content {
  flex: 1;
}

.activity-message {
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #6b7280;
  font-size: 12px;
}

.activity-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.activity-footer {
  margin-top: 16px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

/* System Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.status-label {
  flex: 1;
  font-weight: 500;
  color: #1f2937;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.online {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.status-indicator.warning {
  background-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.status-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* Buttons - same style as ApplicationForm */
.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 2px solid rgba(0, 77, 197, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
  color: #004dc5;
  transform: translateY(-1px);
}

/* Title styling - same as ApplicationForm */
h1 {
  color: white;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
}

h2 {
  color: #003a9b;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid #004dc5;
  padding-bottom: 8px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .section-container {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    padding: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-icon {
    font-size: 28px;
  }
}
</style>
