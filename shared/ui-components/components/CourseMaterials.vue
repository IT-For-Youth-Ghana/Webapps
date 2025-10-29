<template>
  <div class="course-materials card">
    <div class="section-header">
      <h3 class="section-title">Course Materials</h3>
      <button class="btn btn-primary" @click="showUpload = true">
        Upload Material
      </button>
    </div>
    
    <div class="materials-list">
      <div 
        v-for="material in materials" 
        :key="material.id"
        class="material-item"
      >
        <div class="material-icon">
          {{ getFileIcon(material.type) }}
        </div>
        <div class="material-info">
          <h4>{{ material.name }}</h4>
          <p>{{ material.description }}</p>
          <div class="material-meta">
            <span>{{ formatFileSize(material.size) }}</span>
            <span>{{ formatDate(material.uploadDate) }}</span>
          </div>
        </div>
        <div class="material-actions">
          <button class="btn-icon" @click="downloadMaterial(material)">↓</button>
          <button class="btn-icon delete" @click="removeMaterial(material.id)">×</button>
        </div>
      </div>
    </div>
    
    <div v-if="materials.length === 0" class="empty-state">
      <p>No materials uploaded yet. Add learning resources for your students.</p>
    </div>
    
    <div v-if="showUpload" class="upload-modal">
      <div class="upload-content">
        <h4>Upload Material</h4>
        <div class="upload-zone" @drop="handleDrop" @dragover.prevent>
          <p>Drag files here or click to select</p>
          <input type="file" multiple @change="handleFileSelect" />
        </div>
        <button class="btn btn-secondary" @click="showUpload = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseMaterials',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showUpload: false
    }
  },
  computed: {
    materials: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    getFileIcon(type) {
      const icons = {
        document: 'D',
        video: 'V',
        audio: 'A',
        image: 'I',
        archive: 'Z'
      }
      return icons[type] || 'F'
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    handleDrop(event) {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
    },
    processFiles(files) {
      files.forEach(file => {
        const material = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: this.getFileType(file),
          size: file.size,
          uploadDate: new Date().toISOString(),
          description: ''
        }
        this.materials = [...this.materials, material]
      })
      this.showUpload = false
    },
    getFileType(file) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document'
      if (['mp4', 'avi', 'mov'].includes(ext)) return 'video'
      if (['mp3', 'wav'].includes(ext)) return 'audio'
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
      if (['zip', 'rar'].includes(ext)) return 'archive'
      return 'file'
    },
    downloadMaterial(material) {
      console.log('Downloading:', material.name)
    },
    removeMaterial(id) {
      this.materials = this.materials.filter(m => m.id !== id)
    }
  }
}
</script>

<style scoped>
.course-materials {
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
}

.material-icon {
  width: 3rem;
  height: 3rem;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.material-info {
  flex: 1;
}

.material-info h4 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.material-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.material-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.material-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 2rem;
  height: 2rem;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--brand-primary);
  color: white;
}

.btn-icon.delete:hover {
  background: var(--status-error-text);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.upload-modal {
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

.upload-content {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
}

.upload-zone {
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
  transition: border-color 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--brand-primary);
}

.upload-zone input {
  width: 100%;
  margin-top: 1rem;
}
</style>