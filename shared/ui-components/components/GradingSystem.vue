<template>
  <div class="grading-system">
    <!-- Grading Header -->
    <div class="grading-header">
      <div class="header-info">
        <h2 class="page-title">Grading Center</h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">Submissions to Grade</span>
            <span class="stat-value">{{ pendingSubmissions.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Graded This Week</span>
            <span class="stat-value">{{ weeklyGradedCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Grade</span>
            <span class="stat-value">{{ averageGrade }}%</span>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <div class="view-toggle">
          <button 
            :class="['view-btn', { active: currentView === 'submissions' }]"
            @click="currentView = 'submissions'"
          >
            Submissions
          </button>
          <button 
            :class="['view-btn', { active: currentView === 'analytics' }]"
            @click="currentView = 'analytics'"
          >
            Analytics
          </button>
          <button 
            :class="['view-btn', { active: currentView === 'rubrics' }]"
            @click="currentView = 'rubrics'"
          >
            Rubrics
          </button>
        </div>
      </div>
    </div>

    <!-- Submissions View -->
    <div v-if="currentView === 'submissions'" class="submissions-view">
      <div class="submissions-filters">
        <div class="filter-group">
          <label>Course</label>
          <select v-model="selectedCourse" class="filter-select">
            <option value="all">All Courses</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Status</label>
          <select v-model="selectedStatus" class="filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Assignment</label>
          <select v-model="selectedAssignment" class="filter-select">
            <option value="all">All Assignments</option>
            <option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">
              {{ assignment.title }}
            </option>
          </select>
        </div>

        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search students..."
            class="search-input"
          />
        </div>
      </div>

      <div class="submissions-table">
        <div class="table-header">
          <div class="table-cell">Student</div>
          <div class="table-cell">Assignment</div>
          <div class="table-cell">Submitted</div>
          <div class="table-cell">Status</div>
          <div class="table-cell">Grade</div>
          <div class="table-cell">Actions</div>
        </div>

        <div 
          v-for="submission in filteredSubmissions" 
          :key="submission.id"
          class="table-row"
          :class="{ 'priority': submission.priority === 'high' }"
        >
          <div class="table-cell student-cell">
            <div class="student-info">
              <div class="student-avatar">
                {{ submission.student.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="student-name">{{ submission.student.name }}</div>
                <div class="student-id">{{ submission.student.id }}</div>
              </div>
            </div>
          </div>

          <div class="table-cell">
            <div class="assignment-info">
              <div class="assignment-title">{{ submission.assignment.title }}</div>
              <div class="assignment-course">{{ submission.assignment.course }}</div>
            </div>
          </div>

          <div class="table-cell">
            <div class="submission-time">
              {{ formatDate(submission.submittedAt) }}
            </div>
          </div>

          <div class="table-cell">
            <span :class="['status-badge', submission.status]">
              {{ submission.status }}
            </span>
          </div>

          <div class="table-cell">
            <div v-if="submission.grade !== null" class="grade-display">
              <span class="grade-value">{{ submission.grade }}%</span>
              <span class="grade-max">/ {{ submission.maxPoints }}</span>
            </div>
            <span v-else class="no-grade">—</span>
          </div>

          <div class="table-cell">
            <div class="action-buttons">
              <button @click="openGradingModal(submission)" class="action-btn primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Grade
              </button>
              <button @click="viewSubmission(submission)" class="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics View -->
    <div v-if="currentView === 'analytics'" class="analytics-view">
      <div class="analytics-grid">
        <div class="analytics-card">
          <h3>Grade Distribution</h3>
          <div class="chart-container">
            <div class="grade-bars">
              <div v-for="range in gradeRanges" :key="range.label" class="grade-bar-item">
                <div class="bar-label">{{ range.label }}</div>
                <div class="bar-track">
                  <div 
                    class="bar-fill" 
                    :style="{ width: range.percentage + '%', backgroundColor: range.color }"
                  ></div>
                </div>
                <div class="bar-count">{{ range.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <h3>Grading Progress</h3>
          <div class="progress-stats">
            <div class="progress-item">
              <div class="progress-circle">
                <svg width="80" height="80" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border-light)" stroke-width="2"/>
                  <circle 
                    cx="12" cy="12" r="10" 
                    fill="none" 
                    stroke="var(--primary)" 
                    stroke-width="2"
                    stroke-dasharray="62.8"
                    :stroke-dashoffset="62.8 - (62.8 * gradingProgress / 100)"
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <div class="progress-text">{{ gradingProgress }}%</div>
              </div>
              <div class="progress-label">Overall Progress</div>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rubrics View -->
    <div v-if="currentView === 'rubrics'" class="rubrics-view">
      <div class="rubrics-header">
        <h3>Grading Rubrics</h3>
        <button @click="showCreateRubricModal = true" class="btn btn-primary">
          Create Rubric
        </button>
      </div>

      <div class="rubrics-grid">
        <div 
          v-for="rubric in rubrics" 
          :key="rubric.id"
          class="rubric-card"
        >
          <div class="rubric-header">
            <h4>{{ rubric.title }}</h4>
            <div class="rubric-actions">
              <button @click="editRubric(rubric)" class="action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button @click="deleteRubric(rubric)" class="action-btn danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="rubric-description">
            {{ rubric.description }}
          </div>

          <div class="rubric-criteria">
            <div v-for="criterion in rubric.criteria" :key="criterion.id" class="criterion-item">
              <div class="criterion-name">{{ criterion.name }}</div>
              <div class="criterion-points">{{ criterion.maxPoints }} pts</div>
            </div>
          </div>

          <div class="rubric-footer">
            <span class="rubric-total">{{ getTotalPoints(rubric) }} total points</span>
            <span class="rubric-usage">Used in {{ rubric.usageCount }} assignments</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Grading Modal -->
    <div v-if="showGradingModal" class="modal-overlay" @click="closeGradingModal">
      <div class="grading-modal" @click.stop>
        <div class="modal-header">
          <h3>Grade Submission</h3>
          <button @click="closeGradingModal" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="submission-preview">
            <div class="preview-header">
              <h4>{{ currentSubmission?.assignment.title }}</h4>
              <div class="student-info">
                <span>{{ currentSubmission?.student.name }}</span>
                <span>{{ currentSubmission?.student.id }}</span>
              </div>
            </div>
            
            <div class="preview-content">
              <!-- File attachments, text content, etc. -->
              <div class="content-section">
                <h5>Submitted Content</h5>
                <div class="content-display">
                  {{ currentSubmission?.content || 'No content submitted' }}
                </div>
              </div>
            </div>
          </div>

          <div class="grading-section">
            <h4>Grading</h4>
            
            <!-- Points-based grading -->
            <div class="points-grading">
              <div class="points-input">
                <label>Grade Points</label>
                <div class="points-field">
                  <input 
                    v-model.number="gradingData.points" 
                    type="number" 
                    :max="currentSubmission?.maxPoints"
                    min="0"
                    class="points-input-field"
                  />
                  <span class="points-max">/ {{ currentSubmission?.maxPoints }}</span>
                </div>
              </div>

              <div class="percentage-display">
                {{ gradePercentage }}%
              </div>
            </div>

            <!-- Rubric-based grading -->
            <div v-if="selectedRubric" class="rubric-grading">
              <h5>Rubric Assessment</h5>
              <div 
                v-for="criterion in selectedRubric.criteria" 
                :key="criterion.id"
                class="rubric-criterion"
              >
                <div class="criterion-header">
                  <span class="criterion-name">{{ criterion.name }}</span>
                  <span class="criterion-points">{{ criterion.maxPoints }} pts</span>
                </div>
                <div class="criterion-levels">
                  <label 
                    v-for="level in criterion.levels" 
                    :key="level.id"
                    class="level-option"
                  >
                    <input
                      type="radio"
                      :name="'criterion-' + criterion.id"
                      :value="level.points"
                      v-model="gradingData.rubricScores[criterion.id]"
                    />
                    <div class="level-content">
                      <div class="level-name">{{ level.name }}</div>
                      <div class="level-description">{{ level.description }}</div>
                      <div class="level-points">{{ level.points }} pts</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Feedback -->
            <div class="feedback-section">
              <h5>Feedback</h5>
              <textarea
                v-model="gradingData.feedback"
                placeholder="Provide detailed feedback to the student..."
                class="feedback-textarea"
                rows="6"
              ></textarea>
            </div>

            <!-- Quick Feedback -->
            <div class="quick-feedback">
              <h5>Quick Feedback</h5>
              <div class="feedback-tags">
                <button 
                  v-for="tag in feedbackTags"
                  :key="tag"
                  @click="addFeedbackTag(tag)"
                  class="feedback-tag-btn"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="saveDraft" class="btn btn-secondary">Save Draft</button>
          <button @click="submitGrade" class="btn btn-primary">Submit Grade</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['grade-submitted', 'grade-draft-saved'])

// Reactive state
const currentView = ref('submissions')
const selectedCourse = ref('all')
const selectedStatus = ref('all')
const selectedAssignment = ref('all')
const searchQuery = ref('')
const showGradingModal = ref(false)
const showCreateRubricModal = ref(false)
const currentSubmission = ref(null)
const selectedRubric = ref(null)

const gradingData = ref({
  points: 0,
  feedback: '',
  rubricScores: {}
})

// Mock data
const submissions = ref([
  {
    id: 1,
    student: { name: 'Alice Johnson', id: 'STU001' },
    assignment: { 
      title: 'Essay Assignment', 
      course: 'English Literature',
      maxPoints: 100
    },
    submittedAt: new Date('2024-01-20T10:30:00'),
    status: 'pending',
    grade: null,
    priority: 'high',
    content: 'This is my essay submission about the themes in Shakespeare\'s works...'
  },
  {
    id: 2,
    student: { name: 'Bob Smith', id: 'STU002' },
    assignment: { 
      title: 'Math Problem Set', 
      course: 'Calculus',
      maxPoints: 50
    },
    submittedAt: new Date('2024-01-19T15:45:00'),
    status: 'graded',
    grade: 85,
    priority: 'normal',
    content: 'Problem 1 solution shown...'
  },
  {
    id: 3,
    student: { name: 'Carol White', id: 'STU003' },
    assignment: { 
      title: 'Lab Report', 
      course: 'Chemistry',
      maxPoints: 75
    },
    submittedAt: new Date('2024-01-18T09:15:00'),
    status: 'reviewed',
    grade: 92,
    priority: 'normal',
    content: 'Experimental results and analysis...'
  }
])

const courses = ref([
  { id: 1, name: 'English Literature' },
  { id: 2, name: 'Calculus' },
  { id: 3, name: 'Chemistry' }
])

const assignments = ref([
  { id: 1, title: 'Essay Assignment', course: 'English Literature' },
  { id: 2, title: 'Math Problem Set', course: 'Calculus' },
  { id: 3, title: 'Lab Report', course: 'Chemistry' }
])

const rubrics = ref([
  {
    id: 1,
    title: 'Essay Rubric',
    description: 'Standard rubric for academic essays',
    criteria: [
      {
        id: 1,
        name: 'Content & Ideas',
        maxPoints: 30,
        levels: [
          { id: 1, name: 'Excellent', description: 'Insightful ideas, strong evidence', points: 30 },
          { id: 2, name: 'Good', description: 'Clear ideas, adequate evidence', points: 25 },
          { id: 3, name: 'Satisfactory', description: 'Basic ideas, limited evidence', points: 20 }
        ]
      },
      {
        id: 2,
        name: 'Organization',
        maxPoints: 20,
        levels: [
          { id: 1, name: 'Excellent', description: 'Clear structure, logical flow', points: 20 },
          { id: 2, name: 'Good', description: 'Good structure, mostly logical', points: 15 },
          { id: 3, name: 'Satisfactory', description: 'Basic structure', points: 10 }
        ]
      }
    ],
    usageCount: 5
  }
])

const feedbackTags = ref([
  'Excellent work!',
  'Good analysis',
  'Needs improvement',
  'Check grammar',
  'Add more detail',
  'Great examples',
  'Unclear argument',
  'Strong thesis',
  'Well-structured',
  'Needs citations'
])

// Computed properties
const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  if (selectedCourse.value !== 'all') {
    filtered = filtered.filter(s => 
      s.assignment.course === courses.value.find(c => c.id === selectedCourse.value)?.name
    )
  }

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(s => s.status === selectedStatus.value)
  }

  if (selectedAssignment.value !== 'all') {
    filtered = filtered.filter(s => s.assignment.id === selectedAssignment.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.student.name.toLowerCase().includes(query) ||
      s.student.id.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => {
    // Priority items first
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (b.priority === 'high' && a.priority !== 'high') return 1
    // Then by date
    return b.submittedAt - a.submittedAt
  })
})

const pendingSubmissions = computed(() => {
  return submissions.value.filter(s => s.status === 'pending')
})

const weeklyGradedCount = computed(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return submissions.value.filter(s => 
    s.status === 'graded' && s.submittedAt >= oneWeekAgo
  ).length
})

const averageGrade = computed(() => {
  const gradedSubmissions = submissions.value.filter(s => s.grade !== null)
  if (gradedSubmissions.length === 0) return 0
  
  const total = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0)
  return Math.round(total / gradedSubmissions.length)
})

const gradePercentage = computed(() => {
  if (!currentSubmission.value || gradingData.value.points === 0) return 0
  return Math.round((gradingData.value.points / currentSubmission.value.maxPoints) * 100)
})

const gradingProgress = computed(() => {
  const total = submissions.value.length
  const graded = submissions.value.filter(s => s.status === 'graded' || s.status === 'reviewed').length
  return total > 0 ? Math.round((graded / total) * 100) : 0
})

const gradeRanges = computed(() => {
  const grades = submissions.value.filter(s => s.grade !== null).map(s => s.grade)
  const total = grades.length
  
  return [
    { label: 'A (90-100)', count: grades.filter(g => g >= 90).length, percentage: total > 0 ? (grades.filter(g => g >= 90).length / total) * 100 : 0, color: '#10b981' },
    { label: 'B (80-89)', count: grades.filter(g => g >= 80 && g < 90).length, percentage: total > 0 ? (grades.filter(g => g >= 80 && g < 90).length / total) * 100 : 0, color: '#3b82f6' },
    { label: 'C (70-79)', count: grades.filter(g => g >= 70 && g < 80).length, percentage: total > 0 ? (grades.filter(g => g >= 70 && g < 80).length / total) * 100 : 0, color: '#f59e0b' },
    { label: 'D (60-69)', count: grades.filter(g => g >= 60 && g < 70).length, percentage: total > 0 ? (grades.filter(g => g >= 60 && g < 70).length / total) * 100 : 0, color: '#ef4444' },
    { label: 'F (0-59)', count: grades.filter(g => g < 60).length, percentage: total > 0 ? (grades.filter(g => g < 60).length / total) * 100 : 0, color: '#6b7280' }
  ]
})

const recentActivity = computed(() => [
  {
    id: 1,
    text: `Graded ${submissions.value[1]?.student.name}'s submission`,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    text: `Reviewed ${submissions.value[2]?.student.name}'s assignment`,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 3,
    text: `Created new rubric for essays`,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
])

// Methods
const openGradingModal = (submission) => {
  currentSubmission.value = submission
  gradingData.value = {
    points: submission.grade || 0,
    feedback: '',
    rubricScores: {}
  }
  showGradingModal.value = true
}

const closeGradingModal = () => {
  showGradingModal.value = false
  currentSubmission.value = null
  selectedRubric.value = null
}

const viewSubmission = (submission) => {
  // Implement submission viewing logic
  console.log('Viewing submission:', submission.id)
}

const editRubric = (rubric) => {
  // Implement rubric editing logic
  console.log('Editing rubric:', rubric.id)
}

const deleteRubric = (rubric) => {
  if (confirm('Are you sure you want to delete this rubric?')) {
    const index = rubrics.value.findIndex(r => r.id === rubric.id)
    if (index > -1) {
      rubrics.value.splice(index, 1)
    }
  }
}

const addFeedbackTag = (tag) => {
  if (gradingData.value.feedback) {
    gradingData.value.feedback += ' ' + tag
  } else {
    gradingData.value.feedback = tag
  }
}

const saveDraft = () => {
  emit('grade-draft-saved', {
    submissionId: currentSubmission.value?.id,
    gradingData: gradingData.value
  })
  // Show save confirmation
}

const submitGrade = () => {
  if (!currentSubmission.value) return

  // Update submission
  const submission = submissions.value.find(s => s.id === currentSubmission.value.id)
  if (submission) {
    submission.grade = gradingData.value.points
    submission.status = 'graded'
  }

  emit('grade-submitted', {
    submissionId: currentSubmission.value.id,
    grade: gradingData.value.points,
    feedback: gradingData.value.feedback,
    rubricScores: gradingData.value.rubricScores
  })

  closeGradingModal()
}

const getTotalPoints = (rubric) => {
  return rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0)
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return 'Just now'
}
</script>

<style scoped>
.grading-system {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
}

.grading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.page-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
}

.view-toggle {
  display: flex;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 0.25rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.view-btn:hover {
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--primary);
  color: white;
}

.submissions-filters {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 150px;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.submissions-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-light);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--bg-secondary);
}

.table-row.priority {
  border-left: 4px solid #ef4444;
}

.table-cell {
  font-size: 0.875rem;
}

.student-cell {
  display: flex;
  align-items: center;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.student-name {
  font-weight: 500;
  color: var(--text-primary);
}

.student-id {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.assignment-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.assignment-course {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.graded {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.reviewed {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.grade-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.grade-value {
  font-weight: 600;
  color: var(--text-primary);
}

.grade-max {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.no-grade {
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--bg-primary);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.action-btn.primary:hover {
  background: var(--primary-dark);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
  color: #dc2626;
}

/* Analytics View */
.analytics-view {
  padding: 1.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.analytics-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.grade-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grade-bar-item {
  display: grid;
  grid-template-columns: 100px 1fr 40px;
  gap: 1rem;
  align-items: center;
}

.bar-label {
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.bar-track {
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.bar-count {
  text-align: right;
  font-weight: 500;
  color: var(--text-primary);
}

.progress-stats {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.progress-item {
  text-align: center;
}

.progress-circle {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: var(--text-primary);
}

.progress-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Rubrics View */
.rubrics-view {
  padding: 1.5rem;
}

.rubrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.rubrics-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.rubrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.rubric-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.rubric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.rubric-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.rubric-actions {
  display: flex;
  gap: 0.5rem;
}

.rubric-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.rubric-criteria {
  margin-bottom: 1.5rem;
}

.criterion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light);
}

.criterion-item:last-child {
  border-bottom: none;
}

.criterion-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.criterion-points {
  font-size: 0.813rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.rubric-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.rubric-total {
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.grading-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.submission-preview {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.preview-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.student-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.content-section h5 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.content-display {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 6px;
  color: var(--text-secondary);
  line-height: 1.5;
  min-height: 100px;
}

.grading-section h4 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.points-grading {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.points-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.points-field {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.points-input-field {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
}

.points-max {
  color: var(--text-secondary);
}

.percentage-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
}

.rubric-grading {
  margin-bottom: 2rem;
}

.rubric-grading h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.rubric-criterion {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.criterion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.criterion-levels {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-option:hover {
  border-color: var(--primary);
}

.level-option input[type="radio"] {
  margin-top: 0.25rem;
}

.level-content {
  flex: 1;
}

.level-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.level-description {
  font-size: 0.813rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.level-points {
  font-size: 0.813rem;
  color: var(--primary);
  font-weight: 500;
}

.feedback-section {
  margin-bottom: 1.5rem;
}

.feedback-section h5 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.feedback-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 120px;
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quick-feedback h5 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.feedback-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feedback-tag-btn {
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  color: var(--text-primary);
}

.feedback-tag-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--border-hover);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grading-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr;
  }
  
  .table-cell:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .submissions-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group,
  .search-box {
    width: 100%;
  }
  
  .analytics-grid,
  .rubrics-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    display: none;
  }
  
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .table-row::before {
    content: 'Submission';
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .grading-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .points-grading {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>