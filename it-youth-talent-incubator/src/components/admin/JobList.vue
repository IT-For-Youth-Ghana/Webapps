<!-- 
🚀 IT Youth Talent Incubator - Job List Management Component

PURPOSE: A comprehensive job management interface for administrators to view, filter,
and manage all job postings in the system with both card and table view options.

WHAT IT DOES:
- Displays all job postings in both card grid and table list formats
- Provides advanced filtering by status (active/inactive/expired) and search
- Enables bulk operations: select all, bulk activate/deactivate/delete
- Shows job statistics: application counts, deadlines, salary ranges
- Manages job lifecycle: edit, toggle status, duplicate, delete operations
- Highlights expiring jobs with warning badges
- Tracks application metrics for each job posting

FOR CO-PROGRAMMERS:
- Sample jobs data in `jobs` ref (lines 9-90) - replace with API calls
- View modes: 'cards' (default) or 'list' toggle (line 98)
- Filtering logic in computed `filteredJobs` (lines 101-138)
- Sorting supports: createdDate, deadline, applicationCount, title
- Status management: 'active', 'inactive', 'expired' with color coding
- Bulk operations: select multiple jobs for mass actions
- Job actions: edit, toggle status, duplicate, delete, view applications

JOB CARD FEATURES:
- Job title, company, location, salary range display
- Application count with clickable link to view applicants
- Skills preview (first 3 skills + count of remaining)
- Status badges with color coding
- Expiring soon warnings (within 7 days)
- Individual action buttons for each job

JOB TABLE FEATURES:
- Sortable columns by clicking headers
- Compact view for large datasets
- Checkbox selection for bulk operations
- Quick action buttons in each row
- Responsive design for mobile devices

FILTER & SEARCH:
- Status filter: all, active, inactive, expired
- Text search: job title, company name, location
- Sort options: date created, deadline, application count, alphabetical
- Real-time filtering without page reload
-->
<script setup>
import { ref, computed } from 'vue'

// Sample jobs data
const jobs = ref([
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'TechCorp Ghana',
    location: 'Accra, Ghana',
    type: 'Internship',
    salary: { min: 1500, max: 2000, currency: 'GH₵' },
    status: 'active',
    createdDate: '2025-01-15',
    deadline: '2025-02-15',
    applicationCount: 23,
    description: 'Join our dynamic team as a Frontend Developer Intern...',
    requiredSkills: ['JavaScript', 'React', 'HTML/CSS'],
    isRemote: false,
    experienceLevel: 'entry'
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Digital Solutions Ltd',
    location: 'Kumasi, Ghana',
    type: 'Full-time',
    salary: { min: 3500, max: 5000, currency: 'GH₵' },
    status: 'active',
    createdDate: '2025-01-10',
    deadline: '2025-01-30',
    applicationCount: 45,
    description: 'Looking for an experienced Backend Developer...',
    requiredSkills: ['PHP', 'Laravel', 'MySQL'],
    isRemote: true,
    experienceLevel: 'mid'
  },
  {
    id: 3,
    title: 'Mobile App Developer',
    company: 'Innovation Hub',
    location: 'Tamale, Ghana',
    type: 'Contract',
    salary: { min: 4000, max: 6000, currency: 'GH₵' },
    status: 'inactive',
    createdDate: '2025-01-08',
    deadline: '2025-02-20',
    applicationCount: 12,
    description: 'Develop mobile applications using React Native...',
    requiredSkills: ['React Native', 'Flutter', 'Firebase'],
    isRemote: false,
    experienceLevel: 'senior'
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Accra, Ghana',
    type: 'Part-time',
    salary: { min: 2000, max: 3000, currency: 'GH₵' },
    status: 'expired',
    createdDate: '2024-12-20',
    deadline: '2025-01-20',
    applicationCount: 8,
    description: 'Analyze data and provide business insights...',
    requiredSkills: ['Python', 'SQL', 'Excel'],
    isRemote: true,
    experienceLevel: 'junior'
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    location: 'Remote',
    type: 'Full-time',
    salary: { min: 6000, max: 8000, currency: 'GH₵' },
    status: 'active',
    createdDate: '2025-01-12',
    deadline: '2025-02-28',
    applicationCount: 31,
    description: 'Manage cloud infrastructure and deployment...',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes'],
    isRemote: true,
    experienceLevel: 'senior'
  }
])

// Filters and search
const statusFilter = ref('all')
const searchQuery = ref('')
const sortBy = ref('createdDate')
const sortOrder = ref('desc')
const selectedJobs = ref([])
const viewMode = ref('cards') // 'cards' or 'list'

// Computed properties
const filteredJobs = computed(() => {
  let filtered = jobs.value

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(job => job.status === statusFilter.value)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    // Special handling for dates
    if (sortBy.value.includes('Date') || sortBy.value === 'deadline') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

// Methods
const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'status-active'
    case 'inactive': return 'status-inactive'
    case 'expired': return 'status-expired'
    default: return 'status-active'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Active'
    case 'inactive': return 'Inactive'
    case 'expired': return 'Expired'
    default: return 'Active'
  }
}

const formatSalary = (salary) => {
  if (salary.min && salary.max) {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`
  } else if (salary.min) {
    return `${salary.currency} ${salary.min.toLocaleString()}+`
  }
  return 'Negotiable'
}

const isExpiringSoon = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays > 0
}

const editJob = (job) => {
  console.log('Edit job:', job.title)
  // TODO: Navigate to JobForm component with job data for editing
  // Should populate form fields with existing job data
}

const toggleJobStatus = (job) => {
  const newStatus = job.status === 'active' ? 'inactive' : 'active'
  job.status = newStatus
  console.log(`Job ${job.title} status changed to:`, newStatus)
}

const deleteJob = (job) => {
  if (confirm(`Delete job posting "${job.title}"?`)) {
    const index = jobs.value.findIndex(j => j.id === job.id)
    if (index > -1) {
      jobs.value.splice(index, 1)
    }
  }
}

const viewApplications = (job) => {
  console.log('View applications for:', job.title)
  // TODO: Navigate to ApplicationsTable component filtered by this job ID
  // Should show only applications for this specific job posting
}

const duplicateJob = (job) => {
  // Creates a copy of the job with reset metrics
  const newJob = {
    ...job,
    id: Date.now(), // TODO: Replace with proper UUID generation
    title: `${job.title} (Copy)`,
    status: 'inactive', // New jobs start inactive for review
    createdDate: new Date().toISOString().split('T')[0],
    applicationCount: 0 // Reset application count for new posting
  }
  jobs.value.unshift(newJob) // Add to beginning of list
  console.log('Duplicated job:', newJob.title)
}

const selectAll = (event) => {
  if (event.target.checked) {
    selectedJobs.value = filteredJobs.value.map(job => job.id)
  } else {
    selectedJobs.value = []
  }
}

const bulkActivate = () => {
  if (selectedJobs.value.length === 0) return
  
  jobs.value.forEach(job => {
    if (selectedJobs.value.includes(job.id)) {
      job.status = 'active'
    }
  })
  selectedJobs.value = []
}

const bulkDeactivate = () => {
  if (selectedJobs.value.length === 0) return
  
  jobs.value.forEach(job => {
    if (selectedJobs.value.includes(job.id)) {
      job.status = 'inactive'
    }
  })
  selectedJobs.value = []
}

const bulkDelete = () => {
  if (selectedJobs.value.length === 0) return
  
  if (confirm(`Delete ${selectedJobs.value.length} selected jobs?`)) {
    jobs.value = jobs.value.filter(job => !selectedJobs.value.includes(job.id))
    selectedJobs.value = []
  }
}
</script>

<template>
  <div>
    <h1>Job Management</h1>
    <p class="subtitle">Manage job postings and monitor applications</p>

    <div class="section-container">
      <!-- Controls -->
      <div class="controls-section">
        <div class="filters-row">
          <div class="filters">
            <div class="filter-group">
              <label class="filter-label">Status:</label>
              <select v-model="statusFilter" class="filter-select">
                <option value="all">All Jobs</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Sort by:</label>
              <select v-model="sortBy" class="filter-select">
                <option value="createdDate">Date Created</option>
                <option value="deadline">Deadline</option>
                <option value="applicationCount">Applications</option>
                <option value="title">Job Title</option>
              </select>
            </div>

            <div class="search-group">
              <label class="filter-label">Search:</label>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search jobs..."
                class="search-input"
              >
            </div>
          </div>

          <div class="view-controls">
            <button 
              @click="viewMode = 'cards'"
              :class="['view-btn', { active: viewMode === 'cards' }]"
              title="Card View"
            >
              📋
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="['view-btn', { active: viewMode === 'list' }]"
              title="List View"
            >
              📄
            </button>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="bulk-actions" v-if="selectedJobs.length > 0">
          <span class="selected-count">{{ selectedJobs.length }} selected</span>
          <button @click="bulkActivate" class="btn-success btn-small">
            ✅ Activate Selected
          </button>
          <button @click="bulkDeactivate" class="btn-warning btn-small">
            ⏸️ Deactivate Selected
          </button>
          <button @click="bulkDelete" class="btn-danger btn-small">
            🗑️ Delete Selected
          </button>
        </div>
      </div>

      <!-- Job Stats -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-number">{{ jobs.filter(j => j.status === 'active').length }}</span>
          <span class="stat-label">Active Jobs</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ jobs.filter(j => j.status === 'inactive').length }}</span>
          <span class="stat-label">Inactive Jobs</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ jobs.filter(j => j.status === 'expired').length }}</span>
          <span class="stat-label">Expired Jobs</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ jobs.reduce((sum, job) => sum + job.applicationCount, 0) }}</span>
          <span class="stat-label">Total Applications</span>
        </div>
      </div>

      <!-- Jobs Display -->
      <div v-if="viewMode === 'cards'" class="jobs-grid">
        <div class="bulk-select-all" v-if="filteredJobs.length > 0">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              @change="selectAll"
              :checked="selectedJobs.length === filteredJobs.length"
              class="checkbox"
            >
            <span class="checkbox-text">Select All</span>
          </label>
        </div>

        <div 
          v-for="job in filteredJobs" 
          :key="job.id" 
          class="job-card"
          :class="{ selected: selectedJobs.includes(job.id) }"
        >
          <!-- Card Header -->
          <div class="card-header">
            <input 
              type="checkbox" 
              :value="job.id"
              v-model="selectedJobs"
              class="job-checkbox"
            >
            
            <div class="status-and-type">
              <span :class="['status-badge', getStatusClass(job.status)]">
                {{ getStatusText(job.status) }}
              </span>
              <span class="job-type">{{ job.type }}</span>
              <span v-if="isExpiringSoon(job.deadline)" class="expiring-badge">
                ⚠️ Expiring Soon
              </span>
            </div>
          </div>

          <!-- Job Info -->
          <div class="card-body">
            <h3 class="job-title">{{ job.title }}</h3>
            <p class="company-name">{{ job.company }}</p>
            <p class="job-location">📍 {{ job.location }}</p>
            <p class="job-salary">💰 {{ formatSalary(job.salary) }}</p>
            
            <div class="job-meta">
              <div class="meta-item">
                <span class="meta-label">Applications:</span>
                <span class="meta-value">{{ job.applicationCount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Deadline:</span>
                <span class="meta-value">{{ new Date(job.deadline).toLocaleDateString() }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">{{ new Date(job.createdDate).toLocaleDateString() }}</span>
              </div>
            </div>

            <div class="skills-preview">
              <span 
                v-for="skill in job.requiredSkills.slice(0, 3)" 
                :key="skill" 
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span v-if="job.requiredSkills.length > 3" class="more-skills">
                +{{ job.requiredSkills.length - 3 }} more
              </span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <button @click="viewApplications(job)" class="btn-info btn-small">
              👥 {{ job.applicationCount }} Applications
            </button>
            
            <div class="action-buttons">
              <button @click="editJob(job)" class="btn-secondary btn-small" title="Edit">
                ✏️
              </button>
              <button 
                @click="toggleJobStatus(job)" 
                :class="['btn-warning', 'btn-small']"
                :title="job.status === 'active' ? 'Deactivate' : 'Activate'"
              >
                {{ job.status === 'active' ? '⏸️' : '▶️' }}
              </button>
              <button @click="duplicateJob(job)" class="btn-secondary btn-small" title="Duplicate">
                📋
              </button>
              <button @click="deleteJob(job)" class="btn-danger btn-small" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="jobs-table">
        <table class="job-list-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  @change="selectAll"
                  :checked="selectedJobs.length === filteredJobs.length"
                >
              </th>
              <th>Job Title</th>
              <th>Company</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="job in filteredJobs" 
              :key="job.id"
              :class="{ selected: selectedJobs.includes(job.id) }"
            >
              <td>
                <input 
                  type="checkbox" 
                  :value="job.id"
                  v-model="selectedJobs"
                >
              </td>
              <td>
                <div class="job-title-cell">
                  <strong>{{ job.title }}</strong>
                  <div class="job-type-small">{{ job.type }}</div>
                </div>
              </td>
              <td>{{ job.company }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(job.status)]">
                  {{ getStatusText(job.status) }}
                </span>
              </td>
              <td>
                <span class="application-count">{{ job.applicationCount }}</span>
              </td>
              <td>
                <span :class="{ 'expiring': isExpiringSoon(job.deadline) }">
                  {{ new Date(job.deadline).toLocaleDateString() }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button @click="editJob(job)" class="btn-secondary btn-small">Edit</button>
                  <button @click="toggleJobStatus(job)" class="btn-warning btn-small">
                    {{ job.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button @click="deleteJob(job)" class="btn-danger btn-small">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredJobs.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No jobs found</h3>
        <p>{{ searchQuery ? 'Try adjusting your search terms' : 'No jobs match the selected filters' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

/* Controls Section */
.controls-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
  gap: 20px;
}

.filters {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  flex: 1;
}

.filter-group, .search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #003a9b;
}

.filter-select, .search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  transition: all 0.2s ease;
}

.filter-select:focus, .search-input:focus {
  outline: none;
  border-color: #004dc5;
  box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
}

.search-input {
  min-width: 250px;
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.view-btn:hover {
  background-color: #f3f4f6;
}

.view-btn.active {
  background-color: #004dc5;
  color: white;
  border-color: #004dc5;
}

.bulk-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.selected-count {
  color: #0369a1;
  font-weight: 600;
  font-size: 14px;
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #004dc5;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

/* Jobs Grid */
.jobs-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.bulk-select-all {
  grid-column: 1 / -1;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.job-card {
  background: #ffffff;
  border: 1px solid rgba(0, 77, 197, 0.15);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 77, 197, 0.15);
}

.job-card.selected {
  border-color: #004dc5;
  background-color: rgba(0, 77, 197, 0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.job-checkbox {
  margin-right: 12px;
}

.status-and-type {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background-color: #f3f4f6;
  color: #374151;
}

.status-expired {
  background-color: #fee2e2;
  color: #991b1b;
}

.job-type {
  background-color: rgba(0, 77, 197, 0.1);
  color: #003a9b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.expiring-badge {
  background-color: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.card-body {
  margin-bottom: 16px;
}

.job-title {
  color: #003a9b;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.company-name {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.job-location, .job-salary {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.job-salary {
  color: #059669;
  font-weight: 600;
}

.job-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 12px 0;
  padding: 8px;
  background-color: #f8fafc;
  border-radius: 6px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.meta-label {
  color: #6b7280;
}

.meta-value {
  color: #1f2937;
  font-weight: 500;
}

.skills-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.skill-tag {
  background-color: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.more-skills {
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

.action-buttons {
  display: flex;
  gap: 6px;
}

/* List View */
.jobs-table {
  overflow-x: auto;
}

.job-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.job-list-table th,
.job-list-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 77, 197, 0.05);
}

.job-list-table th {
  background-color: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid rgba(0, 77, 197, 0.1);
}

.job-list-table tr:hover {
  background-color: #f9fafb;
}

.job-list-table tr.selected {
  background-color: rgba(0, 77, 197, 0.02);
}

.job-title-cell strong {
  display: block;
  color: #003a9b;
  margin-bottom: 2px;
}

.job-type-small {
  font-size: 12px;
  color: #6b7280;
}

.application-count {
  font-weight: 600;
  color: #004dc5;
}

.expiring {
  color: #dc2626;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 6px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 8px;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger, .btn-info {
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 1px solid rgba(0, 77, 197, 0.3);
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
}

.btn-success:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.btn-warning:hover {
  background-color: #d97706;
  transform: translateY(-1px);
}

.btn-danger:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

.btn-info:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

/* Checkbox styling */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #004dc5;
}

.checkbox-text {
  user-select: none;
}

/* Title styling */
h1 {
  color: white;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }

  .filters {
    flex-direction: column;
    gap: 16px;
  }

  .search-input {
    min-width: 100%;
  }

  .stats-section {
    flex-direction: column;
    gap: 12px;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-actions {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    justify-content: center;
  }

  .job-list-table {
    font-size: 12px;
  }

  .table-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
