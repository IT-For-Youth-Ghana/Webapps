<script setup>
/**
 * CompanyDashboardIntegrated Page
 * Company dashboard with stats, recent applications, and job overview
 */
import { ref, computed, onMounted } from 'vue'
import { useCompanyStore } from '../../stores/company.js'
import { useAuthStore } from '../../stores/auth.js'
import CompanyJobsManager from '../../components/company/CompanyJobsManager.vue'
import JobFormModal from '../../components/company/JobFormModal.vue'
import { COLORS } from '../../constants/colors.js'

const companyStore = useCompanyStore()
const authStore = useAuthStore()

// State
const showJobModal = ref(false)
const editingJob = ref(null)
const savingJob = ref(false)
const activeTab = ref('overview')

// Computed
const profile = computed(() => companyStore.profile)
const jobs = computed(() => companyStore.jobs)
const jobStats = computed(() => companyStore.jobStats)
const applications = computed(() => companyStore.applications)
const analytics = computed(() => companyStore.analytics)
const loading = computed(() => companyStore.loading)
const profileCompletion = computed(() => companyStore.profileCompletion)

// Recent applications (last 5)
const recentApplications = computed(() => {
  return [...applications.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

// Overview stats
const overviewStats = computed(() => [
  {
    label: 'Active Jobs',
    value: jobStats.value?.published || 0,
    icon: 'briefcase',
    color: COLORS.STATUS.SUCCESS
  },
  {
    label: 'Total Applications',
    value: jobStats.value?.total_applications || 0,
    icon: 'users',
    color: COLORS.BRAND.PRIMARY
  },
  {
    label: 'Pending Review',
    value: applications.value.filter((a) => a.status === 'pending').length,
    icon: 'clock',
    color: COLORS.STATUS.WARNING
  },
  {
    label: 'Profile Views',
    value: analytics.value?.profile_views || 0,
    icon: 'eye',
    color: COLORS.TEXT.SECONDARY
  }
])

// Lifecycle
onMounted(async () => {
  await Promise.all([
    companyStore.fetchProfile(),
    companyStore.fetchJobs(),
    companyStore.fetchJobStats(),
    companyStore.fetchApplications(),
    companyStore.fetchAnalytics()
  ])
})

// Methods
const handleCreateJob = () => {
  editingJob.value = null
  showJobModal.value = true
}

const handleEditJob = (job) => {
  editingJob.value = job
  showJobModal.value = true
}

const handleJobSubmit = async (jobData) => {
  savingJob.value = true
  try {
    if (editingJob.value?._id) {
      await companyStore.updateJob(editingJob.value._id, jobData)
    } else {
      await companyStore.createJob(jobData)
    }
    showJobModal.value = false
    editingJob.value = null
  } finally {
    savingJob.value = false
  }
}

const handleDeleteJob = async (jobId) => {
  if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
    await companyStore.deleteJob(jobId)
  }
}

const handlePublishJob = async (jobId) => {
  await companyStore.publishJob(jobId)
}

const handleCloseJob = async (jobId) => {
  if (confirm('Close this job posting? Candidates will no longer be able to apply.')) {
    await companyStore.closeJob(jobId)
  }
}

const handleViewApplications = (jobId) => {
  // Switch to applications tab and filter by job
  activeTab.value = 'applications'
  // Could emit or filter applications by job
}

// Format date
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Get status badge class
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'reviewed':
      return 'status-reviewed'
    case 'shortlisted':
      return 'status-shortlisted'
    case 'interviewing':
      return 'status-interviewing'
    case 'hired':
      return 'status-hired'
    case 'rejected':
      return 'status-rejected'
    default:
      return ''
  }
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="page-title">
            Welcome back, {{ profile?.name || authStore.user?.first_name || 'Company' }}
          </h1>
          <p class="page-subtitle">Manage your job postings and review candidate applications</p>
        </div>
        <div class="header-actions">
          <button class="primary-btn" @click="handleCreateJob">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post a Job
          </button>
        </div>
      </div>

      <!-- Profile Completion -->
      <div v-if="profileCompletion < 100" class="profile-alert">
        <div class="alert-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Complete your company profile to attract more candidates</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: profileCompletion + '%' }"></div>
        </div>
        <span class="progress-label">{{ profileCompletion }}% complete</span>
      </div>
    </header>

    <!-- Stats Overview -->
    <section class="stats-section">
      <div class="stats-grid">
        <div v-for="stat in overviewStats" :key="stat.label" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color + '20', color: stat.color }">
            <svg v-if="stat.icon === 'briefcase'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <svg v-else-if="stat.icon === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <svg v-else-if="stat.icon === 'clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <svg v-else-if="stat.icon === 'eye'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Tabs -->
    <div class="content-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'overview' }]"
        @click="activeTab = 'overview'"
      >
        Overview
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'jobs' }]"
        @click="activeTab = 'jobs'"
      >
        Jobs
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'applications' }]"
        @click="activeTab = 'applications'"
      >
        Applications
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="overview-content">
        <div class="content-grid">
          <!-- Recent Applications -->
          <div class="content-card">
            <div class="card-header">
              <h3>Recent Applications</h3>
              <button class="link-btn" @click="activeTab = 'applications'">View all</button>
            </div>
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
            </div>
            <div v-else-if="recentApplications.length === 0" class="empty-state">
              <p>No applications yet</p>
            </div>
            <div v-else class="applications-list">
              <div
                v-for="app in recentApplications"
                :key="app._id"
                class="application-item"
              >
                <div class="applicant-avatar">
                  {{ app.student?.user?.first_name?.[0] || '?' }}{{ app.student?.user?.last_name?.[0] || '' }}
                </div>
                <div class="applicant-info">
                  <span class="applicant-name">
                    {{ app.student?.user?.first_name }} {{ app.student?.user?.last_name }}
                  </span>
                  <span class="applicant-job">{{ app.job?.title || 'Unknown Position' }}</span>
                </div>
                <span :class="['status-badge', getStatusClass(app.status)]">
                  {{ app.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="content-card">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="quick-actions">
              <button class="action-card" @click="handleCreateJob">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Post New Job</span>
              </button>
              <router-link to="/company/profile" class="action-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Profile</span>
              </router-link>
              <button class="action-card" @click="activeTab = 'applications'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Review Applications</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs Tab -->
      <div v-if="activeTab === 'jobs'" class="jobs-content">
        <CompanyJobsManager
          :jobs="jobs"
          :loading="loading"
          :stats="jobStats"
          @create="handleCreateJob"
          @edit="handleEditJob"
          @delete="handleDeleteJob"
          @publish="handlePublishJob"
          @close="handleCloseJob"
          @view-applications="handleViewApplications"
        />
      </div>

      <!-- Applications Tab -->
      <div v-if="activeTab === 'applications'" class="applications-content">
        <div class="content-card full-width">
          <div class="card-header">
            <h3>All Applications</h3>
            <span class="badge">{{ applications.length }} total</span>
          </div>
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="applications.length === 0" class="empty-state large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h4>No applications yet</h4>
            <p>Applications will appear here when candidates apply to your jobs</p>
          </div>
          <div v-else class="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in applications" :key="app._id">
                  <td class="candidate-cell">
                    <div class="applicant-avatar small">
                      {{ app.student?.user?.first_name?.[0] || '?' }}
                    </div>
                    <div>
                      <span class="candidate-name">
                        {{ app.student?.user?.first_name }} {{ app.student?.user?.last_name }}
                      </span>
                      <span class="candidate-email">{{ app.student?.user?.email }}</span>
                    </div>
                  </td>
                  <td>{{ app.job?.title || '-' }}</td>
                  <td>{{ formatDate(app.created_at) }}</td>
                  <td>
                    <span :class="['status-badge', getStatusClass(app.status)]">
                      {{ app.status }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="table-btn" title="View details">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button class="table-btn" title="Download resume">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Modal -->
    <JobFormModal
      :show="showJobModal"
      :job="editingJob"
      :saving="savingJob"
      @close="showJobModal = false"
      @submit="handleJobSubmit"
    />
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.page-subtitle {
  margin: 0;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.primary-btn svg {
  width: 18px;
  height: 18px;
}

/* Profile Alert */
.profile-alert {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.STATUS.WARNING');
  border-radius: 12px;
  padding: 1rem 1.25rem;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: v-bind('COLORS.STATUS.WARNING');
}

.alert-content svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert-content span {
  font-size: 0.9375rem;
}

.progress-bar {
  height: 6px;
  background: v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: v-bind('COLORS.STATUS.WARNING');
  transition: width 0.3s;
}

.progress-label {
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.25rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.stat-label {
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

/* Content Tabs */
.content-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: v-bind('COLORS.TEXT.PRIMARY');
  background: v-bind('COLORS.BACKGROUND.CARD');
}

.tab-btn.active {
  color: v-bind('COLORS.BRAND.PRIMARY');
  background: rgba(88, 166, 255, 0.1);
}

/* Content Cards */
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
}

.content-card {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  overflow: hidden;
}

.content-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.link-btn {
  background: transparent;
  border: none;
  color: v-bind('COLORS.BRAND.PRIMARY');
  font-size: 0.875rem;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.badge {
  padding: 0.25rem 0.625rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border-radius: 20px;
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

/* Loading/Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.empty-state.large {
  padding: 3rem;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 0.5rem;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-top-color: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Applications List */
.applications-list {
  padding: 0.5rem 0;
}

.application-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  transition: background 0.2s;
}

.application-item:hover {
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
}

.applicant-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.applicant-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.applicant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.applicant-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.applicant-job {
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-pending {
  background: rgba(214, 158, 46, 0.15);
  color: v-bind('COLORS.STATUS.WARNING');
}

.status-reviewed {
  background: rgba(88, 166, 255, 0.15);
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.status-shortlisted {
  background: rgba(56, 161, 105, 0.15);
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.status-interviewing {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.status-hired {
  background: rgba(56, 161, 105, 0.15);
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.status-rejected {
  background: rgba(248, 113, 113, 0.15);
  color: v-bind('COLORS.STATUS.ERROR');
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 10px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  background: v-bind('COLORS.BACKGROUND.CARD');
}

.action-card svg {
  width: 24px;
  height: 24px;
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.action-card span {
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: center;
}

/* Applications Table */
.applications-table {
  overflow-x: auto;
}

.applications-table table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table th,
.applications-table td {
  padding: 1rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.applications-table th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: v-bind('COLORS.TEXT.MUTED');
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
}

.applications-table tr:hover {
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
}

.candidate-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.candidate-name {
  display: block;
  font-weight: 500;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.candidate-email {
  display: block;
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.table-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  cursor: pointer;
  transition: all 0.2s;
}

.table-btn:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.table-btn svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .content-tabs {
    overflow-x: auto;
  }
}
</style>
