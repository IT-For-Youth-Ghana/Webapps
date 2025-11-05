<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Edit Lesson</h2>
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
        </div>

        <!-- Content Upload Section -->
        <div class="quick-actions-section" v-if="form.contentType">
          <div class="section-header">
            <h3 class="section-title">{{ getContentLabel() }}</h3>
          </div>
          
          <!-- URL Input -->
          <div v-if="form.contentType === 'url'" class="url-section">
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
              Update Lesson
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditLessonModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    lesson: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'update-lesson'],
  data() {
    return {
      form: {
        title: '',
        description: '',
        contentType: '',
        duration: null,
        url: '',
        content: '',
        lessonDate: ''
      }
    }
  },
  watch: {
    lesson: {
      immediate: true,
      handler(newLesson) {
        if (newLesson) {
          this.form = {
            title: newLesson.title || '',
            description: newLesson.description || '',
            contentType: newLesson.type?.toLowerCase() || '',
            duration: newLesson.duration || null,
            url: newLesson.url || '',
            content: newLesson.content || '',
            lessonDate: newLesson.lessonDate || ''
          }
        }
      }
    }
  },
  computed: {
    isFormValid() {
      return this.form.title && 
             this.form.description && 
             this.form.contentType && 
             this.form.duration && 
             this.form.lessonDate
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },

    getContentLabel() {
      const labels = {
        video: 'Video File Information',
        pdf: 'PDF Document Information', 
        url: 'External URL',
        interactive: 'Interactive Content'
      }
      return labels[this.form.contentType] || 'Content'
    },

    async handleSubmit() {
      if (!this.isFormValid) return

      const lessonData = {
        id: this.lesson.id,
        title: this.form.title,
        description: this.form.description,
        type: this.form.contentType,
        duration: this.form.duration,
        url: this.form.url,
        content: this.form.content,
        lessonDate: this.form.lessonDate,
        updatedAt: new Date().toISOString()
      }

      // Simulate update process
      console.log('Updating lesson:', lessonData)
      
      // Emit the updated lesson data
      this.$emit('update-lesson', lessonData)
      
      // Show success message and close
      this.showSuccessMessage()
      this.closeModal()
    },

    showSuccessMessage() {
      // Simple success feedback
      console.log('Lesson updated successfully!')
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

.form-group {
  margin-bottom: 1rem;
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

.url-section,
.content-section {
  margin-top: 1rem;
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

.modal-form {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .quick-action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>