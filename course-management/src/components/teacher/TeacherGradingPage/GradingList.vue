<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Submissions</h2>
      <div class="actions">
        <button class="quick-action-btn" @click="$emit('bulk-grade')">
          <!-- Bulk Grade Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Bulk Grade
        </button>
      </div>
    </div>

    <div class="submissions-list">
      <div 
        v-for="submission in submissions"
        :key="submission.id"
        class="submission-card"
        :class="{ 
          'overdue': isOverdue(submission.dueDate),
          'graded': submission.status === 'graded'
        }"
      >
        <div class="submission-header">
          <div class="student-info">
            <div class="student-avatar">
              <div class="avatar-placeholder">{{ getInitials(submission.student.name) }}</div>
            </div>
            <div class="student-details">
              <h3 class="student-name">{{ submission.student.name }}</h3>
              <p class="student-email">{{ submission.student.email }}</p>
            </div>
          </div>
          
          <div class="submission-meta">
            <div class="assignment-title">{{ submission.assignmentTitle }}</div>
            <div class="submission-date">
              Submitted: {{ formatDate(submission.submittedAt) }}
            </div>
            <div class="status-badge" :class="submission.status">
              {{ formatStatus(submission.status) }}
            </div>
          </div>
        </div>
        
        <div class="submission-content">
          <!-- Assignment Type Indicator -->
          <div class="assignment-type" :class="submission.type">
            <!-- File Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="type-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <span class="type-label">{{ submission.type.toUpperCase() }}</span>
          </div>
          
          <!-- Text Submission -->
          <div v-if="submission.textContent" class="text-submission">
            <h4>Answer:</h4>
            <div class="submission-text">{{ submission.textContent }}</div>
          </div>
          
          <!-- File Attachments -->
          <div v-if="submission.files && submission.files.length > 0" class="file-attachments">
            <h4>Attachments:</h4>
            <div class="files-list">
              <div 
                v-for="file in submission.files"
                :key="file.id"
                class="file-item"
                @click="$emit('download-file', file)"
              >
                <!-- File Icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="file-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Previous Feedback -->
          <div v-if="submission.feedback" class="previous-feedback">
            <h4>Previous Feedback:</h4>
            <div class="feedback-content">{{ submission.feedback }}</div>
          </div>
        </div>
        
        <!-- Grading Section -->
        <div class="grading-section">
          <div class="grade-input-group">
            <label class="grade-label">Grade:</label>
            <input 
              :value="submission.tempGrade"
              @input="$emit('update-grade', submission.id, $event.target.value)"
              type="number" 
              class="grade-input"
              :placeholder="`0-${submission.maxPoints}`"
              :min="0"
              :max="submission.maxPoints"
            />
            <span class="grade-max">/ {{ submission.maxPoints }}</span>
          </div>
          
          <div class="feedback-input-group">
            <label class="feedback-label">Feedback:</label>
            <textarea 
              :value="submission.tempFeedback"
              @input="$emit('update-feedback', submission.id, $event.target.value)"
              class="feedback-textarea"
              placeholder="Provide detailed feedback to help the student improve..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="submission-actions">
          <button 
            class="quick-action-btn"
            @click="$emit('save-draft', submission)"
          >
            Save Draft
          </button>
          <button 
            class="quick-action-btn"
            @click="$emit('return-revision', submission)"
          >
            Return for Revision
          </button>
          <button 
            class="quick-action-btn primary"
            @click="$emit('submit-grade', submission)"
            :disabled="!isGradingValid(submission)"
          >
            Submit Grade
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="submissions.length === 0" class="empty-state">
      <div class="empty-icon">
        <!-- Clipboard Icon -->
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      </div>
      <h3>No submissions to grade</h3>
      <p>All submissions have been graded or there are no pending submissions</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradingList',
  props: {
    submissions: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'bulk-grade',
    'download-file',
    'update-grade',
    'update-feedback',
    'save-draft',
    'return-revision',
    'submit-grade'
  ],
  methods: {
    isOverdue(dueDate) {
      return new Date(dueDate) < new Date()
    },

    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },

    formatStatus(status) {
      const statusMap = {
        pending: 'Pending Review',
        graded: 'Graded',
        returned: 'Returned',
        late: 'Late Submission'
      }
      return statusMap[status] || status
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    isGradingValid(submission) {
      return submission.tempGrade !== null && 
             submission.tempGrade !== undefined && 
             submission.tempGrade >= 0 && 
             submission.tempGrade <= submission.maxPoints
    }
  }
}
</script>

<style scoped>
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.submission-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.submission-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submission-card.overdue {
  border-left: 4px solid var(--status-error-text);
}

.submission-card.graded {
  border-left: 4px solid var(--status-success-text);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.student-details {
  flex: 1;
}

.student-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.student-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.submission-meta {
  text-align: right;
}

.assignment-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.submission-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.status-badge.graded {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.status-badge.returned {
  background: var(--status-error-bg);
  color: var(--status-error-text);
}

.status-badge.late {
  background: var(--status-error-bg);
  color: var(--status-error-text);
}

.submission-content {
  margin-bottom: 1.5rem;
}

.assignment-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 1rem;
  width: fit-content;
}

.type-icon {
  color: var(--primary);
}

.type-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.text-submission {
  margin-bottom: 1rem;
}

.text-submission h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.submission-text {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.file-attachments {
  margin-bottom: 1rem;
}

.file-attachments h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: var(--primary-hover);
}

.file-icon {
  color: var(--primary);
}

.file-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.file-size {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.previous-feedback {
  margin-bottom: 1rem;
}

.previous-feedback h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.feedback-content {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.grading-section {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.grade-input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.grade-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 60px;
}

.grade-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.grade-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.grade-max {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.feedback-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feedback-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feedback-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.submission-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  margin: 0 auto 1.5rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .submission-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .submission-meta {
    text-align: left;
  }
  
  .grade-input-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .submission-actions {
    flex-direction: column;
  }
}
</style>