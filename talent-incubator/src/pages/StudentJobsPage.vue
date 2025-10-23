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

    <!-- Simple Search -->
    <div class="search-container">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search jobs..." 
        class="search-input"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Loading jobs...</div>

    <!-- Jobs Grid -->
    <div v-else class="jobs-grid">
      <JobCard
        v-for="job in filteredJobs"
        :key="job.id"
        :job="job"
        @apply="handleApplyJob"
      />
    </div>

    <!-- Application Modal -->
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
import { useStudentJobs } from '../composables/useStudentJobs.js'
import { COLORS } from '../constants/colors.js'

// Components
import JobCard from '../components/student/JobCard.vue'
import JobApplicationModal from '../components/student/JobApplicationModal.vue'

// Initialize composable
const {
  loading,
  jobs,
  showApplicationModal,
  selectedJob,
  fetchJobs,
  handleApplyJob,
  handleApplicationSubmit,
  closeApplicationModal
} = useStudentJobs()

// Filter state
const searchQuery = ref('')

// Computed filtered jobs
const filteredJobs = computed(() => {
  if (!searchQuery.value) return jobs.value
  
  const query = searchQuery.value.toLowerCase()
  return jobs.value.filter(job => 
    job.title.toLowerCase().includes(query) ||
    job.company.toLowerCase().includes(query) ||
    job.location.toLowerCase().includes(query)
  )
})

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
  color: v-bind('COLORS.TEXT.PRIMARY');
  background: linear-gradient(135deg, v-bind('COLORS.BRAND.PRIMARY'), v-bind('COLORS.BRAND.ACCENT'));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.25rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
}

.loading {
  text-align: center;
  padding: 3rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 1.125rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
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
  
  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
</style>