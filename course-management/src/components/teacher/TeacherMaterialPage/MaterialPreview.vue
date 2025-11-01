<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content preview-modal" @click.stop>
      <div class="modal-header">
        <div class="material-info">
          <h3>{{ material.name }}</h3>
          <div class="material-meta">
            <span class="material-type">{{ material.type }}</span>
            <span class="material-size">{{ formatFileSize(material.size) }}</span>
            <span class="material-date">{{ formatDate(material.updatedAt) }}</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="quick-action-btn" @click="$emit('download', material)">
            <!-- Download Icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          
          <button class="quick-action-btn" @click="$emit('edit', material)">
            <!-- Edit Icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          
          <button class="quick-action-btn" @click="$emit('close')">
            <!-- Close Icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Close
          </button>
        </div>
      </div>
      
      <div class="modal-body">
        <div class="preview-container">
          <!-- Document Preview -->
          <div v-if="material.type === 'document'" class="document-preview">
            <div class="document-icon">
              📄
            </div>
            <div class="document-info">
              <h4>{{ material.name }}</h4>
              <p>Click download to view this document</p>
              <div class="document-actions">
                <button class="quick-action-btn primary" @click="$emit('download', material)">
                  Open Document
                </button>
                <button class="quick-action-btn" @click="copyToClipboard">
                  Copy Share Link
                </button>
              </div>
            </div>
          </div>
          
          <!-- Video Preview -->
          <div v-else-if="material.type === 'video'" class="video-preview">
            <div class="video-placeholder">
              <div class="video-icon">
                🎥
              </div>
              <h4>{{ material.name }}</h4>
              <p>Video preview coming soon</p>
              <div class="video-controls">
                <button class="quick-action-btn primary" @click="$emit('download', material)">
                  Download Video
                </button>
                <button class="quick-action-btn" @click="shareWithStudents">
                  Share with Students
                </button>
              </div>
            </div>
          </div>
          
          <!-- Image Preview -->
          <div v-else-if="material.type === 'image'" class="image-preview">
            <div class="image-placeholder">
              <div class="image-icon">
                🖼️
              </div>
              <h4>{{ material.name }}</h4>
              <p>Image preview will appear here</p>
            </div>
          </div>
          
          <!-- Generic Preview -->
          <div v-else class="generic-preview">
            <div class="file-icon">
              📁
            </div>
            <h4>{{ material.name }}</h4>
            <p>{{ getFileDescription(material.type) }}</p>
          </div>
        </div>
        
        <!-- Material Details -->
        <div class="material-details">
          <div class="detail-section">
            <h4>Material Details</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>File Type:</label>
                <span>{{ material.type }}</span>
              </div>
              <div class="detail-item">
                <label>Category:</label>
                <span>{{ material.category }}</span>
              </div>
              <div class="detail-item">
                <label>File Size:</label>
                <span>{{ formatFileSize(material.size) }}</span>
              </div>
              <div class="detail-item">
                <label>Downloads:</label>
                <span>{{ material.downloads || 0 }}</span>
              </div>
              <div class="detail-item">
                <label>Last Modified:</label>
                <span>{{ formatDate(material.updatedAt) }}</span>
              </div>
              <div class="detail-item">
                <label>Assigned to:</label>
                <span>{{ material.course || 'All Courses' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Quick Actions</h4>
            <div class="quick-actions">
              <button class="action-btn" @click="assignToCourse">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                Assign to Course
              </button>
              
              <button class="action-btn" @click="addToCollection">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
                Add to Collection
              </button>
              
              <button class="action-btn" @click="generateQR">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="5" height="5"/>
                  <rect x="16" y="3" width="5" height="5"/>
                  <rect x="3" y="16" width="5" height="5"/>
                </svg>
                Generate QR Code
              </button>
              
              <button class="action-btn danger" @click="$emit('delete', material)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete Material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialPreview',
  props: {
    material: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'download', 'edit', 'delete'],
  methods: {
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
    
    getFileDescription(type) {
      const descriptions = {
        document: 'Document file - PDF, DOC, or TXT format',
        video: 'Video file - MP4 or other video format',
        image: 'Image file - JPG, PNG, or GIF format',
        audio: 'Audio file - MP3 or other audio format',
        presentation: 'Presentation file - PPT or similar format'
      }
      return descriptions[type] || 'File ready for download'
    },
    
    copyToClipboard() {
      const shareLink = `${window.location.origin}/materials/${this.material.id}`
      navigator.clipboard.writeText(shareLink)
      alert('Share link copied to clipboard!')
    },
    
    shareWithStudents() {
      alert('Share with students functionality coming soon!')
    },
    
    assignToCourse() {
      alert('Assign to course functionality coming soon!')
    },
    
    addToCollection() {
      alert('Add to collection functionality coming soon!')
    },
    
    generateQR() {
      alert('Generate QR code functionality coming soon!')
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

.preview-modal {
  max-width: 900px;
  width: 95%;
  max-height: 90vh;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  gap: 1rem;
}

.material-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.material-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.material-meta span {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modal-body {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.preview-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-preview,
.video-preview,
.image-preview,
.generic-preview {
  width: 100%;
}

.document-icon,
.video-icon,
.image-icon,
.file-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.document-info h4,
.video-placeholder h4,
.image-placeholder h4,
.generic-preview h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.document-info p,
.video-placeholder p,
.image-placeholder p,
.generic-preview p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

.document-actions,
.video-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.material-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
}

.detail-item label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.detail-item span {
  color: var(--text-primary);
  font-size: 0.875rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
  text-align: left;
  width: 100%;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.action-btn.danger:hover {
  border-color: var(--status-error-text);
  color: var(--status-error-text);
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
  white-space: nowrap;
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

@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .document-actions,
  .video-controls {
    flex-direction: column;
  }
}
</style>