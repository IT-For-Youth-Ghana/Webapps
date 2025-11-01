<template>
  <div class="empty-state">
    <div class="empty-content">
      <h3 class="empty-title">No {{ activeTabLabel }} Assignments</h3>
      <p class="empty-description">{{ description }}</p>
      <button class="btn btn-primary" @click="$emit('browse-courses')">
        Browse Courses
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    activeTabLabel: {
      type: String,
      default: 'All'
    },
    description: {
      type: String,
      default: 'No assignments available. Enroll in courses to get started!'
    }
  },
  emits: ['browse-courses']
}
</script>

<style scoped>
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .empty-state {
    padding: 3rem 1.5rem;
  }
  
  .empty-title {
    font-size: 1.125rem;
  }
  
  .empty-description {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
}
</style>