<script setup>
import { ref, computed, onMounted } from 'vue'
import JobCard from '../components/student/JobCard.vue'
import JobApplicationModal from '../components/student/JobApplicationModal.vue'

const loading = ref(true)
const searchQuery = ref('')
const selectedLocation = ref('')
const selectedType = ref('')
const selectedSalaryRange = ref('')
const sortBy = ref('newest')

const showApplicationModal = ref(false)
const selectedJob = ref(null)

const jobs = ref([])
const locations = ref(['All Locations', 'Accra', 'Kumasi', 'Tamale', 'Cape Coast', 'Ho'])
const jobTypes = ref(['All Types', 'Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'])
const salaryRanges = ref(['All Salaries', '0 - 2,000', '2,000 - 5,000', '5,000 - 8,000', '8,000+'])

const filteredJobs = computed(() => {
  let filtered = [...jobs.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.requirements.some(req => req.toLowerCase().includes(query))
    )
  }

  if (selectedLocation.value && selectedLocation.value !== 'All Locations') {
    filtered = filtered.filter(job => job.location.includes(selectedLocation.value))
  }

  if (selectedType.value && selectedType.value !== 'All Types') {
    filtered = filtered.filter(job => job.type === selectedType.value)
  }

  if (selectedSalaryRange.value && selectedSalaryRange.value !== 'All Salaries') {
    filtered = filtered.filter(job => {
      const salary = parseInt(job.salary.replace(/[^\d]/g, ''))
      switch (selectedSalaryRange.value) {
        case '0 - 2,000': return salary <= 2000
        case '2,000 - 5,000': return salary > 2000 && salary <= 5000
        case '5,000 - 8,000': return salary > 5000 && salary <= 8000
        case '8,000+': return salary > 8000
        default: return true
      }
    })
  }

  // Sort jobs
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate))
      break
    case 'salary-high':
      filtered.sort((a, b) => {
        const salaryA = parseInt(a.salary.replace(/[^\d]/g, ''))
        const salaryB = parseInt(b.salary.replace(/[^\d]/g, ''))
        return salaryB - salaryA
      })
      break
    case 'salary-low':
      filtered.sort((a, b) => {
        const salaryA = parseInt(a.salary.replace(/[^\d]/g, ''))
        const salaryB = parseInt(b.salary.replace(/[^\d]/g, ''))
        return salaryA - salaryB
      })
      break
    case 'deadline':
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      break
  }

  return filtered
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedLocation.value = ''
  selectedType.value = ''
  selectedSalaryRange.value = ''
  sortBy.value = 'newest'
}

const handleApplyToJob = (jobId) => {
  selectedJob.value = jobs.value.find(job => job.id === jobId)
  showApplicationModal.value = true
}

const handleViewJobDetails = (jobId) => {
  const job = jobs.value.find(job => job.id === jobId)
  console.log('Viewing job details:', job)
  // In real app, this would open a detailed job view modal or navigate to job details page
}

const handleApplicationSubmit = (applicationData) => {
  console.log('Application submitted:', applicationData)
  showApplicationModal.value = false
  selectedJob.value = null
  // In real app, this would submit to backend and show success message
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
        salary: 'GHS 8,000 - 12,000',
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        description: 'We are looking for a talented Frontend Developer to join our team and help build the next generation of web applications. You will work with modern technologies and collaborate with a passionate team.',
        requirements: ['React', 'JavaScript', 'CSS', 'Git', 'TypeScript'],
        responsibilities: [
          'Develop user-facing features using React',
          'Write clean, maintainable code',
          'Collaborate with design and backend teams',
          'Optimize applications for maximum speed and scalability'
        ],
        benefits: ['Health Insurance', 'Flexible Hours', 'Professional Development', 'Remote Work Options']
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
        description: 'Join our growing team as a Backend Developer and help build scalable server-side applications. Great opportunity for someone passionate about building robust systems.',
        requirements: ['Node.js', 'Python', 'MongoDB', 'API Development', 'AWS'],
        responsibilities: [
          'Design and implement RESTful APIs',
          'Optimize database performance',
          'Implement security best practices',
          'Deploy and monitor applications'
        ],
        benefits: ['Competitive Salary', 'Stock Options', 'Learning Budget', 'Team Events']
      },
      {
        id: 3,
        title: 'UI/UX Designer',
        company: 'DesignHub Africa',
        location: 'Accra',
        type: 'Part-time',
        salary: 'GHS 4,000 - 6,000',
        postedDate: '2024-01-10',
        deadline: '2024-02-10',
        description: 'We need a creative UI/UX Designer to create beautiful and intuitive user experiences. Perfect for someone who loves solving design challenges.',
        requirements: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
        responsibilities: [
          'Create wireframes and prototypes',
          'Conduct user research and testing',
          'Design user interfaces and experiences',
          'Collaborate with development teams'
        ],
        benefits: ['Flexible Schedule', 'Creative Freedom', 'Latest Design Tools', 'Portfolio Projects']
      },
      {
        id: 4,
        title: 'Data Analyst Intern',
        company: 'DataCorp',
        location: 'Tamale',
        type: 'Internship',
        salary: 'GHS 1,500 - 2,500',
        postedDate: '2024-01-08',
        deadline: '2024-02-08',
        description: 'Learn data analysis in a real-world environment. Great opportunity for students or recent graduates to gain hands-on experience.',
        requirements: ['Python', 'SQL', 'Excel', 'Statistics'],
        responsibilities: [
          'Analyze business data and trends',
          'Create reports and visualizations',
          'Support data-driven decision making',
          'Learn advanced analytics techniques'
        ],
        benefits: ['Mentorship Program', 'Real Projects', 'Certificate', 'Potential Full-time Offer']
      },
      {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Cape Coast',
        type: 'Full-time',
        salary: 'GHS 10,000 - 15,000',
        postedDate: '2024-01-05',
        deadline: '2024-02-05',
        description: 'Help us build and maintain our cloud infrastructure. Looking for someone passionate about automation and scalable systems.',
        requirements: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
        responsibilities: [
          'Manage cloud infrastructure',
          'Implement CI/CD pipelines',
          'Monitor system performance',
          'Ensure security and compliance'
        ],
        benefits: ['High Salary', 'Cloud Certifications', 'Latest Technology', 'Global Projects']
      },
      {
        id: 6,
        title: 'Mobile Developer',
        company: 'AppMakers Ghana',
        location: 'Ho',
        type: 'Contract',
        salary: 'GHS 7,000 - 9,000',
        postedDate: '2024-01-03',
        deadline: '2024-02-03',
        description: 'Build mobile applications that impact thousands of users across Ghana. Work with cutting-edge mobile technologies.',
        requirements: ['React Native', 'Flutter', 'Mobile UI/UX', 'API Integration'],
        responsibilities: [
          'Develop cross-platform mobile apps',
          'Optimize app performance',
          'Implement native features',
          'Collaborate with product team'
        ],
        benefits: ['Project-based Work', 'Portfolio Building', 'Flexible Hours', 'Tech Allowance']
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
      <h1 class="page-title">Browse Job Opportunities</h1>
      <p class="page-subtitle">Discover your next career opportunity in Ghana's tech industry</p>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section card">
      <div class="search-row">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search jobs, companies, or skills..."
          >
        </div>
        <button @click="clearFilters" class="btn-secondary">
          Clear Filters
        </button>
      </div>

      <div class="filters-row">
        <select v-model="selectedLocation" class="filter-select">
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>

        <select v-model="selectedType" class="filter-select">
          <option v-for="type in jobTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <select v-model="selectedSalaryRange" class="filter-select">
          <option v-for="range in salaryRanges" :key="range" :value="range">
            {{ range }}
          </option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="salary-high">Highest Salary</option>
          <option value="salary-low">Lowest Salary</option>
          <option value="deadline">Deadline Soon</option>
        </select>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <p class="results-count">
        <span class="count-number">{{ filteredJobs.length }}</span>
        {{ filteredJobs.length === 1 ? 'job' : 'jobs' }} found
        <span v-if="searchQuery" class="search-term">for "{{ searchQuery }}"</span>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading job opportunities...</p>
    </div>

    <!-- Jobs Grid -->
    <div v-else-if="filteredJobs.length > 0" class="jobs-grid">
      <JobCard
        v-for="job in filteredJobs"
        :key="job.id"
        :job="job"
        @apply="handleApplyToJob"
        @view-details="handleViewJobDetails"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3 class="empty-title">No jobs found</h3>
        <p class="empty-description">
          Try adjusting your search criteria or clearing the filters to see more opportunities.
        </p>
        <button @click="clearFilters" class="btn-primary">
          Clear All Filters
        </button>
      </div>
    </div>

    <!-- Job Application Modal -->
    <JobApplicationModal
      v-if="showApplicationModal && selectedJob"
      :job="selectedJob"
      @submit="handleApplicationSubmit"
      @close="showApplicationModal = false"
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
  margin-bottom: 2rem;
  text-align: center;
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

.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.search-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.search-input-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 1rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  background: #161B22;
}

.search-input::placeholder {
  color: #6E7681;
}

.filters-row {
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
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
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

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
}

.empty-content {
  text-align: center;
  max-width: 24rem;
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

@media (max-width: 768px) {
  .jobs-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-row {
    flex-direction: column;
  }

  .filters-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filters-section {
    padding: 1rem;
  }
}
</style>