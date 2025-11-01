<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Recommended Courses</h2>
      <button class="quick-action-btn">
        <!-- Star Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26 12,2"/>
        </svg>
        Browse All
      </button>
    </div>
    
    <div class="courses-grid">
      <CourseCard 
        v-for="course in recommendedCourses"
        :key="course.id"
        :course="course"
        @click="$emit('view-course', course.id)"
      >
        <template #action>
          <button class="quick-action-btn">
            <!-- Eye Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Details
          </button>
        </template>
      </CourseCard>
    </div>
  </div>
</template>

<script>
import CourseCard from '../Shared/CourseCard.vue'

export default {
  name: 'RecommendedCourses',
  components: {
    CourseCard
  },
  props: {
    recommendedCourses: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-course']
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

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
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

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}

@media (max-width: 768px) {
  .quick-actions-section {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>