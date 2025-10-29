<template>
  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">Active Courses</h2>
      <router-link to="/teacher/courses" class="view-all-link">
        View All
      </router-link>
    </div>
    
    <div class="course-grid">
      <div v-for="course in courses" :key="course.id" class="course-card card">
        <div class="course-header">
          <div class="course-image">
            <component :is="course.icon" class="w-12 h-12" />
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
              <span>{{ course.assignments }}</span>
            </div>
            <div class="stat-item">
              <ClockIcon class="w-4 h-4" />
              <span>{{ course.duration }}</span>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">Course Progress</span>
              <span class="progress-value">{{ course.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
            </div>
          </div>
          
          <div class="course-actions">
            <router-link :to="`/teacher/edit-course/${course.id}`" class="btn-secondary btn-sm">
              <PencilIcon class="w-4 h-4" />
              Edit
            </router-link>
            <router-link :to="`/teacher/analytics/${course.id}`" class="btn-primary btn-sm">
              <ChartBarIcon class="w-4 h-4" />
              Analytics
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { BookOpenIcon, UserGroupIcon, DocumentTextIcon, ChartBarIcon, ClockIcon, PencilIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ActiveCourses',
  components: {
    BookOpenIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ClockIcon,
    PencilIcon
  },
  data() {
    return {
      courses: [
        {
          id: 1,
          title: 'Web Development Fundamentals',
          description: 'Complete guide to HTML, CSS, JavaScript and modern web development',
          status: 'active',
          enrolledStudents: 45,
          assignments: 8,
          duration: '12 weeks',
          progress: 75,
          icon: 'BookOpenIcon'
        },
        {
          id: 2,
          title: 'Advanced Vue.js',
          description: 'Master Vue.js with composition API, state management and testing',
          status: 'active',
          enrolledStudents: 32,
          assignments: 6,
          duration: '10 weeks',
          progress: 60,
          icon: 'BookOpenIcon'
        },
        {
          id: 3,
          title: 'Database Design',
          description: 'Learn database modeling, SQL optimization and best practices',
          status: 'draft',
          enrolledStudents: 0,
          assignments: 3,
          duration: '8 weeks',
          progress: 30,
          icon: 'BookOpenIcon'
        }
      ]
    }
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        'active': 'Active',
        'draft': 'Draft',
        'archived': 'Archived'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.content-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.view-all-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: var(--brand-accent);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  overflow: hidden;
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
  text-decoration: none;
  transition: all 0.2s ease;
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
  text-decoration: none;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
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