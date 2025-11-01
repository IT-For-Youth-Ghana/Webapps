<template>
  <div class="assignment-tabs">
    <button 
      v-for="tab in tabs"
      :key="tab.id"
      class="quick-action-btn"
      :class="{ active: activeTab === tab.id }"
      @click="$emit('tab-change', tab.id)"
    >
      <!-- Tab Icons -->
      <svg v-if="tab.id === 'all'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <svg v-else-if="tab.id === 'todo'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
      </svg>
      <svg v-else-if="tab.id === 'submitted'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <svg v-else-if="tab.id === 'graded'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      
      <span class="tab-label">{{ tab.label }}</span>
      <span class="tab-count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'AssignmentTabs',
  props: {
    activeTab: {
      type: String,
      default: 'all'
    },
    tabs: {
      type: Array,
      required: true
    }
  },
  emits: ['tab-change']
}
</script>

<style scoped>
.assignment-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
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
  flex: 1;
  justify-content: center;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.active:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
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

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}

.tab-label {
  font-weight: 500;
}

.tab-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.quick-action-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

@media (max-width: 768px) {
  .assignment-tabs {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .quick-action-btn {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
}
</style>