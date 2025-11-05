<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">{{ isEditMode ? 'Edit Lesson' : 'Add New Lesson' }}</h2>
          <button @click="closeModal" class="quick-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Close
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Form Content -->
        <div class="quick-actions-section">
          <!-- Basic Information -->
          <div class="form-grid">
            <div class="form-group">
              <label for="title" class="form-label">Lesson Title</label>
              <input 
                id="title"
                v-model="form.title" 
                type="text" 
                class="quick-action-btn form-input"
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div class="form-group">
              <label for="lessonDate" class="form-label">Lesson Date</label>
              <input 
                id="lessonDate"
                v-model="form.lessonDate" 
                type="date" 
                class="quick-action-btn form-input"
                required
              />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="duration" class="form-label">Duration (minutes)</label>
              <input 
                id="duration"
                v-model.number="form.duration" 
                type="number" 
                class="quick-action-btn form-input"
                placeholder="e.g. 45"
                min="1"
                required
              />
            </div>

            <div class="form-group">
              <label for="lessonType" class="form-label">Lesson Type</label>
              <select 
                id="lessonType"
                v-model="form.lessonType" 
                class="quick-action-btn form-select"
                required
              >
                <option value="">Select lesson type</option>
                <option value="content">Course Content/Slides</option>
                <option value="assignment">Assignment with Deadline</option>
                <option value="quiz">Quiz with Deadline</option>
              </select>
            </div>
          </div>

          <!-- Deadline (only shown for assignments and quizzes) -->
          <div class="form-group" v-if="form.lessonType === 'assignment' || form.lessonType === 'quiz'">
            <label for="deadline" class="form-label">
              {{ form.lessonType === 'assignment' ? 'Assignment Deadline' : 'Quiz Deadline' }}
            </label>
            <input 
              id="deadline"
              v-model="form.deadline" 
              type="datetime-local" 
              class="quick-action-btn form-input"
              :min="form.lessonDate + 'T00:00'"
              required
            />
            <div class="form-hint-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Students will see this deadline and receive notifications</span>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea 
              id="description"
              v-model="form.description" 
              class="quick-action-btn form-textarea"
              placeholder="Describe what students will learn"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="contentType" class="form-label">Content Type</label>
            <select 
              id="contentType"
              v-model="form.contentType" 
              class="quick-action-btn form-select"
              required
            >
              <option value="">Select content type</option>
              <option value="video">Video</option>
              <option value="pdf">PDF Document</option>
              <option value="url">External URL</option>
              <option value="interactive">Interactive Content</option>
            </select>
          </div>
        </div>

        <!-- Content Upload Section -->
        <div class="quick-actions-section" v-if="form.contentType">

          <div class="section-header">
            <h3 class="section-title">{{ getContentLabel() }}</h3>
          </div>
          
          <!-- File Upload for PDF/Video -->
          <div v-if="form.contentType === 'pdf' || form.contentType === 'video'" class="upload-section">
            <input 
              ref="fileInput"
              type="file" 
              :accept="getFileAccept()"
              @change="handleFileUpload"
              class="file-input"
              id="fileUpload"
            />
            <label for="fileUpload" class="upload-area">
              <div class="upload-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <div class="upload-text">
                  <span v-if="!form.file" class="upload-title">
                    Click to upload {{ form.contentType }} or drag and drop
                  </span>
                  <span v-else class="file-selected">
                    {{ form.file.name }}
                  </span>
                </div>
              </div>
            </label>
          </div>

          <!-- URL Input -->
          <div v-else-if="form.contentType === 'url'" class="url-section">
            <input 
              v-model="form.url" 
              type="url" 
              class="quick-action-btn form-input"
              placeholder="https://example.com/lesson-content"
              required
            />
            <div class="form-hint-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Students will be redirected to this URL when accessing the lesson</span>
            </div>
          </div>

          <!-- Interactive Content -->
          <div v-else-if="form.contentType === 'interactive'" class="content-section">
            <textarea 
              v-model="form.content" 
              class="quick-action-btn form-textarea"
              placeholder="Describe the interactive content or paste embed code"
              rows="6"
            ></textarea>
          </div>

          <!-- Quiz/Assignment -->
          <div v-else-if="form.contentType === 'quiz' || form.contentType === 'assignment'" class="content-section">
            <textarea 
              v-model="form.content" 
              class="quick-action-btn form-textarea"
              :placeholder="`Enter ${form.contentType} instructions`"
              rows="6"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="quick-actions-section">
          <!-- Redirect Warning -->
          <div v-if="form.contentType === 'url'" class="warning-section">
            <div class="warning-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Students will be notified before being redirected to external content</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="quick-action-btn">
              Cancel
            </button>
            <button type="submit" :disabled="!isFormValid" class="quick-action-btn primary" :class="{ disabled: !isFormValid }">
              {{ isEditMode ? 'Update Lesson' : 'Add Lesson' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddLessonModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    lessonToEdit: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'add-lesson', 'update-lesson'],
  data() {
    return {
      form: {
        title: '',
        description: '',
        contentType: '',
        duration: null,
        file: null,
        url: '',
        content: '',
        lessonDate: '',
        lessonType: '',
        deadline: ''
      }
    }
  },
  watch: {
    lessonToEdit: {
      immediate: true,
      handler(newLesson) {
        if (newLesson && this.isEditMode) {
          this.loadLessonData(newLesson)
        }
      }
    },
    isEditMode: {
      immediate: true,
      handler(newValue) {
        if (!newValue) {
          this.resetForm()
        }
      }
    }
  },
  computed: {
    isFormValid() {
      const baseValid = this.form.title && this.form.description && this.form.contentType && 
                       this.form.duration && this.form.lessonDate && this.form.lessonType

      if (this.form.contentType === 'pdf' || this.form.contentType === 'video') {
        return baseValid && this.form.file
      } else if (this.form.contentType === 'url') {
        return baseValid && this.form.url
      } else if (this.form.contentType === 'interactive') {
        return baseValid && this.form.content
      }

      // Additional validation for assignment and quiz deadlines
      if (this.form.lessonType === 'assignment' || this.form.lessonType === 'quiz') {
        return baseValid && this.form.deadline
      }

      return baseValid
    }
  },
  methods: {
    closeModal() {
      this.resetForm()
      this.$emit('close')
    },
    
    resetForm() {
      this.form = {
        title: '',
        description: '',
        contentType: '',
        duration: null,
        file: null,
        url: '',
        content: '',
        lessonDate: '',
        lessonType: '',
        deadline: ''
      }
    },

    getContentLabel() {
      const labels = {
        video: 'Upload Video File',
        pdf: 'Upload PDF Document', 
        url: 'External URL',
        interactive: 'Interactive Content',
        quiz: 'Quiz Content',
        assignment: 'Assignment Instructions'
      }
      return labels[this.form.contentType] || 'Content'
    },

    getFileAccept() {
      if (this.form.contentType === 'pdf') return '.pdf'
      if (this.form.contentType === 'video') return '.mp4,.avi,.mov,.wmv,.webm'
      return '*'
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.form.file = file
      }
    },

    async handleSubmit() {
      if (!this.isFormValid) return

      const lessonData = {
        id: Date.now(), // Simple ID generation
        title: this.form.title,
        description: this.form.description,
        type: this.form.contentType,
        duration: this.form.duration,
        file: this.form.file,
        url: this.form.url,
        content: this.form.content,
        lessonDate: this.form.lessonDate,
        lessonType: this.form.lessonType,
        deadline: (this.form.lessonType === 'assignment' || this.form.lessonType === 'quiz') ? this.form.deadline : null,
        createdAt: new Date().toISOString()
      }

      // Simulate upload/save process
      console.log('Creating lesson:', lessonData)
      
      // Emit the lesson data
      if (this.isEditMode) {
        lessonData.id = this.lessonToEdit.id
        this.$emit('update-lesson', lessonData)
      } else {
        this.$emit('add-lesson', lessonData)
      }
      
      // Show success message and close
      this.showSuccessMessage()
      this.closeModal()
    },

    loadLessonData(lesson) {
      this.form = {
        title: lesson.title || '',
        description: lesson.description || '',
        contentType: lesson.type?.toLowerCase() || '',
        duration: lesson.duration || null,
        file: lesson.file || null,
        url: lesson.url || '',
        content: lesson.content || '',
        lessonDate: lesson.lessonDate || '',
        lessonType: lesson.lessonType || 'content',
        deadline: lesson.deadline || ''
      }
    },
    showSuccessMessage() {
      // Simple success feedback
      console.log(this.isEditMode ? 'Lesson updated successfully!' : 'Lesson created successfully!')
    }
  }
}
</script>

<style scoped>
/* Modal specific styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
}

/* Page design styles */
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--interactive-primary);
  transform: translateY(-1px);
}

.quick-action-btn.primary {
  background: var(--interactive-primary);
  color: white;
  border-color: var(--interactive-primary);
}

.quick-action-btn.primary:hover:not(.disabled) {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.quick-action-btn.disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.upload-section,
.url-section,
.content-section {
  margin-top: 1rem;
}

.upload-area {
  display: block;
  border: 2px dashed var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: var(--interactive-primary);
  background: var(--interactive-secondary);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
  text-align: center;
  gap: 0.5rem;
}

.upload-title {
  font-weight: 500;
}

.file-selected {
  color: var(--interactive-primary);
  font-weight: 500;
}

.form-hint-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.warning-section {
  margin-bottom: 1rem;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  background: var(--bg-primary) !important;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
  border-radius: 12px 12px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.upload-area {
  border: 2px dashed var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--interactive-primary);
  background: var(--interactive-secondary);
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: pointer;
  color: var(--text-secondary);
  text-align: center;
  gap: 0.5rem;
}

.file-selected {
  color: var(--interactive-primary);
  font-weight: 500;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #f59e0b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-cancel:hover {
  background: var(--bg-tertiary);
}

.btn-submit {
  background: var(--interactive-primary);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>