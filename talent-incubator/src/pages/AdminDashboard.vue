<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['navigate'])

const loading = ref(true)
const stats = ref({
  totalStudents: 0,
  totalJobs: 0,
  totalApplications: 0,
  pendingReviews: 0
})

const recentApplications = ref([])
const activeJobs = ref([])
const quickActions = ref([
  { id: 'create-job', label: 'Create Job Posting', description: 'Add a new job opportunity', color: 'blue' },
  { id: 'review-applications', label: 'Review Applications', description: 'Process pending applications', color: 'orange' },
  { id: 'manage-students', label: 'Manage Students', description: 'View and manage student accounts', color: 'purple' },
  { id: 'view-analytics', label: 'View Analytics', description: 'Access detailed reports', color: 'green' }
])

const fetchDashboardData = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    stats.value = {
      totalStudents: 247,
      totalJobs: 18,
      totalApplications: 152,
      pendingReviews: 23
    }
    
    recentApplications.value = [
      {
        id: 1,
        studentName: 'John Doe',
        jobTitle: 'Frontend Developer',
        appliedDate: '2024-01-15',
        status: 'pending'
      },
      {
        id: 2,
        studentName: 'Sarah Wilson',
        jobTitle: 'Backend Developer',
        appliedDate: '2024-01-14',
        status: 'reviewing'
      },
      {
        id: 3,
        studentName: 'Michael Chen',
        jobTitle: 'UI/UX Designer',
        appliedDate: '2024-01-13',
        status: 'pending'
      }
    ]
    
    activeJobs.value = [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'TechCorp Ghana',
        applications: 12,
        deadline: '2024-02-15',
        status: 'active'
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'StartupGH',
        applications: 8,
        deadline: '2024-02-12',
        status: 'active'
      }
    ]
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const handleQuickAction = (actionId) => {
  switch (actionId) {
    case 'create-job':
      emit('navigate', 'jobs')
      break
    case 'review-applications':
      emit('navigate', 'applications')
      break
    case 'manage-students':
      emit('navigate', 'students')
      break
    case 'view-analytics':
      emit('navigate', 'analytics')
      break
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="admin-dashboard">
    <div class="welcome-section fade-in">
      <h1 class="welcome-title">Admin Dashboard</h1>
      <p class="welcome-subtitle">Manage the IT Youth Talent Incubator platform</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading dashboard data...</p>
    </div>

    <div v-else class="dashboard-content slide-up">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Total Students</h3>
          </div>
          <div class="stat-value">{{ stats.totalStudents }}</div>
          <div class="stat-change positive">+12 this month</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Active Jobs</h3>
          </div>
          <div class="stat-value text-blue">{{ stats.totalJobs }}</div>
          <div class="stat-change">Currently posted</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Total Applications</h3>
          </div>
          <div class="stat-value text-green">{{ stats.totalApplications }}</div>
          <div class="stat-change positive">+18 this week</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Pending Reviews</h3>
          </div>
          <div class="stat-value text-orange">{{ stats.pendingReviews }}</div>
          <div class="stat-change">Needs attention</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="quick-actions-grid">
          <button
            v-for="action in quickActions"
            :key="action.id"
            @click="handleQuickAction(action.id)"
            class="quick-action-card"
            :class="`quick-action-${action.color}`"
          >
            <h3 class="action-title">{{ action.label }}</h3>
            <p class="action-description">{{ action.description }}</p>
          </button>
        </div>
      </div>

      <!-- Recent Applications -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Recent Applications</h2>
          <button @click="emit('navigate', 'applications')" class="btn-secondary">
            View All Applications
          </button>
        </div>
        <div class="applications-table">
          <div class="table-header">
            <span>Student</span>
            <span>Position</span>
            <span>Applied</span>
            <span>Status</span>
          </div>
          <div
            v-for="application in recentApplications"
            :key="application.id"
            class="table-row"
          >
            <span class="student-name">{{ application.studentName }}</span>
            <span class="job-title">{{ application.jobTitle }}</span>
            <span class="applied-date">{{ formatDate(application.appliedDate) }}</span>
            <span 
              :class="['status-badge', `status-${application.status}`]"
            >
              {{ application.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Active Jobs -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Active Job Postings</h2>
          <button @click="emit('navigate', 'jobs')" class="btn-secondary">
            Manage All Jobs
          </button>
        </div>
        <div class="jobs-grid">
          <div
            v-for="job in activeJobs"
            :key="job.id"
            class="job-card"
          >
            <div class="job-header">
              <h3 class="job-title">{{ job.title }}</h3>
              <span class="applications-count">{{ job.applications }} applications</span>
            </div>
            <p class="job-company">{{ job.company }}</p>
            <div class="job-footer">
              <span class="job-deadline">Deadline: {{ formatDate(job.deadline) }}</span>
              <span :class="['job-status', `status-${job.status}`]">{{ job.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.welcome-section {
  margin-bottom: 2rem;
  text-align: center;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #8B949E;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
}

.loading-text {
  color: #8B949E;
  font-size: 0.875rem;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #8B949E;
  margin: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.text-orange { color: #FF9F0A; }
.text-green { color: #32D74B; }
.text-blue { color: #007AFF; }

.stat-change {
  font-size: 0.75rem;
  color: #6E7681;
}

.stat-change.positive {
  color: #32D74B;
}

.section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.quick-action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  transition: background 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-action-blue::before { background: #007AFF; }
.quick-action-orange::before { background: #FF9F0A; }
.quick-action-purple::before { background: #BF5AF2; }
.quick-action-green::before { background: #32D74B; }

.quick-action-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.action-description {
  font-size: 0.875rem;
  color: #8B949E;
  margin: 0;
}

.applications-table {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #21262D;
  font-size: 0.875rem;
  font-weight: 600;
  color: #8B949E;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #30363D;
  transition: background 150ms ease;
  align-items: center;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.student-name {
  font-weight: 500;
  color: #F0F6FC;
}

.job-title {
  color: #007AFF;
  font-weight: 500;
}

.applied-date {
  color: #8B949E;
  font-size: 0.875rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.job-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.job-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.job-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
}

.applications-count {
  font-size: 0.75rem;
  color: #32D74B;
  background: rgba(50, 215, 75, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(50, 215, 75, 0.2);
}

.job-company {
  color: #8B949E;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.job-deadline {
  color: #8B949E;
}

.job-status {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.status-pending {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
  border: 1px solid rgba(255, 159, 10, 0.2);
}

.status-reviewing {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.status-active {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
  border: 1px solid rgba(50, 215, 75, 0.2);
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header {
    display: none;
  }

  .table-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>