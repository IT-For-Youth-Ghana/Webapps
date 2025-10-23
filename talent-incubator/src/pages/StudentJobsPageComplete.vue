<template>
  <div class="student-jobs-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Find Your Dream Job</h1>
        <p class="page-description">
          Discover exciting opportunities from Ghana's top companies and startups
        </p>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-container">
      <div class="search-section">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by job title, company, or skills..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-btn"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="filters-section">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Location</label>
            <select v-model="selectedLocation" class="filter-select">
              <option value="">All Locations</option>
              <option value="Accra">Accra</option>
              <option value="Kumasi">Kumasi</option>
              <option value="Tamale">Tamale</option>
              <option value="Cape Coast">Cape Coast</option>
              <option value="Ho">Ho</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Job Type</label>
            <select v-model="selectedType" class="filter-select">
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Salary Range</label>
            <select v-model="selectedSalaryRange" class="filter-select">
              <option value="">All Salaries</option>
              <option value="0-2k">0 - 2,000 GHS</option>
              <option value="2k-5k">2,000 - 5,000 GHS</option>
              <option value="5k-8k">5,000 - 8,000 GHS</option>
              <option value="8k+">8,000+ GHS</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <select v-model="sortBy" class="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="salary-high">Highest Salary</option>
              <option value="salary-low">Lowest Salary</option>
              <option value="deadline">Deadline Soon</option>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <button 
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="clear-filters-btn"
            type="button"
          >
            Clear Filters
          </button>
          
          <div class="results-count">
            {{ filteredJobs.length }} {{ filteredJobs.length === 1 ? 'job' : 'jobs' }} found
          </div>
        </div>
      </div>
    </div>

    <!-- Jobs Grid -->
    <div class="jobs-grid-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-grid">
          <div 
            v-for="n in 6"
            :key="n"
            class="job-card-skeleton"
          >
            <div class="skeleton-header"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line"></div>
            </div>
            <div class="skeleton-footer"></div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M20 6H4V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2z" fill="#6E7681"/>
          <path d="M4 8h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8z" fill="#6E7681"/>
        </svg>
        <h3>No jobs found</h3>
        <p>Try adjusting your search filters to find more opportunities.</p>
      </div>

      <div v-else class="jobs-grid">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="job-card"
          @click="handleViewJob(job)"
        >
          <div class="job-card-header">
            <div class="company-info">
              <div class="company-logo">
                <span class="company-initial">{{ job.company.charAt(0) }}</span>
              </div>
              <div class="company-details">
                <h3 class="job-title">{{ job.title }}</h3>
                <p class="company-name">{{ job.company }}</p>
              </div>
            </div>
            <div class="job-type-badge" :class="getTypeBadgeClass(job.type)">
              {{ job.type }}
            </div>
          </div>

          <div class="job-card-content">
            <div class="job-info-row">
              <div class="job-info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ job.location }}</span>
              </div>
              <div class="job-info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ job.salary }}</span>
              </div>
            </div>

            <p class="job-description">{{ job.description }}</p>

            <div class="job-skills">
              <span 
                v-for="skill in job.requirements.slice(0, 3)" 
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span v-if="job.requirements.length > 3" class="skill-more">
                +{{ job.requirements.length - 3 }} more
              </span>
            </div>
          </div>

          <div class="job-card-footer">
            <div class="job-meta">
              <span class="posted-date">{{ formatDate(job.postedDate) }}</span>
              <span class="deadline" v-if="job.deadline">
                Deadline: {{ formatDate(job.deadline) }}
              </span>
            </div>
            <button 
              @click.stop="handleApplyJob(job)"
              class="apply-btn"
              :disabled="job.hasApplied"
            >
              {{ job.hasApplied ? 'Applied' : 'Apply Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Application Modal -->
    <JobApplicationModal
      v-if="showApplicationModal"
      :job="selectedJob"
      @submit="handleApplicationSubmit"
      @close="closeApplicationModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import JobApplicationModal from '../components/student/JobApplicationModal.vue'

// State management
const loading = ref(true)
const showApplicationModal = ref(false)
const selectedJob = ref(null)
const jobs = ref([])

// Filter state
const searchQuery = ref('')
const selectedLocation = ref('')
const selectedType = ref('')
const selectedSalaryRange = ref('')
const sortBy = ref('newest')

// Computed properties
const filteredJobs = computed(() => {
  let filtered = [...jobs.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.requirements.some(req => req.toLowerCase().includes(query))
    )
  }

  // Location filter
  if (selectedLocation.value) {
    filtered = filtered.filter(job => job.location.includes(selectedLocation.value))
  }

  // Job type filter
  if (selectedType.value) {
    filtered = filtered.filter(job => job.type === selectedType.value)
  }

  // Salary range filter
  if (selectedSalaryRange.value) {
    filtered = filtered.filter(job => {
      const salary = extractSalaryNumber(job.salary)
      return matchesSalaryRange(salary, selectedSalaryRange.value)
    })
  }

  // Sort results
  return sortJobs(filtered, sortBy.value)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         selectedLocation.value || 
         selectedType.value ||
         selectedSalaryRange.value
})

// Methods
const extractSalaryNumber = (salary) => {
  if (!salary) return 0
  const matches = salary.match(/[\d,]+/)
  return matches ? parseInt(matches[0].replace(/,/g, '')) : 0
}

const matchesSalaryRange = (salary, range) => {
  switch (range) {
    case '0-2k': return salary <= 2000
    case '2k-5k': return salary > 2000 && salary <= 5000
    case '5k-8k': return salary > 5000 && salary <= 8000
    case '8k+': return salary > 8000
    default: return true
  }
}

const sortJobs = (jobList, sortBy) => {
  const sorted = [...jobList]
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate))
    case 'salary-high':
      return sorted.sort((a, b) => extractSalaryNumber(b.salary) - extractSalaryNumber(a.salary))
    case 'salary-low':
      return sorted.sort((a, b) => extractSalaryNumber(a.salary) - extractSalaryNumber(b.salary))
    case 'deadline':
      return sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    default:
      return sorted
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedLocation.value = ''
  selectedType.value = ''
  selectedSalaryRange.value = ''
  sortBy.value = 'newest'
}

const handleApplyJob = (job) => {
  selectedJob.value = job
  showApplicationModal.value = true
}

const handleViewJob = (job) => {
  selectedJob.value = job
  console.log('Viewing job:', job.title)
}

const handleApplicationSubmit = async (applicationData) => {
  try {
    console.log('Submitting application:', applicationData)
    
    // Mark job as applied
    const jobIndex = jobs.value.findIndex(j => j.id === selectedJob.value.id)
    if (jobIndex !== -1) {
      jobs.value[jobIndex].hasApplied = true
    }
    
    closeApplicationModal()
  } catch (error) {
    console.error('Error submitting application:', error)
  }
}

const closeApplicationModal = () => {
  showApplicationModal.value = false
  selectedJob.value = null
}

// Helper functions
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
        salary: 'GHS 8,000 - 12,000',
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        description: 'We are looking for a talented Frontend Developer to join our growing team and help build amazing user experiences.',
        requirements: ['React', 'JavaScript', 'CSS', 'Git', 'HTML'],
        responsibilities: ['Develop user-facing features', 'Write clean, maintainable code', 'Collaborate with design team'],
        benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget'],
        remote: false,
        urgent: false,
        hasApplied: false
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'StartupGH',
        location: 'Kumasi',
        type: 'Full-time',
        salary: 'GHS 6,000 - 10,000',
        postedDate: '2024-01-12',
        deadline: '2024-02-12',
        description: 'Join our growing team as a Backend Developer and help us scale our platform.',
        requirements: ['Node.js', 'Python', 'MongoDB', 'REST APIs'],
        responsibilities: ['Design and implement APIs', 'Optimize database performance', 'Ensure security'],
        benefits: ['Stock Options', 'Learning Budget', 'Flexible Work'],
        remote: true,
        urgent: false,
        hasApplied: false
      },
      {
        id: 3,
        title: 'UI/UX Designer Intern',
        company: 'DesignHub Africa',
        location: 'Accra',
        type: 'Internship',
        salary: 'GHS 1,500 - 2,500',
        postedDate: '2024-01-10',
        deadline: '2024-02-01',
        description: 'Great opportunity for a creative UI/UX Designer to gain hands-on experience.',
        requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        responsibilities: ['Create wireframes and prototypes', 'Conduct user research', 'Design user interfaces'],
        benefits: ['Mentorship', 'Portfolio Building', 'Certificate'],
        remote: false,
        urgent: true,
        hasApplied: false
      },
      {
        id: 4,
        title: 'Data Analyst',
        company: 'DataCorp',
        location: 'Remote',
        type: 'Part-time',
        salary: 'GHS 4,000 - 6,000',
        postedDate: '2024-01-08',
        deadline: '2024-02-08',
        description: 'Analyze data and provide insights to help drive business decisions.',
        requirements: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
        responsibilities: ['Analyze business data', 'Create reports and dashboards', 'Present findings'],
        benefits: ['Flexible Schedule', 'Remote Work', 'Learning Opportunities'],
        remote: true,
        urgent: false,
        hasApplied: true
      },
      {
        id: 5,
        title: 'Mobile App Developer',
        company: 'MobileTech GH',
        location: 'Cape Coast',
        type: 'Contract',
        salary: 'GHS 10,000 - 15,000',
        postedDate: '2024-01-05',
        deadline: '2024-01-30',
        description: 'Develop cross-platform mobile applications for our clients.',
        requirements: ['React Native', 'Flutter', 'JavaScript', 'Mobile UI/UX'],
        responsibilities: ['Build mobile applications', 'Optimize performance', 'Test on multiple devices'],
        benefits: ['High Compensation', 'Project-based Work', 'Portfolio Growth'],
        remote: false,
        urgent: true,
        hasApplied: false
      },
      {
        id: 6,
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Accra',
        type: 'Full-time',
        salary: 'GHS 12,000 - 18,000',
        postedDate: '2024-01-03',
        deadline: '2024-02-03',
        description: 'Help us build and maintain scalable cloud infrastructure.',
        requirements: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
        responsibilities: ['Manage cloud infrastructure', 'Implement CI/CD pipelines', 'Monitor system performance'],
        benefits: ['High Salary', 'Cloud Certifications', 'Remote Options'],
        remote: true,
        urgent: false,
        hasApplied: false
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
.student-jobs-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-title {
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.25rem;
  color: #8fb2d6;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.filters-container {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6E7681;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1b65b2;
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.2);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px;
  background: transparent;
  border: none;
  color: #6E7681;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #30363D;
  color: #8fb2d6;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #8fb2d6;
}

.filter-select {
  padding: 10px 12px;
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
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #30363D;
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

.results-count {
  font-size: 0.875rem;
  color: #8fb2d6;
  font-weight: 500;
}

.jobs-grid-container {
  min-height: 400px;
}

.loading-container {
  padding: 1rem 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.job-card-skeleton {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 16px;
  padding: 1.5rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  height: 60px;
  background: #21262D;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.skeleton-line {
  height: 16px;
  background: #21262D;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 70%;
}

.skeleton-footer {
  height: 40px;
  background: #21262D;
  border-radius: 8px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1.5rem;
}

.empty-state h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  color: #8fb2d6;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.job-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.job-card:hover {
  border-color: #1b65b2;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(27, 101, 178, 0.15);
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.company-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-initial {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.company-details {
  flex: 1;
}

.job-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
}

.company-name {
  margin: 0;
  font-size: 0.875rem;
  color: #8fb2d6;
}

.job-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
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

.job-card-content {
  margin-bottom: 1.5rem;
}

.job-info-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.job-info-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #8fb2d6;
}

.job-description {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #ffffff;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  padding: 0.25rem 0.5rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #8fb2d6;
}

.skill-more {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px dashed #30363D;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #6E7681;
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #30363D;
}

.job-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.posted-date, .deadline {
  font-size: 0.75rem;
  color: #6E7681;
}

.deadline {
  color: #f59e0b;
}

.apply-btn {
  padding: 0.5rem 1rem;
  background: #1b65b2;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-btn:hover:not(:disabled) {
  background: #195aa5;
  transform: translateY(-1px);
}

.apply-btn:disabled {
  background: #30363D;
  color: #6E7681;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .student-jobs-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2.25rem;
  }
  
  .page-description {
    font-size: 1.125rem;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .results-count {
    text-align: center;
  }
  
  .jobs-grid {
    grid-template-columns: 1fr;
  }
  
  .job-card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .job-type-badge {
    align-self: flex-start;
  }
  
  .job-info-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>