<template>
  <div class="course-card card" @click="viewCourseDetails(course.id)">
    <div class="course-header">
      <div class="course-image">
        <BookOpenIcon class="w-12 h-12" />
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
          <UserGroupIcon class="w-4 h-4" />
          <span>{{ course.enrolledStudents }}</span>
        </div>
        <div class="stat-item">
          <DocumentTextIcon class="w-4 h-4" />
          <span>{{ course.totalLessons }}</span>
        </div>
        <div class="stat-item">
          <ClockIcon class="w-4 h-4" />
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
        <router-link :to="`/teacher/courses/${course.id}/edit`" class="btn-secondary btn-sm" @click.stop>
          <PencilIcon class="w-4 h-4" />
          Edit
        </router-link>
        <router-link :to="`/teacher/courses/${course.id}/analytics`" class="btn-primary btn-sm" @click.stop>
          <ChartBarIcon class="w-4 h-4" />
          Analytics
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { BookOpenIcon, UserGroupIcon, DocumentTextIcon, ClockIcon, PencilIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CourseCard',
  components: {
    BookOpenIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ClockIcon,
    PencilIcon,
    ChartBarIcon
  },
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
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.course-header {
  position: relative;
  height: 120px;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
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
}

.course-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.course-status.active {
  background: var(--status-success);
}

.course-status.draft {
  background: var(--status-warning);
}

.course-status.completed {
  background: var(--text-secondary);
}

.course-status.archived {
  background: var(--status-error);
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
  gap: 1rem;
  margin-bottom: 1rem;
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-weight: 500;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  justify-content: center;
}

.btn-primary:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--interactive-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.75rem;
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  justify-content: center;
}

.btn-secondary:hover {
  background: var(--interactive-tertiary-hover);
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  gap: 0.25rem;
}
</style>