<script setup>
import { ref, computed, onMounted } from 'vue'
import JobCard from '../components/student/JobCard.vue'
import ApplicationCard from '../components/student/ApplicationCard.vue'

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

const loading = ref(true)
const stats = ref({
  totalApplications: 0,
  pendingApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0
})

const recentJobs = ref([])
const recentApplications = ref([])
const quickActions = ref([
  { id: 'browse-jobs', label: 'Browse Jobs', description: 'Discover new opportunities', color: 'blue' },
  { id: 'update-profile', label: 'Update Profile', description: 'Keep your information current', color: 'purple' },
  { id: 'view-applications', label: 'View Applications', description: 'Track your submissions', color: 'green' }
])

const emit = defineEmits(['navigate', 'apply-to-job'])

// Simulated API calls
const fetchDashboardData = async () => {
  loading.value = true
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data
    stats.value = {
      totalApplications: 12,
      pendingApplications: 3,
      approvedApplications: 7,
      rejectedApplications: 2
    }
    
    recentJobs.value = [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'TechCorp Ghana',
        location: 'Accra',
        type: 'Full-time',
        salary: 'GHS 8,000 - 12,000',
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        description: 'We are looking for a talented Frontend Developer to join our team...',
        requirements: ['React', 'JavaScript', 'CSS', 'Git']
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'StartupGH',
        location: 'Kumasi',
        type: 'Full-time',
        salary: 'GHS 6,000 - 10,000',
        postedDate: '2024-01-12',
        deadline: '2024-02-12',
        description: 'Join our growing team as a Backend Developer...',
        requirements: ['Node.js', 'Python', 'MongoDB', 'API Development']
      }
    ]
    
    recentApplications.value = [
      {
        id: 1,
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Ghana',
        appliedDate: '2024-01-10',
        status: 'reviewing',
        statusColor: 'blue'
      },
      {
        id: 2,
        jobTitle: 'UI/UX Designer',
        company: 'DesignHub',
        appliedDate: '2024-01-08',
        status: 'approved',
        statusColor: 'green'
      },
      {
        id: 3,
        jobTitle: 'Data Analyst',
        company: 'DataCorp',
        appliedDate: '2024-01-05',
        status: 'pending',
        statusColor: 'orange'
      }
    ]
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="student-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section fade-in">
      <h1 class="welcome-title">Good morning, Student</h1>
      <p class="welcome-subtitle">Here's what's happening with your job search today</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content slide-up">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Total Applications</h3>
          </div>
          <div class="stat-value">{{ stats.totalApplications }}</div>
          <div class="stat-change positive">+2 this week</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Pending Review</h3>
          </div>
          <div class="stat-value text-orange">{{ stats.pendingApplications }}</div>
          <div class="stat-change">Under review</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Approved</h3>
          </div>
          <div class="stat-value text-green">{{ stats.approvedApplications }}</div>
          <div class="stat-change positive">{{ Math.round((stats.approvedApplications / stats.totalApplications) * 100) }}% success rate</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3 class="stat-title">Interviews</h3>
          </div>
          <div class="stat-value text-blue">3</div>
          <div class="stat-change positive">Next: Tomorrow</div>
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

      <!-- Recent Jobs -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Latest Job Opportunities</h2>
          <button @click="emit('navigate', 'jobs')" class="btn-secondary">
            View All Jobs
          </button>
        </div>
        <div class="jobs-grid">
          <JobCard
            v-for="job in recentJobs"
            :key="job.id"
            :job="job"
            @apply="handleApplyToJob"
          />
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
        <div class="applications-grid">
          <ApplicationCard
            v-for="application in recentApplications"
            :key="application.id"
            :application="application"
          />
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

.welcome-section {
  margin-bottom: 2rem;
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

@media (max-width: 768px) {
  .student-dashboard {
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