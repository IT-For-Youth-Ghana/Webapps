<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  student: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-status', 'close'])

const isUpdating = ref(false)
const newStatus = ref(props.student.status)
const adminNotes = ref('')

const statusOptions = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'job_seeking', label: 'Job Seeking', color: 'warning' },
  { value: 'employed', label: 'Employed', color: 'primary' },
  { value: 'inactive', label: 'Inactive', color: 'secondary' }
]

const getStatusColor = (status) => {
  const statusOption = statusOptions.find(opt => opt.value === status)
  return statusOption ? statusOption.color : 'secondary'
}

const getProfileScoreColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleUpdateStatus = async () => {
  isUpdating.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('update-status', props.student.id, newStatus.value)
    emit('close')
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isUpdating.value = false
  }
}

const handleViewPortfolio = () => {
  if (props.student.portfolioUrl) {
    window.open(props.student.portfolioUrl, '_blank')
  }
}

const handleViewLinkedIn = () => {
  if (props.student.linkedinUrl) {
    window.open(props.student.linkedinUrl, '_blank')
  }
}

const handleViewGitHub = () => {
  if (props.student.githubUrl) {
    window.open(props.student.githubUrl, '_blank')
  }
}

const handleSendEmail = () => {
  window.location.href = `mailto:${props.student.email}`
}

const handleCallPhone = () => {
  window.location.href = `tel:${props.student.phone}`
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">{{ student.name }}</h2>
          <div class="student-meta">
            <span :class="['status-badge', getStatusColor(student.status)]">
              {{ statusOptions.find(s => s.value === student.status)?.label || student.status }}
            </span>
            <span class="student-id">ID: {{ student.id }}</span>
          </div>
        </div>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <div class="content-grid">
          <!-- Personal Information -->
          <div class="info-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="info-card">
              <div class="info-item">
                <label class="info-label">Full Name</label>
                <span class="info-value">{{ student.name }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Email</label>
                <span class="info-value">
                  <a @click="handleSendEmail" class="contact-link">{{ student.email }}</a>
                </span>
              </div>
              <div class="info-item">
                <label class="info-label">Phone</label>
                <span class="info-value">
                  <a @click="handleCallPhone" class="contact-link">{{ student.phone }}</a>
                </span>
              </div>
              <div class="info-item">
                <label class="info-label">Location</label>
                <span class="info-value">{{ student.location }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Joined Date</label>
                <span class="info-value">{{ formatDate(student.joinedDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Education & Experience -->
          <div class="info-section">
            <h3 class="section-title">Education & Experience</h3>
            <div class="info-card">
              <div class="info-item">
                <label class="info-label">Education</label>
                <span class="info-value">{{ student.education }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Experience</label>
                <span class="info-value">{{ student.experience }}</span>
              </div>
              <div v-if="student.currentEmployer" class="info-item">
                <label class="info-label">Current Employer</label>
                <span class="info-value">{{ student.currentEmployer }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Work Preference</label>
                <span class="info-value">{{ student.workPreference }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Preferred Salary</label>
                <span class="info-value">{{ student.preferredSalary }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Availability</label>
                <span class="info-value">{{ student.availability }}</span>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="info-section full-width">
            <h3 class="section-title">Skills & Expertise</h3>
            <div class="info-card">
              <div class="skills-grid">
                <span
                  v-for="skill in student.skills"
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div v-if="student.bio" class="info-section full-width">
            <h3 class="section-title">Biography</h3>
            <div class="info-card">
              <div class="bio-text">
                {{ student.bio }}
              </div>
            </div>
          </div>

          <!-- Profile Completeness -->
          <div class="info-section">
            <h3 class="section-title">Profile Status</h3>
            <div class="info-card">
              <div class="profile-progress">
                <div class="progress-header">
                  <span class="progress-label">Profile Completeness</span>
                  <span :class="['progress-value', getProfileScoreColor(student.profileCompleteness)]">
                    {{ student.profileCompleteness }}%
                  </span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :class="getProfileScoreColor(student.profileCompleteness)"
                    :style="{ width: `${student.profileCompleteness}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="activity-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ student.applicationCount }}</span>
                  <span class="stat-label">Applications Submitted</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ student.interviewCount }}</span>
                  <span class="stat-label">Interviews Attended</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Links & Portfolio -->
          <div class="info-section">
            <h3 class="section-title">Links & Portfolio</h3>
            <div class="info-card">
              <div class="links-section">
                <button
                  v-if="student.portfolioUrl"
                  @click="handleViewPortfolio"
                  class="link-btn portfolio"
                >
                  View Portfolio
                </button>
                <button
                  v-if="student.linkedinUrl"
                  @click="handleViewLinkedIn"
                  class="link-btn linkedin"
                >
                  LinkedIn Profile
                </button>
                <button
                  v-if="student.githubUrl"
                  @click="handleViewGitHub"
                  class="link-btn github"
                >
                  GitHub Profile
                </button>
              </div>
              <div v-if="!student.portfolioUrl && !student.linkedinUrl && !student.githubUrl" class="no-links">
                No portfolio or social links provided
              </div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div class="info-section full-width">
            <h3 class="section-title">Admin Actions</h3>
            <div class="info-card">
              <div class="admin-form">
                <div class="form-group">
                  <label for="status" class="form-label">Update Status</label>
                  <select
                    id="status"
                    v-model="newStatus"
                    class="form-select"
                  >
                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="notes" class="form-label">Admin Notes</label>
                  <textarea
                    id="notes"
                    v-model="adminNotes"
                    class="form-textarea"
                    rows="3"
                    placeholder="Add notes about this student's progress, feedback, or recommendations..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button @click="closeModal" class="btn-secondary">
            Close
          </button>
          <button
            @click="handleUpdateStatus"
            :disabled="isUpdating"
            class="btn-primary"
          >
            <span v-if="isUpdating" class="loading-spinner"></span>
            {{ isUpdating ? 'Updating...' : 'Update Student' }}
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
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  width: 100%;
  max-width: 64rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #30363D;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #F0F6FC;
  margin: 0 0 0.5rem 0;
}

.student-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.status-badge.warning {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.status-badge.primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.status-badge.secondary {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.student-id {
  font-size: 0.875rem;
  color: #8B949E;
}

.close-btn {
  background: none;
  border: none;
  color: #8B949E;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 150ms ease;
}

.close-btn:hover {
  color: #F0F6FC;
}

.modal-body {
  padding: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 1rem 0;
}

.info-card {
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 500;
  min-width: 6rem;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.875rem;
  color: #F0F6FC;
  text-align: right;
  word-break: break-word;
}

.contact-link {
  color: #007AFF;
  cursor: pointer;
  text-decoration: none;
  transition: color 150ms ease;
}

.contact-link:hover {
  color: #0056CC;
  text-decoration: underline;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.bio-text {
  color: #F0F6FC;
  line-height: 1.6;
  font-size: 0.875rem;
}

.profile-progress {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #8B949E;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-value.success { color: #32D74B; }
.progress-value.warning { color: #FF9F0A; }
.progress-value.danger { color: #FF453A; }

.progress-bar {
  height: 0.5rem;
  background: #30363D;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 300ms ease;
}

.progress-fill.success { background: #32D74B; }
.progress-fill.warning { background: #FF9F0A; }
.progress-fill.danger { background: #FF453A; }

.activity-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #F0F6FC;
}

.stat-label {
  font-size: 0.75rem;
  color: #8B949E;
  text-align: center;
}

.links-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}

.link-btn.portfolio {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.link-btn.portfolio:hover {
  background: rgba(191, 90, 242, 0.2);
}

.link-btn.linkedin {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.link-btn.linkedin:hover {
  background: rgba(0, 122, 255, 0.2);
}

.link-btn.github {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.link-btn.github:hover {
  background: rgba(139, 148, 158, 0.2);
}

.no-links {
  color: #8B949E;
  font-style: italic;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F0F6FC;
}

.form-select,
.form-textarea {
  padding: 0.75rem;
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  transition: all 250ms ease;
  resize: vertical;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-textarea {
  min-height: 5rem;
  font-family: inherit;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #30363D;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info-label {
    min-width: auto;
  }

  .info-value {
    text-align: left;
  }

  .footer-actions {
    flex-direction: column;
  }

  .footer-actions button {
    width: 100%;
  }

  .student-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .activity-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>