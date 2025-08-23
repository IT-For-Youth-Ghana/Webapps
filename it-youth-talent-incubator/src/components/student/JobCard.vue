<!-- 
  Job Card Component
  Individual job opportunity card display for students
-->
<script setup>
import { ref } from 'vue'

// Sample job data - in real app this would be passed as props
const jobs = ref([
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'TechCorp Ghana',
    location: 'Accra, Ghana',
    type: 'Internship',
    salary: 'GH₵ 1,500 - 2,000',
    description: 'Join our dynamic team as a Frontend Developer Intern. Work on exciting projects using modern technologies like React, Vue.js, and TypeScript.',
    requirements: ['JavaScript', 'React/Vue.js', 'HTML/CSS', 'Git'],
    posted: '2 days ago',
    deadline: '2025-02-15',
    status: 'active',
    applied: false,
    saved: false
  },
  {
    id: 2,
    title: 'Junior Web Developer',
    company: 'Digital Solutions Ltd',
    location: 'Kumasi, Ghana',
    type: 'Part-time',
    salary: 'GH₵ 2,500 - 3,500',
    description: 'Looking for a motivated Junior Web Developer to help build innovative web applications. Perfect opportunity for recent graduates.',
    requirements: ['PHP', 'Laravel', 'MySQL', 'JavaScript'],
    posted: '1 week ago',
    deadline: '2025-01-30',
    status: 'expiring',
    applied: true,
    saved: true
  },
  {
    id: 3,
    title: 'Mobile App Developer',
    company: 'Innovation Hub',
    location: 'Tamale, Ghana',
    type: 'Full-time',
    salary: 'GH₵ 4,000 - 6,000',
    description: 'Exciting opportunity to develop mobile applications using React Native and Flutter. Join our growing tech team in Northern Ghana.',
    requirements: ['React Native', 'Flutter', 'Firebase', 'API Integration'],
    posted: '3 days ago',
    deadline: '2025-02-20',
    status: 'active',
    applied: false,
    saved: false
  }
])

const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'status-active'
    case 'expiring': return 'status-expiring'
    case 'closed': return 'status-closed'
    default: return 'status-active'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Active'
    case 'expiring': return 'Expiring Soon'
    case 'closed': return 'Closed'
    default: return 'Active'
  }
}

const applyToJob = (job) => {
  if (job.applied) return
  
  job.applied = true
  console.log('Applied to job:', job.title)
  // TODO: Implement actual application logic
}

const toggleSaveJob = (job) => {
  job.saved = !job.saved
  console.log(job.saved ? 'Saved job:' : 'Unsaved job:', job.title)
  // TODO: Implement save/unsave logic
}

const viewJobDetails = (job) => {
  console.log('View details for:', job.title)
  // TODO: Navigate to job details page
}
</script>

<template>
  <div>
    <h1>Available Opportunities</h1>
    <p class="subtitle">Discover exciting IT career opportunities in Ghana</p>
    
    <div class="section-container">
      <h2>Job Opportunities ({{ jobs.length }})</h2>
      
      <div class="jobs-grid">
        <div 
          v-for="job in jobs" 
          :key="job.id" 
          class="job-card"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="status-and-type">
              <span :class="['status-badge', getStatusClass(job.status)]">
                {{ getStatusText(job.status) }}
              </span>
              <span class="job-type">{{ job.type }}</span>
            </div>
            
            <button 
              @click="toggleSaveJob(job)" 
              :class="['save-btn', { saved: job.saved }]"
              :title="job.saved ? 'Remove from saved' : 'Save job'"
            >
              {{ job.saved ? '❤️' : '🤍' }}
            </button>
          </div>

          <!-- Job Information -->
          <div class="card-body">
            <h3 class="job-title">{{ job.title }}</h3>
            <p class="company-name">{{ job.company }}</p>
            <p class="job-location">📍 {{ job.location }}</p>
            <p class="job-salary">💰 {{ job.salary }}</p>
            
            <p class="job-description">{{ job.description }}</p>
            
            <!-- Required Skills -->
            <div class="skills-section">
              <h4>Required Skills:</h4>
              <div class="skills-tags">
                <span 
                  v-for="skill in job.requirements" 
                  :key="skill" 
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
            
            <!-- Job Dates -->
            <div class="job-dates">
              <div class="date-item">
                <span class="date-label">Posted:</span>
                <span class="date-value">{{ job.posted }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">Deadline:</span>
                <span class="date-value">{{ new Date(job.deadline).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <button @click="viewJobDetails(job)" class="btn-secondary">
              View Details
            </button>
            
            <button 
              @click="applyToJob(job)" 
              :class="['btn-primary', { applied: job.applied }]"
              :disabled="job.applied || job.status === 'closed'"
            >
              {{ job.applied ? '✅ Applied' : 'Apply Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container - same as ApplicationForm */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

/* Jobs Grid */
.jobs-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.job-card {
  background: #ffffff;
  border: 1px solid rgba(0, 77, 197, 0.15);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
  display: flex;
  flex-direction: column;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 77, 197, 0.15);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.status-and-type {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.status-expiring {
  background-color: #fef3c7;
  color: #92400e;
}

.status-closed {
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

.save-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 4px;
}

.save-btn:hover {
  transform: scale(1.1);
}

.save-btn.saved {
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Card Body */
.card-body {
  flex: 1;
  margin-bottom: 20px;
}

.job-title {
  color: #003a9b;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
}

.company-name {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.job-location {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.job-salary {
  color: #059669;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.job-description {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* Skills Section */
.skills-section {
  margin-bottom: 16px;
}

.skills-section h4 {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

/* Job Dates */
.job-dates {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

.date-item {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.date-label {
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 2px;
}

.date-value {
  color: #374151;
  font-weight: 600;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 12px;
  justify-content: stretch;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

.card-actions button {
  flex: 1;
}

/* Buttons - same style as ApplicationForm */
.btn-primary {
  background-color: #004dc5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #003a9b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.3);
}

.btn-primary:disabled, .btn-primary.applied {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-primary.applied {
  background-color: #059669;
}

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 2px solid rgba(0, 77, 197, 0.3);
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
  color: #004dc5;
  transform: translateY(-1px);
}

/* Title styling - same as ApplicationForm */
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

h2 {
  color: #003a9b;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid #004dc5;
  padding-bottom: 8px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .jobs-grid {
    grid-template-columns: 1fr;
  }
  
  .section-container {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .job-card {
    padding: 20px;
  }
  
  .job-dates {
    flex-direction: column;
    gap: 8px;
  }
  
  .date-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>