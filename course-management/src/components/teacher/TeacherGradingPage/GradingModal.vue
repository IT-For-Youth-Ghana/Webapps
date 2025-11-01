<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Bulk Grading</h2>
          <button class="quick-action-btn" @click="$emit('close')">
            <!-- Close Icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Close
          </button>
        </div>
        
        <div class="bulk-options">
          <div class="option-group">
            <label class="form-label">Select Assignment:</label>
            <select 
              :value="assignmentId" 
              @change="$emit('update:assignmentId', $event.target.value)" 
              class="filter-select"
            >
              <option value="">Choose assignment</option>
              <option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">
                {{ assignment.title }}
              </option>
            </select>
          </div>
          
          <div class="option-group">
            <label class="form-label">Grade to Apply:</label>
            <input 
              :value="grade"
              @input="$emit('update:grade', Number($event.target.value))"
              type="number" 
              class="grade-input"
              placeholder="Grade"
              min="0"
              :max="getMaxPoints(assignmentId)"
            />
            <span class="grade-max" v-if="assignmentId">/ {{ getMaxPoints(assignmentId) }}</span>
          </div>
          
          <div class="option-group">
            <label class="form-label">Bulk Feedback:</label>
            <textarea 
              :value="feedback"
              @input="$emit('update:feedback', $event.target.value)"
              class="feedback-textarea"
              placeholder="This feedback will be applied to all selected submissions"
              rows="4"
            ></textarea>
          </div>
          
          <div class="selected-submissions">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-number">{{ selectedSubmissions.length }}</span>
                <span class="stat-label">Selected</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ pendingCount }}</span>
                <span class="stat-label">Pending</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ gradedCount }}</span>
                <span class="stat-label">Already Graded</span>
              </div>
            </div>
          </div>

          <div class="submissions-preview">
            <h4>Selected Submissions:</h4>
            <div class="submissions-list">
              <div 
                v-for="submission in selectedSubmissions.slice(0, 5)"
                :key="submission.id"
                class="submission-item"
              >
                <div class="student-info">
                  <div class="student-avatar">
                    <div class="avatar-placeholder">{{ getInitials(submission.student.name) }}</div>
                  </div>
                  <div class="student-details">
                    <span class="student-name">{{ submission.student.name }}</span>
                    <span class="assignment-name">{{ submission.assignmentTitle }}</span>
                  </div>
                </div>
                <div class="current-status" :class="submission.status">
                  {{ formatStatus(submission.status) }}
                </div>
              </div>
              <div v-if="selectedSubmissions.length > 5" class="more-indicator">
                + {{ selectedSubmissions.length - 5 }} more submissions
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="quick-action-btn" @click="$emit('close')">
            Cancel
          </button>
          <button 
            class="quick-action-btn primary" 
            @click="handleApplyBulk"
            :disabled="!isValidBulkGrading"
          >
            Apply Bulk Grade
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradingModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    assignmentId: {
      type: String,
      default: ''
    },
    grade: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    selectedSubmissions: {
      type: Array,
      default: () => []
    },
    assignments: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'close',
    'update:assignmentId',
    'update:grade',
    'update:feedback',
    'apply-bulk'
  ],
  computed: {
    pendingCount() {
      return this.selectedSubmissions.filter(s => s.status === 'pending').length
    },

    gradedCount() {
      return this.selectedSubmissions.filter(s => s.status === 'graded').length
    },

    isValidBulkGrading() {
      return this.assignmentId && 
             this.grade !== null && 
             this.grade >= 0 && 
             this.selectedSubmissions.length > 0
    }
  },
  methods: {
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    },

    formatStatus(status) {
      const statusMap = {
        pending: 'Pending',
        graded: 'Graded',
        returned: 'Returned',
        late: 'Late'
      }
      return statusMap[status] || status
    },

    getMaxPoints(assignmentId) {
      const assignment = this.assignments.find(a => a.id === assignmentId)
      return assignment ? assignment.maxPoints : 100
    },

    handleApplyBulk() {
      if (this.isValidBulkGrading) {
        this.$emit('apply-bulk', {
          assignmentId: this.assignmentId,
          grade: this.grade,
          feedback: this.feedback,
          submissions: this.selectedSubmissions
        })
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
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

.bulk-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.grade-input {
  width: 120px;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.grade-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.grade-max {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-left: 0.5rem;
}

.feedback-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.selected-submissions {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.submissions-preview h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.submission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.student-avatar {
  width: 32px;
  height: 32px;
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
  font-size: 0.75rem;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.assignment-name {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.current-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.current-status.pending {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.current-status.graded {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.current-status.returned {
  background: var(--status-error-bg);
  color: var(--status-error-text);
}

.more-indicator {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  padding: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .submission-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .current-status {
    align-self: flex-end;
  }
}
</style>