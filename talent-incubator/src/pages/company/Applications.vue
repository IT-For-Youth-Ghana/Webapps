<!--
📋 Company Applications Overview
Professional application management with complete theme support
-->
<template>
  <div class="applications-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Applications</h1>
        <p class="page-subtitle">Review and manage candidate applications</p>
      </div>
      <div class="header-actions">
        <button @click="exportApplications" class="btn btn-secondary">
          <DownloadIcon />
          Export CSV
        </button>
        <button @click="showBulkActions = !showBulkActions" class="btn btn-tertiary">
          <FilterIcon />
          Bulk Actions
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">Total Applications</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.pending }}</div>
        <div class="stat-label">Pending Review</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.interviewed }}</div>
        <div class="stat-label">Interviewed</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.hired }}</div>
        <div class="stat-label">Hired</div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <SearchIcon />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search applications, candidates, positions..."
          class="input search-input"
        >
      </div>
      <div class="filter-controls">
        <select v-model="jobFilter" class="input filter-select">
          <option value="all">All Positions</option>
          <option v-for="job in availableJobs" :key="job.id" :value="job.id">
            {{ job.title }}
          </option>
        </select>
        <select v-model="statusFilter" class="input filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="interviewed">Interviewed</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="sortBy" class="input filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="position">Position</option>
        </select>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="showBulkActions && selectedApplications.length > 0" class="bulk-actions-bar">
      <div class="bulk-info">
        {{ selectedApplications.length }} application(s) selected
      </div>
      <div class="bulk-buttons">
        <button @click="bulkUpdateStatus('reviewing')" class="btn btn-secondary btn-sm">
          Mark as Reviewing
        </button>
        <button @click="bulkUpdateStatus('interviewed')" class="btn btn-secondary btn-sm">
          Move to Interview
        </button>
        <button @click="bulkUpdateStatus('rejected')" class="btn btn-secondary btn-sm">
          Reject Selected
        </button>
      </div>
    </div>

    <!-- Applications Table -->
    <div class="applications-section">
      <div v-if="filteredApplications.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No applications found</h3>
        <p>{{ getEmptyStateMessage() }}</p>
      </div>

      <div v-else class="applications-table">
        <!-- Table Header -->
        <div class="table-header">
          <div class="header-cell checkbox-cell">
            <input 
              type="checkbox" 
              v-model="selectAll"
              @change="toggleSelectAll"
              class="checkbox"
            >
          </div>
          <div class="header-cell candidate-cell">Candidate</div>
          <div class="header-cell position-cell">Position</div>
          <div class="header-cell status-cell">Status</div>
          <div class="header-cell date-cell">Applied</div>
          <div class="header-cell score-cell">Score</div>
          <div class="header-cell actions-cell">Actions</div>
        </div>

        <!-- Table Body -->
        <div class="table-body">
          <div 
            v-for="application in filteredApplications" 
            :key="application.id"
            class="table-row"
            :class="{ 'selected': selectedApplications.includes(application.id) }"
            @click="viewApplication(application)"
          >
            <div class="table-cell checkbox-cell" @click.stop>
              <input 
                type="checkbox" 
                :value="application.id"
                v-model="selectedApplications"
                class="checkbox"
              >
            </div>
            
            <div class="table-cell candidate-cell">
              <div class="candidate-info">
                <div class="candidate-avatar">
                  {{ getInitials(application.candidateName) }}
                </div>
                <div class="candidate-details">
                  <div class="candidate-name">{{ application.candidateName }}</div>
                  <div class="candidate-email">{{ application.candidateEmail }}</div>
                </div>
              </div>
            </div>
            
            <div class="table-cell position-cell">
              <div class="position-info">
                <div class="position-title">{{ application.jobTitle }}</div>
                <div class="position-type">{{ formatJobType(application.jobType) }}</div>
              </div>
            </div>
            
            <div class="table-cell status-cell">
              <button 
                :class="['badge', `badge-${getStatusVariant(application.status)}`]"
                @click.stop="changeStatus(application)"
              >
                {{ formatStatus(application.status) }}
              </button>
            </div>
            
            <div class="table-cell date-cell">
              <div class="date-info">
                <div class="date-primary">{{ formatDate(application.appliedAt) }}</div>
                <div class="date-secondary">{{ formatRelativeDate(application.appliedAt) }}</div>
              </div>
            </div>
            
            <div class="table-cell score-cell">
              <div class="score-display" :class="getScoreClass(application.matchScore)">
                {{ application.matchScore }}%
              </div>
            </div>
            
            <div class="table-cell actions-cell" @click.stop>
              <div class="action-buttons">
                <button @click="viewApplication(application)" class="btn-icon" title="View Details">
                  <EyeIcon />
                </button>
                <button @click="downloadResume(application)" class="btn-icon" title="Download Resume">
                  <DownloadIcon />
                </button>
                <button @click="contactCandidate(application)" class="btn-icon" title="Contact">
                  <MailIcon />
                </button>
                <button @click="showApplicationMenu(application)" class="btn-icon" title="More">
                  <MoreIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredApplications.length > 0" class="pagination-section">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredApplications.length }} applications
      </div>
      <div class="pagination-controls">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn btn-secondary btn-sm"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn btn-secondary btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Component state
const searchQuery = ref('')
const jobFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('newest')
const showBulkActions = ref(false)
const selectedApplications = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

// Sample data
const applications = ref([
  {
    id: 1,
    candidateName: 'Kwame Asante',
    candidateEmail: 'kwame.asante@email.com',
    jobTitle: 'Senior Frontend Developer',
    jobType: 'full-time',
    jobId: 1,
    status: 'pending',
    appliedAt: '2024-01-20T10:30:00Z',
    matchScore: 92,
    resumeUrl: '/resumes/kwame-asante.pdf'
  },
  {
    id: 2,
    candidateName: 'Ama Osei',
    candidateEmail: 'ama.osei@email.com',
    jobTitle: 'Senior Frontend Developer',
    jobType: 'full-time',
    jobId: 1,
    status: 'reviewing',
    appliedAt: '2024-01-19T14:15:00Z',
    matchScore: 88,
    resumeUrl: '/resumes/ama-osei.pdf'
  },
  {
    id: 3,
    candidateName: 'Kojo Mensah',
    candidateEmail: 'kojo.mensah@email.com',
    jobTitle: 'Backend Developer (Node.js)',
    jobType: 'full-time',
    jobId: 2,
    status: 'interviewed',
    appliedAt: '2024-01-18T09:45:00Z',
    matchScore: 85,
    resumeUrl: '/resumes/kojo-mensah.pdf'
  },
  {
    id: 4,
    candidateName: 'Akosua Boateng',
    candidateEmail: 'akosua.boateng@email.com',
    jobTitle: 'UI/UX Designer Intern',
    jobType: 'internship',
    jobId: 3,
    status: 'hired',
    appliedAt: '2024-01-17T16:20:00Z',
    matchScore: 95,
    resumeUrl: '/resumes/akosua-boateng.pdf'
  },
  {
    id: 5,
    candidateName: 'Yaw Appiah',
    candidateEmail: 'yaw.appiah@email.com',
    jobTitle: 'DevOps Engineer',
    jobType: 'contract',
    jobId: 4,
    status: 'rejected',
    appliedAt: '2024-01-16T11:10:00Z',
    matchScore: 72,
    resumeUrl: '/resumes/yaw-appiah.pdf'
  }
])

const availableJobs = ref([
  { id: 1, title: 'Senior Frontend Developer' },
  { id: 2, title: 'Backend Developer (Node.js)' },
  { id: 3, title: 'UI/UX Designer Intern' },
  { id: 4, title: 'DevOps Engineer' }
])

// Computed properties
const stats = computed(() => {
  const total = applications.value.length
  const pending = applications.value.filter(app => app.status === 'pending').length
  const interviewed = applications.value.filter(app => app.status === 'interviewed').length
  const hired = applications.value.filter(app => app.status === 'hired').length
  
  return { total, pending, interviewed, hired }
})

const filteredApplications = computed(() => {
  let filtered = applications.value.filter(app => {
    const matchesSearch = !searchQuery.value || 
      app.candidateName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesJob = jobFilter.value === 'all' || app.jobId === parseInt(jobFilter.value)
    const matchesStatus = statusFilter.value === 'all' || app.status === statusFilter.value
    
    return matchesSearch && matchesJob && matchesStatus
  })

  // Sort applications
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.appliedAt) - new Date(a.appliedAt)
      case 'oldest':
        return new Date(a.appliedAt) - new Date(b.appliedAt)
      case 'name':
        return a.candidateName.localeCompare(b.candidateName)
      case 'position':
        return a.jobTitle.localeCompare(b.jobTitle)
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredApplications.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredApplications.value.length))

// Methods
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatJobType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
}

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    reviewing: 'Reviewing',
    interviewed: 'Interviewed',
    hired: 'Hired',
    rejected: 'Rejected'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status) => {
  const variantMap = {
    pending: 'warning',
    reviewing: 'info',
    interviewed: 'info',
    hired: 'success',
    rejected: 'error'
  }
  return variantMap[status] || 'info'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatRelativeDate = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  return `${Math.ceil(diffDays / 7)} weeks ago`
}

const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-fair'
  return 'score-poor'
}

const getEmptyStateMessage = () => {
  if (searchQuery.value) return 'Try adjusting your search terms'
  if (statusFilter.value !== 'all' || jobFilter.value !== 'all') return 'Try adjusting your filters'
  return 'No applications received yet'
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedApplications.value = filteredApplications.value.map(app => app.id)
  } else {
    selectedApplications.value = []
  }
}

const bulkUpdateStatus = (status) => {
  console.log(`Updating ${selectedApplications.value.length} applications to ${status}`)
  // In real app, make API call to update statuses
  selectedApplications.value = []
  selectAll.value = false
}

const viewApplication = (application) => {
  console.log('View application:', application.id)
  // Open application detail modal or navigate to detail page
}

const changeStatus = (application) => {
  console.log('Change status for application:', application.id)
  // Show status change dropdown
}

const downloadResume = (application) => {
  console.log('Download resume:', application.resumeUrl)
  // Trigger file download
}

const contactCandidate = (application) => {
  console.log('Contact candidate:', application.candidateEmail)
  // Open email client or messaging modal
}

const showApplicationMenu = (application) => {
  console.log('Show menu for application:', application.id)
  // Show context menu
}

const exportApplications = () => {
  console.log('Export applications to CSV')
  // Generate and download CSV file
}

// Icon components
const SearchIcon = { template: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>' }
const DownloadIcon = { template: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>' }
const FilterIcon = { template: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9Z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 12 2 2 4-4"/></svg>' }
const EyeIcon = { template: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>' }
const MailIcon = { template: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>' }
const MoreIcon = { template: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/></svg>' }

onMounted(() => {
  console.log('Applications page mounted')
})
</script>

<style scoped>
.applications-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-overview {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--interactive-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  padding-left: 3rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  min-width: 150px;
}

.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--status-info);
  border: 1px solid var(--status-info-border);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.bulk-info {
  font-weight: 600;
  color: var(--text-primary);
}

.bulk-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.applications-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
}

.applications-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 300px 200px 120px 150px 80px 150px;
  padding: 1rem 1.5rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.table-body {
  max-height: 70vh;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 300px 200px 120px 150px 80px 150px;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: var(--interactive-tertiary);
}

.table-row.selected {
  background: var(--interactive-secondary);
}

.table-cell {
  display: flex;
  align-items: center;
}

.checkbox-cell {
  justify-content: center;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--interactive-primary);
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.candidate-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--interactive-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.candidate-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.candidate-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.position-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.position-type {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  text-transform: capitalize;
}

.date-primary {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.date-secondary {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.score-display {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.score-excellent {
  background: var(--status-success);
  color: #32D74B;
}

.score-good {
  background: var(--status-info);
  color: #007AFF;
}

.score-fair {
  background: var(--status-warning);
  color: #FF9F0A;
}

.score-poor {
  background: var(--status-error);
  color: #FF453A;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.pagination-section {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid var(--border-primary);
  margin-top: 2rem;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
  flex: 1;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 50px 250px 150px 100px 120px 70px 120px;
  }
}

@media (max-width: 768px) {
  .applications-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: stretch;
  }
  
  .filter-select {
    min-width: auto;
    flex: 1;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-cell {
    justify-content: flex-start;
    padding: 0.5rem 0;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>