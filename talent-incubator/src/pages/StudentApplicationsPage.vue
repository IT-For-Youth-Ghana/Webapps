<script setup>
import { ref, computed, onMounted } from 'vue'
import ApplicationCard from '../components/student/ApplicationCard.vue'

const loading = ref(true)
const selectedFilter = ref('all')
const searchQuery = ref('')
const applications = ref([])

const filterOptions = [
  { value: 'all', label: 'All Applications', count: 0 },
  { value: 'pending', label: 'Pending', count: 0 },
  { value: 'reviewing', label: 'Under Review', count: 0 },
  { value: 'interview', label: 'Interview', count: 0 },
  { value: 'approved', label: 'Approved', count: 0 },
  { value: 'rejected', label: 'Not Selected', count: 0 }
]

const filteredApplications = computed(() => {
  let filtered = [...applications.value]

  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === selectedFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(app => 
      app.jobTitle.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
})

const stats = computed(() => {
  const total = applications.value.length
  const pending = applications.value.filter(app => app.status === 'pending').length
  const reviewing = applications.value.filter(app => app.status === 'reviewing').length
  const interview = applications.value.filter(app => app.status === 'interview').length
  const approved = applications.value.filter(app => app.status === 'approved').length
  const rejected = applications.value.filter(app => app.status === 'rejected').length

  return {
    total,
    pending,
    reviewing,
    interview,
    approved,
    rejected,
    successRate: total > 0 ? Math.round((approved / total) * 100) : 0
  }
})

const handleViewDetails = (applicationId) => {
  const application = applications.value.find(app => app.id === applicationId)
  console.log('Viewing application details:', application)
  // In real app, this would open a detailed view modal
}

const handleWithdraw = async (applicationId) => {
  if (confirm('Are you sure you want to withdraw this application?')) {
    const application = applications.value.find(app => app.id === applicationId)
    if (application) {
      application.status = 'withdrawn'
      console.log('Application withdrawn:', applicationId)
      // In real app, this would make an API call
    }
  }
}

const fetchApplications = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    applications.value = [
      {
        id: 1,
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Ghana',
        appliedDate: '2024-01-15',
        status: 'interview',
        notes: 'Interview scheduled for January 25th at 10:00 AM. Please prepare for technical questions about React and JavaScript.',
        salary: 'GHS 8,000 - 12,000',
        location: 'Accra',
        type: 'Full-time',
        coverLetter: 'Dear Hiring Manager, I am excited to apply for the Frontend Developer position...',
        interviewDate: '2024-01-25',
        feedback: 'Strong technical skills, good communication'
      },
      {
        id: 2,
        jobTitle: 'UI/UX Designer',
        company: 'DesignHub Africa',
        appliedDate: '2024-01-12',
        status: 'approved',
        notes: 'Congratulations! Your application has been approved. HR will contact you with the offer details.',
        salary: 'GHS 4,000 - 6,000',
        location: 'Accra',
        type: 'Part-time',
        coverLetter: 'Dear DesignHub Team, I am passionate about creating beautiful user experiences...',
        offerDetails: 'Starting salary: GHS 5,500, Start date: February 1st'
      },
      {
        id: 3,
        jobTitle: 'Backend Developer',
        company: 'StartupGH',
        appliedDate: '2024-01-10',
        status: 'reviewing',
        notes: 'Your application is currently being reviewed by our technical team.',
        salary: 'GHS 6,000 - 10,000',
        location: 'Kumasi',
        type: 'Full-time',
        coverLetter: 'Hello StartupGH team, I am interested in the Backend Developer role...'
      },
      {
        id: 4,
        jobTitle: 'Data Analyst Intern',
        company: 'DataCorp',
        appliedDate: '2024-01-08',
        status: 'pending',
        notes: 'Application received and is in the queue for initial review.',
        salary: 'GHS 1,500 - 2,500',
        location: 'Tamale',
        type: 'Internship',
        coverLetter: 'Dear DataCorp team, I am eager to learn data analysis...'
      },
      {
        id: 5,
        jobTitle: 'Mobile Developer',
        company: 'AppMakers Ghana',
        appliedDate: '2024-01-05',
        status: 'rejected',
        notes: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.',
        salary: 'GHS 7,000 - 9,000',
        location: 'Ho',
        type: 'Contract',
        coverLetter: 'Dear AppMakers team, I would love to contribute to your mobile development projects...',
        feedback: 'Good portfolio but looking for more React Native experience'
      },
      {
        id: 6,
        jobTitle: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        appliedDate: '2024-01-03',
        status: 'pending',
        notes: 'Application submitted successfully. You will hear back within 2 weeks.',
        salary: 'GHS 10,000 - 15,000',
        location: 'Cape Coast',
        type: 'Full-time',
        coverLetter: 'Dear CloudTech team, I am excited about the DevOps Engineer opportunity...'
      }
    ]
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div class="applications-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">My Applications</h1>
      <p class="page-subtitle">Track the status of your job applications</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your applications...</p>
    </div>

    <div v-else>
      <!-- Statistics -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card pending">
            <div class="stat-value">{{ stats.pending + stats.reviewing }}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card success">
            <div class="stat-value">{{ stats.approved + stats.interview }}</div>
            <div class="stat-label">Positive Response</div>
          </div>
          <div class="stat-card rate">
            <div class="stat-value">{{ stats.successRate }}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section card">
        <div class="filters-header">
          <h3 class="filters-title">Filter Applications</h3>
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search by job title or company..."
            >
          </div>
        </div>

        <div class="filter-buttons">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            :class="[
              'filter-btn',
              { 'active': selectedFilter === filter.value }
            ]"
          >
            {{ filter.label }}
            <span class="filter-count">
              {{ filter.value === 'all' ? stats.total : stats[filter.value] || 0 }}
            </span>
          </button>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        <p class="results-count">
          <span class="count-number">{{ filteredApplications.length }}</span>
          {{ filteredApplications.length === 1 ? 'application' : 'applications' }}
          <span v-if="selectedFilter !== 'all'" class="filter-name">
            ({{ filterOptions.find(f => f.value === selectedFilter)?.label }})
          </span>
          <span v-if="searchQuery" class="search-term">
            matching "{{ searchQuery }}"
          </span>
        </p>
      </div>

      <!-- Applications List -->
      <div v-if="filteredApplications.length > 0" class="applications-grid">
        <ApplicationCard
          v-for="application in filteredApplications"
          :key="application.id"
          :application="application"
          @view-details="handleViewDetails"
          @withdraw="handleWithdraw"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">📄</div>
          <h3 class="empty-title">
            {{ searchQuery || selectedFilter !== 'all' 
              ? 'No applications found' 
              : 'No applications yet' 
            }}
          </h3>
          <p class="empty-description">
            {{ searchQuery || selectedFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start applying to jobs to see your applications here.'
            }}
          </p>
          <div class="empty-actions">
            <button 
              v-if="searchQuery || selectedFilter !== 'all'"
              @click="searchQuery = ''; selectedFilter = 'all'" 
              class="btn-secondary"
            >
              Clear Filters
            </button>
            <button class="btn-primary">
              Browse Jobs
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="tips-section card">
        <h3 class="tips-title">Application Tips</h3>
        <div class="tips-grid">
          <div class="tip-item">
            <div class="tip-icon">💡</div>
            <div class="tip-content">
              <h4>Follow Up</h4>
              <p>If you haven't heard back within 2 weeks, consider sending a polite follow-up message.</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">📝</div>
            <div class="tip-content">
              <h4>Keep Records</h4>
              <p>Track your applications and note what worked well for successful applications.</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">🎯</div>
            <div class="tip-content">
              <h4>Quality over Quantity</h4>
              <p>Focus on applications that match your skills and interests rather than applying everywhere.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.applications-page {
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
.stat-card.pending::before { background: #FF9F0A; }
.stat-card.success::before { background: #32D74B; }
.stat-card.rate::before { background: #BF5AF2; }

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

.search-container {
  flex: 1;
  max-width: 20rem;
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

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  background: none;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #8B949E;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 250ms ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  border-color: #484F58;
  color: #F0F6FC;
}

.filter-btn.active {
  background: #007AFF;
  border-color: #007AFF;
  color: white;
}

.filter-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
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

.filter-name,
.search-term {
  color: #007AFF;
  font-weight: 500;
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
  margin-bottom: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 28rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
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

.tips-section {
  padding: 1.5rem;
}

.tips-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 1rem 0;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.tip-content p {
  font-size: 0.8125rem;
  color: #8B949E;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 768px) {
  .applications-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .applications-grid {
    grid-template-columns: 1fr;
  }

  .empty-actions {
    flex-direction: column;
    align-items: center;
  }

  .empty-actions button {
    width: 100%;
    max-width: 12rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    justify-content: center;
  }
}
</style>