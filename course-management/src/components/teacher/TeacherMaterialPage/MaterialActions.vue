<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <div class="selection-info">
        <h3 class="section-title">Bulk Actions</h3>
        <p class="selection-count">{{ selectedMaterials.length }} materials selected</p>
      </div>
      
      <div class="bulk-actions" v-if="selectedMaterials.length > 0">
        <button class="quick-action-btn" @click="$emit('assign-to-course', selectedMaterials)">
          <!-- Course Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Assign to Course
        </button>
        
        <button class="quick-action-btn" @click="$emit('download-selected', selectedMaterials)">
          <!-- Download Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download ZIP
        </button>
        
        <button class="quick-action-btn admin" @click="$emit('move-to-folder', selectedMaterials)">
          <!-- Folder Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Move to Folder
        </button>
        
        <button class="quick-action-btn danger" @click="confirmBulkDelete">
          <!-- Delete Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete Selected
        </button>
      </div>
    </div>

    <!-- Teacher Productivity Tools -->
    <div class="productivity-tools">
      <div class="tool-group">
        <h4>Quick Actions</h4>
        <div class="tool-buttons">
          <button class="tool-btn" @click="$emit('create-assignment-template')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Create Assignment Template
          </button>
          
          <button class="tool-btn" @click="$emit('batch-convert-pdf')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <path d="M8 6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6"/>
            </svg>
            Convert to PDF
          </button>
          
          <button class="tool-btn" @click="$emit('generate-qr-codes')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="5" height="5"/>
              <rect x="16" y="3" width="5" height="5"/>
              <rect x="3" y="16" width="5" height="5"/>
              <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
              <path d="M21 21v.01"/>
              <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
              <path d="M3 12h.01"/>
              <path d="M12 3h.01"/>
              <path d="M12 16v.01"/>
              <path d="M16 12h1"/>
              <path d="M21 12v.01"/>
              <path d="M12 21v-1"/>
            </svg>
            Generate QR Codes
          </button>
          
          <button class="tool-btn" @click="$emit('schedule-release')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Schedule Release
          </button>
        </div>
      </div>
      
      <div class="tool-group">
        <h4>Organization</h4>
        <div class="tool-buttons">
          <button class="tool-btn" @click="$emit('auto-organize')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h7v9H3z"/>
              <path d="M14 3h7v5h-7z"/>
              <path d="M14 12h7v9h-7z"/>
              <path d="M3 16h7v5H3z"/>
            </svg>
            Auto-Organize by Course
          </button>
          
          <button class="tool-btn" @click="$emit('create-collection')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="2"/>
            </svg>
            Create Collection
          </button>
          
          <button class="tool-btn" @click="$emit('tag-materials')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Bulk Tag
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialActions',
  props: {
    selectedMaterials: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'assign-to-course',
    'download-selected', 
    'move-to-folder',
    'delete-selected',
    'create-assignment-template',
    'batch-convert-pdf',
    'generate-qr-codes',
    'schedule-release',
    'auto-organize',
    'create-collection',
    'tag-materials'
  ],
  methods: {
    confirmBulkDelete() {
      if (confirm(`Are you sure you want to delete ${this.selectedMaterials.length} materials? This action cannot be undone.`)) {
        this.$emit('delete-selected', this.selectedMaterials)
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
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.selection-info .section-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.selection-count {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.bulk-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.productivity-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tool-group h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.tool-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
}

.tool-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}

.quick-action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-error-text);
  border-color: var(--status-error-text);
}

.quick-action-btn.danger:hover {
  background: var(--status-error-text);
  color: white;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bulk-actions {
    justify-content: stretch;
  }
  
  .bulk-actions .quick-action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .tool-buttons {
    grid-template-columns: 1fr;
  }
}
</style>