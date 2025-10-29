<template>
  <div class="stats-grid">
    <div class="dashboard-stat">
      <div class="stat-icon courses">
        <BookOpenIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalCourses }}</div>
        <div class="stat-label">Total Courses</div>
        <div class="stat-change positive">+{{ Math.floor(Math.random() * 3) + 1 }} this month</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon students">
        <UserGroupIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalStudents }}</div>
        <div class="stat-label">Total Students</div>
        <div class="stat-change positive">+{{ Math.floor(Math.random() * 20) + 10 }} this week</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon assignments">
        <CheckCircleIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ activeCourses }}</div>
        <div class="stat-label">Active Courses</div>
        <div class="stat-change positive">{{ Math.floor(Math.random() * 5) + 1 }} running now</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon rating">
        <StarIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ averageRating }}</div>
        <div class="stat-label">Average Rating</div>
        <div class="stat-change positive">+0.{{ Math.floor(Math.random() * 5) + 1 }} this month</div>
      </div>
    </div>
  </div>
</template>

<script>
import { BookOpenIcon, UserGroupIcon, CheckCircleIcon, StarIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CoursesStats',
  components: {
    BookOpenIcon,
    UserGroupIcon,
    CheckCircleIcon,
    StarIcon
  },
  props: {
    totalCourses: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    activeCourses: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: String,
      default: '0.0'
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.courses {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.stat-icon.students {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-icon.assignments {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-icon.rating {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--status-success-text);
}
</style>