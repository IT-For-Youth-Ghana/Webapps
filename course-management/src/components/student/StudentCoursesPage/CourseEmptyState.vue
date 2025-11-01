<template>
  <div v-if="courses.length === 0" class="empty-state">
    <div class="empty-content">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <button class="action-btn primary" @click="$emit('browse-courses')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8m-4-4h8"/>
        </svg>
        Browse Available Courses
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseEmptyState',
  props: {
    courses: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'No Courses Found'
    },
    description: {
      type: String,
      default: 'Start exploring courses to build your skills!'
    }
  },
  emits: ['browse-courses']
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  background: var(--bg-secondary);
  border-radius: 50%;
  color: var(--text-tertiary);
  border: 2px solid var(--border-light);
}

.empty-icon svg {
  width: 3rem;
  height: 3rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  margin: 0 auto;
}

.action-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    width: 100px;
    height: 100px;
  }
  
  .empty-icon svg {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>