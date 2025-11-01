<template>
  <div class="assignment-card card" :class="{ 'overdue': isOverdue(assignment.dueDate) }">
    <div class="assignment-header">
      <div class="assignment-type" :class="assignment.type">
        <!-- Assignment Type Icons -->
        <svg v-if="assignment.type === 'essay'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <svg v-else-if="assignment.type === 'quiz'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg v-else-if="assignment.type === 'project'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
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
            <!-- Calendar Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Due: {{ formatDate(assignment.dueDate) }}
          </span>
          <span class="meta-item">
            <!-- Clock Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 12"/>
            </svg>
            {{ assignment.duration }} min
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-item">
            <!-- Users Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ assignment.submissions }}/{{ assignment.totalStudents }} submitted
          </span>
          <span class="meta-item">
            <!-- Star Icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
            </svg>
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
      <button class="quick-action-btn btn-sm" @click="$emit('view-submissions', assignment.id)">
        <!-- Users Icon -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        View Submissions
      </button>
      <button class="quick-action-btn btn-sm" @click="$emit('edit', assignment.id)">
        <!-- Pencil Icon -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
        Edit
      </button>
      <button class="quick-action-btn primary btn-sm" @click="$emit('grade', assignment.id)">
        <!-- Chart Bar Icon -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        Grade
      </button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AssignmentCard',
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
    },
    getAssignmentEmoji(type) {
      const emojiMap = {
        'essay': '📝',
        'quiz': '📊',
        'project': '🎓',
        'exercise': '✏️'
      }
      return emojiMap[type] || '📋'
    }
  }
}
</script>

<style scoped>
.assignment-card {
  overflow: hidden;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  gap: 0.25rem;
}
</style>