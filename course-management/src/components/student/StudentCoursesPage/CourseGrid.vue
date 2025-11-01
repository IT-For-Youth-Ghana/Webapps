<template>
  <div class="course-grid">
    <div 
      v-for="course in courses"
      :key="course.id"
      class="course-card"
      :class="{ 'completed': course.progress === 100 }"
    >
      <!-- Course Header -->
      <div class="course-header">
        <div class="course-image">
          <img :src="course.image" :alt="course.title" />
          <div class="course-overlay">
            <div class="course-badge" :class="course.level">
              {{ formatLevel(course.level) }}
            </div>
            <div v-if="course.featured" class="featured-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Featured
            </div>
          </div>
        </div>
      </div>

      <!-- Course Content -->
      <div class="course-content">
        <h3 class="course-title">{{ course.title }}</h3>
        <p class="course-description">{{ course.description }}</p>
        
        <!-- Instructor Info -->
        <div class="instructor-info">
          <div class="instructor-avatar">
            <img :src="course.instructor.avatar" :alt="course.instructor.name" />
          </div>
          <div class="instructor-details">
            <span class="instructor-name">{{ course.instructor.name }}</span>
            <span class="instructor-title">{{ course.instructor.title }}</span>
          </div>
        </div>

        <!-- Course Stats -->
        <div class="course-stats">
          <div class="stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span class="stat-value">{{ course.rating }}/5</span>
            <span class="stat-label">Rating</span>
          </div>
          <div class="stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span class="stat-value">{{ course.duration }}</span>
            <span class="stat-label">Duration</span>
          </div>
          <div class="stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span class="stat-value">{{ course.modules }}</span>
            <span class="stat-label">Modules</span>
          </div>
        </div>

        <!-- Progress Section -->
        <div v-if="course.progress !== undefined" class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Progress</span>
            <span class="progress-value">{{ course.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :class="getProgressClass(course.progress)"
              :style="{ width: course.progress + '%' }"
            ></div>
          </div>
          <div v-if="course.lastAccessed" class="last-accessed">
            Last accessed: {{ formatDate(course.lastAccessed) }}
          </div>
        </div>

        <!-- Status Badge -->
        <div v-if="course.status" class="status-badge" :class="course.status">
          {{ formatStatus(course.status) }}
        </div>
      </div>

      <!-- Course Actions -->
      <div class="course-actions">
        <button 
          v-if="course.progress < 100"
          class="action-btn primary"
          @click="$emit('continue-course', course.id)"
        >
          Continue Learning
        </button>
        <button 
          v-else
          class="action-btn secondary"
          @click="$emit('review-course', course.id)"
        >
          Review Course
        </button>
        <button 
          class="action-btn outline"
          @click="$emit('view-details', course.id)"
        >
          View Details
        </button>
        <button 
          class="action-btn outline"
          @click="$emit('download-certificate', course.id)"
          v-if="course.progress === 100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
            <path d="M12 3v12"/>
            <path d="M5 20h14"/>
          </svg>
          Certificate
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseGrid',
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  emits: ['continue-course', 'review-course', 'view-details', 'download-certificate'],
  methods: {
    formatLevel(level) {
      const levels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
      return levels[level] || level
    },
    
    formatStatus(status) {
      const statuses = {
        in_progress: 'In Progress',
        completed: 'Completed',
        not_started: 'Not Started'
      }
      return statuses[status] || status
    },
    
    getProgressClass(progress) {
      if (progress < 33) return 'progress-low'
      if (progress < 66) return 'progress-medium'
      return 'progress-high'
    },
    
    formatDate(date) {
      const diff = new Date() - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 1) return 'Yesterday'
      if (days < 7) return `${days} days ago`
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
}
</script>

<style scoped>
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.course-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.course-card.completed {
  border-left: 4px solid #10b981;
}

.course-header {
  position: relative;
}

.course-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}

.course-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.course-badge.beginner {
  background: #10b981;
}

.course-badge.intermediate {
  background: #f59e0b;
}

.course-badge.advanced {
  background: #ef4444;
}

.featured-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}

.course-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.course-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex-grow: 1;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.instructor-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.instructor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instructor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.instructor-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.instructor-title {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.course-stats {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.stat-icon {
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-section {
  border-top: 1px solid var(--border-light);
  padding-top: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-value {
  font-weight: 600;
  color: var(--primary);
}

.progress-bar {
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.last-accessed {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
}

.status-badge {
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.course-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.875rem;
  flex: 1;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background: var(--primary-hover);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.action-btn.secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.action-btn.outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.action-btn.outline:hover {
  background: var(--primary);
  color: white;
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .course-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat {
    flex-direction: row;
    justify-content: center;
  }
  
  .course-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>