<!--
🚀 IT Youth Talent Incubator - Job Approval Modal

PURPOSE: Modal for admins to approve or reject company job postings

WHAT IT DOES:
- Shows job details submitted by companies
- Allows admin to approve or reject jobs
- Provides feedback textarea for rejections
- Updates job status and notifies company
-->
<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'approve', 'reject'])

// State
const isLoading = ref(false)
const rejectionReason = ref('')
const showRejectForm = ref(false)

// Computed
const formattedSalary = computed(() => {
  if (!props.job.salary || (!props.job.salary.min && !props.job.salary.max)) {
    return 'Not specified'
  }
  
  const currency = props.job.salary.currency || 'GH₵'
  const min = props.job.salary.min
  const max = props.job.salary.max
  
  if (min && max) {
    return `${currency} ${min.toLocaleString()} - ${currency} ${max.toLocaleString()}`
  } else if (min) {
    return `From ${currency} ${min.toLocaleString()}`
  } else if (max) {
    return `Up to ${currency} ${max.toLocaleString()}`
  }
  
  return 'Not specified'
})

const formattedDate = computed(() => {
  return new Date(props.job.submittedAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Methods
const handleApprove = async () => {
  isLoading.value = true
  
  try {
    // TODO: API call to approve job
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('approve', props.job.id)
    emit('close')
  } catch (error) {
    console.error('Failed to approve job:', error)
  } finally {
    isLoading.value = false
  }
}

const handleReject = async () => {
  if (!rejectionReason.value.trim()) {
    return
  }
  
  isLoading.value = true
  
  try {
    // TODO: API call to reject job with reason
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('reject', {
      jobId: props.job.id,
      reason: rejectionReason.value.trim()
    })
    emit('close')
  } catch (error) {
    console.error('Failed to reject job:', error)
  } finally {
    isLoading.value = false
  }
}

const showRejectDialog = () => {
  showRejectForm.value = true
}

const cancelReject = () => {
  showRejectForm.value = false
  rejectionReason.value = ''
}

const handleClose = () => {
  showRejectForm.value = false
  rejectionReason.value = ''
  emit('close')
}
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Review Job Posting</h2>
        <button @click="handleClose" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <!-- Company Information -->
        <div class="section">
          <h3>Company Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Company Name:</label>
              <span>{{ job.company?.name || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <label>Company Email:</label>
              <span>{{ job.company?.email || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <label>Website:</label>
              <span v-if="job.company?.website">
                <a :href="job.company.website" target="_blank" class="link">
                  {{ job.company.website }}
                </a>
              </span>
              <span v-else>Not provided</span>
            </div>
            <div class="info-item">
              <label>Contact Person:</label>
              <span>{{ job.company?.contactPerson || 'Not specified' }}</span>
            </div>
          </div>
        </div>

        <!-- Job Information -->
        <div class="section">
          <h3>Job Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Job Title:</label>
              <span>{{ job.title }}</span>
            </div>
            <div class="info-item">
              <label>Location:</label>
              <span>{{ job.location }}</span>
            </div>
            <div class="info-item">
              <label>Job Type:</label>
              <span class="job-type">{{ job.type }}</span>
            </div>
            <div class="info-item">
              <label>Experience Level:</label>
              <span>{{ job.experienceLevel }}</span>
            </div>
            <div class="info-item">
              <label>Remote Work:</label>
              <span>{{ job.isRemote ? 'Yes' : 'No' }}</span>
            </div>
            <div class="info-item">
              <label>Salary:</label>
              <span>{{ formattedSalary }}</span>
            </div>
          </div>
        </div>

        <!-- Job Description -->
        <div class="section">
          <h3>Job Description</h3>
          <div class="description-content">
            {{ job.description }}
          </div>
        </div>

        <!-- Required Skills -->
        <div class="section" v-if="job.requiredSkills && job.requiredSkills.length > 0">
          <h3>Required Skills</h3>
          <div class="skills-list">
            <span 
              v-for="skill in job.requiredSkills" 
              :key="skill" 
              class="skill-tag"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Requirements -->
        <div class="section" v-if="job.requirements && job.requirements.length > 0">
          <h3>Job Requirements</h3>
          <ul class="requirements-list">
            <li v-for="(requirement, index) in job.requirements" :key="index">
              {{ requirement }}
            </li>
          </ul>
        </div>

        <!-- Responsibilities -->
        <div class="section" v-if="job.responsibilities && job.responsibilities.length > 0">
          <h3>Key Responsibilities</h3>
          <ul class="responsibilities-list">
            <li v-for="(responsibility, index) in job.responsibilities" :key="index">
              {{ responsibility }}
            </li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div class="section">
          <h3>Application Contact</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Contact Email:</label>
              <span>{{ job.contact?.email || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <label>Contact Phone:</label>
              <span>{{ job.contact?.phone || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Application Deadline:</label>
              <span>{{ job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB') : 'Not specified' }}</span>
            </div>
          </div>
        </div>

        <!-- Submission Info -->
        <div class="section">
          <h3>Submission Information</h3>
          <div class="info-item">
            <label>Submitted:</label>
            <span>{{ formattedDate }}</span>
          </div>
        </div>

        <!-- Rejection Form -->
        <div v-if="showRejectForm" class="section reject-section">
          <h3>Rejection Feedback</h3>
          <textarea
            v-model="rejectionReason"
            class="rejection-textarea"
            placeholder="Provide feedback to the company about why this job posting was rejected and what they can do to improve it..."
            rows="4"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <!-- Normal Actions -->
        <div v-if="!showRejectForm" class="action-buttons">
          <button @click="handleClose" class="btn-secondary">
            Cancel
          </button>
          <button @click="showRejectDialog" class="btn-danger">
            Reject Job
          </button>
          <button @click="handleApprove" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            {{ isLoading ? 'Approving...' : 'Approve Job' }}
          </button>
        </div>

        <!-- Rejection Actions -->
        <div v-else class="action-buttons">
          <button @click="cancelReject" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="handleReject" 
            class="btn-danger"
            :disabled="isLoading || !rejectionReason.trim()"
          >
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            {{ isLoading ? 'Rejecting...' : 'Confirm Rejection' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #161B22;
  border-radius: 12px;
  border: 1px solid #30363D;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
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

.modal-header h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #8fb2d6;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(143, 178, 214, 0.1);
  color: white;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  color: #1b65b2;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 2px solid #1b65b2;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  color: #8fb2d6;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-item span {
  color: white;
  font-size: 1rem;
}

.link {
  color: #1b65b2;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link:hover {
  color: #195aa5;
  text-decoration: underline;
}

.job-type {
  text-transform: capitalize;
}

.description-content {
  color: white;
  font-size: 1rem;
  line-height: 1.6;
  background: #21262D;
  padding: 1rem;
  border-radius: 6px;
  white-space: pre-wrap;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background-color: rgba(27, 101, 178, 0.1);
  color: #1b65b2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(27, 101, 178, 0.2);
}

.requirements-list,
.responsibilities-list {
  color: white;
  padding-left: 1.5rem;
  margin: 0;
}

.requirements-list li,
.responsibilities-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.reject-section {
  background: rgba(255, 69, 58, 0.05);
  border: 1px solid rgba(255, 69, 58, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.reject-section h3 {
  color: #FF453A;
  border-bottom-color: #FF453A;
}

.rejection-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 69, 58, 0.3);
  border-radius: 6px;
  background-color: #21262D;
  color: white;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
}

.rejection-textarea:focus {
  outline: none;
  border-color: #FF453A;
  box-shadow: 0 0 0 2px rgba(255, 69, 58, 0.2);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #30363D;
  background: #0D1117;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary {
  background-color: #32D74B;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #28CD41;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(50, 215, 75, 0.3);
}

.btn-primary:disabled {
  background-color: #6B7280;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: transparent;
  color: #8fb2d6;
  border: 1px solid rgba(143, 178, 214, 0.3);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(143, 178, 214, 0.1);
  border-color: rgba(143, 178, 214, 0.5);
  color: white;
}

.btn-danger {
  background-color: #FF453A;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover:not(:disabled) {
  background-color: #D70015;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 69, 58, 0.3);
}

.btn-danger:disabled {
  background-color: #6B7280;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>