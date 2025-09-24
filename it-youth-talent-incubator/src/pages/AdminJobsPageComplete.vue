<template>
  <div class="admin-jobs-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Job Management</h1>
        <p class="page-description">
          Manage all job postings, review applications, and track hiring progress
        </p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 6H4V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2z" fill="#1b65b2"/>
            <path d="M4 8h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8z" fill="#8fb2d6"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" fill="#22c55e"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.active }}</div>
          <div class="stat-label">Active Jobs</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="#f59e0b"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.draft }}</div>
          <div class="stat-label">Draft Jobs</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="#195aa5"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalApplications }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-container">
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search jobs by title, company, or location..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-button"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Type</label>
          <select v-model="typeFilter" class="filter-select">
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Sort by</label>
          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="applications">Most Applications</option>
          </select>
        </div>

        <div class="filter-actions">
          <button 
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="clear-filters-btn"
            type="button"
          >
            Clear Filters
          </button>
          
          <button 
            @click="handleCreateJob"
            class="create-job-btn"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
            </svg>
            Create Job
          </button>
        </div>
      </div>
    </div>

    <!-- Jobs Table -->
    <div class="jobs-table-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading jobs...</p>
      </div>

      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M20 6H4V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2z" fill="#6E7681"/>
          <path d="M4 8h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8z" fill="#6E7681"/>
        </svg>
        <h3>No jobs found</h3>
        <p>Try adjusting your filters or create a new job.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="jobs-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Type</th>
              <th>Location</th>
              <th>Applications</th>
              <th>Status</th>
              <th>Posted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="job in filteredJobs" 
              :key="job.id"
              class="job-row"
            >
              <td class="job-title-cell">
                <div class="job-title-content">
                  <h4 class="job-title">{{ job.title }}</h4>
                  <p v-if="job.department" class="job-department">{{ job.department }}</p>
                </div>
              </td>
              
              <td class="company-cell">
                <div class="company-info">
                  <img 
                    v-if="job.companyLogo" 
                    :src="job.companyLogo" 
                    :alt="job.company"
                    class="company-logo"
                  />
                  <span class="company-name">{{ job.company }}</span>
                </div>
              </td>
              
              <td class="type-cell">
                <span class="job-type-badge" :class="getTypeBadgeClass(job.type)">
                  {{ job.type }}
                </span>
              </td>
              
              <td class="location-cell">
                <div class="location-info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ job.location }}</span>
                </div>
              </td>
              
              <td class="applications-cell">
                <div class="applications-info">
                  <span class="applications-count">{{ job.applicationCount || 0 }}</span>
                  <span class="applications-label">applications</span>
                </div>
              </td>
              
              <td class="status-cell">
                <span class="status-badge" :class="getStatusBadgeClass(job.status)">
                  {{ formatStatus(job.status) }}
                </span>
              </td>
              
              <td class="date-cell">
                <span class="posted-date">{{ formatDate(job.postedDate) }}</span>
              </td>
              
              <td class="actions-cell">
                <div class="actions-menu">
                  <button
                    @click="handleToggleStatus(job)"
                    class="action-btn toggle-btn"
                    :title="job.status === 'active' ? 'Deactivate job' : 'Activate job'"
                  >
                    <svg v-if="job.status === 'active'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M10 9V5a3 3 0 0 1 6 0v4M2 13a11 11 0 0 0 20 0" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 1v6M12 17v6M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h6M17 12h6M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  
                  <button
                    @click="handleEditJob(job)"
                    class="action-btn edit-btn"
                    title="Edit job"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  
                  <button
                    @click="confirmDelete(job.id)"
                    class="action-btn delete-btn"
                    title="Delete job"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Job Form Modal -->
    <JobFormModal
      v-if="showJobModal"
      :job="editingJob"
      @submit="handleJobSubmit"
      @close="closeJobModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import JobFormModal from '../components/admin/JobFormModal.vue'

// State management
const loading = ref(true)
const showJobModal = ref(false)
const editingJob = ref(null)
const jobs = ref([])

// Filter state
const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const sortBy = ref('newest')

// Computed properties
const stats = computed(() => {
  const total = jobs.value.length
  const active = jobs.value.filter(job => job.status === 'active').length
  const draft = jobs.value.filter(job => job.status === 'draft').length
  const closed = jobs.value.filter(job => job.status === 'closed').length
  const totalApplications = jobs.value.reduce((sum, job) => sum + (job.applicationCount || 0), 0)
  
  return {
    total,
    active,
    draft,
    closed,
    totalApplications
  }
})

const filteredJobs = computed(() => {
  let filtered = [...jobs.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(job => job.status === statusFilter.value)
  }

  // Type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(job => job.type === typeFilter.value)
  }

  // Sorting
  switch (sortBy.value) {
    case 'newest':
      return filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate))
    case 'title':
      return filtered.sort((a, b) => a.title.localeCompare(b.title))
    case 'applications':
      return filtered.sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0))
    default:
      return filtered
  }
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         statusFilter.value !== 'all' || 
         typeFilter.value !== 'all'
})

// Methods
const clearSearch = () => {
  searchQuery.value = ''
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
  sortBy.value = 'newest'
}

const handleCreateJob = () => {
  editingJob.value = null
  showJobModal.value = true
}

const handleEditJob = (job) => {
  editingJob.value = job
  showJobModal.value = true
}

const handleDeleteJob = async (jobId) => {
  try {
    const index = jobs.value.findIndex(job => job.id === jobId)
    if (index !== -1) {
      jobs.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Error deleting job:', error)
  }
}

const handleToggleStatus = async (job) => {
  try {
    const newStatus = job.status === 'active' ? 'closed' : 'active'
    const index = jobs.value.findIndex(j => j.id === job.id)
    if (index !== -1) {
      jobs.value[index].status = newStatus
    }
  } catch (error) {
    console.error('Error toggling job status:', error)
  }
}

const handleJobSubmit = (jobData) => {
  if (editingJob.value) {
    // Update existing job
    const index = jobs.value.findIndex(job => job.id === editingJob.value.id)
    if (index !== -1) {
      jobs.value[index] = { ...jobs.value[index], ...jobData }
    }
  } else {
    // Create new job
    const newJob = {
      id: Date.now(),
      ...jobData,
      applicationCount: 0,
      viewCount: 0,
      postedDate: new Date().toISOString()
    }
    jobs.value.unshift(newJob)
  }
  
  closeJobModal()
}

const closeJobModal = () => {
  showJobModal.value = false
  editingJob.value = null
}

const confirmDelete = (jobId) => {
  const job = jobs.value.find(j => j.id === jobId)
  if (job && confirm(`Are you sure you want to delete the job "${job.title}"?`)) {
    handleDeleteJob(jobId)
  }
}

// Helper functions
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    active: 'status-active',
    draft: 'status-draft',
    closed: 'status-closed',
    expired: 'status-expired'
  }
  return statusClasses[status] || 'status-draft'
}

const getTypeBadgeClass = (type) => {
  const typeClasses = {
    'Full-time': 'type-fulltime',
    'Part-time': 'type-parttime',
    'Internship': 'type-internship',
    'Contract': 'type-contract',
    'Remote': 'type-remote'
  }
  return typeClasses[type] || 'type-default'
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
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

const fetchJobs = async () => {
  loading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    jobs.value = [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'TechCorp Ghana',
        location: 'Accra',
        type: 'Full-time',
        status: 'active',
        salary: 'GHS 8,000 - 12,000',
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        applicationCount: 23,
        viewCount: 156,
        description: 'We are looking for a talented Frontend Developer to join our team.',
        requirements: ['React', 'JavaScript', 'CSS', 'Git'],
        responsibilities: ['Develop user-facing features', 'Write clean code'],
        benefits: ['Health Insurance', 'Flexible Hours']
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'StartupGH',
        location: 'Kumasi',
        type: 'Full-time',
        status: 'active',
        salary: 'GHS 6,000 - 10,000',
        postedDate: '2024-01-12',
        deadline: '2024-02-12',
        applicationCount: 18,
        viewCount: 89,
        description: 'Join our growing team as a Backend Developer.',
        requirements: ['Node.js', 'Python', 'MongoDB'],
        responsibilities: ['Design APIs', 'Optimize database'],
        benefits: ['Stock Options', 'Learning Budget']
      },
      {
        id: 3,
        title: 'UI/UX Designer',
        company: 'DesignHub Africa',
        location: 'Accra',
        type: 'Part-time',
        status: 'draft',
        salary: 'GHS 4,000 - 6,000',
        postedDate: '2024-01-10',
        deadline: '2024-02-10',
        applicationCount: 0,
        viewCount: 0,
        description: 'We need a creative UI/UX Designer.',
        requirements: ['Figma', 'Adobe Creative Suite'],
        responsibilities: ['Create wireframes', 'Conduct user research'],
        benefits: ['Flexible Schedule', 'Creative Freedom']
      },
      {
        id: 4,
        title: 'Data Analyst',
        company: 'DataCorp',
        location: 'Tamale',
        type: 'Internship',
        status: 'closed',
        salary: 'GHS 1,500 - 2,500',
        postedDate: '2024-01-08',
        deadline: '2024-02-08',
        applicationCount: 45,
        viewCount: 234,
        description: 'Learn data analysis in a real-world environment.',
        requirements: ['Python', 'SQL', 'Excel'],
        responsibilities: ['Analyze data', 'Create reports'],
        benefits: ['Mentorship Program', 'Certificate']
      },
      {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Cape Coast',
        type: 'Full-time',
        status: 'expired',
        salary: 'GHS 10,000 - 15,000',
        postedDate: '2024-01-05',
        deadline: '2024-01-25',
        applicationCount: 12,
        viewCount: 78,
        description: 'Help us build and maintain cloud infrastructure.',
        requirements: ['Docker', 'Kubernetes', 'AWS'],
        responsibilities: ['Manage infrastructure', 'Implement CI/CD'],
        benefits: ['High Salary', 'Cloud Certifications']
      }
    ]
  } catch (error) {
    console.error('Error fetching jobs:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchJobs()
})
</script>

<style scoped>
.admin-jobs-page {
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

.search-container {
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6E7681;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1b65b2;
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.2);
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background: transparent;
  border: none;
  color: #6E7681;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #30363D;
  color: #8fb2d6;
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

.create-job-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  background: #1b65b2;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-job-btn:hover {
  background: #195aa5;
  transform: translateY(-1px);
}

.jobs-table-container {
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

.jobs-table {
  width: 100%;
  border-collapse: collapse;
}

.jobs-table th {
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

.jobs-table th:first-child {
  padding-left: 1.5rem;
}

.jobs-table th:last-child {
  padding-right: 1.5rem;
}

.job-row {
  border-bottom: 1px solid #30363D;
  transition: background-color 0.2s ease;
}

.job-row:hover {
  background-color: rgba(27, 101, 178, 0.05);
}

.job-row td {
  padding: 1rem;
  vertical-align: middle;
}

.job-row td:first-child {
  padding-left: 1.5rem;
}

.job-row td:last-child {
  padding-right: 1.5rem;
}

.job-title-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.job-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
}

.job-department {
  margin: 0;
  font-size: 0.75rem;
  color: #6E7681;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.company-logo {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
}

.company-name {
  font-size: 0.875rem;
  color: #8fb2d6;
}

.job-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.type-fulltime {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.type-parttime {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.type-internship {
  background: rgba(143, 178, 214, 0.2);
  color: #1b65b2;
}

.type-contract {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.type-remote {
  background: rgba(27, 101, 178, 0.2);
  color: #1b65b2;
}

.type-default {
  background: #21262D;
  color: #8fb2d6;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #8fb2d6;
}

.applications-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.applications-count {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}

.applications-label {
  font-size: 0.75rem;
  color: #6E7681;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-draft {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-closed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-expired {
  background: rgba(110, 118, 129, 0.2);
  color: #6E7681;
}

.posted-date {
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

.toggle-btn {
  color: #1b65b2;
}

.edit-btn {
  color: #3b82f6;
}

.delete-btn {
  color: #ef4444;
}

.action-btn:hover.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .admin-jobs-page {
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
    justify-content: stretch;
  }
  
  .filter-actions button {
    flex: 1;
  }
}
</style>