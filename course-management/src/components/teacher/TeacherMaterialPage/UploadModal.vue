<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Upload Learning Materials</h3>
        <button class="quick-action-btn" @click="$emit('close')">
          <!-- Close Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Course Assignment -->
        <div class="form-group">
          <label class="form-label">Assign to Course</label>
          <select v-model="selectedCourse" class="input-field">
            <option value="">All Courses</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>

        <!-- Category Selection -->
        <div class="form-group">
          <label class="form-label">Material Category</label>
          <select v-model="selectedCategory" class="input-field">
            <option value="lecture">Lecture Notes</option>
            <option value="assignment">Assignments</option>
            <option value="reference">Reference Material</option>
            <option value="exercise">Exercises</option>
            <option value="project">Project Resources</option>
          </select>
        </div>

        <!-- Upload Area -->
        <div class="upload-area" :class="{ 'drag-over': isDragOver }" 
             @drop="handleDrop" 
             @dragover="handleDragOver" 
             @dragleave="handleDragLeave">
          <div class="upload-icon">
            <!-- Upload Icon -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h4>Drop files here or click to browse</h4>
          <p>Support for PDF, DOC, PPT, MP4, MP3, images and more</p>
          <p class="size-limit">Max file size: 50MB per file</p>
          
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            multiple 
            class="file-input"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png,.gif,.txt,.zip"
          />
          
          <button class="quick-action-btn primary" @click="$refs.fileInput.click()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Select Files
          </button>
        </div>

        <!-- Selected Files Preview -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <h4>Selected Files ({{ selectedFiles.length }})</h4>
          <div class="file-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="file-info">
                <div class="file-icon">
                  📄
                </div>
                <div class="file-details">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
              <button class="remove-btn" @click="removeFile(index)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="quick-action-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="quick-action-btn primary" 
          :disabled="selectedFiles.length === 0 || isUploading"
          @click="uploadFiles"
        >
          <svg v-if="!isUploading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          <div v-else class="spinner"></div>
          {{ isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'UploadModal',
  props: {
    courses: {
      type: Array,
      default: () => [
        { id: 1, name: 'Web Development Fundamentals' },
        { id: 2, name: 'Vue.js Advanced' },
        { id: 3, name: 'Database Design' }
      ]
    }
  },
  emits: ['close', 'upload'],
  setup(props, { emit }) {
    const selectedFiles = ref([])
    const selectedCourse = ref('')
    const selectedCategory = ref('lecture')
    const isDragOver = ref(false)
    const isUploading = ref(false)

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files)
    }

    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      const files = Array.from(event.dataTransfer.files)
      addFiles(files)
    }

    const handleDragOver = (event) => {
      event.preventDefault()
      isDragOver.value = true
    }

    const handleDragLeave = () => {
      isDragOver.value = false
    }

    const addFiles = (files) => {
      const validFiles = files.filter(file => {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          alert(`File ${file.name} is too large. Maximum size is 50MB.`)
          return false
        }
        return true
      })
      selectedFiles.value.push(...validFiles)
    }

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const uploadFiles = async () => {
      if (selectedFiles.value.length === 0) return
      
      isUploading.value = true
      
      // Simulate upload process
      setTimeout(() => {
        const uploadData = {
          files: selectedFiles.value,
          course: selectedCourse.value,
          category: selectedCategory.value
        }
        
        emit('upload', uploadData)
        isUploading.value = false
        selectedFiles.value = []
        emit('close')
      }, 2000)
    }

    return {
      selectedFiles,
      selectedCourse,
      selectedCategory,
      isDragOver,
      isUploading,
      handleFileSelect,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      removeFile,
      formatFileSize,
      uploadFiles
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
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.upload-area {
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--border-light);
  border-radius: 12px;
  transition: all 0.2s ease;
  margin-bottom: 1.5rem;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--primary);
  background: var(--bg-tertiary);
}

.upload-icon {
  margin: 0 auto 1rem;
  color: var(--text-secondary);
}

.upload-area h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.upload-area p {
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.size-limit {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 1.5rem !important;
}

.file-input {
  display: none;
}

.selected-files h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.file-list {
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.file-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.remove-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  color: var(--status-error-text);
  background: var(--bg-tertiary);
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
}

.quick-action-btn:hover:not(:disabled) {
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

.quick-action-btn.primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>