<template>
  <div class="course-card card" @click="viewCourseDetails(course.id)">
    <div class="course-header" :class="{ 'has-background': course.backgroundImage }" :style="getBackgroundStyle()">
      <div class="course-image">
        <!-- Book Icon (only show if no background) -->
        <svg v-if="!course.backgroundImage" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <span>{{ course.enrolledStudents }} Studierende</span>
        </div>
        <div class="stat-item">
          <!-- Document Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <span>{{ course.totalLessons }} Lektionen</span>
        </div>
      </div>
      
      <div v-if="course.schedule" class="schedule-section">
        <div class="schedule-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="schedule-label">Unterrichtszeiten</span>
        </div>
        <div class="schedule-time">{{ course.schedule }}</div>
      </div>
      
      
      <div class="course-actions">
        <router-link :to="`/teacher/courses/${course.id}`" class="btn-primary course-action-btn" @click.stop>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Kurs verwalten
        </router-link>
        <router-link :to="`/teacher/edit-course/${course.id}`" class="btn-secondary course-action-btn" @click.stop>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          Bearbeiten
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
    getBackgroundStyle() {
      if (this.course.backgroundImage) {
        return {
          backgroundImage: `url(${this.course.backgroundImage})`
        }
      }
      return {}
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
  overflow: hidden;
}

.course-header.has-background {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.course-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
  position: relative;
  z-index: 2;
}

.course-header.has-background .course-image {
  background: rgba(0, 0, 0, 0.3);
}

.course-header.has-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
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
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.schedule-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--status-info);
  border: 1px solid var(--status-info-border);
  border-radius: 0.5rem;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.schedule-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--status-info-text);
}

.schedule-time {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--status-info-text);
  margin-left: 1.5rem;
}


.course-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.course-action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  gap: 0.5rem;
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