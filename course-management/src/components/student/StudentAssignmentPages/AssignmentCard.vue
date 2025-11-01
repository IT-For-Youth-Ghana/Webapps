<template>
  <div 
    class="assignment-card"
    :class="{ 
      'overdue': isOverdue(assignment.dueDate),
      'graded': assignment.grade !== null
    }"
    @click="$emit('click', assignment.id)"
  >
    <!-- Assignment Header -->
    <div class="assignment-header">
      <div class="course-info">
        <h3 class="assignment-title">{{ assignment.title }}</h3>
        <p class="course-name">{{ assignment.courseName }}</p>
      </div>
      <div class="assignment-meta">
        <div class="assignment-type" :class="assignment.type">
          {{ formatType(assignment.type) }}
        </div>
        <div class="assignment-points">
          {{ assignment.maxPoints }} pts
        </div>
      </div>
    </div>

    <!-- Assignment Content -->
    <div class="assignment-content">
      <p class="assignment-description">{{ assignment.description }}</p>
      
      <!-- Due Date -->
      <div class="due-date">
        <span class="due-text">
          Due: {{ formatDate(assignment.dueDate) }}
        </span>
        <span v-if="isOverdue(assignment.dueDate)" class="overdue-badge">
          OVERDUE
        </span>
      </div>

      <!-- Status -->
      <div class="assignment-status">
        <div v-if="assignment.submission" class="submission-status">
          <span class="status-indicator" :class="assignment.submission.status">
          </span>
          <span class="status-text">
            {{ formatStatus(assignment.submission.status) }}
          </span>
          <span class="submission-date">
            Submitted {{ formatDate(assignment.submission.submittedAt) }}
          </span>
        </div>
        <div v-else class="no-submission">
          <span class="status-indicator not-submitted"></span>
          <span class="status-text">Not submitted</span>
        </div>
      </div>

      <!-- Grade Display -->
      <div v-if="assignment.grade !== null" class="grade-display">
        <div class="grade-info">
          <span class="grade-value">{{ assignment.grade }}</span>
          <span class="grade-max">/ {{ assignment.maxPoints }}</span>
        </div>
        <div class="grade-percentage">
          {{ Math.round((assignment.grade / assignment.maxPoints) * 100) }}%
        </div>
      </div>
    </div>

    <!-- Assignment Actions -->
    <div class="assignment-actions">
      <button 
        v-if="!assignment.submission && !isOverdue(assignment.dueDate)"
        class="btn btn-primary"
        @click.stop="$emit('submit', assignment.id)"
      >
        Submit Assignment
      </button>
      
      <button 
        v-else-if="assignment.submission"
        class="btn btn-secondary"
        @click.stop="$emit('view-submission', assignment.submission.id)"
      >
        View Submission
      </button>
      
      <button 
        class="btn btn-outline"
        @click.stop="$emit('view-details', assignment.id)"
      >
        View Details
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
  emits: ['click', 'submit', 'view-submission', 'view-details'],
  methods: {
    isOverdue(dueDate) {
      return new Date(dueDate) < new Date()
    },
    
    formatType(type) {
      const types = {
        quiz: 'Quiz',
        assignment: 'Assignment',
        project: 'Project',
        essay: 'Essay'
      }
      return types[type] || type
    },
    
    formatDate(date) {
      const now = new Date()
      const assignmentDate = new Date(date)
      const diff = assignmentDate - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60))
          return `${minutes} min${minutes > 1 ? 's' : ''} left`
        }
        return `${hours} hour${hours > 1 ? 's' : ''} left`
      } else if (days === 1) {
        return 'Tomorrow'
      } else if (days < 7) {
        return `${days} days`
      } else {
        return assignmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    },
    
    formatStatus(status) {
      const statuses = {
        draft: 'Draft',
        submitted: 'Submitted',
        graded: 'Graded',
        late: 'Late'
      }
      return statuses[status] || status
    }
  }
}
</script>

<style scoped>
.assignment-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-primary);
}

.assignment-card.overdue {
  border-left: 4px solid #ef4444;
}

.assignment-card.graded {
  border-left: 4px solid #10b981;
}

.assignment-header {
  margin-bottom: 1rem;
}

.assignment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.course-name {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.assignment-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.assignment-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.assignment-points {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.assignment-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.due-date {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.due-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.overdue-badge {
  padding: 0.25rem 0.5rem;
  background: var(--text-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
}

.assignment-status {
  margin-bottom: 1rem;
}

.submission-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.no-submission {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--text-secondary);
}

.status-indicator.submitted {
  background: var(--primary);
}

.status-indicator.graded {
  background: var(--text-primary);
}

.status-indicator.late {
  background: var(--text-secondary);
}

.status-indicator.not-submitted {
  background: var(--text-secondary);
}

.status-text {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.submission-date {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.grade-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.grade-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.grade-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.grade-max {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.grade-percentage {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.assignment-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

@media (max-width: 768px) {
  .assignment-card {
    padding: 1rem;
  }
  
  .assignment-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .grade-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .assignment-actions {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .assignment-card {
    padding: 0.75rem;
  }
  
  .assignment-title {
    font-size: 1rem;
  }
  
  .course-name {
    font-size: 0.8rem;
  }
  
  .assignment-description {
    font-size: 0.8rem;
  }
  
  .due-date {
    padding: 0.5rem;
  }
  
  .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>