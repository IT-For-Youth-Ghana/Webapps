<template>
  <div class="course-card glass-card" :class="{ 'featured': course.featured }">
    <!-- Course Header -->
    <div class="course-header">
      <div class="course-image" v-if="course.image">
        <img :src="course.image" :alt="course.title" />
      </div>
      <div class="course-meta">
        <span class="course-level" :class="course.level">{{ formatLevel(course.level) }}</span>
        <span class="course-category">{{ course.category }}</span>
      </div>
    </div>
    
    <!-- Course Content -->
    <div class="course-content">
      <h3 class="course-title">{{ course.title }}</h3>
      <p class="course-description">{{ course.description }}</p>
      
      <!-- Course Stats -->
      <div class="course-stats">
        <div class="stat">
          <span class="stat-icon">⏱️</span>
          <span class="stat-value">{{ course.duration }}</span>
        </div>
        <div class="stat">
          <span class="stat-icon">📚</span>
          <span class="stat-value">{{ course.modules }} modules</span>
        </div>
        <div class="stat">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ course.rating }}/5</span>
        </div>
      </div>
      
      <!-- Instructor Info -->
      <div class="instructor" v-if="course.instructor">
        <div class="instructor-avatar">
          <img :src="course.instructor.avatar" :alt="course.instructor.name" />
        </div>
        <div class="instructor-info">
          <span class="instructor-name">{{ course.instructor.name }}</span>
          <span class="instructor-title">{{ course.instructor.title }}</span>
        </div>
      </div>
      
      <!-- Progress Bar (for enrolled courses) -->
      <div class="progress-section" v-if="course.progress !== undefined">
        <div class="progress-header">
          <span class="progress-label">Progress</span>
          <span class="progress-value">{{ course.progress }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: course.progress + '%' }"
            :class="getProgressClass(course.progress)"
          ></div>
        </div>
      </div>
      
      <!-- Enrollment Status -->
      <div class="enrollment-status" v-if="course.status">
        <span class="status-badge" :class="course.status">
          {{ formatStatus(course.status) }}
        </span>
      </div>
    </div>
    
    <!-- Course Actions -->
    <div class="course-actions">
      <button 
        class="btn btn-primary course-action-btn"
        @click="handlePrimaryAction"
        :disabled="isLoading"
      >
        <span class="btn-icon">{{ getPrimaryActionIcon() }}</span>
        <span class="btn-text">{{ getPrimaryActionText() }}</span>
      </button>
      
      <button 
        class="btn btn-secondary course-action-btn"
        @click="handleSecondaryAction"
        v-if="showSecondaryAction"
      >
        <span class="btn-icon">{{ getSecondaryActionIcon() }}</span>
        <span class="btn-text">{{ getSecondaryActionText() }}</span>
      </button>
    </div>
    
    <!-- Featured Badge -->
    <div class="featured-badge" v-if="course.featured">
      <span class="badge-icon">⭐</span>
      <span class="badge-text">Featured</span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true,
      validator: (course) => {
        return course.id && course.title && course.description
      }
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['enroll', 'continue', 'view-details', 'bookmark', 'share'],
  setup(props, { emit }) {
    const isLoading = ref(false)
    
    // Format course level
    const formatLevel = (level) => {
      const levels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
      return levels[level] || level
    }
    
    // Format enrollment status
    const formatStatus = (status) => {
      const statuses = {
        enrolled: 'Enrolled',
        completed: 'Completed',
        in_progress: 'In Progress',
        not_started: 'Not Started'
      }
      return statuses[status] || status
    }
    
    // Get progress class based on percentage
    const getProgressClass = (progress) => {
      if (progress < 25) return 'progress-low'
      if (progress < 75) return 'progress-medium'
      return 'progress-high'
    }
    
    // Get primary action icon
    const getPrimaryActionIcon = () => {
      if (props.course.progress !== undefined) {
        return '▶️' // Continue
      }
      return '📝' // Enroll
    }
    
    // Get primary action text
    const getPrimaryActionText = () => {
      if (props.course.progress !== undefined) {
        return props.course.progress > 0 ? 'Continue' : 'Start'
      }
      return 'Enroll Now'
    }
    
    // Get secondary action icon
    const getSecondaryActionIcon = () => {
      return 'ℹ️' // Details
    }
    
    // Get secondary action text
    const getSecondaryActionText = () => {
      return 'Details'
    }
    
    // Show secondary action?
    const showSecondaryAction = computed(() => {
      return !props.compact
    })
    
    // Handle primary action
    const handlePrimaryAction = async () => {
      if (isLoading.value) return
      
      isLoading.value = true
      
      try {
        if (props.course.progress !== undefined) {
          emit('continue', props.course)
        } else {
          emit('enroll', props.course)
        }
      } finally {
        setTimeout(() => {
          isLoading.value = false
        }, 1000)
      }
    }
    
    // Handle secondary action
    const handleSecondaryAction = () => {
      emit('view-details', props.course)
    }
    
    return {
      isLoading,
      formatLevel,
      formatStatus,
      getProgressClass,
      getPrimaryActionIcon,
      getPrimaryActionText,
      getSecondaryActionIcon,
      getSecondaryActionText,
      showSecondaryAction,
      handlePrimaryAction,
      handleSecondaryAction
    }
  }
}
</script>

<style scoped>
@import '../styles/shared.css';

.course-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.course-card.featured {
  border: 2px solid var(--brand-primary);
  box-shadow: 0 12px 40px rgba(37, 99, 235, 0.3);
}

.course-header {
  position: relative;
}

.course-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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

.course-meta {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.course-level,
.course-category {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.course-level {
  color: white;
}

.course-level.beginner {
  background: #10b981;
}

.course-level.intermediate {
  background: #f59e0b;
}

.course-level.advanced {
  background: #ef4444;
}

.course-category {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.course-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.course-description {
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
}

.course-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.stat-icon {
  font-size: 1rem;
}

.instructor {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.instructor-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
}

.instructor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instructor-info {
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

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.progress-label {
  color: var(--text-secondary);
}

.progress-value {
  font-weight: 600;
  color: var(--brand-primary);
}

.progress-bar {
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-sm);
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

.enrollment-status {
  margin-top: auto;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.status-badge.enrolled {
  background: rgba(37, 99, 235, 0.1);
  color: var(--brand-primary);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.course-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
}

.course-action-btn {
  flex: 1;
  justify-content: center;
  font-size: 0.9rem;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  color: white;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.badge-icon {
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .course-content {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .course-title {
    font-size: 1.1rem;
  }
  
  .course-stats {
    gap: 0.75rem;
  }
  
  .stat {
    font-size: 0.8rem;
  }
  
  .course-actions {
    padding: 1rem;
    flex-direction: column;
  }
  
  .course-action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .course-image {
    height: 120px;
  }
  
  .instructor {
    padding: 0.5rem;
  }
  
  .instructor-avatar {
    width: 2rem;
    height: 2rem;
  }
}

/* Loading States */
.course-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

.course-card.loading .btn {
  opacity: 0.5;
}

/* PWA Touch Optimizations */
@media (hover: none) {
  .course-action-btn:active {
    transform: scale(0.95);
  }
}
</style>