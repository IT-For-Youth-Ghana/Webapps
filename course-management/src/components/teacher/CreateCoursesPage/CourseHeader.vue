<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <div>
        <h2 class="section-title">Create Course</h2>
        <p class="section-subtitle">Design and configure your new course</p>
      </div>
      <div class="actions">
      <button class="quick-action-btn" @click="$emit('save-draft')">
        <!-- Save Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17,21 17,13 7,13 7,21"/>
          <polyline points="7,3 7,8 15,8"/>
        </svg>
        Save Draft
      </button>
      <button class="quick-action-btn primary" @click="$emit('publish-course')" :disabled="!isValid">
        <!-- Publish Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Publish Course
      </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseHeader',
  props: {
    isValid: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save-draft', 'publish-course']
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .actions .quick-action-btn {
    flex: 1;
  }
}
</style>