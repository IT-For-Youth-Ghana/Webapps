<script setup>
/**
 * StudentJobsPageIntegrated
 * Job listings page with search, filters, and API integration
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useJobsStore } from '../stores/jobs.js'
import { COLORS } from '../constants/colors.js'

// Components
import JobSearch from '../components/jobs/JobSearch.vue'
import JobFilters from '../components/jobs/JobFilters.vue'
import JobCardIntegrated from '../components/jobs/JobCardIntegrated.vue'
import JobDetailModal from '../components/jobs/JobDetailModal.vue'

// Initialize store
const jobsStore = useJobsStore()

// Local state
const showFilters = ref(false)
const showJobModal = ref(false)
const applyingToJob = ref(false)

// Computed
const jobs = computed(() => jobsStore.jobs)
const featuredJobs = computed(() => jobsStore.featuredJobs)
const isLoading = computed(() => jobsStore.isLoading)
const isLoadingMore = computed(() => jobsStore.isLoadingMore)
const error = computed(() => jobsStore.error)
const selectedJob = computed(() => jobsStore.selectedJob)
const searchQuery = computed(() => jobsStore.searchQuery)
const filters = computed(() => jobsStore.filters)
const paginationInfo = computed(() => jobsStore.paginationInfo)
const hasActiveFilters = computed(() => jobsStore.hasActiveFilters)
const activeFiltersCount = computed(() => jobsStore.activeFiltersCount)
const isEmpty = computed(() => jobsStore.isEmpty)

// Handler functions
const handleSearch = (query) => {
  jobsStore.searchJobs(query)
}

const handleClearSearch = () => {
  jobsStore.clearSearch()
  jobsStore.fetchJobs(true)
}

const handleUpdateFilters = (newFilters) => {
  jobsStore.setFilters(newFilters)
}

const handleApplyFilters = () => {
  jobsStore.applyFilters()
  if (window.innerWidth < 768) {
    showFilters.value = false
  }
}

const handleClearFilters = () => {
  jobsStore.clearFilters()
}

const handleLoadMore = () => {
  jobsStore.loadMore()
}

const handleViewDetails = (job) => {
  jobsStore.setSelectedJob(job)
  showJobModal.value = true
}

const handleCloseModal = () => {
  showJobModal.value = false
  jobsStore.clearSelectedJob()
}

const handleApply = async (job) => {
  applyingToJob.value = true
  try {
    // Navigate to application form or show application modal
    // For now, we'll just log and close
    console.log('Applying to job:', job._id)
    // In real implementation, this would navigate to application page
    // or open an application modal
    alert(`Application for "${job.title}" would be submitted here.`)
    handleCloseModal()
  } catch (err) {
    console.error('Error applying to job:', err)
  } finally {
    applyingToJob.value = false
  }
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Lifecycle
onMounted(async () => {
  // Fetch initial data
  await Promise.all([
    jobsStore.fetchJobs(true),
    jobsStore.fetchFeaturedJobs()
  ])
})
</script>

<template>
  <div class="jobs-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Find Your Dream Job</h1>
        <p class="page-subtitle">
          Discover exciting opportunities from Ghana's top companies and startups
        </p>
      </div>
    </header>

    <!-- Search Section -->
    <section class="search-section">
      <div class="search-wrapper">
        <JobSearch
          :model-value="searchQuery"
          @update:model-value="jobsStore.searchQuery = $event"
          @search="handleSearch"
          @clear="handleClearSearch"
          :loading="isLoading"
          placeholder="Search by job title, company, skills..."
        />
        
        <!-- Mobile Filter Toggle -->
        <button @click="toggleFilters" class="filter-toggle-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span v-if="activeFiltersCount > 0" class="filter-count">{{ activeFiltersCount }}</span>
        </button>
      </div>

      <!-- Active Filters Summary -->
      <div v-if="hasActiveFilters" class="active-filters-bar">
        <span class="filters-label">
          {{ activeFiltersCount }} filter{{ activeFiltersCount > 1 ? 's' : '' }} applied
        </span>
        <button @click="handleClearFilters" class="clear-all-btn">
          Clear all
        </button>
      </div>
    </section>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar Filters (Desktop) -->
      <aside class="filters-sidebar" :class="{ 'is-open': showFilters }">
        <div class="filters-backdrop" @click="showFilters = false"></div>
        <div class="filters-panel">
          <JobFilters
            :filters="filters"
            :loading="isLoading"
            :active-filters-count="activeFiltersCount"
            @update:filters="handleUpdateFilters"
            @apply="handleApplyFilters"
            @clear="handleClearFilters"
          />
        </div>
      </aside>

      <!-- Jobs Content -->
      <main class="jobs-content">
        <!-- Featured Jobs -->
        <section v-if="featuredJobs.length > 0 && !hasActiveFilters" class="featured-section">
          <h2 class="section-title">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Featured Jobs
          </h2>
          <div class="featured-grid">
            <JobCardIntegrated
              v-for="job in featuredJobs.slice(0, 3)"
              :key="job._id"
              :job="job"
              @view-details="handleViewDetails"
              @apply="handleApply"
            />
          </div>
        </section>

        <!-- Results Header -->
        <div class="results-header">
          <h2 class="results-title">
            {{ hasActiveFilters ? 'Search Results' : 'All Jobs' }}
            <span v-if="!isLoading" class="results-count">({{ paginationInfo.totalJobs }})</span>
          </h2>
          
          <div class="sort-controls">
            <label class="sort-label">Sort by:</label>
            <select 
              :value="filters.sort_by"
              @change="jobsStore.setFilter('sort_by', $event.target.value); handleApplyFilters()"
              class="sort-select"
            >
              <option value="createdAt">Newest</option>
              <option value="salary">Salary</option>
              <option value="views">Most Viewed</option>
              <option value="applications_count">Applications</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && jobs.length === 0" class="loading-state">
          <div class="loading-spinner-large"></div>
          <p>Loading jobs...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="jobsStore.fetchJobs(true)" class="retry-btn">
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="isEmpty" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <h3>No jobs found</h3>
          <p v-if="hasActiveFilters">
            Try adjusting your filters or search terms
          </p>
          <p v-else>
            Check back later for new opportunities
          </p>
          <button v-if="hasActiveFilters" @click="handleClearFilters" class="clear-filters-btn">
            Clear Filters
          </button>
        </div>

        <!-- Jobs Grid -->
        <div v-else class="jobs-grid">
          <JobCardIntegrated
            v-for="job in jobs"
            :key="job._id"
            :job="job"
            @view-details="handleViewDetails"
            @apply="handleApply"
          />
        </div>

        <!-- Load More -->
        <div v-if="paginationInfo.hasMore" class="load-more-section">
          <p class="showing-info">
            Showing {{ paginationInfo.showing.from }}-{{ paginationInfo.showing.to }} 
            of {{ paginationInfo.totalJobs }} jobs
          </p>
          <button 
            @click="handleLoadMore" 
            class="load-more-btn"
            :disabled="isLoadingMore"
          >
            <span v-if="isLoadingMore" class="loading-spinner"></span>
            <span v-else>Load More Jobs</span>
          </button>
        </div>
      </main>
    </div>

    <!-- Job Detail Modal -->
    <JobDetailModal
      v-if="showJobModal && selectedJob"
      :job="selectedJob"
      :loading="applyingToJob"
      @close="handleCloseModal"
      @apply="handleApply"
    />
  </div>
</template>

<style scoped>
.jobs-page {
  min-height: 100vh;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
}

/* Header */
.page-header {
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  background: linear-gradient(
    180deg,
    v-bind('COLORS.BACKGROUND.CARD') 0%,
    v-bind('COLORS.BACKGROUND.PRIMARY') 100%
  );
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, v-bind('COLORS.BRAND.PRIMARY'), v-bind('COLORS.BRAND.ACCENT'));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 0.75rem 0 0;
  font-size: 1.125rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  line-height: 1.5;
}

/* Search Section */
.search-section {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.search-wrapper {
  display: flex;
  gap: 0.75rem;
  max-width: 700px;
  margin: 0 auto;
}

.filter-toggle-btn {
  display: none;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 48px;
  height: 48px;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  cursor: pointer;
  flex-shrink: 0;
}

.filter-toggle-btn svg {
  width: 20px;
  height: 20px;
}

.filter-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 9px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-filters-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(79, 172, 254, 0.1);
  border-radius: 8px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.filters-label {
  font-size: 0.875rem;
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.clear-all-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  cursor: pointer;
  text-decoration: underline;
}

.clear-all-btn:hover {
  color: v-bind('COLORS.TEXT.PRIMARY');
}

/* Main Content Layout */
.main-content {
  display: flex;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

/* Filters Sidebar */
.filters-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.filters-backdrop {
  display: none;
}

.filters-panel {
  position: sticky;
  top: 1.5rem;
}

/* Jobs Content */
.jobs-content {
  flex: 1;
  min-width: 0;
}

/* Featured Section */
.featured-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.section-title svg {
  width: 20px;
  height: 20px;
  color: #f5af19;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Results Header */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.results-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.results-count {
  font-weight: 400;
  color: v-bind('COLORS.TEXT.MUTED');
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-label {
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.sort-select {
  padding: 0.375rem 0.75rem;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 0.875rem;
  cursor: pointer;
}

/* Jobs Grid */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-top-color: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state p {
  margin: 1rem 0 0;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-state svg {
  width: 48px;
  height: 48px;
  color: v-bind('COLORS.STATUS.ERROR');
  margin-bottom: 1rem;
}

.error-state h3 {
  margin: 0;
  font-size: 1.25rem;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.error-state p {
  margin: 0.5rem 0 1.5rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: v-bind('COLORS.TEXT.MUTED');
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0;
  font-size: 1.25rem;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.empty-state p {
  margin: 0.5rem 0 1.5rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

/* Load More */
.load-more-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.showing-info {
  margin: 0;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: transparent;
  border: 1px solid v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 8px;
  color: v-bind('COLORS.BRAND.PRIMARY');
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.load-more-btn:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.PRIMARY');
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(79, 172, 254, 0.3);
  border-top-color: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .filters-sidebar {
    width: 260px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .filter-toggle-btn {
    display: flex;
  }

  .main-content {
    flex-direction: column;
  }

  .filters-sidebar {
    position: fixed;
    inset: 0;
    width: 100%;
    z-index: 100;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .filters-sidebar.is-open {
    pointer-events: auto;
    opacity: 1;
  }

  .filters-backdrop {
    display: block;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .filters-panel {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    max-width: 85%;
    background: v-bind('COLORS.BACKGROUND.PRIMARY');
    padding: 1rem;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .filters-sidebar.is-open .filters-panel {
    transform: translateX(0);
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
