<template>
  <div class="upload-modal-overlay" @click="$emit('close')">
    <div class="upload-modal" @click.stop>
      <div class="modal-header">
        <h3>Upload Material</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="upload-zone" 
             :class="{ dragover: isDragOver }"
             @drop="handleDrop"
             @dragover.prevent="isDragOver = true"
             @dragleave="isDragOver = false">
          <div class="upload-icon">📁</div>
          <p class="upload-text">
            <strong>Drop files here</strong> or 
            <button class="upload-browse" @click="$refs.fileInput.click()">browse</button>
          </p>
          <p class="upload-hint">Support: PDF, DOC, PPT, MP4, MP3, ZIP (max 100MB)</p>
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.zip,.jpg,.png"
            @change="handleFileSelect"
            style="display: none"
          />
        </div>

        <div v-if="files.length > 0" class="files-list">
          <h4>Selected Files ({{ files.length }})</h4>
          <div class="file-items">
            <div v-for="(file, index) in files" :key="index" class="file-item">
              <div class="file-info">
                <div class="file-icon">{{ getFileIcon(file.type) }}</div>
                <div class="file-details">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">
                    {{ formatFileSize(file.size) }} • {{ file.type }}
                  </div>
                </div>
              </div>
              <div class="file-progress" v-if="file.uploading">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ file.progress }}%</span>
              </div>
              <button class="remove-file" @click="removeFile(index)" v-else>×</button>
            </div>
          </div>
        </div>

        <div class="upload-settings">
          <div class="form-group">
            <label>Category</label>
            <select v-model="uploadData.category" class="input-field">
              <option value="lecture">Lecture Materials</option>
              <option value="assignment">Assignments</option>
              <option value="resource">Resources</option>
              <option value="video">Videos</option>
              <option value="reading">Reading Materials</option>
            </select>
          </div>

          <div class="form-group">
            <label>Folder</label>
            <select v-model="uploadData.folder" class="input-field">
              <option value="">Root Folder</option>
              <option value="week1">Week 1</option>
              <option value="week2">Week 2</option>
              <option value="resources">Resources</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input 
                v-model="uploadData.makeAvailableOffline" 
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              Make available offline
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
        <button 
          class="btn btn-primary" 
          @click="startUpload"
          :disabled="files.length === 0 || isUploading"
        >
          {{ isUploading ? 'Uploading...' : `Upload ${files.length} files` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'UploadModal',
  emits: ['close', 'upload'],
  setup(props, { emit }) {
    const files = ref([])
    const isDragOver = ref(false)
    const isUploading = ref(false)
    
    const uploadData = reactive({
      category: 'lecture',
      folder: '',
      makeAvailableOffline: true
    })

    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      const droppedFiles = Array.from(event.dataTransfer.files)
      addFiles(droppedFiles)
    }

    const handleFileSelect = (event) => {
      const selectedFiles = Array.from(event.target.files)
      addFiles(selectedFiles)
    }

    const addFiles = (newFiles) => {
      newFiles.forEach(file => {
        if (file.size <= 100 * 1024 * 1024) { // 100MB limit
          files.value.push({
            file,
            name: file.name,
            size: file.size,
            type: file.type || getFileTypeFromName(file.name),
            progress: 0,
            uploading: false
          })
        }
      })
    }

    const removeFile = (index) => {
      files.value.splice(index, 1)
    }

    const getFileIcon = (type) => {
      if (type.includes('pdf')) return '📄'
      if (type.includes('word') || type.includes('doc')) return '📝'
      if (type.includes('presentation') || type.includes('ppt')) return '📊'
      if (type.includes('video')) return '🎥'
      if (type.includes('audio')) return '🎵'
      if (type.includes('image')) return '🖼️'
      if (type.includes('zip') || type.includes('archive')) return '📦'
      return '📄'
    }

    const getFileTypeFromName = (name) => {
      const ext = name.split('.').pop().toLowerCase()
      const typeMap = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        zip: 'application/zip'
      }
      return typeMap[ext] || 'application/octet-stream'
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const startUpload = async () => {
      isUploading.value = true
      
      for (let fileItem of files.value) {
        fileItem.uploading = true
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          fileItem.progress = progress
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        fileItem.uploading = false
      }
      
      // Emit upload completion
      emit('upload', {
        files: files.value.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          category: uploadData.category,
          folder: uploadData.folder,
          offlineAvailable: uploadData.makeAvailableOffline
        })),
        settings: uploadData
      })
      
      isUploading.value = false
      emit('close')
    }

    return {
      files,
      isDragOver,
      isUploading,
      uploadData,
      handleDrop,
      handleFileSelect,
      removeFile,
      getFileIcon,
      formatFileSize,
      startUpload
    }
  }
}
</script>

<style scoped>
.upload-modal-overlay {
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

.upload-modal {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.upload-zone {
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.upload-zone.dragover {
  border-color: var(--brand-primary);
  background: rgba(27, 101, 178, 0.05);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.upload-browse {
  color: var(--brand-primary);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
}

.upload-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.files-list h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.file-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.file-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 120px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 40px;
}

.remove-file {
  width: 2rem;
  height: 2rem;
  border: none;
  background: var(--status-error-text);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

.upload-settings {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.checkbox-input {
  opacity: 0;
  position: absolute;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.875rem;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .upload-modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .upload-zone {
    padding: 2rem 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>