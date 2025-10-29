<template>
  <div class="materials-toolbar">
    <div class="toolbar-left">
      <div class="search-box">
        <input
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          type="text"
          placeholder="Search materials..."
          class="search-input"
        />
        <div class="search-icon">🔍</div>
      </div>
    </div>

    <div class="toolbar-center">
      <div v-if="selectedCount > 0" class="selection-actions">
        <span class="selection-count">{{ selectedCount }} selected</span>
        <button class="action-btn" @click="$emit('download-selected')">
          Download
        </button>
        <button class="action-btn danger" @click="$emit('delete-selected')">
          Delete
        </button>
      </div>
    </div>

    <div class="toolbar-right">
      <div class="view-toggle">
        <button
          :class="['view-btn', { active: view === 'grid' }]"
          @click="$emit('update:view', 'grid')"
        >
          ⊞
        </button>
        <button
          :class="['view-btn', { active: view === 'list' }]"
          @click="$emit('update:view', 'list')"
        >
          ☰
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialsToolbar',
  props: {
    view: {
      type: String,
      default: 'grid'
    },
    search: {
      type: String,
      default: ''
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:view', 'update:search', 'download-selected', 'delete-selected']
}
</script>

<style scoped>
.materials-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.toolbar-left {
  flex: 1;
}

.search-box {
  position: relative;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--brand-primary);
  border-radius: var(--radius-md);
  color: white;
}

.selection-count {
  font-size: 0.875rem;
  font-weight: 500;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.danger {
  background: var(--status-error-bg);
  border-color: var(--status-error-text);
  color: var(--status-error-text);
}

.action-btn.danger:hover {
  background: var(--status-error-text);
  color: white;
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-btn {
  padding: 0.75rem;
  border: none;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-width: 2.5rem;
}

.view-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--brand-primary);
  color: white;
}

@media (max-width: 768px) {
  .materials-toolbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    width: 100%;
    flex: none;
  }
  
  .toolbar-center {
    justify-content: flex-start;
  }
  
  .toolbar-right {
    justify-content: flex-start;
  }
  
  .search-box {
    max-width: none;
  }
}
</style>