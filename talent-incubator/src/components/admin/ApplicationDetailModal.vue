<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-status', 'close'])

const isUpdating = ref(false)
const newStatus = ref(props.application.status)
const adminNotes = ref(props.application.notes || '')
const rating = ref(props.application.rating || 0)

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'reviewing', label: 'Under Review', color: 'info' },
  { value: 'interview', label: 'Interview', color: 'primary' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'danger' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'secondary' }
]

const getStatusColor = (status) => {
  const statusOption = statusOptions.find(opt => opt.value === status)
  return statusOption ? statusOption.color : 'secondary'
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleUpdateStatus = async () => {
  isUpdating.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('update-status', props.application.id, newStatus.value, adminNotes.value)
    emit('close')
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isUpdating.value = false
  }
}

const handleDownloadResume = () => {
  console.log('Downloading resume:', props.application.resumeUrl)
  window.open(props.application.resumeUrl, '_blank')
}

const handleViewPortfolio = () => {
  if (props.application.portfolioUrl) {
    window.open(props.application.portfolioUrl, '_blank')
  }
}

const setRating = (newRating) => {
  rating.value = newRating
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
          <h2 class="modal-title">Application Details</h2>
          <div class="application-meta">
            <span :class="['status-badge', getStatusColor(application.status)]">
              {{ application.status }}
            </span>
            <span class="application-id">ID: {{ application.id }}</span>
          </div>
        </div>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <div class="content-grid">
          <!-- Applicant Information -->
          <div class="info-section">
            <h3 class="section-title">Applicant Information</h3>
            <div class="info-card">
              <div class="info-item">
                <label class="info-label">Full Name</label>
                <span class="info-value">{{ application.applicantName }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Email</label>
                <span class="info-value">{{ application.applicantEmail }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Phone</label>
                <span class="info-value">{{ application.applicantPhone }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Education</label>
                <span class="info-value">{{ application.education }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Experience</label>
                <span class="info-value">{{ application.experience }}</span>
              </div>
            </div>
          </div>

          <!-- Job Information -->
          <div class="info-section">
            <h3 class="section-title">Job Information</h3>
            <div class="info-card">
              <div class="info-item">
                <label class="info-label">Position</label>
                <span class="info-value">{{ application.jobTitle }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Company</label>
                <span class="info-value">{{ application.company }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Applied Date</label>
                <span class="info-value">{{ formatDateTime(application.appliedDate) }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">Last Updated</label>
                <span class="info-value">{{ formatDateTime(application.updatedAt) }}</span>
              </div>
              <div v-if="application.interviewDate" class="info-item">
                <label class="info-label">Interview Date</label>
                <span class="info-value interview-date">{{ formatDateTime(application.interviewDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Cover Letter -->
          <div class="info-section full-width">
            <h3 class="section-title">Cover Letter</h3>
            <div class="info-card">
              <div class="cover-letter">
                {{ application.coverLetter }}
              </div>
            </div>
          </div>

          <!-- Documents & Portfolio -->
          <div class="info-section">
            <h3 class="section-title">Documents & Portfolio</h3>
            <div class="info-card">
              <div class="document-actions">
                <button
                  v-if="application.resumeUrl"
                  @click="handleDownloadResume"
                  class="btn-secondary"
                >
                  Download Resume
                </button>
                <button
                  v-if="application.portfolioUrl"
                  @click="handleViewPortfolio"
                  class="btn-secondary"
                >
                  View Portfolio
                </button>
              </div>
              <div v-if="!application.resumeUrl && !application.portfolioUrl" class="no-documents">
                No documents uploaded
              </div>
            </div>
          </div>

          <!-- Rating -->
          <div class="info-section">
            <h3 class="section-title">Rating</h3>
            <div class="info-card">
              <div class="rating-section">
                <div class="stars">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="setRating(star)"
                    :class="['star-btn', { 'filled': star <= rating }]"
                  >
                    ★
                  </button>
                </div>
                <span class="rating-text">{{ rating }}/5</span>
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
                    rows="4"
                    placeholder="Add notes about this application, interview feedback, or next steps..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Notes -->
          <div v-if="application.notes" class="info-section full-width">
            <h3 class="section-title">Previous Notes</h3>
            <div class="info-card">
              <div class="current-notes">
                {{ application.notes }}
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
            {{ isUpdating ? 'Updating...' : 'Update Application' }}
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

.application-meta {
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

.status-badge.info {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.status-badge.primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.status-badge.danger {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.status-badge.secondary {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.application-id {
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

.interview-date {
  color: #FF9F0A;
  font-weight: 600;
}

.cover-letter {
  color: #F0F6FC;
  line-height: 1.6;
  font-size: 0.875rem;
  white-space: pre-wrap;
}

.document-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.no-documents {
  color: #8B949E;
  font-style: italic;
  font-size: 0.875rem;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #30363D;
  cursor: pointer;
  transition: color 150ms ease;
  padding: 0;
}

.star-btn:hover {
  color: #FF9F0A;
}

.star-btn.filled {
  color: #FF9F0A;
}

.rating-text {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 500;
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
  min-height: 6rem;
  font-family: inherit;
}

.current-notes {
  color: #F0F6FC;
  line-height: 1.6;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #007AFF;
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

  .document-actions {
    flex-direction: column;
  }

  .footer-actions {
    flex-direction: column;
  }

  .footer-actions button {
    width: 100%;
  }

  .application-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>