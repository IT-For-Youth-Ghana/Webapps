<template>
  <div class="course-tabs">
    <button 
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-btn"
      :class="{ active: activeTab === tab.id }"
      @click="$emit('tab-change', tab.id)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
        <path v-if="tab.id === 'active'" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path v-if="tab.id === 'active'" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <polyline v-if="tab.id === 'completed'" points="9 11 12 14 20 6"/>
        <path v-if="tab.id === 'bookmarked'" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="tab-label">{{ tab.label }}</span>
      <span class="tab-count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'CourseTabs',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    activeTab: {
      type: String,
      default: 'active'
    }
  },
  emits: ['tab-change']
}
</script>

<style scoped>
.course-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.25rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-label {
  font-size: 1rem;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tab-btn:not(.active) .tab-count {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .course-tabs {
    flex-direction: column;
    padding: 0.125rem;
  }
  
  .tab-btn {
    justify-content: center;
  }
}
</style>