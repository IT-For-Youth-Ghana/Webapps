<template>
  <div class="course-card" @click="$emit('click', course.id)">
    <div class="course-image">
      <img :src="course.image" :alt="course.title" />
      <div class="course-overlay">
        <div class="course-badge" :class="course.level">
          {{ formatLevel(course.level) }}
        </div>
        <div v-if="course.featured" class="featured-badge">
          Featured
        </div>
      </div>
    </div>
    
    <div class="course-content">
      <h3 class="course-title">{{ course.title }}</h3>
      <p class="course-description">{{ course.description }}</p>
      
      <!-- Progress (if available) -->
      <div v-if="course.progress !== undefined" class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: course.progress + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ course.progress }}%</span>
      </div>
      
      <!-- Slot for custom actions -->
      <div class="course-actions">
        <slot name="action"></slot>
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
  emits: ['click'],
  methods: {
    formatLevel(level) {
      const levels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
      return levels[level] || level
    }
  }
}
</script>

<style scoped>
.course-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.course-image {
  position: relative;
  height: 160px;
  overflow: hidden;
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
  background: var(--primary);
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0;
}

.course-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 3rem;
  text-align: right;
}

.course-actions {
  margin-top: auto;
}

@media (max-width: 768px) {
  .course-content {
    padding: 1rem;
  }
  
  .course-title {
    font-size: 1rem;
  }
  
  .course-description {
    font-size: 0.8rem;
  }
}
</style>