<template>
  <div class="materials-list">
    <div v-if="materials.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>No materials found</h3>
      <p>Upload your first material to get started</p>
    </div>

    <div v-else :class="['materials-grid', viewMode]">
      <div
        v-for="material in materials"
        :key="material.id"
        :class="['material-card', { selected: isSelected(material) }]"
        @click="$emit('select', material)"
      >
        <div class="material-header">
          <div class="material-icon">{{ getFileIcon(material.type) }}</div>
          <div class="material-actions">
            <button class="action-btn" @click.stop="$emit('download', material)">⬇</button>
            <button class="action-btn" @click.stop="$emit('edit', material)">✏</button>
            <button class="action-btn danger" @click.stop="$emit('delete', material)">🗑</button>
          </div>
        </div>

        <div class="material-content">
          <h4 class="material-name">{{ material.name }}</h4>
          <div class="material-meta">
            <span class="material-size">{{ formatSize(material.size) }}</span>
            <span class="material-date">{{ formatDate(material.uploadDate) }}</span>
          </div>
          <div class="material-category">{{ material.category }}</div>
        </div>

        <div class="material-footer">
          <div class="material-stats">
            <span class="stat">👁 {{ material.views }}</span>
            <span class="stat">⬇ {{ material.downloads }}</span>
          </div>
          <div v-if="material.offlineAvailable" class="offline-indicator">📱</div>
        </div>

        <div v-if="isSelected(material)" class="selection-indicator">✓</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialsList',
  props: {
    materials: {
      type: Array,
      required: true
    },
    viewMode: {
      type: String,
      default: 'grid'
    },
    selected: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select', 'edit', 'delete', 'download'],
  methods: {
    isSelected(material) {
      return this.selected.some(m => m.id === material.id)
    },
    
    getFileIcon(type) {
      if (type.includes('pdf')) return '📄'
      if (type.includes('word') || type.includes('doc')) return '📝'
      if (type.includes('presentation') || type.includes('ppt')) return '📊'
      if (type.includes('video')) return '🎥'
      if (type.includes('audio')) return '🎵'
      if (type.includes('image')) return '🖼️'
      if (type.includes('zip') || type.includes('archive')) return '📦'
      return '📄'
    },

    formatSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.materials-list {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.materials-grid {
  display: grid;
  gap: 1rem;
}

.materials-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.materials-grid.list {
  grid-template-columns: 1fr;
}

.material-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  user-select: none;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

.material-card.selected {
  border-color: var(--brand-primary);
  background: rgba(27, 101, 178, 0.1);
}

.material-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.material-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.material-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.material-card:hover .material-actions {
  opacity: 1;
}

.action-btn {
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
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  background: var(--status-error-text);
  color: white;
}

.material-content {
  margin-bottom: 1rem;
}

.material-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.material-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.material-category {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.material-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.material-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.offline-indicator {
  font-size: 1rem;
  color: var(--brand-primary);
}

.selection-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--brand-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.materials-grid.list .material-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.materials-grid.list .material-header,
.materials-grid.list .material-content,
.materials-grid.list .material-footer {
  margin: 0;
}

.materials-grid.list .material-header {
  flex-shrink: 0;
}

.materials-grid.list .material-content {
  flex: 1;
}

.materials-grid.list .material-footer {
  flex-shrink: 0;
}

.materials-grid.list .material-name {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .materials-grid.grid {
    grid-template-columns: 1fr;
  }
  
  .material-actions {
    opacity: 1;
  }
  
  .materials-grid.list .material-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .materials-grid.list .material-header,
  .materials-grid.list .material-content,
  .materials-grid.list .material-footer {
    width: 100%;
  }
}
</style>