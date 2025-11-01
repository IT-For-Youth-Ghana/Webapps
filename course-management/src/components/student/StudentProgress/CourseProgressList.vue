<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Course Progress</h2>
    </div>
    
    <div class="courses-progress">
      <div 
        v-for="course in courseProgress"
        :key="course.id"
        class="course-progress-card"
      >
        <div class="course-header">
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-instructor">{{ course.instructor }}</p>
          </div>
          <div class="course-status" :class="course.status">
            {{ formatStatus(course.status) }}
          </div>
        </div>
        
        <div class="progress-details">
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: course.progress + '%' }"
              ></div>
            </div>
            <span class="progress-percentage">{{ course.progress }}%</span>
          </div>
          
          <div class="course-metrics">
            <div class="metric">
              <span class="metric-label">Lessons:</span>
              <span class="metric-value">{{ course.completedLessons }}/{{ course.totalLessons }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Assignments:</span>
              <span class="metric-value">{{ course.completedAssignments }}/{{ course.totalAssignments }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Study Time:</span>
              <span class="metric-value">{{ course.studyTime }}h</span>
            </div>
          </div>
        </div>
        
        <div class="course-actions">
          <button 
            v-if="course.status === 'in_progress'"
            class="quick-action-btn primary"
            @click="$emit('continue-course', course.id)"
          >
            Continue Learning
          </button>
          <button 
            v-else-if="course.status === 'completed'"
            class="quick-action-btn"
            @click="$emit('view-certificate', course.id)"
          >
            View Certificate
          </button>
          <button 
            v-else
            class="quick-action-btn"
            @click="$emit('start-course', course.id)"
          >
            Start Course
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseProgressList',
  props: {
    courseProgress: {
      type: Array,
      default: () => []
    }
  },
  emits: ['continue-course', 'start-course', 'view-certificate'],
  methods: {
    formatStatus(status) {
      const statusMap = {
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'not_started': 'Not Started'
      }
      return statusMap[status] || status
    }
  }
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

.courses-progress {
  display: grid;
  gap: 1.5rem;
}

.course-progress-card {
  padding: 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.course-progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.course-info {
  flex: 1;
}

.course-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.course-instructor {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin: 0;
}

.course-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.course-status.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.course-status.in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.course-status.not_started {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.progress-details {
  margin-bottom: 1.5rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 3rem;
  text-align: right;
}

.course-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.course-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

@media (max-width: 768px) {
  .quick-actions-section {
    padding: 1rem;
  }
  
  .course-progress-card {
    padding: 1.5rem;
  }
  
  .course-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .course-metrics {
    grid-template-columns: 1fr;
  }
  
  .course-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>