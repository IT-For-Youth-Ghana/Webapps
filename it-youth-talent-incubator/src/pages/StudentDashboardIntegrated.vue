<!--
  Student Dashboard (Integrated)
  Overview dashboard for students with API integration
  Shows stats, quick actions, recent jobs, and applications
-->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '../stores/student.js'
import { useAuthStore } from '../stores/auth.js'
import { applicationsAPI, jobsAPI } from '../utils/api.js'
import JobCard from '../components/student/JobCard.vue'
import ApplicationCard from '../components/student/ApplicationCard.vue'

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['navigate', 'apply-to-job'])

const studentStore = useStudentStore()
const authStore = useAuthStore()

// State
const loading = ref(true)
const stats = ref({
  totalApplications: 0,
  pendingApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0
})
const recentJobs = ref([])
const recentApplications = ref([])
const error = ref(null)

// Quick actions
const quickActions = ref([
  { id: 'browse-jobs', label: 'Browse Jobs', description: 'Discover new opportunities', color: 'blue', icon: '🔍' },
  { id: 'update-profile', label: 'Update Profile', description: 'Keep your information current', color: 'purple', icon: '👤' },
  { id: 'view-applications', label: 'View Applications', description: 'Track your submissions', color: 'green', icon: '📋' }
])

// Computed
const userName = computed(() => {
  if (studentStore.profile) {
    return studentStore.profile.first_name || 'Student'
  }
  return authStore.userName || 'Student'
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const profileCompletion = computed(() => studentStore.profileCompletion)

// Fetch dashboard data
const fetchDashboardData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch student profile if not already loaded
    if (!studentStore.isProfileLoaded) {
      await studentStore.fetchProfile()
    }

    // Fetch applications in parallel with jobs
    const [applicationsResponse, jobsResponse] = await Promise.all([
      applicationsAPI.getMyApplications().catch(() => ({ data: { success: false } })),
      jobsAPI.listJobs({ limit: 4, status: 'published' }).catch(() => ({ data: { success: false } }))
    ])

    // Process applications
    if (applicationsResponse.data?.success) {
      const applications = applicationsResponse.data.data?.items || applicationsResponse.data.data || []
      
      // Calculate stats
      stats.value = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length,
        approvedApplications: applications.filter(a => a.status === 'approved' || a.status === 'accepted').length,
        rejectedApplications: applications.filter(a => a.status === 'rejected').length
      }

      // Get recent applications (last 3)
      recentApplications.value = applications.slice(0, 3).map(app => ({
        id: app._id,
        jobTitle: app.job?.title || 'Unknown Job',
        company: app.job?.company?.name || 'Unknown Company',
        appliedDate: app.createdAt,
        status: app.status,
        statusColor: getStatusColor(app.status)
      }))
    }

    // Process jobs
    if (jobsResponse.data?.success) {
      const jobs = jobsResponse.data.data?.items || jobsResponse.data.data || []
      recentJobs.value = jobs.slice(0, 4).map(job => ({
        id: job._id,
        title: job.title,
        company: job.company?.name || 'Unknown Company',
        location: job.location,
        type: job.job_type,
        salary: formatSalary(job.salary_range),
        postedDate: job.createdAt,
        deadline: job.deadline,
        description: job.description,
        requirements: job.requirements?.slice(0, 4) || []
      }))
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Helpers
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    reviewing: 'blue',
    approved: 'green',
    accepted: 'green',
    rejected: 'red',
    withdrawn: 'gray'
  }
  return colors[status] || 'gray'
}

const formatSalary = (salaryRange) => {
  if (!salaryRange) return 'Competitive'
  const { min, max, currency = 'GHS' } = salaryRange
  if (min && max) {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  }
  if (min) return `${currency} ${min.toLocaleString()}+`
  return 'Competitive'
}

const handleQuickAction = (actionId) => {
  switch (actionId) {
    case 'browse-jobs':
      emit('navigate', 'jobs')
      break
    case 'update-profile':
      emit('navigate', 'profile')
      break
    case 'view-applications':
      emit('navigate', 'applications')
      break
  }
}

const handleApplyToJob = (jobId) => {
  emit('apply-to-job', jobId)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Initialize
onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="student-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section fade-in">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ greeting }}, {{ userName }}</h1>
        <p class="welcome-subtitle">Here's what's happening with your job search today</p>
      </div>
      
      <!-- Profile Completion Alert -->
      <div v-if="profileCompletion < 80 && !loading" class="profile-alert">
        <div class="alert-content">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <strong>Complete your profile</strong>
            <p>Your profile is {{ profileCompletion }}% complete. A complete profile helps you get noticed by employers.</p>
          </div>
        </div>
        <button @click="emit('navigate', 'profile')" class="btn-primary small">
          Complete Profile
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchDashboardData" class="btn-primary">
        Try Again
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content slide-up">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Total Applications</h3>
            <span class="stat-icon">📄</span>
          </div>
          <div class="stat-value">{{ stats.totalApplications }}</div>
          <div class="stat-change" :class="{ positive: stats.totalApplications > 0 }">
            {{ stats.totalApplications > 0 ? 'Keep applying!' : 'Start applying' }}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Pending Review</h3>
            <span class="stat-icon">⏳</span>
          </div>
          <div class="stat-value text-orange">{{ stats.pendingApplications }}</div>
          <div class="stat-change">Awaiting response</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Approved</h3>
            <span class="stat-icon">✅</span>
          </div>
          <div class="stat-value text-green">{{ stats.approvedApplications }}</div>
          <div class="stat-change positive" v-if="stats.totalApplications > 0">
            {{ Math.round((stats.approvedApplications / stats.totalApplications) * 100) || 0 }}% success rate
          </div>
          <div class="stat-change" v-else>No applications yet</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Profile Strength</h3>
            <span class="stat-icon">💪</span>
          </div>
          <div class="stat-value text-blue">{{ profileCompletion }}%</div>
          <div class="stat-change" :class="{ positive: profileCompletion >= 80 }">
            {{ profileCompletion >= 80 ? 'Looking good!' : 'Needs improvement' }}
          </div>
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
            <span class="action-icon">{{ action.icon }}</span>
            <h3 class="action-title">{{ action.label }}</h3>
            <p class="action-description">{{ action.description }}</p>
          </button>
        </div>
      </div>

      <!-- Recent Jobs -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Latest Job Opportunities</h2>
          <button @click="emit('navigate', 'jobs')" class="btn-secondary">
            View All Jobs
          </button>
        </div>
        <div v-if="recentJobs.length > 0" class="jobs-grid">
          <JobCard
            v-for="job in recentJobs"
            :key="job.id"
            :job="job"
            @apply="handleApplyToJob"
          />
        </div>
        <div v-else class="empty-state">
          <p>No jobs available at the moment. Check back soon!</p>
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
        <div v-if="recentApplications.length > 0" class="applications-grid">
          <ApplicationCard
            v-for="application in recentApplications"
            :key="application.id"
            :application="application"
          />
        </div>
        <div v-else class="empty-state">
          <p>No applications yet. Start by browsing available jobs!</p>
          <button @click="emit('navigate', 'jobs')" class="btn-primary">
            Browse Jobs
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 2rem;
}

.welcome-content {
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #f0f6fc);
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-secondary, #8b949e);
  margin: 0;
}

/* Profile Alert */
.profile-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 159, 10, 0.1);
  border: 1px solid rgba(255, 159, 10, 0.2);
  border-radius: 12px;
  margin-top: 1rem;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-icon {
  font-size: 1.25rem;
}

.alert-text {
  flex: 1;
}

.alert-text strong {
  color: var(--text-primary, #f0f6fc);
  display: block;
  margin-bottom: 0.25rem;
}

.alert-text p {
  color: var(--text-secondary, #8b949e);
  font-size: 0.875rem;
  margin: 0;
}

/* Loading & Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border-color, #30363d);
  border-top-color: var(--color-primary, #007aff);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary, #8b949e);
  font-size: 0.875rem;
}

.error-message {
  color: var(--color-danger, #ef4444);
}

/* Dashboard Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--card-background, #161b22);
  border: 1px solid var(--border-color, #30363d);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  border-color: var(--border-hover, #484f58);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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
  color: var(--text-secondary, #8b949e);
  margin: 0;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #f0f6fc);
  margin-bottom: 0.5rem;
}

.text-orange { color: #ff9f0a; }
.text-green { color: #32d74b; }
.text-blue { color: #007aff; }

.stat-change {
  font-size: 0.75rem;
  color: var(--text-muted, #6e7681);
}

.stat-change.positive {
  color: #32d74b;
}

/* Sections */
.section {
  margin-bottom: 1rem;
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
  color: var(--text-primary, #f0f6fc);
  margin: 0;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-card {
  background: var(--card-background, #161b22);
  border: 1px solid var(--border-color, #30363d);
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

.quick-action-blue::before { background: #007aff; }
.quick-action-purple::before { background: #bf5af2; }
.quick-action-green::before { background: #32d74b; }

.quick-action-card:hover {
  border-color: var(--border-hover, #484f58);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.action-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #f0f6fc);
  margin: 0 0 0.5rem 0;
}

.action-description {
  font-size: 0.875rem;
  color: var(--text-secondary, #8b949e);
  margin: 0;
}

/* Jobs & Applications Grid */
.jobs-grid,
.applications-grid {
  display: grid;
  gap: 1rem;
}

.jobs-grid {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.applications-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--card-background, #161b22);
  border: 1px solid var(--border-color, #30363d);
  border-radius: 12px;
}

.empty-state p {
  color: var(--text-secondary, #8b949e);
  margin: 0 0 1rem 0;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary, #007aff);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary-dark, #0056b3);
}

.btn-primary.small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary, #8b949e);
  border: 1px solid var(--border-color, #30363d);
}

.btn-secondary:hover {
  background: var(--bg-hover, #21262d);
  border-color: var(--border-hover, #484f58);
}

/* Animations */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-up {
  animation: slideUp 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .student-dashboard {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .profile-alert {
    flex-direction: column;
    align-items: flex-start;
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

  .jobs-grid,
  .applications-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
