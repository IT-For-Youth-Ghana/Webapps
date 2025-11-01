<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Materials</h2>
      <button class="quick-action-btn primary" @click="$emit('upload-material')">
        <!-- Upload Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Upload Material
      </button>
    </div>

    <div class="materials-grid">
      <div 
        v-for="material in materials" 
        :key="material.id"
        class="material-card"
        @click="$emit('view-material', material)"
      >
        <div class="material-icon">
          <component :is="getFileIcon(material.type)" />
        </div>
        
        <div class="material-info">
          <h4 class="material-title">{{ material.name }}</h4>
          <p class="material-meta">
            {{ material.type }} • {{ formatFileSize(material.size) }} • {{ formatDate(material.updatedAt) }}
          </p>
        </div>
        
        <div class="material-actions">
          <input 
            type="checkbox" 
            @click.stop 
            @change="$emit('select-material', material)"
            class="material-checkbox"
          />
          <button 
            class="action-btn"
            @click.stop="$emit('download-material', material)"
            title="Download"
          >
            <!-- Download Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          
          <button 
            class="action-btn"
            @click.stop="$emit('edit-material', material)"
            title="Edit"
          >
            <!-- Edit Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          
          <button 
            class="action-btn delete-btn"
            @click.stop="$emit('delete-material', material)"
            title="Delete"
          >
            <!-- Delete Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="materials.length === 0" class="empty-state">
      <div class="empty-icon">
        <!-- Folder Icon -->
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <h3>No materials found</h3>
      <p>Upload your first learning material to get started</p>
      <button class="quick-action-btn primary" @click="$emit('upload-material')">
        Upload Material
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialsList',
  props: {
    materials: {
      type: Array,
      default: () => []
    }
  },
  emits: ['upload-material', 'view-material', 'edit-material', 'delete-material', 'download-material', 'select-material'],
  methods: {
    getFileIcon(type) {
      const icons = {
        document: 'FileTextIcon',
        video: 'VideoIcon', 
        image: 'ImageIcon',
        audio: 'AudioIcon',
        presentation: 'PresentationIcon'
      }
      
      // Return SVG component as string since we don't have icon library
      return 'div'
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

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.material-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.material-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.material-icon {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.material-info {
  flex: 1;
  min-width: 0;
}

.material-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.material-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.material-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.action-btn.delete-btn:hover {
  border-color: var(--status-error-text);
  color: var(--status-error-text);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  margin: 0 auto 1.5rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
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

@media (max-width: 768px) {
  .materials-grid {
    grid-template-columns: 1fr;
  }
  
  .material-card {
    flex-direction: column;
    text-align: center;
  }
  
  .material-info {
    text-align: center;
  }
}
</style>