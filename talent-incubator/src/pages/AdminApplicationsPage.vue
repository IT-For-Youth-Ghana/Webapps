<script setup>
import { ref, computed, onMounted } from 'vue'
import ApplicationDetailModal from '../components/admin/ApplicationDetailModal.vue'

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const jobFilter = ref('all')
const sortBy = ref('newest')

const showDetailModal = ref(false)
const selectedApplication = ref(null)
const applications = ref([])
const jobs = ref([])

const statusOptions = [
  { value: 'all', label: 'All Status', color: 'secondary' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'reviewing', label: 'Under Review', color: 'info' },
  { value: 'interview', label: 'Interview', color: 'primary' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'danger' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'secondary' }
]

const filteredApplications = computed(() => {
  let filtered = [...applications.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(app => 
      app.applicantName.toLowerCase().includes(query) ||
      app.applicantEmail.toLowerCase().includes(query) ||
      app.jobTitle.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === statusFilter.value)
  }

  if (jobFilter.value !== 'all') {
    filtered = filtered.filter(app => app.jobId.toString() === jobFilter.value)
  }

  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate))
      break
    case 'status':
      filtered.sort((a, b) => a.status.localeCompare(b.status))
      break
    case 'job':
      filtered.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle))
      break
  }

  return filtered
})

const stats = computed(() => {
  const total = applications.value.length
  const pending = applications.value.filter(app => app.status === 'pending').length
  const reviewing = applications.value.filter(app => app.status === 'reviewing').length
  const interview = applications.value.filter(app => app.status === 'interview').length
  const approved = applications.value.filter(app => app.status === 'approved').length
  const rejected = applications.value.filter(app => app.status === 'rejected').length

  return { total, pending, reviewing, interview, approved, rejected }
})

const jobOptions = computed(() => {
  const uniqueJobs = [...new Set(applications.value.map(app => app.jobId))]
  return uniqueJobs.map(jobId => {
    const job = jobs.value.find(j => j.id === jobId)
    return job ? { value: jobId.toString(), label: job.title } : null
  }).filter(Boolean)
})

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  jobFilter.value = 'all'
  sortBy.value = 'newest'
}

const handleViewApplication = (application) => {
  selectedApplication.value = application
  showDetailModal.value = true
}

const handleUpdateStatus = async (applicationId, newStatus, notes = '') => {
  const application = applications.value.find(app => app.id === applicationId)
  if (application) {
    application.status = newStatus
    application.notes = notes
    application.updatedAt = new Date().toISOString()
    console.log('Application status updated:', applicationId, newStatus)
  }
}

const handleBulkAction = async (action, selectedIds) => {
  const selectedApps = applications.value.filter(app => selectedIds.includes(app.id))
  
  switch (action) {
    case 'approve':
      selectedApps.forEach(app => app.status = 'approved')
      break
    case 'reject':
      selectedApps.forEach(app => app.status = 'rejected')
      break
    case 'review':
      selectedApps.forEach(app => app.status = 'reviewing')
      break
  }
  
  console.log('Bulk action performed:', action, selectedIds)
}

const getStatusColor = (status) => {
  const statusOption = statusOptions.find(opt => opt.value === status)
  return statusOption ? statusOption.color : 'secondary'
}

const getStatusLabel = (status) => {
  const statusOption = statusOptions.find(opt => opt.value === status)
  return statusOption ? statusOption.label : status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchApplications = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    jobs.value = [
      { id: 1, title: 'Frontend Developer' },
      { id: 2, title: 'Backend Developer' },
      { id: 3, title: 'UI/UX Designer' },
      { id: 4, title: 'Data Analyst Intern' },
      { id: 5, title: 'DevOps Engineer' }
    ]
    
    applications.value = [
      {
        id: 1,
        jobId: 1,
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Ghana',
        applicantName: 'Kwame Asante',
        applicantEmail: 'kwame.asante@email.com',
        applicantPhone: '+233 24 123 4567',
        status: 'interview',
        appliedDate: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:15:00Z',
        experience: '3 years',
        education: 'BSc Computer Science',
        coverLetter: 'Dear Hiring Manager, I am excited to apply for the Frontend Developer position...',
        resumeUrl: '/uploads/resumes/kwame-asante-resume.pdf',
        portfolioUrl: 'https://kwameasante.dev',
        notes: 'Interview scheduled for January 25th at 10:00 AM. Strong technical background.',
        interviewDate: '2024-01-25',
        rating: 4
      },
      {
        id: 2,
        jobId: 3,
        jobTitle: 'UI/UX Designer',
        company: 'DesignHub Africa',
        applicantName: 'Ama Osei',
        applicantEmail: 'ama.osei@email.com',
        applicantPhone: '+233 20 987 6543',
        status: 'approved',
        appliedDate: '2024-01-12T09:15:00Z',
        updatedAt: '2024-01-18T16:30:00Z',
        experience: '2 years',
        education: 'BA Graphic Design',
        coverLetter: 'Dear DesignHub Team, I am passionate about creating beautiful user experiences...',
        resumeUrl: '/uploads/resumes/ama-osei-resume.pdf',
        portfolioUrl: 'https://amaosei.design',
        notes: 'Excellent portfolio. Offer approved at GHS 5,500/month.',
        rating: 5
      },
      {
        id: 3,
        jobId: 2,
        jobTitle: 'Backend Developer',
        company: 'StartupGH',
        applicantName: 'Kofi Mensah',
        applicantEmail: 'kofi.mensah@email.com',
        applicantPhone: '+233 26 555 7890',
        status: 'reviewing',
        appliedDate: '2024-01-10T14:45:00Z',
        updatedAt: '2024-01-15T11:20:00Z',
        experience: '4 years',
        education: 'BSc Information Technology',
        coverLetter: 'Hello StartupGH team, I am interested in the Backend Developer role...',
        resumeUrl: '/uploads/resumes/kofi-mensah-resume.pdf',
        portfolioUrl: 'https://github.com/kofi-mensah',
        notes: 'Technical review in progress. Good experience with Node.js and Python.',
        rating: 3
      },
      {
        id: 4,
        jobId: 4,
        jobTitle: 'Data Analyst Intern',
        company: 'DataCorp',
        applicantName: 'Akosua Darko',
        applicantEmail: 'akosua.darko@email.com',
        applicantPhone: '+233 23 444 5678',
        status: 'pending',
        appliedDate: '2024-01-08T16:20:00Z',
        updatedAt: '2024-01-08T16:20:00Z',
        experience: 'Fresh Graduate',
        education: 'BSc Mathematics',
        coverLetter: 'Dear DataCorp team, I am eager to learn data analysis and contribute to your team...',
        resumeUrl: '/uploads/resumes/akosua-darko-resume.pdf',
        portfolioUrl: '',
        notes: 'Application received. Initial review pending.',
        rating: 0
      },
      {
        id: 5,
        jobId: 1,
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Ghana',
        applicantName: 'Yaw Owusu',
        applicantEmail: 'yaw.owusu@email.com',
        applicantPhone: '+233 24 777 8888',
        status: 'rejected',
        appliedDate: '2024-01-05T11:10:00Z',
        updatedAt: '2024-01-12T09:45:00Z',
        experience: '1 year',
        education: 'Diploma in Web Development',
        coverLetter: 'Dear Hiring Team, I would love to join your frontend development team...',
        resumeUrl: '/uploads/resumes/yaw-owusu-resume.pdf',
        portfolioUrl: 'https://yawowusu.netlify.app',
        notes: 'Limited experience for this senior role. Recommended for junior positions.',
        rating: 2
      },
      {
        id: 6,
        jobId: 5,
        jobTitle: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        applicantName: 'Efua Appiah',
        applicantEmail: 'efua.appiah@email.com',
        applicantPhone: '+233 20 333 9999',
        status: 'interview',
        appliedDate: '2024-01-03T13:30:00Z',
        updatedAt: '2024-01-10T15:45:00Z',
        experience: '5 years',
        education: 'MSc Computer Engineering',
        coverLetter: 'Dear CloudTech team, I am excited about the DevOps Engineer opportunity...',
        resumeUrl: '/uploads/resumes/efua-appiah-resume.pdf',
        portfolioUrl: 'https://linkedin.com/in/efua-appiah',
        notes: 'Excellent DevOps background. Technical interview scheduled.',
        interviewDate: '2024-01-15',
        rating: 5
      }
    ]
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div class="applications-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Application Management</h1>
        <p class="page-subtitle">Review and manage job applications from candidates</p>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">{{ stats.reviewing + stats.interview }}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ stats.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section card">
      <div class="filters-header">
        <h3 class="filters-title">Filter Applications</h3>
        <button @click="clearFilters" class="btn-secondary">
          Clear Filters
        </button>
      </div>

      <div class="filters-content">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by applicant name, email, job title, or company..."
          >
        </div>

        <div class="filter-selects">
          <select v-model="statusFilter" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="jobFilter" class="filter-select">
            <option value="all">All Jobs</option>
            <option v-for="job in jobOptions" :key="job.value" :value="job.value">
              {{ job.label }}
            </option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
            <option value="job">By Job</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <p class="results-count">
        <span class="count-number">{{ filteredApplications.length }}</span>
        {{ filteredApplications.length === 1 ? 'application' : 'applications' }}
        <span v-if="searchQuery" class="search-term">matching "{{ searchQuery }}"</span>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading applications...</p>
    </div>

    <!-- Applications Table -->
    <div v-else-if="filteredApplications.length > 0" class="applications-table-container card">
      <div class="table-responsive">
        <table class="applications-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Job</th>
              <th>Status</th>
              <th>Experience</th>
              <th>Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="application in filteredApplications" :key="application.id" class="application-row">
              <td class="applicant-info">
                <div class="applicant-details">
                  <h4 class="applicant-name">{{ application.applicantName }}</h4>
                  <p class="applicant-contact">{{ application.applicantEmail }}</p>
                  <p class="applicant-education">{{ application.education }}</p>
                </div>
              </td>
              <td class="job-info">
                <div class="job-details">
                  <h4 class="job-title">{{ application.jobTitle }}</h4>
                  <p class="job-company">{{ application.company }}</p>
                </div>
              </td>
              <td class="application-status">
                <span :class="['status-badge', getStatusColor(application.status)]">
                  {{ getStatusLabel(application.status) }}
                </span>
                <div v-if="application.rating > 0" class="rating">
                  <span v-for="star in 5" :key="star" :class="['star', { 'filled': star <= application.rating }]">
                    ★
                  </span>
                </div>
              </td>
              <td class="experience-info">
                {{ application.experience }}
              </td>
              <td class="date-info">
                <div class="date-details">
                  <span class="applied-date">{{ formatDate(application.appliedDate) }}</span>
                  <span class="updated-date">Updated: {{ formatDate(application.updatedAt) }}</span>
                </div>
              </td>
              <td class="application-actions">
                <div class="action-buttons">
                  <button
                    @click="handleViewApplication(application)"
                    class="action-btn view"
                    title="View Details"
                  >
                    View
                  </button>
                  <button
                    v-if="application.status === 'pending'"
                    @click="handleUpdateStatus(application.id, 'reviewing')"
                    class="action-btn review"
                    title="Start Review"
                  >
                    Review
                  </button>
                  <button
                    v-if="['pending', 'reviewing'].includes(application.status)"
                    @click="handleUpdateStatus(application.id, 'interview')"
                    class="action-btn interview"
                    title="Schedule Interview"
                  >
                    Interview
                  </button>
                  <button
                    v-if="!['approved', 'rejected'].includes(application.status)"
                    @click="handleUpdateStatus(application.id, 'approved')"
                    class="action-btn approve"
                    title="Approve"
                  >
                    Approve
                  </button>
                  <button
                    v-if="!['approved', 'rejected'].includes(application.status)"
                    @click="handleUpdateStatus(application.id, 'rejected')"
                    class="action-btn reject"
                    title="Reject"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3 class="empty-title">No applications found</h3>
        <p class="empty-description">
          {{ searchQuery ? 'Try adjusting your search or filter criteria.' : 'No applications have been submitted yet.' }}
        </p>
        <button v-if="searchQuery" @click="clearFilters" class="btn-primary">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <ApplicationDetailModal
      v-if="showDetailModal && selectedApplication"
      :application="selectedApplication"
      @update-status="handleUpdateStatus"
      @close="showDetailModal = false"
    />
  </div>
</template>

<style scoped>
.applications-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #8B949E;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
}

.stat-card.primary::before { background: #007AFF; }
.stat-card.warning::before { background: #FF9F0A; }
.stat-card.info::before { background: #BF5AF2; }
.stat-card.success::before { background: #32D74B; }

.stat-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 500;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filters-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  transition: all 250ms ease;
}

.search-input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.search-input::placeholder {
  color: #6E7681;
}

.filter-selects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 250ms ease;
}

.filter-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.results-summary {
  margin-bottom: 1.5rem;
}

.results-count {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0;
}

.count-number {
  color: #F0F6FC;
  font-weight: 600;
}

.search-term {
  color: #007AFF;
  font-weight: 500;
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

.applications-table-container {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table th {
  background: #21262D;
  color: #F0F6FC;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #30363D;
}

.application-row {
  border-bottom: 1px solid #30363D;
  transition: background 150ms ease;
}

.application-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.applications-table td {
  padding: 1rem;
  vertical-align: top;
}

.applicant-details {
  min-width: 200px;
}

.applicant-name {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.applicant-contact {
  font-size: 0.875rem;
  color: #8B949E;
  margin: 0 0 0.25rem 0;
}

.applicant-education {
  font-size: 0.75rem;
  color: #6E7681;
  margin: 0;
}

.job-details {
  min-width: 150px;
}

.job-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.job-company {
  font-size: 0.75rem;
  color: #8B949E;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.status-badge.success {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.status-badge.warning {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.status-badge.info {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.status-badge.primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.status-badge.danger {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.status-badge.secondary {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.rating {
  display: flex;
  gap: 0.125rem;
}

.star {
  font-size: 0.875rem;
  color: #30363D;
}

.star.filled {
  color: #FF9F0A;
}

.experience-info {
  font-size: 0.875rem;
  color: #8B949E;
  white-space: nowrap;
}

.date-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.applied-date {
  font-size: 0.875rem;
  color: #F0F6FC;
  font-weight: 500;
}

.updated-date {
  font-size: 0.75rem;
  color: #8B949E;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  text-decoration: none;
  white-space: nowrap;
}

.action-btn.view {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.action-btn.view:hover {
  background: rgba(0, 122, 255, 0.2);
}

.action-btn.review {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.action-btn.review:hover {
  background: rgba(191, 90, 242, 0.2);
}

.action-btn.interview {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.action-btn.interview:hover {
  background: rgba(255, 159, 10, 0.2);
}

.action-btn.approve {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.action-btn.approve:hover {
  background: rgba(50, 215, 75, 0.2);
}

.action-btn.reject {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.action-btn.reject:hover {
  background: rgba(255, 69, 58, 0.2);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
}

.empty-content {
  text-align: center;
  max-width: 28rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #F0F6FC;
  margin-bottom: 1rem;
}

.empty-description {
  color: #8B949E;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .applications-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-content {
    gap: 0.75rem;
  }

  .filter-selects {
    grid-template-columns: 1fr;
  }

  .applications-table th,
  .applications-table td {
    padding: 0.75rem 0.5rem;
  }

  .applicant-details,
  .job-details {
    min-width: 150px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>