<template>
  <div class="student-applications-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">My Applications</h1>
        <p class="page-description">
          Track your job applications and stay updated on their progress
        </p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">Total Applications</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.pending }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.interviews }}</div>
        <div class="stat-label">Interviews</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.offers }}</div>
        <div class="stat-label">Offers</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <div class="filter-group">
        <label>Status Filter:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Under Review</option>
          <option value="interview">Interview Scheduled</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sort by:</label>
        <select v-model="sortBy" class="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="status">By Status</option>
        </select>
      </div>
    </div>

    <!-- Applications List -->
    <div class="applications-container">
      <div v-if="loading" class="loading">Loading your applications...</div>
      
      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#6E7681" stroke-width="2"/>
        </svg>
        <h3>No applications yet</h3>
        <p>Start applying to jobs to see them here!</p>
        <button @click="$emit('navigate', 'jobs')" class="browse-jobs-btn">
          Browse Jobs
        </button>
      </div>

      <div v-else class="applications-grid">
        <div
          v-for="application in filteredApplications"
          :key="application.id"
          class="application-card"
        >
          <div class="card-header">
            <div class="job-info">
              <h3 class="job-title">{{ application.jobTitle }}</h3>
              <p class="company-name">{{ application.company }}</p>
            </div>
            <div class="status-badge" :class="getStatusClass(application.status)">
              {{ formatStatus(application.status) }}
            </div>
          </div>

          <div class="card-content">
            <div class="application-details">
              <div class="detail-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Applied {{ formatDate(application.appliedDate) }}</span>
              </div>
              <div class="detail-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ application.location }}</span>
              </div>
              <div class="detail-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ application.jobType }}</span>
              </div>
            </div>

            <div v-if="application.notes" class="application-notes">
              <p>{{ application.notes }}</p>
            </div>

            <div v-if="application.nextStep" class="next-step">
              <div class="next-step-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="#22c55e" stroke-width="2"/>
                </svg>
                <span class="next-step-label">Next Step:</span>
              </div>
              <p class="next-step-text">{{ application.nextStep }}</p>
            </div>
          </div>

          <div class="card-footer">
            <div class="timeline-progress">
              <div class="timeline-step" :class="{ active: true }">
                <div class="step-dot"></div>
                <span>Applied</span>
              </div>
              <div class="timeline-step" :class="{ active: ['reviewing', 'interview', 'approved'].includes(application.status) }">
                <div class="step-dot"></div>
                <span>Review</span>
              </div>
              <div class="timeline-step" :class="{ active: ['interview', 'approved'].includes(application.status) }">
                <div class="step-dot"></div>
                <span>Interview</span>
              </div>
              <div class="timeline-step" :class="{ active: application.status === 'approved' }">
                <div class="step-dot"></div>
                <span>Decision</span>
              </div>
            </div>

            <div class="card-actions">
              <button @click="viewApplication(application)" class="action-btn view-btn">
                View Details
              </button>
              <button 
                v-if="application.status === 'pending'" 
                @click="withdrawApplication(application)" 
                class="action-btn withdraw-btn"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Application Details</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedApplication" class="application-detail">
            <h4>{{ selectedApplication.jobTitle }}</h4>
            <p class="company">{{ selectedApplication.company }}</p>
            
            <div class="detail-section">
              <h5>Cover Letter</h5>
              <p>{{ selectedApplication.coverLetter }}</p>
            </div>

            <div class="detail-section">
              <h5>Skills Highlighted</h5>
              <div class="skills-list">
                <span v-for="skill in selectedApplication.skills" :key="skill" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>

            <div class="detail-section">
              <h5>Application Timeline</h5>
              <div class="timeline-detail">
                <div class="timeline-item">
                  <strong>Applied:</strong> {{ formatDate(selectedApplication.appliedDate) }}
                </div>
                <div v-if="selectedApplication.reviewedDate" class="timeline-item">
                  <strong>Reviewed:</strong> {{ formatDate(selectedApplication.reviewedDate) }}
                </div>
                <div v-if="selectedApplication.interviewDate" class="timeline-item">
                  <strong>Interview:</strong> {{ formatDate(selectedApplication.interviewDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// State
const loading = ref(true)
const applications = ref([])
const statusFilter = ref('all')
const sortBy = ref('newest')
const showDetailModal = ref(false)
const selectedApplication = ref(null)

// Computed
const stats = computed(() => {
  const total = applications.value.length
  const pending = applications.value.filter(app => app.status === 'pending').length
  const interviews = applications.value.filter(app => app.status === 'interview').length
  const offers = applications.value.filter(app => app.status === 'approved').length
  
  return { total, pending, interviews, offers }
})

const filteredApplications = computed(() => {
  let filtered = [...applications.value]

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === statusFilter.value)
  }

  switch (sortBy.value) {
    case 'newest':
      return filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate))
    case 'status':
      return filtered.sort((a, b) => a.status.localeCompare(b.status))
    default:
      return filtered
  }
})

// Methods
const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    reviewing: 'status-reviewing',
    interview: 'status-interview',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }
  return classes[status] || 'status-pending'
}

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    reviewing: 'Under Review',
    interview: 'Interview Scheduled',
    approved: 'Approved',
    rejected: 'Rejected'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewApplication = (application) => {
  selectedApplication.value = application
  showDetailModal.value = true
}

const withdrawApplication = (application) => {
  if (confirm('Are you sure you want to withdraw this application?')) {
    const index = applications.value.findIndex(app => app.id === application.id)
    if (index !== -1) {
      applications.value.splice(index, 1)
    }
  }
}

const closeModal = () => {
  showDetailModal.value = false
  selectedApplication.value = null
}

const fetchApplications = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    applications.value = [
      {
        id: 1,
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Ghana',
        location: 'Accra',
        jobType: 'Full-time',
        appliedDate: '2024-01-20',
        status: 'interview',
        coverLetter: 'I am excited to apply for the Frontend Developer position at TechCorp Ghana...',
        skills: ['React', 'JavaScript', 'CSS', 'Git'],
        nextStep: 'Interview scheduled for January 25th at 2:00 PM',
        interviewDate: '2024-01-25'
      },
      {
        id: 2,
        jobTitle: 'UI/UX Designer',
        company: 'DesignHub Africa',
        location: 'Accra',
        jobType: 'Internship',
        appliedDate: '2024-01-18',
        status: 'reviewing',
        coverLetter: 'I have a passion for creating user-centered designs...',
        skills: ['Figma', 'Adobe XD', 'Prototyping'],
        notes: 'Portfolio submitted for review',
        reviewedDate: '2024-01-19'
      },
      {
        id: 3,
        jobTitle: 'Backend Developer',
        company: 'StartupGH',
        location: 'Kumasi',
        jobType: 'Full-time',
        appliedDate: '2024-01-15',
        status: 'approved',
        coverLetter: 'I am a full-stack developer with focus on backend technologies...',
        skills: ['Node.js', 'Python', 'MongoDB'],
        nextStep: 'Offer letter will be sent within 48 hours'
      },
      {
        id: 4,
        jobTitle: 'Data Analyst',
        company: 'DataCorp',
        location: 'Remote',
        jobType: 'Part-time',
        appliedDate: '2024-01-12',
        status: 'rejected',
        coverLetter: 'I am passionate about data analysis and visualization...',
        skills: ['Python', 'SQL', 'Tableau'],
        notes: 'Thank you for your interest. We found a candidate with more experience.'
      },
      {
        id: 5,
        jobTitle: 'Mobile Developer',
        company: 'MobileTech GH',
        location: 'Cape Coast',
        jobType: 'Contract',
        appliedDate: '2024-01-10',
        status: 'pending',
        coverLetter: 'I have experience developing mobile applications...',
        skills: ['React Native', 'Flutter', 'JavaScript']
      }
    ]
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.student-applications-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.125rem;
  color: #8fb2d6;
  line-height: 1.6;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #8fb2d6;
}

.filters-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #8fb2d6;
}

.filter-select {
  padding: 8px 12px;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1b65b2;
}

.applications-container {
  min-height: 400px;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #8fb2d6;
  font-size: 1.125rem;
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
}

.browse-jobs-btn {
  padding: 0.75rem 1.5rem;
  background: #1b65b2;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.browse-jobs-btn:hover {
  background: #195aa5;
  transform: translateY(-1px);
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.application-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.application-card:hover {
  border-color: #1b65b2;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}

.company-name {
  margin: 0;
  font-size: 0.875rem;
  color: #8fb2d6;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.status-reviewing { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.status-interview { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.status-approved { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.status-rejected { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.card-content {
  margin-bottom: 1.5rem;
}

.application-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #8fb2d6;
}

.application-notes {
  padding: 1rem;
  background: #21262D;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.application-notes p {
  margin: 0;
  font-size: 0.875rem;
  color: #ffffff;
}

.next-step {
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
}

.next-step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.next-step-label {
  font-weight: 600;
  color: #22c55e;
  font-size: 0.875rem;
}

.next-step-text {
  margin: 0;
  font-size: 0.875rem;
  color: #ffffff;
}

.card-footer {
  border-top: 1px solid #30363D;
  padding-top: 1rem;
}

.timeline-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  position: relative;
}

.timeline-progress::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #30363D;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  z-index: 1;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #30363D;
  transition: all 0.2s ease;
}

.timeline-step.active .step-dot {
  background: #1b65b2;
}

.timeline-step span {
  font-size: 0.75rem;
  color: #8fb2d6;
}

.timeline-step.active span {
  color: #1b65b2;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background: #1b65b2;
  color: white;
}

.view-btn:hover {
  background: #195aa5;
}

.withdraw-btn {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.withdraw-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #30363D;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #8fb2d6;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #30363D;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.application-detail h4 {
  margin: 0 0 0.25rem 0;
  color: #ffffff;
  font-size: 1.125rem;
}

.application-detail .company {
  margin: 0 0 1.5rem 0;
  color: #8fb2d6;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h5 {
  margin: 0 0 0.75rem 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
}

.detail-section p {
  margin: 0;
  color: #8fb2d6;
  line-height: 1.6;
}

.skills-list {
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

.timeline-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-item {
  font-size: 0.875rem;
  color: #8fb2d6;
}

@media (max-width: 768px) {
  .student-applications-page {
    padding: 1rem;
  }
  
  .applications-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>