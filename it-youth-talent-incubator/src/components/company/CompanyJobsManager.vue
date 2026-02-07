<script setup>
/**
 * CompanyJobsManager Component
 * Manage company job postings - list, filter, and quick actions
 */
import { ref, computed } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  jobs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['create', 'edit', 'delete', 'publish', 'close', 'view-applications'])

// Filter state
const statusFilter = ref('all')
const searchQuery = ref('')

// Status options
const statusOptions = [
  { value: 'all', label: 'All Jobs' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' }
]

// Filtered jobs
const filteredJobs = computed(() => {
  let result = [...props.jobs]

  // Filter by status
  if (statusFilter.value !== 'all') {
    result = result.filter((job) => job.status === statusFilter.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (job) =>
        job.title?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.employment_type?.toLowerCase().includes(query)
    )
  }

  return result
})

// Get status badge class
const getStatusClass = (status) => {
  switch (status) {
    case 'published':
      return 'status-published'
    case 'draft':
      return 'status-draft'
    case 'closed':
      return 'status-closed'
    default:
      return ''
  }
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

// Get employment type label
const getEmploymentTypeLabel = (type) => {
  const labels = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    remote: 'Remote'
  }
  return labels[type] || type
}
</script>

<template>
  <div class="jobs-manager">
    <!-- Header -->
    <div class="manager-header">
      <div class="header-left">
        <h2 class="manager-title">Job Postings</h2>
        <p class="manager-subtitle">Manage your company's job listings</p>
      </div>
      <button class="create-btn" @click="emit('create')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Job
      </button>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="stats-cards">
      <div class="stat-card">
        <span class="stat-value">{{ stats.total || 0 }}</span>
        <span class="stat-label">Total Jobs</span>
      </div>
      <div class="stat-card stat-published">
        <span class="stat-value">{{ stats.published || 0 }}</span>
        <span class="stat-label">Published</span>
      </div>
      <div class="stat-card stat-draft">
        <span class="stat-value">{{ stats.draft || 0 }}</span>
        <span class="stat-label">Drafts</span>
      </div>
      <div class="stat-card stat-applications">
        <span class="stat-value">{{ stats.total_applications || 0 }}</span>
        <span class="stat-label">Applications</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search jobs..."
          class="search-input"
        />
      </div>
      <div class="status-tabs">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          :class="['tab-btn', { active: statusFilter === option.value }]"
          @click="statusFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Jobs List -->
    <div class="jobs-list">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading jobs...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <h3>No jobs found</h3>
        <p v-if="statusFilter !== 'all' || searchQuery">
          Try adjusting your filters or search query
        </p>
        <p v-else>Create your first job posting to attract talented candidates</p>
        <button v-if="statusFilter === 'all' && !searchQuery" class="create-btn" @click="emit('create')">
          Create Job
        </button>
      </div>

      <!-- Job Cards -->
      <div v-else class="job-cards">
        <div v-for="job in filteredJobs" :key="job._id" class="job-card">
          <div class="job-main">
            <div class="job-header">
              <h3 class="job-title">{{ job.title }}</h3>
              <span :class="['status-badge', getStatusClass(job.status)]">
                {{ job.status }}
              </span>
            </div>

            <div class="job-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {{ job.location || 'Not specified' }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {{ getEmploymentTypeLabel(job.employment_type) }}
              </span>
              <span v-if="job.salary_range" class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                {{ job.salary_range }}
              </span>
            </div>

            <div class="job-stats">
              <span class="stat">
                <strong>{{ job.applications_count || 0 }}</strong> applications
              </span>
              <span class="stat">
                <strong>{{ job.views_count || 0 }}</strong> views
              </span>
              <span class="stat">Posted {{ formatDate(job.created_at) }}</span>
            </div>
          </div>

          <div class="job-actions">
            <button
              v-if="job.status === 'draft'"
              class="action-btn publish-btn"
              @click="emit('publish', job._id)"
              title="Publish job"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Publish
            </button>
            <button
              v-if="job.status === 'published'"
              class="action-btn close-btn"
              @click="emit('close', job._id)"
              title="Close job"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Close
            </button>
            <button
              class="action-btn view-btn"
              @click="emit('view-applications', job._id)"
              title="View applications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {{ job.applications_count || 0 }}
            </button>
            <button
              class="action-btn edit-btn"
              @click="emit('edit', job)"
              title="Edit job"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              class="action-btn delete-btn"
              @click="emit('delete', job._id)"
              title="Delete job"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jobs-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.manager-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.manager-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.create-btn {
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
  transition: all 0.2s;
}

.create-btn:hover {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.create-btn svg {
  width: 18px;
  height: 18px;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.stat-label {
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.stat-published .stat-value {
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.stat-draft .stat-value {
  color: v-bind('COLORS.STATUS.WARNING');
}

.stat-applications .stat-value {
  color: v-bind('COLORS.BRAND.PRIMARY');
}

/* Filters */
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  padding: 0 1rem;
  min-width: 280px;
}

.search-box svg {
  width: 18px;
  height: 18px;
  color: v-bind('COLORS.TEXT.MUTED');
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 0.75rem 0;
  background: transparent;
  border: none;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 0.9375rem;
}

.search-input:focus {
  outline: none;
}

.status-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.tab-btn.active {
  background: v-bind('COLORS.BRAND.PRIMARY');
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: white;
}

/* Jobs List */
.jobs-list {
  min-height: 200px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: v-bind('COLORS.TEXT.MUTED');
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-top-color: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.empty-state p {
  margin: 0 0 1.5rem;
}

/* Job Cards */
.job-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.job-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s;
}

.job-card:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
}

.job-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.job-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.job-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-published {
  background: rgba(56, 161, 105, 0.15);
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.status-draft {
  background: rgba(214, 158, 46, 0.15);
  color: v-bind('COLORS.STATUS.WARNING');
}

.status-closed {
  background: rgba(139, 148, 158, 0.15);
  color: v-bind('COLORS.TEXT.MUTED');
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.job-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.job-stats strong {
  color: v-bind('COLORS.TEXT.PRIMARY');
}

/* Job Actions */
.job-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.publish-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.publish-btn:hover {
  background: v-bind('COLORS.STATUS.SUCCESS');
  border-color: v-bind('COLORS.STATUS.SUCCESS');
  color: white;
}

.close-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.close-btn:hover {
  background: v-bind('COLORS.STATUS.WARNING');
  border-color: v-bind('COLORS.STATUS.WARNING');
  color: white;
}

.view-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.delete-btn:hover {
  background: v-bind('COLORS.STATUS.ERROR');
  border-color: v-bind('COLORS.STATUS.ERROR');
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .status-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .job-card {
    flex-direction: column;
    align-items: stretch;
  }

  .job-actions {
    justify-content: flex-end;
    padding-top: 0.75rem;
    border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  }
}
</style>
