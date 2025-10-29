<template>
  <div class="bulk-upload-modal-overlay" @click="$emit('close')">
    <div class="bulk-upload-modal" @click.stop>
      <div class="modal-header">
        <h3>Bulk Upload Materials</h3>
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
            <strong>Drop multiple files or folders here</strong> or 
            <button class="upload-browse" @click="$refs.fileInput.click()">browse</button>
          </p>
          <p class="upload-hint">Supports batch upload of up to 50 files at once</p>
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            webkitdirectory
            @change="handleFileSelect"
            style="display: none"
          />
        </div>

        <div v-if="files.length > 0" class="files-preview">
          <h4>Files to Upload ({{ files.length }})</h4>
          <div class="files-grid">
            <div v-for="(file, index) in files.slice(0, 10)" :key="index" class="file-preview">
              <div class="file-icon">{{ getFileIcon(file.type) }}</div>
              <div class="file-name">{{ file.name }}</div>
              <button class="remove-file" @click="removeFile(index)">×</button>
            </div>
          </div>
          <div v-if="files.length > 10" class="more-files">
            and {{ files.length - 10 }} more files...
          </div>
        </div>

        <div class="bulk-settings">
          <div class="settings-grid">
            <div class="form-group">
              <label>Default Category</label>
              <select v-model="uploadData.category" class="input-field">
                <option value="lecture">Lecture Materials</option>
                <option value="assignment">Assignments</option>
                <option value="resource">Resources</option>
                <option value="video">Videos</option>
                <option value="reading">Reading Materials</option>
              </select>
            </div>

            <div class="form-group">
              <label>Target Folder</label>
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
                  v-model="uploadData.autoOrganize" 
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                Auto-organize by file type
              </label>
            </div>

            <div class="form-group">
              <label>
                <input 
                  v-model="uploadData.makeAvailableOffline" 
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                Make all files available offline
              </label>
            </div>
          </div>
        </div>

        <div v-if="isUploading" class="upload-progress">
          <div class="progress-header">
            <span>Uploading {{ currentFileIndex + 1 }} of {{ files.length }}</span>
            <span>{{ Math.round(overallProgress) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <div class="current-file">{{ currentFileName }}</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
        <button 
          class="btn btn-primary" 
          @click="startBulkUpload"
          :disabled="files.length === 0 || isUploading"
        >
          {{ isUploading ? 'Uploading...' : `Upload ${files.length} files` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'BulkUploadModal',
  emits: ['close', 'upload'],
  setup(props, { emit }) {
    const files = ref([])
    const isDragOver = ref(false)
    const isUploading = ref(false)
    const currentFileIndex = ref(0)
    const currentFileName = ref('')
    
    const uploadData = reactive({
      category: 'lecture',
      folder: '',
      autoOrganize: true,
      makeAvailableOffline: false
    })

    const overallProgress = computed(() => {
      if (!isUploading.value || files.value.length === 0) return 0
      return (currentFileIndex.value / files.value.length) * 100
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
        if (file.size <= 100 * 1024 * 1024) { // 100MB limit per file
          files.value.push({
            file,
            name: file.name,
            size: file.size,
            type: file.type || getFileTypeFromName(file.name),
            category: getCategoryFromFile(file)
          })
        }
      })
      
      // Limit to 50 files
      if (files.value.length > 50) {
        files.value = files.value.slice(0, 50)
      }
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

    const getCategoryFromFile = (file) => {
      const name = file.name.toLowerCase()
      const type = file.type.toLowerCase()
      
      if (type.includes('video')) return 'video'
      if (type.includes('audio')) return 'video'
      if (name.includes('assignment') || name.includes('homework')) return 'assignment'
      if (name.includes('reading') || name.includes('book')) return 'reading'
      if (type.includes('pdf') || type.includes('document')) return 'lecture'
      
      return uploadData.category
    }

    const startBulkUpload = async () => {
      isUploading.value = true
      currentFileIndex.value = 0
      
      for (let i = 0; i < files.value.length; i++) {
        const fileItem = files.value[i]
        currentFileIndex.value = i
        currentFileName.value = fileItem.name
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Emit upload completion
      emit('upload', {
        files: files.value.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          category: uploadData.autoOrganize ? f.category : uploadData.category,
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
      currentFileIndex,
      currentFileName,
      uploadData,
      overallProgress,
      handleDrop,
      handleFileSelect,
      removeFile,
      getFileIcon,
      startBulkUpload
    }
  }
}
</script>

<style scoped>
.bulk-upload-modal-overlay {
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

.bulk-upload-modal {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 800px;
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

.files-preview h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  position: relative;
}

.file-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: var(--status-error-text);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.more-files {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.bulk-settings {
  margin: 2rem 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.upload-progress {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin: 2rem 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  transition: width 0.3s ease;
}

.current-file {
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .bulk-upload-modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .files-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>