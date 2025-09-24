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
        <div class="stat-content">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.active }}</div>
          <div class="stat-label">Active Jobs</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.draft }}</div>
          <div class="stat-label">Draft Jobs</div>
        </div>
      </div>
    </div>

    <!-- Simple Jobs List -->
    <div class="jobs-container">
      <div class="jobs-header">
        <button @click="handleCreateJob" class="create-btn">Create Job</button>
      </div>
      
      <div v-if="loading" class="loading">Loading jobs...</div>
      
      <div v-else class="jobs-list">
        <div 
          v-for="job in filteredJobs" 
          :key="job.id"
          class="job-item"
        >
          <h3>{{ job.title }}</h3>
          <p>{{ job.company }} - {{ job.location }}</p>
          <p>{{ job.type }} | {{ job.salary }}</p>
          <div class="job-actions">
            <button @click="handleEditJob(job)" class="edit-btn">Edit</button>
            <button @click="handleDeleteJob(job.id)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Form Modal -->
    <JobFormModal
      v-if="showJobModal"
      :job="editingJob"
      @submit="handleJobSubmit"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFilters } from '../composables/useFilters.js'
import { useJobManagement } from '../composables/useJobManagement.js'
import { COLORS } from '../constants/colors.js'

// Components (temporarily commented out to debug)
// import JobsStats from '../components/admin/jobs/JobsStats.vue'
// import JobsFilters from '../components/admin/jobs/JobsFilters.vue'
// import JobsTable from '../components/admin/jobs/JobsTable.vue'
import JobFormModal from '../components/admin/JobFormModal.vue'

// Initialize composables
const {
  loading,
  jobs,
  showJobModal,
  editingJob,
  stats,
  fetchJobs,
  handleCreateJob,
  handleEditJob,
  handleDeleteJob,
  handleToggleStatus,
  handleJobSubmit,
  closeJobModal
} = useJobManagement()

const { 
  filters, 
  filteredData: filteredJobs, 
  updateFilter, 
  clearFilters: clearAllFilters 
} = useFilters(jobs, {
  search: '',
  status: 'all',
  type: 'all',
  sortBy: 'newest'
})

// Computed properties for v-model bindings
const searchQuery = computed({
  get: () => filters.value.search,
  set: (value) => updateFilter('search', value)
})

const statusFilter = computed({
  get: () => filters.value.status,
  set: (value) => updateFilter('status', value)
})

const typeFilter = computed({
  get: () => filters.value.type,
  set: (value) => updateFilter('type', value)
})

const sortBy = computed({
  get: () => filters.value.sortBy,
  set: (value) => updateFilter('sortBy', value)
})

// Methods
const clearFilters = () => {
  clearAllFilters()
}

const handleModalClose = () => {
  closeJobModal()
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
  color: v-bind('COLORS.TEXT.PRIMARY');
  background: linear-gradient(135deg, v-bind('COLORS.BRAND.PRIMARY'), v-bind('COLORS.BRAND.ACCENT'));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.125rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.jobs-container {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.5rem;
}

.jobs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.create-btn {
  background: v-bind('COLORS.BRAND.PRIMARY');
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.create-btn:hover {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.loading {
  text-align: center;
  padding: 2rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.jobs-list {
  display: grid;
  gap: 1rem;
}

.job-item {
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  padding: 1rem;
}

.job-item h3 {
  margin: 0 0 0.5rem 0;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.job-item p {
  margin: 0.25rem 0;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.875rem;
}

.job-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
}

.edit-btn {
  background: v-bind('COLORS.STATUS.INFO');
  color: white;
}

.delete-btn {
  background: v-bind('COLORS.STATUS.ERROR');
  color: white;
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
}
</style>