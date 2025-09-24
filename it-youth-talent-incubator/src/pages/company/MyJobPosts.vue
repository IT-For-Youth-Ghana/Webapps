<!--
🏢 Company Job Posts Management
Complete theme support with professional layout
-->
<template>
  <div class="job-posts-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">My Job Posts</h1>
        <p class="page-subtitle">Manage and track your job postings</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <PlusIcon />
        Create Job Post
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Total Posts</div>
        </div>
        <div class="stat-icon total">📝</div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.active }}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-icon active">✅</div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-icon pending">⏳</div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.applications }}</div>
          <div class="stat-label">Applications</div>
        </div>
        <div class="stat-icon applications">👥</div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <SearchIcon />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search job posts..."
          class="input search-input"
        >
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" class="input filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="typeFilter" class="input filter-select">
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>
    </div>

    <!-- Job Posts List -->
    <div class="jobs-section">
      <div v-if="filteredJobs.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No job posts found</h3>
        <p>{{ searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first job post to get started' }}</p>
        <button v-if="!searchQuery && statusFilter === 'all'" @click="showCreateModal = true" class="btn btn-primary">
          Create First Job Post
        </button>
      </div>

      <div v-else class="jobs-grid">
        <div 
          v-for="job in filteredJobs" 
          :key="job.id"
          class="job-card"
          @click="selectJob(job)"
        >
          <div class="job-header">
            <div class="job-title-section">
              <h3 class="job-title">{{ job.title }}</h3>
              <div class="job-meta">
                <span class="job-location">📍 {{ job.location }}</span>
                <span class="job-type">💼 {{ formatJobType(job.type) }}</span>
              </div>
            </div>
            <div class="job-actions">
              <button 
                :class="['badge', `badge-${getStatusVariant(job.status)}`]"
              >
                {{ formatStatus(job.status) }}
              </button>
              <button @click.stop="toggleJobMenu(job.id)" class="job-menu-btn">
                <MoreIcon />
              </button>
            </div>
          </div>

          <div class="job-description">
            {{ truncateText(job.description, 150) }}
          </div>

          <div class="job-stats">
            <div class="stat-item">
              <strong>{{ job.applications || 0 }}</strong>
              <span>Applications</span>
            </div>
            <div class="stat-item">
              <strong>{{ job.views || 0 }}</strong>
              <span>Views</span>
            </div>
            <div class="stat-item">
              <strong>{{ formatDate(job.deadline) }}</strong>
              <span>Deadline</span>
            </div>
          </div>

          <div class="job-footer">
            <span class="job-posted">Posted {{ formatRelativeDate(job.createdAt) }}</span>
            <div class="job-quick-actions">
              <button @click.stop="editJob(job)" class="btn-icon" title="Edit">
                <EditIcon />
              </button>
              <button @click.stop="viewApplications(job)" class="btn-icon" title="View Applications">
                <UsersIcon />
              </button>
              <button @click.stop="duplicateJob(job)" class="btn-icon" title="Duplicate">
                <CopyIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// const router = useRouter() // Disabled for now

// Component state
const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const showCreateModal = ref(false)
const selectedJob = ref(null)

// Sample data (in real app, fetch from API)
const jobs = ref([
  {
    id: 1,
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern frameworks like React or Vue.js.',
    location: 'Accra, Ghana',
    type: 'full-time',
    status: 'active',
    applications: 24,
    views: 156,
    deadline: '2024-02-15',
    createdAt: '2024-01-15',
    salary: { min: 8000, max: 12000, currency: 'GH₵' }
  },
  {
    id: 2,
    title: 'Backend Developer (Node.js)',
    description: 'Join our backend team to develop scalable APIs and microservices. Experience with Node.js, Express, and MongoDB required.',
    location: 'Kumasi, Ghana',
    type: 'full-time',
    status: 'pending',
    applications: 0,
    views: 45,
    deadline: '2024-02-28',
    createdAt: '2024-01-20',
    salary: { min: 7000, max: 10000, currency: 'GH₵' }
  },
  {
    id: 3,
    title: 'UI/UX Designer Intern',
    description: 'Great opportunity for design students to gain hands-on experience in creating user interfaces and improving user experience.',
    location: 'Remote',
    type: 'internship',
    status: 'active',
    applications: 18,
    views: 89,
    deadline: '2024-01-30',
    createdAt: '2024-01-10',
    salary: { min: 1500, max: 2500, currency: 'GH₵' }
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    description: 'We need a DevOps engineer to help us scale our infrastructure and implement CI/CD pipelines.',
    location: 'Accra, Ghana',
    type: 'contract',
    status: 'expired',
    applications: 12,
    views: 78,
    deadline: '2024-01-20',
    createdAt: '2023-12-15',
    salary: { min: 10000, max: 15000, currency: 'GH₵' }
  }
])

// Computed properties
const stats = computed(() => {
  const total = jobs.value.length
  const active = jobs.value.filter(job => job.status === 'active').length
  const pending = jobs.value.filter(job => job.status === 'pending').length
  const applications = jobs.value.reduce((sum, job) => sum + (job.applications || 0), 0)
  
  return { total, active, pending, applications }
})

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = !searchQuery.value || 
      job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'all' || job.status === statusFilter.value
    const matchesType = typeFilter.value === 'all' || job.type === typeFilter.value
    
    return matchesSearch && matchesStatus && matchesType
  })
})

// Methods
const formatJobType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
}

const formatStatus = (status) => {
  const statusMap = {
    active: 'Active',
    pending: 'Under Review',
    expired: 'Expired',
    rejected: 'Rejected'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status) => {
  const variantMap = {
    active: 'success',
    pending: 'warning',
    expired: 'error',
    rejected: 'error'
  }
  return variantMap[status] || 'info'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

const formatRelativeDate = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const selectJob = (job) => {
  selectedJob.value = job
  // Could open job details modal or navigate to detail page
}

const editJob = (job) => {
  console.log('Edit job:', job.id)
  // Navigate to edit form or open modal
}

const viewApplications = (job) => {
  console.log('View applications for job:', job.id)
  // router.push(`/company/applications?jobId=${job.id}`) // Disabled for now
}

const duplicateJob = (job) => {
  console.log('Duplicate job:', job.id)
  // Create copy of job
}

const toggleJobMenu = (jobId) => {
  console.log('Toggle menu for job:', jobId)
  // Show dropdown menu
}

// Icon components (inline SVGs)
const PlusIcon = { template: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>' }
const SearchIcon = { template: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>' }
const MoreIcon = { template: '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/></svg>' }
const EditIcon = { template: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13L2 21l.35-2.935a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/></svg>' }
const UsersIcon = { template: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>' }
const CopyIcon = { template: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"/></svg>' }

onMounted(() => {
  // Load jobs from API in real implementation
  console.log('MyJobPosts component mounted')
})
</script>

<style scoped>
.job-posts-page {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--interactive-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-icon {
  font-size: 1.5rem;
  opacity: 0.7;
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

.jobs-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
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
  margin-bottom: 2rem;
}

.jobs-grid {
  display: grid;
  gap: 1.5rem;
}

.job-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.job-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.job-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.job-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.job-menu-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.job-menu-btn:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.job-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.job-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-item span {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-posted {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.job-quick-actions {
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

@media (max-width: 768px) {
  .job-posts-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .job-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .job-stats {
    gap: 1rem;
  }
  
  .job-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>