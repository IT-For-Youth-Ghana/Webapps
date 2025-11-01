<template>
  <div class="courses-header">
    <div class="header-content">
      <h1 class="page-title">My Courses</h1>
      <p class="page-subtitle">Track your progress and manage your enrollments</p>
    </div>
    <div class="header-actions">
      <button class="action-btn primary" @click="$emit('browse-courses')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8m-4-4h8"/>
        </svg>
        Browse Courses
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursesHeader',
  emits: ['browse-courses']
}
</script>

<style scoped>
.courses-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
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

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

@media (max-width: 768px) {
  .courses-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style>