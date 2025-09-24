<template>
  <div class="admin-applications-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Application Management</h1>
        <p class="page-description">
          Review and manage job applications from students across all positions
        </p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#1b65b2" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="#1b65b2" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="#f59e0b" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#22c55e" stroke-width="2"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="#22c55e" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.rejected }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Job Position</label>
          <select v-model="jobFilter" class="filter-select">
            <option value="all">All Positions</option>
            <option v-for="job in availableJobs" :key="job" :value="job">
              {{ job }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Date Range</label>
          <select v-model="dateFilter" class="filter-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
            <option value="name">Student Name</option>
          </select>
        </div>

        <div class="filter-actions">
          <button 
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Applications Table -->
    <div class="applications-table-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>

      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#6E7681" stroke-width="2"/>
        </svg>
        <h3>No applications found</h3>
        <p>Try adjusting your filters to see more applications.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="applications-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Position Applied</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Experience Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="application in filteredApplications" 
              :key="application.id"
              class="application-row"
            >
              <td class="student-cell">
                <div class="student-info">
                  <div class="student-avatar">
                    <span class="student-initial">{{ application.studentName.charAt(0) }}</span>
                  </div>
                  <div class="student-details">
                    <h4 class="student-name">{{ application.studentName }}</h4>
                    <p class="student-email">{{ application.studentEmail }}</p>
                  </div>
                </div>
              </td>
              
              <td class="position-cell">
                <div class="position-info">
                  <h4 class="position-title">{{ application.jobTitle }}</h4>
                  <p class="company-name">{{ application.company }}</p>
                </div>
              </td>
              
              <td class="date-cell">
                <span class="applied-date">{{ formatDate(application.appliedDate) }}</span>
              </td>
              
              <td class="status-cell">
                <div class="status-badge-container">
                  <select 
                    v-model="application.status" 
                    @change="updateApplicationStatus(application)"
                    class="status-select"
                    :class="getStatusSelectClass(application.status)"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </td>
              
              <td class="experience-cell">
                <span class="experience-level">{{ application.experienceLevel }}</span>
              </td>
              
              <td class="actions-cell">
                <div class="actions-menu">
                  <button
                    @click="viewApplication(application)"
                    class="action-btn view-btn"
                    title="View Details"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  
                  <button
                    @click="downloadResume(application)"
                    class="action-btn download-btn"
                    title="Download Resume"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  
                  <button
                    @click="contactStudent(application)"
                    class="action-btn contact-btn"
                    title="Contact Student"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <ApplicationDetailModal
      v-if="showApplicationModal"
      :application="selectedApplication"
      @update-status="updateApplicationStatus"
      @close="closeApplicationModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ApplicationDetailModal from '../components/admin/ApplicationDetailModal.vue'

// State management
const loading = ref(true)
const showApplicationModal = ref(false)
const selectedApplication = ref(null)
const applications = ref([])

// Filter state
const statusFilter = ref('all')
const jobFilter = ref('all')
const dateFilter = ref('all')
const sortBy = ref('newest')

// Computed properties
const stats = computed(() => {
  const total = applications.value.length
  const pending = applications.value.filter(app => app.status === 'pending').length
  const approved = applications.value.filter(app => app.status === 'approved').length
  const rejected = applications.value.filter(app => app.status === 'rejected').length
  
  return {
    total,
    pending,
    approved,
    rejected
  }
})

const availableJobs = computed(() => {
  const jobs = [...new Set(applications.value.map(app => app.jobTitle))]
  return jobs.sort()
})

const filteredApplications = computed(() => {
  let filtered = [...applications.value]

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === statusFilter.value)
  }

  // Job filter
  if (jobFilter.value !== 'all') {
    filtered = filtered.filter(app => app.jobTitle === jobFilter.value)
  }

  // Date filter
  if (dateFilter.value !== 'all') {
    const now = new Date()
    filtered = filtered.filter(app => {
      const appDate = new Date(app.appliedDate)
      switch (dateFilter.value) {
        case 'today':
          return appDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return appDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return appDate >= monthAgo
        default:
          return true
      }
    })
  }

  // Sorting
  switch (sortBy.value) {
    case 'newest':
      return filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate))
    case 'status':
      return filtered.sort((a, b) => a.status.localeCompare(b.status))
    case 'name':
      return filtered.sort((a, b) => a.studentName.localeCompare(b.studentName))
    default:
      return filtered
  }
})

const hasActiveFilters = computed(() => {
  return statusFilter.value !== 'all' || 
         jobFilter.value !== 'all' || 
         dateFilter.value !== 'all'
})

// Methods
const clearFilters = () => {
  statusFilter.value = 'all'
  jobFilter.value = 'all'
  dateFilter.value = 'all'
  sortBy.value = 'newest'
}

const updateApplicationStatus = async (application) => {
  try {
    console.log('Updating status:', application.id, 'to', application.status)
    // In real app, this would make API call
  } catch (error) {
    console.error('Error updating application status:', error)
  }
}

const viewApplication = (application) => {
  selectedApplication.value = application
  showApplicationModal.value = true
}

const downloadResume = (application) => {
  console.log('Downloading resume for:', application.studentName)
  // In real app, this would download the actual resume file
}

const contactStudent = (application) => {
  console.log('Contacting student:', application.studentEmail)
  // In real app, this would open email client or messaging system
}

const closeApplicationModal = () => {
  showApplicationModal.value = false
  selectedApplication.value = null
}

// Helper functions
const getStatusSelectClass = (status) => {
  const statusClasses = {
    pending: 'status-pending',
    reviewing: 'status-reviewing',
    interview: 'status-interview',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }
  return statusClasses[status] || 'status-pending'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchApplications = async () => {
  loading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    applications.value = [
      {
        id: 1,
        studentName: 'Kwame Asante',
        studentEmail: 'kwame.asante@email.com',
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Ghana',
        appliedDate: '2024-01-20',
        status: 'pending',
        experienceLevel: 'Junior',
        coverLetter: 'I am excited to apply for the Frontend Developer position...',
        skills: ['React', 'JavaScript', 'CSS'],
        education: 'BSc Computer Science - University of Ghana'
      },
      {
        id: 2,
        studentName: 'Ama Gyamfi',
        studentEmail: 'ama.gyamfi@email.com',
        jobTitle: 'UI/UX Designer',
        company: 'DesignHub Africa',
        appliedDate: '2024-01-18',
        status: 'reviewing',
        experienceLevel: 'Mid-level',
        coverLetter: 'I have 3 years of experience in UI/UX design...',
        skills: ['Figma', 'Adobe XD', 'Prototyping'],
        education: 'BA Graphic Design - KNUST'
      },
      {
        id: 3,
        studentName: 'Kofi Mensah',
        studentEmail: 'kofi.mensah@email.com',
        jobTitle: 'Backend Developer',
        company: 'StartupGH',
        appliedDate: '2024-01-15',
        status: 'interview',
        experienceLevel: 'Senior',
        coverLetter: 'I am a full-stack developer with focus on backend...',
        skills: ['Node.js', 'Python', 'MongoDB'],
        education: 'MSc Computer Science - University of Cape Coast'
      },
      {
        id: 4,
        studentName: 'Akosua Osei',
        studentEmail: 'akosua.osei@email.com',
        jobTitle: 'Data Analyst',
        company: 'DataCorp',
        appliedDate: '2024-01-12',
        status: 'approved',
        experienceLevel: 'Junior',
        coverLetter: 'I am passionate about data analysis and visualization...',
        skills: ['Python', 'SQL', 'Tableau'],
        education: 'BSc Mathematics - University of Ghana'
      },
      {
        id: 5,
        studentName: 'Yaw Boateng',
        studentEmail: 'yaw.boateng@email.com',
        jobTitle: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        appliedDate: '2024-01-10',
        status: 'rejected',
        experienceLevel: 'Mid-level',
        coverLetter: 'I have experience with cloud infrastructure and DevOps...',
        skills: ['Docker', 'Kubernetes', 'AWS'],
        education: 'BSc Computer Engineering - KNUST'
      },
      {
        id: 6,
        studentName: 'Efua Adjei',
        studentEmail: 'efua.adjei@email.com',
        jobTitle: 'Mobile App Developer',
        company: 'MobileTech GH',
        appliedDate: '2024-01-08',
        status: 'pending',
        experienceLevel: 'Junior',
        coverLetter: 'I am excited about mobile app development...',
        skills: ['React Native', 'Flutter', 'JavaScript'],
        education: 'BSc Information Technology - UCC'
      }
    ]
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.admin-applications-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.125rem;
  color: #8fb2d6;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 1.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #21262D;
  border-radius: 8px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #8fb2d6;
  font-weight: 500;
}

.filters-container {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #8fb2d6;
}

.filter-select {
  padding: 8px 12px;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #1b65b2;
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.2);
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.clear-filters-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #30363D;
  border-radius: 8px;
  color: #8fb2d6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: #30363D;
  border-color: #6E7681;
}

.applications-table-container {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #30363D;
  border-top: 3px solid #1b65b2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
}

.empty-state h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  color: #8fb2d6;
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table th {
  background: #21262D;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #8fb2d6;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #30363D;
  white-space: nowrap;
}

.application-row {
  border-bottom: 1px solid #30363D;
  transition: background-color 0.2s ease;
}

.application-row:hover {
  background-color: rgba(27, 101, 178, 0.05);
}

.application-row td {
  padding: 1rem;
  vertical-align: middle;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-initial {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.student-details {
  flex: 1;
}

.student-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.student-email {
  margin: 0;
  font-size: 0.75rem;
  color: #8fb2d6;
}

.position-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.position-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.company-name {
  margin: 0;
  font-size: 0.75rem;
  color: #8fb2d6;
}

.applied-date {
  font-size: 0.875rem;
  color: #8fb2d6;
}

.status-select {
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  border: none;
  cursor: pointer;
}

.status-pending {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-reviewing {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-interview {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.status-approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.experience-level {
  font-size: 0.875rem;
  color: #8fb2d6;
}

.actions-menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #21262D;
  border-color: #30363D;
}

.view-btn {
  color: #3b82f6;
}

.download-btn {
  color: #22c55e;
}

.contact-btn {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .admin-applications-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
  }
}
</style>