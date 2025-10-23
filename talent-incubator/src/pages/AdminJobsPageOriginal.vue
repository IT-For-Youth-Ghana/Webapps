<script setup>
import { ref, computed, onMounted } from 'vue'
import JobFormModal from '../components/admin/JobFormModal.vue'

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const sortBy = ref('newest')

const showJobModal = ref(false)
const editingJob = ref(null)
const jobs = ref([])

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
  { value: 'expired', label: 'Expired' }
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Remote', label: 'Remote' }
]

const filteredJobs = computed(() => {
  let filtered = [...jobs.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(job => job.status === statusFilter.value)
  }

  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(job => job.type === typeFilter.value)
  }

  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'deadline':
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      break
    case 'applications':
      filtered.sort((a, b) => b.applicationCount - a.applicationCount)
      break
  }

  return filtered
})

const stats = computed(() => {
  const total = jobs.value.length
  const active = jobs.value.filter(job => job.status === 'active').length
  const draft = jobs.value.filter(job => job.status === 'draft').length
  const closed = jobs.value.filter(job => job.status === 'closed').length
  const totalApplications = jobs.value.reduce((sum, job) => sum + job.applicationCount, 0)

  return { total, active, draft, closed, totalApplications }
})

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
  editingJob.value = { ...job }
  showJobModal.value = true
}

const handleDeleteJob = async (jobId) => {
  if (confirm('Are you sure you want to delete this job posting?')) {
    const index = jobs.value.findIndex(job => job.id === jobId)
    if (index !== -1) {
      jobs.value.splice(index, 1)
      console.log('Job deleted:', jobId)
    }
  }
}

const handleToggleStatus = async (job) => {
  const newStatus = job.status === 'active' ? 'closed' : 'active'
  job.status = newStatus
  console.log('Job status updated:', job.id, newStatus)
}

const handleJobSubmit = (jobData) => {
  if (editingJob.value) {
    const index = jobs.value.findIndex(job => job.id === editingJob.value.id)
    if (index !== -1) {
      jobs.value[index] = { ...jobData, id: editingJob.value.id }
      console.log('Job updated:', jobData)
    }
  } else {
    const newJob = {
      ...jobData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      applicationCount: 0,
      viewCount: 0
    }
    jobs.value.unshift(newJob)
    console.log('Job created:', newJob)
  }
  
  showJobModal.value = false
  editingJob.value = null
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    draft: 'warning',
    closed: 'danger',
    expired: 'secondary'
  }
  return colors[status] || 'secondary'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const fetchJobs = async () => {
  loading.value = true
  
  try {
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
        createdAt: '2024-01-15',
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
        createdAt: '2024-01-12',
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
        createdAt: '2024-01-10',
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
        createdAt: '2024-01-08',
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
        createdAt: '2024-01-05',
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

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="jobs-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Job Management</h1>
        <p class="page-subtitle">Create, edit, and manage job postings</p>
      </div>
      <button @click="handleCreateJob" class="btn-primary">
        Create New Job
      </button>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">Active Jobs</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.draft }}</div>
          <div class="stat-label">Draft Jobs</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">{{ stats.totalApplications }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section card">
      <div class="filters-header">
        <h3 class="filters-title">Filter Jobs</h3>
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
            placeholder="Search jobs, companies, or locations..."
          >
        </div>

        <div class="filter-selects">
          <select v-model="statusFilter" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="typeFilter" class="filter-select">
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Deadline Soon</option>
            <option value="applications">Most Applications</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <p class="results-count">
        <span class="count-number">{{ filteredJobs.length }}</span>
        {{ filteredJobs.length === 1 ? 'job' : 'jobs' }}
        <span v-if="searchQuery" class="search-term">matching "{{ searchQuery }}"</span>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading jobs...</p>
    </div>

    <!-- Jobs Table -->
    <div v-else-if="filteredJobs.length > 0" class="jobs-table-container card">
      <div class="table-responsive">
        <table class="jobs-table">
          <thead>
            <tr>
              <th>Job Details</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Deadline</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job.id" class="job-row">
              <td class="job-details">
                <div class="job-info">
                  <h4 class="job-title">{{ job.title }}</h4>
                  <p class="job-meta">{{ job.company }} • {{ job.location }} • {{ job.type }}</p>
                  <p class="job-salary">{{ job.salary }}</p>
                </div>
              </td>
              <td class="job-status">
                <span :class="['status-badge', getStatusColor(job.status)]">
                  {{ job.status }}
                </span>
              </td>
              <td class="job-applications">
                <div class="application-stats">
                  <span class="app-count">{{ job.applicationCount }}</span>
                  <span class="view-count">{{ job.viewCount }} views</span>
                </div>
              </td>
              <td class="job-deadline">
                {{ formatDate(job.deadline) }}
              </td>
              <td class="job-created">
                {{ formatDate(job.createdAt) }}
              </td>
              <td class="job-actions">
                <div class="action-buttons">
                  <button
                    @click="handleEditJob(job)"
                    class="action-btn edit"
                    title="Edit Job"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleToggleStatus(job)"
                    :class="['action-btn', job.status === 'active' ? 'close' : 'activate']"
                    :title="job.status === 'active' ? 'Close Job' : 'Activate Job'"
                  >
                    {{ job.status === 'active' ? 'Close' : 'Activate' }}
                  </button>
                  <button
                    @click="handleDeleteJob(job.id)"
                    class="action-btn delete"
                    title="Delete Job"
                  >
                    Delete
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
        <h3 class="empty-title">No jobs found</h3>
        <p class="empty-description">
          {{ searchQuery ? 'Try adjusting your search or filter criteria.' : 'Start by creating your first job posting.' }}
        </p>
        <div class="empty-actions">
          <button v-if="searchQuery" @click="clearFilters" class="btn-secondary">
            Clear Filters
          </button>
          <button @click="handleCreateJob" class="btn-primary">
            Create New Job
          </button>
        </div>
      </div>
    </div>

    <!-- Job Form Modal -->
    <JobFormModal
      v-if="showJobModal"
      :job="editingJob"
      @submit="handleJobSubmit"
      @close="showJobModal = false"
    />
  </div>
</template>

<style scoped>
.jobs-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
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
.stat-card.success::before { background: #32D74B; }
.stat-card.warning::before { background: #FF9F0A; }
.stat-card.info::before { background: #BF5AF2; }

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

.jobs-table-container {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.jobs-table {
  width: 100%;
  border-collapse: collapse;
}

.jobs-table th {
  background: #21262D;
  color: #F0F6FC;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #30363D;
}

.job-row {
  border-bottom: 1px solid #30363D;
  transition: background 150ms ease;
}

.job-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.jobs-table td {
  padding: 1rem;
  vertical-align: top;
}

.job-details {
  min-width: 250px;
}

.job-title {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.job-meta {
  font-size: 0.875rem;
  color: #8B949E;
  margin: 0 0 0.25rem 0;
}

.job-salary {
  font-size: 0.875rem;
  color: #32D74B;
  font-weight: 500;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.status-badge.warning {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.status-badge.danger {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.status-badge.secondary {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.application-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-count {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FC;
}

.view-count {
  font-size: 0.75rem;
  color: #8B949E;
}

.job-deadline,
.job-created {
  font-size: 0.875rem;
  color: #8B949E;
  white-space: nowrap;
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

.action-btn.edit {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.action-btn.edit:hover {
  background: rgba(0, 122, 255, 0.2);
}

.action-btn.activate {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.action-btn.activate:hover {
  background: rgba(50, 215, 75, 0.2);
}

.action-btn.close {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.action-btn.close:hover {
  background: rgba(255, 159, 10, 0.2);
}

.action-btn.delete {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.action-btn.delete:hover {
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

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .jobs-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
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

  .jobs-table th,
  .jobs-table td {
    padding: 0.75rem 0.5rem;
  }

  .job-details {
    min-width: 200px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }

  .empty-actions {
    flex-direction: column;
    align-items: center;
  }

  .empty-actions button {
    width: 100%;
    max-width: 12rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>