<!--
🚀 IT Youth Talent Incubator - Company Dashboard

PURPOSE: Main dashboard for companies to manage their job postings

WHAT IT DOES:
- Shows company's job postings with their approval status
- Allows companies to post new jobs
- Displays job statistics and application counts
- Shows pending, approved, and rejected jobs
-->
<script setup>
import { ref, computed } from 'vue'
import CompanyJobForm from '../components/company/CompanyJobForm.vue'

// Props
const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
})

// Emits
const emit = defineEmits(['navigate'])

// State
const showJobForm = ref(false)
const jobs = ref([
  {
    id: 1,
    title: 'Frontend Developer',
    company: { name: 'TechCorp Ghana' },
    location: 'Accra, Ghana',
    type: 'full-time',
    status: 'approved',
    submittedAt: '2025-01-15T10:30:00Z',
    applications: 12
  },
  {
    id: 2,
    title: 'Data Analyst',
    company: { name: 'TechCorp Ghana' },
    location: 'Kumasi, Ghana',
    type: 'full-time',
    status: 'pending',
    submittedAt: '2025-01-20T14:15:00Z',
    applications: 0
  },
  {
    id: 3,
    title: 'Backend Developer',
    company: { name: 'TechCorp Ghana' },
    location: 'Accra, Ghana',
    type: 'contract',
    status: 'rejected',
    submittedAt: '2025-01-18T09:45:00Z',
    applications: 0,
    rejectionReason: 'Job description needs more detail about required experience'
  }
])

// Computed
const jobStats = computed(() => {
  const pending = jobs.value.filter(job => job.status === 'pending').length
  const approved = jobs.value.filter(job => job.status === 'approved').length
  const rejected = jobs.value.filter(job => job.status === 'rejected').length
  const totalApplications = jobs.value.reduce((sum, job) => sum + job.applications, 0)
  
  return { pending, approved, rejected, total: jobs.value.length, totalApplications }
})

// Methods
const handleJobSubmitted = (jobData) => {
  const newJob = {
    id: jobs.value.length + 1,
    ...jobData,
    applications: 0
  }
  jobs.value.unshift(newJob)
  showJobForm.value = false
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'approved':
      return 'status-approved'
    case 'rejected':
      return 'status-rejected'
    default:
      return 'status-pending'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Under Review'
    case 'approved':
      return 'Active'
    case 'rejected':
      return 'Rejected'
    default:
      return status
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const resubmitJob = (job) => {
  job.status = 'pending'
  job.submittedAt = new Date().toISOString()
  delete job.rejectionReason
}
</script>

<template>
  <div class="company-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Company Dashboard</h1>
        <p class="subtitle">Manage your job postings and view applications</p>
      </div>
      <button 
        @click="showJobForm = true" 
        class="btn-primary"
        v-if="!showJobForm"
      >
        + Post New Job
      </button>
    </div>

    <!-- Job Form -->
    <div v-if="showJobForm" class="job-form-section">
      <div class="form-header">
        <button @click="showJobForm = false" class="btn-secondary">
          ← Back to Dashboard
        </button>
      </div>
      <CompanyJobForm @job-submitted="handleJobSubmitted" />
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <div class="stat-number">{{ jobStats.total }}</div>
            <div class="stat-label">Total Jobs Posted</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ jobStats.approved }}</div>
            <div class="stat-label">Active Jobs</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ jobStats.pending }}</div>
            <div class="stat-label">Under Review</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ jobStats.totalApplications }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
        </div>
      </div>

      <!-- Jobs List -->
      <div class="jobs-section">
        <h2>Your Job Postings</h2>
        
        <div v-if="jobs.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No Jobs Posted Yet</h3>
          <p>Start by posting your first job opportunity to find great talent!</p>
          <button @click="showJobForm = true" class="btn-primary">
            Post Your First Job
          </button>
        </div>

        <div v-else class="jobs-list">
          <div 
            v-for="job in jobs" 
            :key="job.id" 
            class="job-card"
          >
            <div class="job-header">
              <div class="job-title-section">
                <h3 class="job-title">{{ job.title }}</h3>
                <div class="job-meta">
                  <span class="job-location">📍 {{ job.location }}</span>
                  <span class="job-type">💼 {{ job.type }}</span>
                </div>
              </div>
              <div class="job-status-section">
                <span :class="['status-badge', getStatusBadgeClass(job.status)]">
                  {{ getStatusText(job.status) }}
                </span>
              </div>
            </div>

            <div class="job-details">
              <div class="job-info">
                <div class="info-item">
                  <strong>Posted:</strong> {{ formatDate(job.submittedAt) }}
                </div>
                <div class="info-item" v-if="job.status === 'approved'">
                  <strong>Applications:</strong> {{ job.applications }}
                </div>
              </div>

              <!-- Rejection Reason -->
              <div v-if="job.status === 'rejected'" class="rejection-notice">
                <h4>Feedback from Admin:</h4>
                <p>{{ job.rejectionReason }}</p>
                <button @click="resubmitJob(job)" class="btn-secondary btn-small">
                  Resubmit for Review
                </button>
              </div>

              <!-- Pending Status Info -->
              <div v-if="job.status === 'pending'" class="pending-notice">
                <p>Your job posting is under review by our administrators. You'll receive an email notification once it's approved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-content h1 {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
}

.job-form-section {
  background: #161B22;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #30363D;
}

.form-header {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: #161B22;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #30363D;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #1b65b2;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  min-width: 3rem;
  text-align: center;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1b65b2;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #8fb2d6;
  margin-top: 0.25rem;
}

.jobs-section {
  background: #161B22;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #30363D;
}

.jobs-section h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #1b65b2;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #8fb2d6;
  margin-bottom: 2rem;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.job-card {
  background: #21262D;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #30363D;
  transition: all 0.2s ease;
}

.job-card:hover {
  border-color: #1b65b2;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.job-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #8fb2d6;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
  border: 1px solid rgba(255, 159, 10, 0.2);
}

.status-approved {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
  border: 1px solid rgba(50, 215, 75, 0.2);
}

.status-rejected {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.2);
}

.job-details {
  margin-top: 1rem;
}

.job-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.info-item {
  color: #8fb2d6;
  font-size: 0.9rem;
}

.info-item strong {
  color: white;
}

.rejection-notice {
  background: rgba(255, 69, 58, 0.1);
  border: 1px solid rgba(255, 69, 58, 0.2);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.rejection-notice h4 {
  color: #FF453A;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rejection-notice p {
  color: #FF453A;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.pending-notice {
  background: rgba(255, 159, 10, 0.1);
  border: 1px solid rgba(255, 159, 10, 0.2);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.pending-notice p {
  color: #FF9F0A;
  font-size: 0.9rem;
  margin: 0;
}

.btn-primary {
  background-color: #1b65b2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #195aa5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 101, 178, 0.3);
}

.btn-secondary {
  background-color: transparent;
  color: #8fb2d6;
  border: 2px solid rgba(143, 178, 214, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(143, 178, 214, 0.1);
  border-color: rgba(143, 178, 214, 0.5);
  color: white;
}

.btn-small {
  font-size: 12px;
  padding: 6px 12px;
}

@media (max-width: 768px) {
  .company-dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .job-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .job-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .job-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>