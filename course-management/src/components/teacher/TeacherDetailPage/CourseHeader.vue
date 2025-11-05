<template>
  <div class="quick-actions-section" :style="getBackgroundStyle()">
    <div class="background-overlay"></div>
    <div class="course-header-content">
      <div class="course-image-large">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="course-info">
          <h1 class="course-title">{{ course.title }}</h1>
        <p class="course-description">{{ course.description }}</p>
        <div class="course-meta">
          <div class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{{ course.enrolledStudents }} Students</span>
          </div>
          <div class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <span>{{ course.totalLessons }} Lessons</span>
          </div>
          <div class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 12"/>
            </svg>
            <span>{{ course.duration }}</span>
          </div>
        </div>
      </div>
    </div>
    
    
    <!-- Background Settings (for teachers) -->
    <div v-if="isTeacher" class="background-settings">
      <button class="upload-bg-btn" @click="showImageModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Change Background
      </button>
    </div>

    <!-- Background Image Upload Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <div class="quick-actions-section">
          <div class="section-header">
            <h3 class="section-title">Change Course Background</h3>
            <button @click="closeImageModal" class="quick-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>
          
          <div class="background-options">
            <div class="preset-colors">
              <h4>Background Colors</h4>
              <div class="color-grid">
                <button 
                  v-for="color in presetColors" 
                  :key="color.name"
                  @click="selectBackground(color.value)"
                  class="color-btn"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                ></button>
              </div>
            </div>
            
            <div class="custom-background">
              <h4>Custom Background</h4>
              <div class="upload-area">
                <input 
                  ref="fileInput"
                  type="file" 
                  accept="image/*"
                  @change="handleImageUpload"
                  class="file-input"
                  id="backgroundImageUpload"
                />
                <label for="backgroundImageUpload" class="upload-label">
                  <div class="upload-content">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <div class="upload-text">
                      <span v-if="!selectedFile" class="upload-title">
                        Upload custom image
                      </span>
                      <span v-else class="file-selected">
                        {{ selectedFile.name }}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            <div v-if="course.backgroundImage" class="current-background">
              <h4>Current Background</h4>
              <div class="background-preview">
                <div class="preview-box" :style="{ background: course.backgroundImage }"></div>
                <button @click="removeBackground" class="remove-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeImageModal" class="quick-action-btn">
              Cancel
            </button>
            <button @click="uploadImage" :disabled="!selectedFile" class="quick-action-btn primary">
              Apply Background
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseHeader',
  props: {
    course: {
      type: Object,
      required: true
    },
    isTeacher: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-background'],
  data() {
    return {
      showImageModal: false,
      selectedFile: null,
      presetColors: [
        { name: 'Notion Blue', value: '#2383e2' },
        { name: 'Ocean Blue', value: '#2e3440' },
        { name: 'Forest Green', value: '#2e7d32' },
        { name: 'Purple Haze', value: '#5e35b1' },
        { name: 'Sunset Orange', value: '#ff6f00' },
        { name: 'Rose Pink', value: '#c2185b' },
        { name: 'Mint Green', value: '#00897b' },
        { name: 'Slate Gray', value: '#37474f' },
        { name: 'Navy Blue', value: '#1565c0' },
        { name: 'Burgundy', value: '#880e4f' },
        { name: 'Teal', value: '#00695c' },
        { name: 'Indigo', value: '#3949ab' }
      ]
    }
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        active: 'Active',
        draft: 'Draft',
        completed: 'Completed',
        archived: 'Archived'
      }
      return statusMap[status] || status
    },
    getBackgroundStyle() {
      if (this.course.backgroundImage) {
        // Check if it's a URL or a solid color
        if (this.course.backgroundImage.startsWith('http') || this.course.backgroundImage.startsWith('data:')) {
          return {
            backgroundImage: `url(${this.course.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        } else {
          return {
            backgroundColor: this.course.backgroundImage
          }
        }
      }
      return {}
    },
    selectBackground(color) {
      this.$emit('update-background', {
        courseId: this.course.id,
        backgroundImage: color
      })
      this.closeImageModal()
    },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB')
          return
        }
        this.selectedFile = file
      }
    },
    uploadImage() {
      if (!this.selectedFile) return
      
      // Create file reader to convert to base64 for demo
      const reader = new FileReader()
      reader.onload = (e) => {
        this.$emit('update-background', {
          courseId: this.course.id,
          backgroundImage: e.target.result
        })
        this.closeImageModal()
      }
      reader.readAsDataURL(this.selectedFile)
    },
    removeBackground() {
      if (confirm('Are you sure you want to remove the background image?')) {
        this.$emit('update-background', {
          courseId: this.course.id,
          backgroundImage: null
        })
      }
    },
    closeImageModal() {
      this.showImageModal = false
      this.selectedFile = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
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
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.course-header-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  position: relative;
  z-index: 2;
  padding: 2rem 0;
}

.course-image-large {
  width: 120px;
  height: 120px;
  background: var(--interactive-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-left: 2rem;
}

.background-settings {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.upload-bg-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-bg-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.course-info {
  flex: 1;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 2rem;
  margin: -1rem 0 -1rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}


.course-info .course-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.course-info .course-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.course-info .meta-item {
  color: var(--text-secondary);
}

.course-info .meta-item svg {
  stroke: var(--text-secondary);
}

/* Background Options Modal Styles */
.background-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preset-colors h4,
.custom-background h4,
.current-background h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

.color-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-color: var(--interactive-primary);
}

.background-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-box {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.course-status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.course-status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.course-status-badge.draft {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.course-status-badge.completed {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.course-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.course-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.course-meta {
  display: flex;
  gap: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Modal Styles */
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.upload-area {
  margin-bottom: 1.5rem;
}

.upload-label {
  display: block;
  border: 2px dashed var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-label:hover {
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
  font-size: 0.875rem;
}

.file-selected {
  color: var(--interactive-primary);
  font-weight: 500;
}

.upload-subtitle {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0.5rem 0 0 0;
}

.file-input {
  display: none;
}

.current-image {
  margin-bottom: 1.5rem;
}

.current-image h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ef4444;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .course-header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .course-image-large {
    width: 80px;
    height: 80px;
  }
  
  .course-title {
    font-size: 1.5rem;
  }
  
  .course-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>