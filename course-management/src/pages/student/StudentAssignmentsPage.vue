<template>
  <div class="assignments-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">📝 My Assignments</h1>
        <p class="page-subtitle">Track and submit your assignments across all courses</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="viewCalendar">
          <span class="btn-icon">📅</span>
          Calendar View
        </button>
      </div>
    </div>

    <!-- Filter and Stats -->
    <div class="assignments-filters">
      <div class="filter-tabs">
        <button 
          v-for="filter in filters"
          :key="filter.id"
          class="filter-btn"
          :class="{ active: activeFilter === filter.id }"
          @click="activeFilter = filter.id"
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          <span class="filter-label">{{ filter.label }}</span>
          <span class="filter-count">{{ filter.count }}</span>
        </button>
      </div>
      
      <div class="quick-stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalAssignments }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pendingSubmissions }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ gradedCount }}</span>
          <span class="stat-label">Graded</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ averageGrade }}%</span>
          <span class="stat-label">Avg Grade</span>
        </div>
      </div>
    </div>

    <!-- Assignments Grid -->
    <div class="assignments-grid">
      <div 
        v-for="assignment in filteredAssignments"
        :key="assignment.id"
        class="assignment-card glass-card"
        :class="{ 
          'overdue': isOverdue(assignment.dueDate),
          'graded': assignment.grade !== null
        }"
        @click="viewAssignment(assignment.id)"
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
            <span class="due-icon">⏰</span>
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
              <span class="status-icon" :class="assignment.submission.status">
                {{ getStatusIcon(assignment.submission.status) }}
              </span>
              <span class="status-text">
                {{ formatStatus(assignment.submission.status) }}
              </span>
              <span class="submission-date">
                Submitted {{ formatDate(assignment.submission.submittedAt) }}
              </span>
            </div>
            <div v-else class="no-submission">
              <span class="status-icon">📝</span>
              <span class="status-text">Not submitted</span>
            </div>
          </div>

          <!-- Grade Display -->
          <div v-if="assignment.grade !== null" class="grade-display">
            <div class="grade-circle">
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
            @click.stop="submitAssignment(assignment.id)"
          >
            Submit Assignment
          </button>
          
          <button 
            v-else-if="assignment.submission"
            class="btn btn-secondary"
            @click.stop="viewSubmission(assignment.submission.id)"
          >
            View Submission
          </button>
          
          <button 
            class="btn btn-outline"
            @click.stop="viewDetails(assignment.id)"
          >
            View Details
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredAssignments.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">No {{ getFilterLabel() }} Assignments</h3>
        <p class="empty-description">{{ getEmptyDescription() }}</p>
        <button class="btn btn-primary" @click="browseCourses">
          Browse Courses
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'StudentAssignmentsPage',
  setup() {
    const router = useRouter()
    const activeFilter = ref('all')
    
    // Mock assignments data
    const assignments = ref([
      {
        id: 1,
        title: 'JavaScript Fundamentals Quiz',
        description: 'Test your knowledge of basic JavaScript concepts including variables, functions, and data types',
        courseName: 'Web Development Fundamentals',
        type: 'quiz',
        maxPoints: 50,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        status: 'graded',
        grade: 42,
        submission: {
          id: 1,
          status: 'graded',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          files: ['quiz-results.json'],
          grade: 42,
          feedback: 'Good understanding of concepts. Review array methods for better score.'
        }
      },
      {
        id: 2,
        title: 'Personal Portfolio Website',
        description: 'Create a personal portfolio website showcasing your web development skills',
        courseName: 'Web Development Fundamentals',
        type: 'project',
        maxPoints: 100,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'submitted',
        grade: null,
        submission: {
          id: 2,
          status: 'submitted',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          files: ['portfolio.zip', 'readme.md', 'screenshot.png'],
          grade: null
        }
      },
      {
        id: 3,
        title: 'Vue.js Component Development',
        description: 'Build a reusable Vue.js component with props, events, and slots',
        courseName: 'Vue.js Complete Guide',
        type: 'assignment',
        maxPoints: 75,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        status: 'not_started',
        grade: null
      },
      {
        id: 4,
        title: 'React vs Vue Comparison Essay',
        description: 'Write a 1000-word essay comparing React and Vue.js frameworks',
        courseName: 'Advanced Web Development',
        type: 'essay',
        maxPoints: 60,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        status: 'not_started',
        grade: null
      },
      {
        id: 5,
        title: 'Database Design Final Project',
        description: 'Design and implement a complete database schema for an e-commerce application',
        courseName: 'Database Design',
        type: 'project',
        maxPoints: 150,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        status: 'not_started',
        grade: null
      }
    ])
    
    // Filters
    const filters = computed(() => [
      {
        id: 'all',
        label: 'All',
        icon: '📋',
        count: assignments.value.length
      },
      {
        id: 'pending',
        label: 'Pending',
        icon: '⏳',
        count: assignments.value.filter(a => !a.submission || a.submission.status === 'draft').length
      },
      {
        id: 'submitted',
        label: 'Submitted',
        icon: '✅',
        count: assignments.value.filter(a => a.submission && a.submission.status === 'submitted').length
      },
      {
        id: 'graded',
        label: 'Graded',
        icon: '✨',
        count: assignments.value.filter(a => a.grade !== null).length
      },
      {
        id: 'overdue',
        label: 'Overdue',
        icon: '⚠️',
        count: assignments.value.filter(a => isOverdue(a.dueDate) && (!a.submission || a.submission.status === 'draft')).length
      }
    ])
    
    // Computed properties
    const filteredAssignments = computed(() => {
      switch (activeFilter.value) {
        case 'pending':
          return assignments.value.filter(a => !a.submission || a.submission.status === 'draft')
        case 'submitted':
          return assignments.value.filter(a => a.submission && a.submission.status === 'submitted')
        case 'graded':
          return assignments.value.filter(a => a.grade !== null)
        case 'overdue':
          return assignments.value.filter(a => isOverdue(a.dueDate) && (!a.submission || a.submission.status === 'draft'))
        default:
          return assignments.value
      }
    })
    
    const totalAssignments = computed(() => assignments.value.length)
    const pendingSubmissions = computed(() => assignments.value.filter(a => !a.submission || a.submission.status === 'draft').length)
    const gradedCount = computed(() => assignments.value.filter(a => a.grade !== null).length)
    const averageGrade = computed(() => {
      const graded = assignments.value.filter(a => a.grade !== null)
      if (graded.length === 0) return 0
      const total = graded.reduce((sum, a) => sum + a.grade, 0)
      return Math.round((total / graded.length / assignments.value.reduce((sum, a) => sum + a.maxPoints, 0)) * 100)
    })
    
    // Methods
    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date()
    }
    
    const formatType = (type) => {
      const types = {
        quiz: 'Quiz',
        assignment: 'Assignment',
        project: 'Project',
        essay: 'Essay'
      }
      return types[type] || type
    }
    
    const formatDate = (date) => {
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
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        draft: '📝',
        submitted: '📤',
        graded: '✅',
        late: '⚠️'
      }
      return icons[status] || '📝'
    }
    
    const formatStatus = (status) => {
      const statuses = {
        draft: 'Draft',
        submitted: 'Submitted',
        graded: 'Graded',
        late: 'Late'
      }
      return statuses[status] || status
    }
    
    const getFilterLabel = () => {
      const filter = filters.value.find(f => f.id === activeFilter.value)
      return filter ? filter.label : 'All'
    }
    
    const getEmptyDescription = () => {
      switch (activeFilter.value) {
        case 'pending':
          return 'You have no pending assignments. Keep learning to stay ahead!'
        case 'submitted':
          return 'You haven\'t submitted any assignments yet. Start working on your tasks!'
        case 'graded':
          return 'Your graded assignments will appear here once they\'re reviewed.'
        case 'overdue':
          return 'No overdue assignments! Great job staying on track.'
        default:
          return 'No assignments available. Enroll in courses to get started!'
      }
    }
    
    const submitAssignment = (assignmentId) => {
      console.log('Submitting assignment:', assignmentId)
      router.push(`/assignments/${assignmentId}/submit`)
    }
    
    const viewSubmission = (submissionId) => {
      console.log('Viewing submission:', submissionId)
      router.push(`/submissions/${submissionId}`)
    }
    
    const viewDetails = (assignmentId) => {
      console.log('Viewing assignment details:', assignmentId)
      router.push(`/assignments/${assignmentId}`)
    }
    
    const viewCalendar = () => {
      router.push('/assignments/calendar')
    }
    
    const browseCourses = () => {
      router.push('/courses/list')
    }
    
    return {
      activeFilter,
      filters,
      filteredAssignments,
      totalAssignments,
      pendingSubmissions,
      gradedCount,
      averageGrade,
      isOverdue,
      formatType,
      formatDate,
      getStatusIcon,
      formatStatus,
      getFilterLabel,
      getEmptyDescription,
      submitAssignment,
      viewSubmission,
      viewDetails,
      viewCalendar,
      browseCourses
    }
  }
}
</script>

<style scoped>
.assignments-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.assignments-filters {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  overflow-x: auto;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--brand-primary);
  color: white;
}

.filter-icon {
  font-size: 1rem;
}

.filter-label {
  font-size: 0.9rem;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.quick-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  min-width: 100px;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.assignment-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.assignment-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.assignment-card.overdue {
  border-left-color: #ef4444;
}

.assignment-card.graded {
  border-left-color: #10b981;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.course-info {
  flex: 1;
}

.assignment-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.course-name {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin: 0;
}

.assignment-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.assignment-type {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.assignment-type.quiz {
  background: #8b5cf6;
}

.assignment-type.assignment {
  background: #3b82f6;
}

.assignment-type.project {
  background: #10b981;
}

.assignment-type.essay {
  background: #f59e0b;
}

.assignment-points {
  padding: 0.25rem 0.75rem;
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.assignment-content {
  margin-bottom: 1.5rem;
}

.assignment-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.due-icon {
  font-size: 1rem;
  color: var(--text-tertiary);
}

.due-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.overdue-badge {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
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
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.no-submission {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
}

.status-icon {
  font-size: 1.1rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-text {
  font-weight: 500;
  font-size: 0.9rem;
}

.submission-date {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.grade-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.grade-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.grade-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-primary);
}

.grade-max {
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.grade-percentage {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.assignment-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--brand-secondary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.btn-outline {
  background: transparent;
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.btn-outline:hover {
  background: var(--brand-primary);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .assignments-page {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .assignments-filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .quick-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-item {
    min-width: 80px;
  }
  
  .assignments-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .assignment-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .assignment-meta {
    flex-wrap: wrap;
  }
  
  .assignment-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filter-tabs {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-btn {
    justify-content: center;
  }
  
  .assignment-content {
    padding: 1rem;
  }
  
  .due-date {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .grade-display {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>