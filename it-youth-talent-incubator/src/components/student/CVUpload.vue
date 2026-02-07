<!--
  CV Upload Component
  Manages CV/Resume file upload and display
  Integrates with student store
-->
<script setup>
import { ref, computed } from 'vue'
import { useStudentStore } from '../../stores/student.js'

const props = defineProps({
  cvUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['uploaded', 'deleted'])

const studentStore = useStudentStore()

// Local state
const isDragging = ref(false)
const selectedFile = ref(null)
const uploadError = ref('')
const isUploading = ref(false)

// File input ref
const fileInput = ref(null)

// Accepted file types
const acceptedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
const acceptedExtensions = '.pdf,.doc,.docx'
const maxFileSize = 5 * 1024 * 1024 // 5MB

const hasCV = computed(() => !!props.cvUrl)

const cvFileName = computed(() => {
  if (!props.cvUrl) return ''
  const parts = props.cvUrl.split('/')
  return parts[parts.length - 1] || 'Resume'
})

const validateFile = (file) => {
  uploadError.value = ''
  
  if (!file) {
    uploadError.value = 'No file selected'
    return false
  }
  
  if (!acceptedTypes.includes(file.type)) {
    uploadError.value = 'Please upload a PDF or Word document'
    return false
  }
  
  if (file.size > maxFileSize) {
    uploadError.value = 'File size must be less than 5MB'
    return false
  }
  
  return true
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
    handleUpload()
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
    handleUpload()
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  isUploading.value = true
  uploadError.value = ''
  
  try {
    const result = await studentStore.uploadCV(selectedFile.value)
    
    if (result.success) {
      emit('uploaded', result.url)
      selectedFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    } else {
      uploadError.value = result.message || 'Failed to upload CV'
    }
  } catch (error) {
    uploadError.value = error.message || 'Failed to upload CV'
  } finally {
    isUploading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete your CV?')) return
  
  try {
    const result = await studentStore.deleteCV()
    
    if (result.success) {
      emit('deleted')
    }
  } catch (error) {
    uploadError.value = error.message || 'Failed to delete CV'
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div class="cv-upload">
    <div class="cv-header">
      <h4 class="cv-title">Resume/CV</h4>
      <span class="cv-hint">PDF or Word document, max 5MB</span>
    </div>

    <!-- Current CV Display -->
    <div v-if="hasCV" class="current-cv">
      <div class="cv-file-info">
        <div class="cv-icon">📄</div>
        <div class="cv-details">
          <span class="cv-filename">{{ cvFileName }}</span>
          <a 
            :href="cvUrl" 
            target="_blank" 
            class="cv-view-link"
          >
            View CV ↗
          </a>
        </div>
      </div>
      
      <div class="cv-actions">
        <button
          @click="openFileDialog"
          class="btn-secondary"
          :disabled="isUploading || studentStore.isSaving"
        >
          Replace
        </button>
        <button
          @click="handleDelete"
          class="btn-danger"
          :disabled="isUploading || studentStore.isSaving"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Upload Area (when no CV) -->
    <div
      v-else
      class="upload-area"
      :class="{ 
        'dragging': isDragging,
        'uploading': isUploading 
      }"
      @drop.prevent="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileDialog"
    >
      <div v-if="isUploading" class="upload-progress">
        <div class="loading-spinner"></div>
        <p class="upload-text">Uploading...</p>
      </div>
      
      <div v-else class="upload-content">
        <div class="upload-icon">📁</div>
        <p class="upload-text">
          <span class="upload-link">Click to upload</span> or drag and drop
        </p>
        <p class="upload-formats">PDF, DOC, DOCX (max 5MB)</p>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedExtensions"
      @change="handleFileSelect"
      class="file-input-hidden"
    />

    <!-- Selected File Preview (before upload) -->
    <div v-if="selectedFile && !hasCV" class="selected-file">
      <span class="selected-name">{{ selectedFile.name }}</span>
      <span class="selected-size">{{ formatFileSize(selectedFile.size) }}</span>
    </div>

    <!-- Error Message -->
    <p v-if="uploadError" class="error-message">
      {{ uploadError }}
    </p>

    <!-- Success Message -->
    <p v-if="studentStore.successMessage" class="success-message">
      {{ studentStore.successMessage }}
    </p>
  </div>
</template>

<style scoped>
.cv-upload {
  background: var(--card-background, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
}

.cv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cv-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.cv-hint {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
}

/* Current CV Display */
.current-cv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
  gap: 1rem;
}

.cv-file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cv-icon {
  font-size: 1.5rem;
}

.cv-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cv-filename {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.cv-view-link {
  font-size: 0.8125rem;
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
}

.cv-view-link:hover {
  text-decoration: underline;
}

.cv-actions {
  display: flex;
  gap: 0.5rem;
}

/* Upload Area */
.upload-area {
  border: 2px dashed var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary, #f8fafc);
}

.upload-area:hover:not(.uploading) {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, #eff6ff);
}

.upload-area.dragging {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, #eff6ff);
}

.upload-area.uploading {
  cursor: default;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

.upload-link {
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
}

.upload-formats {
  font-size: 0.8125rem;
  color: var(--text-muted, #94a3b8);
  margin: 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.file-input-hidden {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Selected File Preview */
.selected-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-primary-light, #eff6ff);
  border-radius: 8px;
  margin-top: 0.75rem;
}

.selected-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary, #3b82f6);
}

.selected-size {
  font-size: 0.8125rem;
  color: var(--text-muted, #94a3b8);
}

/* Buttons */
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color, #e2e8f0);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover, white);
}

.btn-danger {
  background: transparent;
  color: var(--color-danger, #ef4444);
  border: 1px solid var(--color-danger, #ef4444);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger, #ef4444);
  color: white;
}

.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.error-message {
  color: var(--color-danger, #ef4444);
  font-size: 0.875rem;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.success-message {
  color: var(--color-success, #22c55e);
  font-size: 0.875rem;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

/* Loading Spinner */
.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color, #e2e8f0);
  border-top-color: var(--color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .current-cv {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cv-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
