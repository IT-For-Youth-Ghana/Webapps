<template>
  <div class="course-card card" @click="viewCourseDetails(course.id)">
    <div class="course-header">
      <div class="course-image">
        <!-- Book Icon -->
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="course-status" :class="course.status">
        {{ formatStatus(course.status) }}
      </div>
    </div>
    
    <div class="course-content">
      <h3 class="course-title">{{ course.title }}</h3>
      <p class="course-description">{{ course.description }}</p>
      
      <div class="course-stats">
<div class="stat-item">
          <!-- Users Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>{{ course.enrolledStudents }}</span>
        </div>
<div class="stat-item">
          <!-- Document Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <span>{{ course.totalLessons }}</span>
        </div>
<div class="stat-item">
          <!-- Clock Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 12"/>
          </svg>
          <span>{{ course.duration || 'Self-paced' }}</span>
        </div>
      </div>
      
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Course Progress</span>
          <span class="progress-value">{{ course.avgProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: course.avgProgress + '%' }"></div>
        </div>
      </div>
      
      <div class="course-actions">
<router-link :to="`/teacher/courses/${course.id}/edit`" class="quick-action-btn btn-sm" @click.stop>
          <!-- Pencil Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          Edit
        </router-link>
<router-link :to="`/teacher/courses/${course.id}/analytics`" class="quick-action-btn primary btn-sm" @click.stop>
          <!-- Chart Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Analytics
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        active: 'Active',
        draft: 'Draft',
        completed: 'Completed',
        archived: 'Archived'
      }
      return statusMap[status] || status
    },
    viewCourseDetails(courseId) {
      this.$router.push(`/teacher/courses/${courseId}`)
    }
  }
}
</script>

<style scoped>
.course-card {
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--border-hover);
}

.course-header {
  position: relative;
  height: 120px;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.course-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
}

.course-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.course-status.active {
  background: rgba(16, 185, 129, 0.9);
}

.course-status.draft {
  background: rgba(245, 158, 11, 0.9);
}

.course-status.completed {
  background: rgba(107, 114, 128, 0.9);
}

.course-status.archived {
  background: rgba(239, 68, 68, 0.9);
}

.course-content {
  padding: 1.5rem;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.course-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.course-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.progress-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-value {
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
}

.progress-bar {
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--interactive-primary), var(--brand-accent));
  transition: width 0.3s ease;
}

.course-actions {
  display: flex;
  gap: 0.75rem;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  gap: 0.25rem;
}
</style>