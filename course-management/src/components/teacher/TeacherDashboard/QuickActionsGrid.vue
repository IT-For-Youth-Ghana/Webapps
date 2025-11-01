<template>
  <section class="quick-actions-section">
    <h2 class="section-title">Quick Actions</h2>
    <div class="quick-actions-grid">
      <button 
        v-for="action in actions" 
        :key="action.id"
        @click="$emit('action-click', action)"
        class="quick-action-btn"
        :class="action.type"
      >
        <!-- Plus Icon -->
        <svg v-if="action.icon === 'Plus'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        
        <!-- Upload Icon -->
        <svg v-else-if="action.icon === 'Upload'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        
        <!-- Document Icon -->
        <svg v-else-if="action.icon === 'Document'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        
        <!-- Users Icon -->
        <svg v-else-if="action.icon === 'Users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        
        <span>{{ action.label }}</span>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'QuickActionsGrid',
  props: {
    actions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['action-click']
}
</script>

<style scoped>
.quick-actions-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #374151;
  text-align: left;
}

.quick-action-btn:hover {
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: #111;
  color: white;
  border-color: #111;
}

.quick-action-btn.primary:hover {
  background: #374151;
  border-color: #374151;
}

@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>