<script setup>
/**
 * JobsPage.vue
 * Public-facing job listings page with modern design
 * Features: Featured jobs, Recent jobs, Search, Filters, Categories
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs.js'
import { useAuthStore } from '../stores/auth.js'
import { useTheme } from '../composables/useTheme.js'

// Components
import JobCardIntegrated from '../components/jobs/JobCardIntegrated.vue'
import JobDetailModal from '../components/jobs/JobDetailModal.vue'
import ThemeToggle from '../components/common/ThemeToggle.vue'

const router = useRouter()
const jobsStore = useJobsStore()
const authStore = useAuthStore()
const { isDark } = useTheme()

// Local state
const showJobModal = ref(false)
const applyingToJob = ref(false)
const activeTab = ref('all') // 'all', 'featured', 'recent'
const searchInput = ref('')
const selectedJobTypes = ref([])
const selectedExperience = ref([])
const selectedLocation = ref('')

// Job type options
const jobTypes = [
  { value: 'full-time', label: 'Full Time', icon: '💼' },
  { value: 'part-time', label: 'Part Time', icon: '⏰' },
  { value: 'contract', label: 'Contract', icon: '📝' },
  { value: 'internship', label: 'Internship', icon: '🎓' },
  { value: 'remote', label: 'Remote', icon: '🏠' }
]

// Experience levels
const experienceLevels = [
  { value: 'entry', label: 'Entry Level', description: '0-2 years' },
  { value: 'mid', label: 'Mid Level', description: '2-5 years' },
  { value: 'senior', label: 'Senior', description: '5+ years' },
  { value: 'lead', label: 'Lead/Manager', description: '7+ years' }
]

// Popular locations
const popularLocations = ['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Remote']

// Computed
const jobs = computed(() => jobsStore.jobs)
const featuredJobs = computed(() => jobsStore.featuredJobs)
const recentJobs = computed(() => jobsStore.recentJobs)
const isLoading = computed(() => jobsStore.isLoading)
const isLoadingMore = computed(() => jobsStore.isLoadingMore)
const error = computed(() => jobsStore.error)
const selectedJob = computed(() => jobsStore.selectedJob)
const totalJobs = computed(() => jobsStore.totalJobs)
const hasMore = computed(() => jobsStore.paginationInfo.hasMore)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Display jobs based on active tab
const displayJobs = computed(() => {
  switch (activeTab.value) {
    case 'featured':
      return featuredJobs.value
    case 'recent':
      return recentJobs.value.length > 0 ? recentJobs.value : jobs.value.slice(0, 8)
    default:
      return jobs.value
  }
})

const hasActiveFilters = computed(() => {
  return selectedJobTypes.value.length > 0 ||
         selectedExperience.value.length > 0 ||
         selectedLocation.value !== '' ||
         searchInput.value !== ''
})

// Stats for hero section
const stats = computed(() => [
  { value: totalJobs.value || '500+', label: 'Active Jobs' },
  { value: '150+', label: 'Companies' },
  { value: '2K+', label: 'Students Hired' }
])

// Methods
const handleSearch = () => {
  if (searchInput.value.trim()) {
    jobsStore.searchJobs(searchInput.value.trim())
  } else {
    jobsStore.clearSearch()
    jobsStore.fetchJobs(true)
  }
}

const handleQuickFilter = (type, value) => {
  if (type === 'jobType') {
    const idx = selectedJobTypes.value.indexOf(value)
    if (idx > -1) {
      selectedJobTypes.value.splice(idx, 1)
    } else {
      selectedJobTypes.value.push(value)
    }
  } else if (type === 'experience') {
    const idx = selectedExperience.value.indexOf(value)
    if (idx > -1) {
      selectedExperience.value.splice(idx, 1)
    } else {
      selectedExperience.value.push(value)
    }
  } else if (type === 'location') {
    selectedLocation.value = selectedLocation.value === value ? '' : value
  }
  applyFilters()
}

const applyFilters = () => {
  jobsStore.setFilters({
    job_type: selectedJobTypes.value.length === 1 ? selectedJobTypes.value[0] : '',
    experience_level: selectedExperience.value.length === 1 ? selectedExperience.value[0] : '',
    location: selectedLocation.value
  })
  jobsStore.applyFilters()
}

const clearAllFilters = () => {
  selectedJobTypes.value = []
  selectedExperience.value = []
  selectedLocation.value = ''
  searchInput.value = ''
  jobsStore.clearFilters()
  jobsStore.clearSearch()
  jobsStore.fetchJobs(true)
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
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: `/jobs/${job._id}` } })
    return
  }

  applyingToJob.value = true
  try {
    router.push(`/student/jobs/${job._id}/apply`)
  } finally {
    applyingToJob.value = false
  }
}

const handleLoadMore = () => {
  jobsStore.loadMore()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  if (tab === 'featured' && featuredJobs.value.length === 0) {
    jobsStore.fetchFeaturedJobs()
  } else if (tab === 'recent' && recentJobs.value.length === 0) {
    jobsStore.fetchRecentJobs()
  }
}

const navigateToRegister = () => {
  router.push('/register/student')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    jobsStore.fetchJobs(true),
    jobsStore.fetchFeaturedJobs(),
    jobsStore.fetchRecentJobs()
  ])
})
</script>

<template>
  <div class="jobs-page">
    <!-- Navigation Bar -->
    <nav class="page-nav">
      <div class="container nav-container">
        <router-link to="/" class="nav-logo">
          <img src="/logo/logo.png" alt="ITFY" class="logo-image" />
          <span>IT Youth</span>
        </router-link>
        <div class="nav-actions">
          <router-link to="/" class="nav-link">Home</router-link>
          <div class="nav-divider"></div>
          <ThemeToggle />
          <div class="nav-divider"></div>
          <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Log In</router-link>
          <router-link v-if="!isAuthenticated" to="/register/student" class="btn btn-primary btn-sm">Get Started</router-link>
          <router-link v-else to="/student/dashboard" class="btn btn-primary btn-sm">Dashboard</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-pattern"></div>
        <div class="hero-gradient"></div>
      </div>

      <div class="container hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          {{ totalJobs || '500+' }} opportunities waiting
        </div>

        <h1 class="hero-title">
          Find Your <span class="gradient-text">Dream Job</span>
        </h1>

        <p class="hero-subtitle">
          Discover exciting career opportunities from Ghana's leading tech companies,
          startups, and organizations actively seeking talented graduates like you.
        </p>

        <!-- Search Bar -->
        <div class="search-container">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="search-btn">
              Search Jobs
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content with Sidebar -->
    <section class="main-content">
      <div class="container">
        <div class="content-layout">
          <!-- Sidebar Filters -->
          <aside class="filters-sidebar">
            <div class="sidebar-header">
              <h2 class="sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filters
              </h2>
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="clear-filters-btn"
              >
                Clear all
              </button>
            </div>

            <!-- Job Type Filter -->
            <div class="filter-group">
              <h3 class="filter-group-title">Job Type</h3>
              <div class="filter-options">
                <label
                  v-for="type in jobTypes"
                  :key="type.value"
                  class="filter-checkbox"
                  :class="{ active: selectedJobTypes.includes(type.value) }"
                >
                  <input
                    type="checkbox"
                    :checked="selectedJobTypes.includes(type.value)"
                    @change="handleQuickFilter('jobType', type.value)"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="filter-icon">{{ type.icon }}</span>
                  <span class="filter-label">{{ type.label }}</span>
                </label>
              </div>
            </div>

            <!-- Experience Level Filter -->
            <div class="filter-group">
              <h3 class="filter-group-title">Experience Level</h3>
              <div class="filter-options">
                <label
                  v-for="level in experienceLevels"
                  :key="level.value"
                  class="filter-checkbox"
                  :class="{ active: selectedExperience.includes(level.value) }"
                >
                  <input
                    type="checkbox"
                    :checked="selectedExperience.includes(level.value)"
                    @change="handleQuickFilter('experience', level.value)"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="filter-label">{{ level.label }}</span>
                  <span class="filter-meta">{{ level.description }}</span>
                </label>
              </div>
            </div>

            <!-- Location Filter -->
            <div class="filter-group">
              <h3 class="filter-group-title">Location</h3>
              <div class="filter-options">
                <label
                  v-for="location in popularLocations"
                  :key="location"
                  class="filter-radio"
                  :class="{ active: selectedLocation === location }"
                >
                  <input
                    type="radio"
                    name="location"
                    :checked="selectedLocation === location"
                    @change="handleQuickFilter('location', location)"
                  />
                  <span class="radio-custom"></span>
                  <svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span class="filter-label">{{ location }}</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Jobs Content -->
          <div class="jobs-content">
            <!-- Tabs -->
            <div class="tabs-wrapper">
              <button
                @click="handleTabChange('all')"
                class="tab-btn"
                :class="{ active: activeTab === 'all' }"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                All Jobs
                <span class="tab-count">{{ totalJobs }}</span>
              </button>
              <button
                @click="handleTabChange('featured')"
                class="tab-btn"
                :class="{ active: activeTab === 'featured' }"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Featured
                <span class="tab-count">{{ featuredJobs.length }}</span>
              </button>
              <button
                @click="handleTabChange('recent')"
                class="tab-btn"
                :class="{ active: activeTab === 'recent' }"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Recent
              </button>
            </div>
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <h2 class="results-title">
              {{ activeTab === 'featured' ? 'Featured Jobs' : activeTab === 'recent' ? 'Recently Posted' : 'All Opportunities' }}
            </h2>
            <p class="results-count" v-if="!isLoading">
              {{ displayJobs.length }} job{{ displayJobs.length !== 1 ? 's' : '' }} found
            </p>
          </div>

          <div class="results-actions">
            <select class="sort-select" @change="jobsStore.setFilter('sort_by', $event.target.value)">
              <option value="createdAt">Newest First</option>
              <option value="salary">Highest Salary</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && displayJobs.length === 0" class="loading-state">
          <div class="loading-grid">
            <div v-for="n in 6" :key="n" class="skeleton-card">
              <div class="skeleton-header"></div>
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-tags"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="jobsStore.fetchJobs(true)" class="retry-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="displayJobs.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" fill="#1b65b2" opacity="0.1"/>
              <circle cx="100" cy="100" r="60" fill="#1b65b2" opacity="0.1"/>
              <rect x="60" y="70" width="80" height="60" rx="8" fill="#1b65b2" opacity="0.2"/>
              <circle cx="100" cy="50" r="20" fill="#f59e0b" opacity="0.3"/>
            </svg>
          </div>
          <h3>No jobs found</h3>
          <p v-if="hasActiveFilters">Try adjusting your search or filters</p>
          <p v-else>New opportunities are added daily. Check back soon!</p>
          <button v-if="hasActiveFilters" @click="clearAllFilters" class="primary-btn">
            Clear All Filters
          </button>
        </div>

        <!-- Jobs Grid -->
        <div v-else class="jobs-grid">
          <JobCardIntegrated
            v-for="job in displayJobs"
            :key="job._id"
            :job="job"
            @view-details="handleViewDetails"
            @apply="handleApply"
          />
        </div>

            <!-- Load More -->
            <div v-if="activeTab === 'all' && hasMore && displayJobs.length > 0" class="load-more">
              <button @click="handleLoadMore" class="load-more-btn" :disabled="isLoadingMore">
                <span v-if="isLoadingMore" class="spinner"></span>
                <span v-else>Load More Jobs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section" v-if="!isAuthenticated">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2>Ready to Start Your Career Journey?</h2>
            <p>Create your profile, showcase your skills, and get matched with opportunities that fit your goals.</p>
            <div class="cta-actions">
              <button @click="navigateToRegister" class="cta-primary-btn">
                Create Free Account
              </button>
              <router-link to="/login" class="cta-secondary-btn">
                Already have an account? Sign in
              </router-link>
            </div>
          </div>
          <div class="cta-visual">
            <div class="cta-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
/* ═══════════════════════════════════════════
   Use Global Theme Variables
   ═══════════════════════════════════════════ */
.jobs-page {
  --primary: var(--interactive-primary, #1b65b2);
  --primary-dark: var(--interactive-primary-hover, #195aa5);
  --primary-light: #3d7bc4;
  --secondary: #f59e0b;
  --secondary-dark: #d97706;

  --bg-page: var(--bg-primary, #0D1117);
  --bg-card: var(--bg-secondary, #161B22);
  --bg-elevated: var(--bg-elevated, #30363D);

  --text-primary: var(--text-primary, #ffffff);
  --text-secondary: var(--text-secondary, #8fb2d6);
  --text-muted: var(--text-tertiary, #6E7681);

  --border-color: var(--border-primary, #30363d);
  --border-light: var(--border-secondary, #21262d);

  --shadow-sm: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.6));
  --shadow-md: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.7));
  --shadow-lg: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.8));
  --shadow-glow: 0 0 40px rgba(27, 101, 178, 0.15);

  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ═══════════════════════════════════════════
   Navigation Bar
   ═══════════════════════════════════════════ */
.page-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

.nav-logo .logo-image {
  height: 36px;
  width: auto;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--interactive-tertiary, rgba(255, 255, 255, 0.05));
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 6px;
}

.btn-primary {
  background: var(--primary);
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ═══════════════════════════════════════════
   Hero Section
   ═══════════════════════════════════════════ */
.hero-section {
  position: relative;
  padding: 6rem 0 4rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(27, 101, 178, 0.97) 0%, rgba(25, 90, 165, 0.98) 50%, rgba(15, 23, 42, 0.95) 100%);
}

.hero-pattern::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-gradient {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 150%;
  background: radial-gradient(ellipse, rgba(245, 158, 11, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 100px;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #fbbf24;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  line-height: 1.1;
  margin: 0 0 1.25rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--secondary) 0%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin: 0 0 2.5rem;
}

/* Search Container */
.search-container {
  max-width: 640px;
  margin: 0 auto 2.5rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0.5rem;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.search-icon {
  width: 24px;
  height: 24px;
  margin-left: 1rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 101, 178, 0.4);
}

/* Hero Stats */
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ═══════════════════════════════════════════
   Main Content Layout
   ═══════════════════════════════════════════ */
.main-content {
  padding: 2rem 0 5rem;
}

.content-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

/* ═══════════════════════════════════════════
   Sidebar Filters
   ═══════════════════════════════════════════ */
.filters-sidebar {
  position: sticky;
  top: 1rem;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-page);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.sidebar-title svg {
  width: 18px;
  height: 18px;
  color: var(--primary);
}

.clear-filters-btn {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--primary);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: rgba(27, 101, 178, 0.1);
}

.filter-group {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.filter-group:last-child {
  border-bottom: none;
}

.filter-group-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-checkbox,
.filter-radio {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  margin: 0 -0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-checkbox:hover,
.filter-radio:hover {
  background: var(--bg-page);
}

.filter-checkbox.active,
.filter-radio.active {
  background: rgba(27, 101, 178, 0.08);
}

.filter-checkbox input,
.filter-radio input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s;
}

.filter-checkbox.active .checkbox-custom {
  background: var(--primary);
  border-color: var(--primary);
}

.filter-checkbox.active .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s;
}

.filter-radio.active .radio-custom {
  border-color: var(--primary);
}

.filter-radio.active .radio-custom::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
}

.filter-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.filter-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: auto;
}

.location-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.filter-radio.active .location-icon {
  color: var(--primary);
}

/* ═══════════════════════════════════════════
   Jobs Content Area
   ═══════════════════════════════════════════ */
.jobs-content {
  min-width: 0;
}

.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn svg {
  width: 18px;
  height: 18px;
}

.tab-btn:hover {
  background: var(--bg-page);
  color: var(--text-primary);
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.tab-btn.active svg {
  color: white;
}

.tab-count {
  padding: 0.125rem 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 100px;
  font-size: 0.75rem;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* ═══════════════════════════════════════════
   Jobs Section
   ═══════════════════════════════════════════ */

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.results-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.results-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0;
}

.sort-select {
  padding: 0.625rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

/* Jobs Grid */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

/* Loading State */
.loading-state {
  padding: 2rem 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.skeleton-header,
.skeleton-title,
.skeleton-text,
.skeleton-tags {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-header {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.skeleton-title {
  width: 70%;
  height: 24px;
  margin-bottom: 0.75rem;
}

.skeleton-text {
  width: 90%;
  height: 16px;
  margin-bottom: 0.5rem;
}

.skeleton-tags {
  width: 40%;
  height: 28px;
  margin-top: 1rem;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #ef4444;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.error-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--primary);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn svg {
  width: 18px;
  height: 18px;
}

.retry-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-illustration {
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.primary-btn {
  padding: 0.875rem 1.5rem;
  background: var(--primary);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: var(--primary-dark);
}

/* Load More */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 200px;
  padding: 1rem 2rem;
  background: var(--bg-card);
  border: 2px solid var(--primary);
  border-radius: 12px;
  color: var(--primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(27, 101, 178, 0.3);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ═══════════════════════════════════════════
   CTA Section
   ═══════════════════════════════════════════ */
.cta-section {
  padding: 0 0 5rem;
}

.cta-card {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 24px;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
}

.cta-content h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.cta-content p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cta-primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: white;
  border: none;
  border-radius: 12px;
  color: var(--primary);
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.cta-secondary-btn {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: color 0.2s;
}

.cta-secondary-btn:hover {
  color: white;
  text-decoration: underline;
}

.cta-visual {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40%;
}

.cta-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}

.shape-1 {
  width: 200px;
  height: 200px;
  background: rgba(245, 158, 11, 0.3);
  top: 20%;
  right: 10%;
}

.shape-2 {
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  bottom: 20%;
  right: 30%;
}

.shape-3 {
  width: 100px;
  height: 100px;
  background: rgba(143, 178, 214, 0.3);
  top: 50%;
  right: 50%;
}

/* ═══════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════ */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 260px 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: relative;
    top: 0;
  }

  .filter-options {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-checkbox,
  .filter-radio {
    padding: 0.5rem 0.75rem;
    margin: 0;
    background: var(--bg-page);
    border-radius: 100px;
    border: 1px solid var(--border-color);
  }

  .filter-checkbox.active,
  .filter-radio.active {
    background: var(--primary);
    border-color: var(--primary);
  }

  .filter-checkbox.active .filter-label,
  .filter-radio.active .filter-label {
    color: white;
  }

  .filter-checkbox.active .checkbox-custom,
  .filter-radio.active .radio-custom {
    display: none;
  }

  .filter-checkbox.active .filter-meta {
    color: rgba(255, 255, 255, 0.8);
  }

  .filter-radio.active .location-icon {
    color: white;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 0 3rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .search-box {
    flex-direction: column;
    padding: 1rem;
    gap: 0.75rem;
  }

  .search-icon {
    display: none;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem;
    text-align: center;
  }

  .search-btn {
    width: 100%;
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .main-content {
    padding: 1.5rem 0 4rem;
  }

  .filters-sidebar {
    border-radius: 12px;
  }

  .sidebar-header {
    padding: 1rem 1.25rem;
  }

  .filter-group {
    padding: 1rem 1.25rem;
  }

  .tabs-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0.375rem;
  }

  .tab-btn {
    flex-shrink: 0;
    white-space: nowrap;
    padding: 0.625rem 1rem;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .loading-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    padding: 2.5rem 1.5rem;
    text-align: center;
  }

  .cta-content {
    max-width: 100%;
  }

  .cta-content h2 {
    font-size: 1.75rem;
  }

  .cta-visual {
    display: none;
  }

  .cta-actions {
    align-items: center;
  }
}
</style>
