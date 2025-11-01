<template>
  <div class="sidebar">
    <CourseProgress :progress="progress" />
    
    <div class="quick-actions">
      <h4>Quick Actions</h4>
      <button class="quick-action-btn" @click="$emit('preview-course')">
        <!-- Eye Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Preview Course
      </button>
      <button class="quick-action-btn" @click="$emit('import-template')">
        <!-- Upload Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Import Template
      </button>
      <button class="quick-action-btn" @click="$emit('duplicate-course')">
        <!-- Copy Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9"/>
        </svg>
        Duplicate Existing
      </button>
    </div>
    
    <CourseTips />
  </div>
</template>

<script>
import CourseProgress from '@shared/ui-components/components/CourseProgress.vue'
import CourseTips from '@shared/ui-components/components/CourseTips.vue'

export default {
  name: 'CourseSidebar',
  components: {
    CourseProgress,
    CourseTips
  },
  props: {
    progress: {
      type: Number,
      default: 0
    }
  },
  emits: ['preview-course', 'import-template', 'duplicate-course']
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quick-actions {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
}

.quick-actions h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.quick-actions .quick-action-btn {
  width: 100%;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.quick-actions .quick-action-btn:last-child {
  margin-bottom: 0;
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

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}

@media (max-width: 1024px) {
  .sidebar {
    position: static;
    order: -1;
  }
}
</style>