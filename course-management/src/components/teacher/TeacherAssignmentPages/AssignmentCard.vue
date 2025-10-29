<template>
  <div class="assignment-card card" :class="{ 'overdue': isOverdue(assignment.dueDate) }">
    <div class="assignment-header">
      <div class="assignment-type" :class="assignment.type">
        <DocumentTextIcon v-if="assignment.type === 'essay'" class="w-5 h-5" />
        <ChartBarIcon v-else-if="assignment.type === 'quiz'" class="w-5 h-5" />
        <AcademicCapIcon v-else-if="assignment.type === 'project'" class="w-5 h-5" />
        <PencilIcon v-else class="w-5 h-5" />
      </div>
      <div class="assignment-status" :class="assignment.status">
        {{ formatStatus(assignment.status) }}
      </div>
    </div>
    
    <div class="assignment-content">
      <h3 class="assignment-title">{{ assignment.title }}</h3>
      <p class="assignment-course">{{ getCourseTitle(assignment.courseId) }}</p>
      <p class="assignment-description">{{ assignment.description }}</p>
      
      <div class="assignment-meta">
        <div class="meta-row">
          <span class="meta-item">
            <ClockIcon class="w-4 h-4" />
            Due: {{ formatDate(assignment.dueDate) }}
          </span>
          <span class="meta-item">
            <ClockIcon class="w-4 h-4" />
            {{ assignment.duration }} min
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-item">
            <UserGroupIcon class="w-4 h-4" />
            {{ assignment.submissions }}/{{ assignment.totalStudents }} submitted
          </span>
          <span class="meta-item">
            <StarIcon class="w-4 h-4" />
            {{ assignment.maxPoints }} points
          </span>
        </div>
      </div>
      
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Submission Progress</span>
          <span class="progress-value">{{ getSubmissionPercentage(assignment) }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: getSubmissionPercentage(assignment) + '%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <div class="assignment-actions">
      <button class="btn-secondary btn-sm" @click="$emit('view-submissions', assignment.id)">
        <UserGroupIcon class="w-4 h-4" />
        View Submissions
      </button>
      <button class="btn-secondary btn-sm" @click="$emit('edit', assignment.id)">
        <PencilIcon class="w-4 h-4" />
        Edit
      </button>
      <button class="btn-primary btn-sm" @click="$emit('grade', assignment.id)">
        <ChartBarIcon class="w-4 h-4" />
        Grade
      </button>
    </div>
  </div>
</template>

<script>
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  AcademicCapIcon, 
  PencilIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'AssignmentCard',
  components: {
    DocumentTextIcon,
    ChartBarIcon,
    AcademicCapIcon,
    PencilIcon,
    ClockIcon,
    UserGroupIcon,
    StarIcon
  },
  props: {
    assignment: {
      type: Object,
      required: true
    }
  },
  emits: ['view-submissions', 'edit', 'grade'],
  data() {
    return {
      courses: [
        { id: 1, title: 'Web Development Fundamentals' },
        { id: 2, title: 'Advanced Vue.js' },
        { id: 3, title: 'Database Design' }
      ]
    }
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        'draft': 'Draft',
        'published': 'Published',
        'closed': 'Closed',
        'graded': 'Graded'
      }
      return statusMap[status] || status
    },
    getCourseTitle(courseId) {
      const course = this.courses.find(c => c.id === courseId)
      return course ? course.title : 'Unknown Course'
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(date))
    },
    isOverdue(dueDate) {
      return new Date(dueDate) < new Date()
    },
    getSubmissionPercentage(assignment) {
      return Math.round((assignment.submissions / assignment.totalStudents) * 100)
    }
  }
}
</script>

<style scoped>
.assignment-card {
  overflow: hidden;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--border-hover);
}

.assignment-card.overdue {
  border-left: 3px solid var(--status-error);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);
}

.assignment-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  color: var(--text-secondary);
}

.assignment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--interactive-secondary);
  color: var(--text-inverse);
}

.assignment-content {
  padding: 1.5rem;
  background: var(--bg-primary);
}

.assignment-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.assignment-course {
  font-size: 0.875rem;
  color: var(--interactive-primary);
  font-weight: 500;
  margin: 0 0 1rem 0;
}

.assignment-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.assignment-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.progress-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
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
  background: var(--bg-secondary);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--interactive-primary);
  transition: width 0.3s ease;
}

.assignment-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
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