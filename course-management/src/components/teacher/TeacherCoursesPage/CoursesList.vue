<template>
  <div class="content-section">
    <div class="section-header">
      <h2 class="section-title">Your Courses ({{ courses.length }})</h2>
      <router-link to="/teacher/courses" class="view-all-link">
        View All
      </router-link>
    </div>
    
    <div 
      v-if="courses.length === 0"
      class="empty-state"
    >
      <BookOpenIcon class="w-16 h-16 empty-icon" />
      <h3 class="empty-title">No courses found</h3>
      <p class="empty-description">
        Try adjusting your filters or search terms
      </p>
      <button class="btn-primary" @click="$emit('create-course')">
        <PlusIcon class="w-5 h-5" />
        Create Your First Course
      </button>
    </div>
    
    <div 
      v-else
      class="course-grid"
    >
      <CourseCard 
        v-for="course in courses" 
        :key="course.id"
        :course="course"
      />
    </div>
  </div>
</template>

<script>
import CourseCard from './CourseCard.vue'
import { BookOpenIcon, PlusIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CoursesList',
  components: {
    CourseCard,
    BookOpenIcon,
    PlusIcon
  },
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  emits: ['create-course']
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
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
</style>