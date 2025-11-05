<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Active Courses ({{ courses.length }})</h2>
      <router-link to="/teacher/courses" class="quick-action-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
        View All
      </router-link>
    </div>
    
    <div v-if="courses.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <h3 class="empty-title">No active courses</h3>
      <p class="empty-description">Create your first course to start teaching</p>
      <button class="quick-action-btn primary" @click="$emit('create-course')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Create Your First Course
      </button>
    </div>
    
    <div v-else class="course-grid">
      <div v-for="course in courses.slice(0, 3)" :key="course.id" class="course-card">
        <div class="course-header">
          <h3 class="course-title">{{ course.title }}</h3>
          <span class="course-status" :class="course.status">{{ course.status }}</span>
        </div>
        <p class="course-description">{{ course.description }}</p>
        <div class="course-stats">
          <div class="stat">
            <span class="stat-value">{{ course.enrolledStudents }}</span>
            <span class="stat-label">Students</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ course.avgProgress }}%</span>
            <span class="stat-label">Progress</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ course.totalLessons }}</span>
            <span class="stat-label">Lessons</span>
          </div>
        </div>
        <div class="course-actions">
          <button @click="$emit('manage-course', course.id)" class="quick-action-btn primary">
            Manage Course
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActiveCourses',
  props: {
    courses: {
      type: Array,
      required: true
    }
  },
  emits: ['create-course', 'manage-course']
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
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
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
  justify-content: center;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  justify-content: center;
}

.quick-action-btn.primary:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.course-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.course-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.course-status.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.course-status.completed {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.course-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.course-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.course-actions {
  display: flex;
  gap: 0.5rem;
}

.course-actions .quick-action-btn {
  flex: 1;
  justify-content: center;
  padding: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .course-actions {
    flex-direction: column;
  }
}
</style>