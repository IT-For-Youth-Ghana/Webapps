<template>
  <div class="teacher-grading">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">📊 Grading Center</h1>
        <p class="page-subtitle">Review submissions, provide feedback, and manage grades</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportGrades">
          <span class="btn-icon">📤</span>
          Export Grades
        </button>
        <button class="btn btn-primary" @click="showBulkGrading = true">
          <span class="btn-icon">📋</span>
          Bulk Grade
        </button>
      </div>
    </div>

    <!-- Grading Stats -->
    <div class="grading-stats">
      <div class="stat-card glass-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingGrades }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ gradedSubmissions }}</div>
          <div class="stat-label">Graded</div>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-value">{{ averageGrade.toFixed(1) }}</div>
          <div class="stat-label">Avg Grade</div>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ gradingSpeed.toFixed(1) }}</div>
          <div class="stat-label">Avg Time (min)</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section glass-card">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Search students or assignments..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filters">
        <select v-model="assignmentFilter" class="filter-select">
          <option value="">All Assignments</option>
          <option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">
            {{ assignment.title }}
          </option>
        </select>
        
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="graded">Graded</option>
          <option value="returned">Returned to Student</option>
        </select>
        
        <select v-model="priorityFilter" class="filter-select">
          <option value="">All Priority</option>
          <option value="overdue">Overdue</option>
          <option value="due-soon">Due Soon</option>
          <option value="normal">Normal</option>
        </select>
      </div>
    </div>

    <!-- Submissions List -->
    <div class="submissions-container">
      <div 
        v-if="filteredSubmissions.length === 0"
        class="empty-state glass-card"
      >
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">No submissions to grade</h3>
        <p class="empty-description">All caught up! Check back later for new submissions.</p>
      </div>
      
      <div v-else class="submissions-list">
        <div 
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="submission-card glass-card"
          :class="{ 
            'overdue': isOverdue(submission.dueDate),
            'graded': submission.status === 'graded'
          }"
        >
          <div class="submission-header">
            <div class="student-info">
              <div class="student-avatar">
                <img :src="submission.student.avatar" :alt="submission.student.name" />
              </div>
              <div class="student-details">
                <h3 class="student-name">{{ submission.student.name }}</h3>
                <p class="student-email">{{ submission.student.email }}</p>
              </div>
            </div>
            
            <div class="submission-meta">
              <div class="assignment-title">{{ getAssignmentTitle(submission.assignmentId) }}</div>
              <div class="submission-date">
                Submitted: {{ formatDate(submission.submittedAt) }}
              </div>
              <div class="status-badge" :class="submission.status">
                {{ formatStatus(submission.status) }}
              </div>
            </div>
          </div>
          
          <div class="submission-content">
            <!-- Assignment Type Indicator -->
            <div class="assignment-type" :class="submission.type">
              <span class="type-icon">{{ getTypeIcon(submission.type) }}</span>
              <span class="type-label">{{ submission.type.toUpperCase() }}</span>
            </div>
            
            <!-- Text Submission -->
            <div v-if="submission.textContent" class="text-submission">
              <h4>Answer:</h4>
              <div class="submission-text">{{ submission.textContent }}</div>
            </div>
            
            <!-- File Attachments -->
            <div v-if="submission.files && submission.files.length > 0" class="file-attachments">
              <h4>Attachments:</h4>
              <div class="files-list">
                <div 
                  v-for="file in submission.files"
                  :key="file.id"
                  class="file-item"
                  @click="downloadFile(file)"
                >
                  <span class="file-icon">{{ getFileIcon(file.type) }}</span>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Previous Feedback -->
            <div v-if="submission.feedback" class="previous-feedback">
              <h4>Previous Feedback:</h4>
              <div class="feedback-content">{{ submission.feedback }}</div>
            </div>
          </div>
          
          <!-- Grading Section -->
          <div class="grading-section">
            <div class="grade-input-group">
              <label class="grade-label">Grade:</label>
              <input 
                v-model.number="submission.tempGrade"
                type="number" 
                class="grade-input"
                :placeholder="`0-${getMaxPoints(submission.assignmentId)}`"
                :min="0"
                :max="getMaxPoints(submission.assignmentId)"
              />
              <span class="grade-max">/ {{ getMaxPoints(submission.assignmentId) }}</span>
            </div>
            
            <div class="feedback-input-group">
              <label class="feedback-label">Feedback:</label>
              <textarea 
                v-model="submission.tempFeedback"
                class="feedback-textarea"
                placeholder="Provide detailed feedback to help the student improve..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="rubric-section" v-if="submission.rubric">
              <h4>Rubric Assessment:</h4>
              <div class="rubric-items">
                <div 
                  v-for="criterion in submission.rubric"
                  :key="criterion.id"
                  class="rubric-item"
                >
                  <div class="criterion-name">{{ criterion.name }}</div>
                  <div class="criterion-points">
                    <label 
                      v-for="level in criterion.levels"
                      :key="level.points"
                      class="points-label"
                    >
                      <input 
                        v-model="criterion.selectedPoints"
                        type="radio" 
                        :value="level.points"
                        class="points-radio"
                      />
                      <span class="points-text">{{ level.description }} ({{ level.points }}pts)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="submission-actions">
            <button 
              class="btn btn-outline btn-sm"
              @click="saveAsDraft(submission)"
            >
              Save Draft
            </button>
            <button 
              class="btn btn-secondary btn-sm"
              @click="returnForRevision(submission)"
            >
              Return for Revision
            </button>
            <button 
              class="btn btn-primary btn-sm"
              @click="submitGrade(submission)"
              :disabled="!isGradingValid(submission)"
            >
              Submit Grade
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Grading Modal -->
    <div v-if="showBulkGrading" class="modal-overlay" @click="closeBulkGrading">
      <div class="modal glass-card" @click.stop>
        <div class="modal-header">
          <h2>Bulk Grading</h2>
          <button class="btn btn-ghost btn-sm" @click="closeBulkGrading">✕</button>
        </div>
        
        <div class="modal-content">
          <div class="bulk-options">
            <div class="option-group">
              <label class="form-label">Select Assignment:</label>
              <select v-model="bulkGrading.assignmentId" class="form-select">
                <option value="">Choose assignment</option>
                <option v-for="assignment in assignments" :key="assignment.id" :value="assignment.id">
                  {{ assignment.title }}
                </option>
              </select>
            </div>
            
            <div class="option-group">
              <label class="form-label">Grade to Apply:</label>
              <input 
                v-model.number="bulkGrading.grade"
                type="number" 
                class="form-input"
                placeholder="Grade"
                min="0"
              />
            </div>
            
            <div class="option-group">
              <label class="form-label">Bulk Feedback:</label>
              <textarea 
                v-model="bulkGrading.feedback"
                class="form-textarea"
                placeholder="This feedback will be applied to all selected submissions"
                rows="4"
              ></textarea>
            </div>
            
            <div class="selected-submissions">
              <label class="form-label">Apply to {{ bulkGrading.selectedSubmissions.length }} selected submissions</label>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeBulkGrading">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="applyBulkGrading"
            :disabled="!bulkGrading.assignmentId || bulkGrading.grade === null"
          >
            Apply Bulk Grade
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherGradingPage',
  setup() {
    const router = useRouter()
    
    // Reactive data
    const searchQuery = ref('')
    const assignmentFilter = ref('')
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const showBulkGrading = ref(false)
    
    const bulkGrading = ref({
      assignmentId: '',
      grade: null,
      feedback: '',
      selectedSubmissions: []
    })
    
    // Mock data
    const assignments = ref([
      { id: 1, title: 'JavaScript Array Methods Quiz', maxPoints: 50 },
      { id: 2, title: 'Vue.js Component Project', maxPoints: 100 },
      { id: 3, title: 'CSS Flexbox Exercise', maxPoints: 75 }
    ])
    
    const submissions = ref([
      {
        id: 1,
        assignmentId: 1,
        student: {
          name: 'Kwame Asante',
          email: 'kwame.asante@email.com',
          avatar: 'https://picsum.photos/seed/student1/100/100.jpg'
        },
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'pending',
        type: 'quiz',
        textContent: 'The map() method creates a new array with the results of calling a function for every array element...',
        files: [],
        grade: null,
        tempGrade: null,
        feedback: '',
        tempFeedback: '',
        rubric: [
          {
            id: 1,
            name: 'Understanding of Concepts',
            selectedPoints: null,
            levels: [
              { points: 10, description: 'Excellent understanding' },
              { points: 8, description: 'Good understanding' },
              { points: 6, description: 'Fair understanding' },
              { points: 4, description: 'Poor understanding' }
            ]
          }
        ]
      },
      {
        id: 2,
        assignmentId: 2,
        student: {
          name: 'Yaa Boahene',
          email: 'yaa.boahene@email.com',
          avatar: 'https://picsum.photos/seed/student2/100/100.jpg'
        },
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'pending',
        type: 'project',
        textContent: '',
        files: [
          { id: 1, name: 'vue-component.zip', type: 'zip', size: 2048576 },
          { id: 2, name: 'documentation.pdf', type: 'pdf', size: 512000 }
        ],
        grade: null,
        tempGrade: null,
        feedback: '',
        tempFeedback: ''
      },
      {
        id: 3,
        assignmentId: 1,
        student: {
          name: 'Joseph Osei',
          email: 'joseph.osei@email.com',
          avatar: 'https://picsum.photos/seed/student3/100/100.jpg'
        },
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'graded',
        type: 'quiz',
        textContent: 'Array methods like map, filter, and reduce are powerful tools...',
        files: [],
        grade: 42,
        tempGrade: 42,
        feedback: 'Good understanding of array methods. Could improve on edge cases.',
        tempFeedback: 'Good understanding of array methods. Could improve on edge cases.'
      }
    ])
    
    // Computed properties
    const filteredSubmissions = computed(() => {
      let filtered = submissions.value
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(submission => 
          submission.student.name.toLowerCase().includes(query) ||
          submission.student.email.toLowerCase().includes(query) ||
          getAssignmentTitle(submission.assignmentId).toLowerCase().includes(query)
        )
      }
      
      if (assignmentFilter.value) {
        filtered = filtered.filter(submission => submission.assignmentId === parseInt(assignmentFilter.value))
      }
      
      if (statusFilter.value) {
        filtered = filtered.filter(submission => submission.status === statusFilter.value)
      }
      
      if (priorityFilter.value) {
        filtered = filtered.filter(submission => {
          const now = new Date()
          const dueDate = new Date(submission.dueDate)
          const hoursDiff = (dueDate - now) / (1000 * 60 * 60)
          
          switch (priorityFilter.value) {
            case 'overdue':
              return hoursDiff < 0
            case 'due-soon':
              return hoursDiff > 0 && hoursDiff < 24
            case 'normal':
              return hoursDiff >= 24
            default:
              return true
          }
        })
      }
      
      return filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    })
    
    const pendingGrades = computed(() => 
      submissions.value.filter(s => s.status === 'pending').length
    )
    
    const gradedSubmissions = computed(() => 
      submissions.value.filter(s => s.status === 'graded').length
    )
    
    const averageGrade = computed(() => {
      const graded = submissions.value.filter(s => s.grade !== null)
      if (graded.length === 0) return 0
      return graded.reduce((sum, s) => sum + s.grade, 0) / graded.length
    })
    
    const gradingSpeed = computed(() => 5.2) // Mock average grading time
    
    // Methods
    const getAssignmentTitle = (assignmentId) => {
      const assignment = assignments.value.find(a => a.id === assignmentId)
      return assignment ? assignment.title : 'Unknown Assignment'
    }
    
    const getMaxPoints = (assignmentId) => {
      const assignment = assignments.value.find(a => a.id === assignmentId)
      return assignment ? assignment.maxPoints : 100
    }
    
    const getTypeIcon = (type) => {
      const icons = {
        quiz: '❓',
        project: '🚀',
        essay: '📝',
        exercise: '💪'
      }
      return icons[type] || '📋'
    }
    
    const getFileIcon = (type) => {
      const icons = {
        pdf: '📄',
        zip: '📦',
        doc: '📝',
        image: '🖼️'
      }
      return icons[type] || '📁'
    }
    
    const formatStatus = (status) => {
      const statuses = {
        pending: 'Pending Review',
        graded: 'Graded',
        returned: 'Returned'
      }
      return statuses[status] || status
    }
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const isOverdue = (dueDate) => {
      return new Date() > new Date(dueDate)
    }
    
    const isGradingValid = (submission) => {
      return submission.tempGrade !== null && 
             submission.tempGrade >= 0 && 
             submission.tempGrade <= getMaxPoints(submission.assignmentId)
    }
    
    const downloadFile = (file) => {
      console.log('Downloading file:', file.name)
      alert(`Downloading ${file.name}`)
    }
    
    const saveAsDraft = (submission) => {
      console.log('Saving draft for submission:', submission.id)
      alert('Grade saved as draft')
    }
    
    const returnForRevision = (submission) => {
      if (!submission.tempFeedback.trim()) {
        alert('Please provide feedback when returning for revision')
        return
      }
      
      submission.status = 'returned'
      submission.feedback = submission.tempFeedback
      alert('Submission returned to student for revision')
    }
    
    const submitGrade = (submission) => {
      if (!isGradingValid(submission)) {
        alert('Please enter a valid grade')
        return
      }
      
      submission.grade = submission.tempGrade
      submission.feedback = submission.tempFeedback
      submission.status = 'graded'
      
      alert(`Grade submitted: ${submission.grade}/${getMaxPoints(submission.assignmentId)}`)
    }
    
    const exportGrades = () => {
      console.log('Exporting grades...')
      alert('Grades exported successfully!')
    }
    
    const closeBulkGrading = () => {
      showBulkGrading.value = false
      bulkGrading.value = {
        assignmentId: '',
        grade: null,
        feedback: '',
        selectedSubmissions: []
      }
    }
    
    const applyBulkGrading = () => {
      try {
        const targetSubmissions = submissions.value.filter(s => 
          s.assignmentId === parseInt(bulkGrading.value.assignmentId) && 
          s.status === 'pending'
        )
        
        targetSubmissions.forEach(submission => {
          submission.grade = bulkGrading.value.grade
          submission.tempGrade = bulkGrading.value.grade
          submission.feedback = bulkGrading.value.feedback
          submission.tempFeedback = bulkGrading.value.feedback
          submission.status = 'graded'
        })
        
        closeBulkGrading()
        alert(`Applied bulk grade to ${targetSubmissions.length} submissions`)
      } catch (error) {
        console.error('Error applying bulk grading:', error)
        alert('Failed to apply bulk grading. Please try again.')
      }
    }
    
    return {
      searchQuery,
      assignmentFilter,
      statusFilter,
      priorityFilter,
      showBulkGrading,
      bulkGrading,
      assignments,
      submissions,
      filteredSubmissions,
      pendingGrades,
      gradedSubmissions,
      averageGrade,
      gradingSpeed,
      getAssignmentTitle,
      getMaxPoints,
      getTypeIcon,
      getFileIcon,
      formatStatus,
      formatDate,
      formatFileSize,
      isOverdue,
      isGradingValid,
      downloadFile,
      saveAsDraft,
      returnForRevision,
      submitGrade,
      exportGrades,
      closeBulkGrading,
      applyBulkGrading
    }
  }
}
</script>

<style scoped>
.teacher-grading {
  max-width: 1400px;
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

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.grading-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.filters-section {
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.submissions-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
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
  margin: 0;
  line-height: 1.5;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.submission-card {
  transition: all 0.3s ease;
}

.submission-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.submission-card.overdue {
  border-left: 4px solid #ef4444;
}

.submission-card.graded {
  border-left: 4px solid #10b981;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.student-email {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin: 0;
}

.submission-meta {
  text-align: right;
}

.assignment-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.submission-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.graded {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.returned {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.submission-content {
  padding: 1.5rem;
}

.assignment-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  width: fit-content;
}

.type-icon {
  font-size: 1.2rem;
}

.type-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.text-submission h4,
.file-attachments h4,
.previous-feedback h4 {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.submission-text {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.file-item:hover {
  background: var(--bg-secondary);
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.file-size {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.feedback-content {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.grading-section {
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin: 1.5rem;
}

.grade-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.grade-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 60px;
}

.grade-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-align: center;
}

.grade-max {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.feedback-input-group {
  margin-bottom: 1.5rem;
}

.feedback-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.feedback-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
}

.rubric-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.rubric-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rubric-item {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  background: var(--bg-secondary);
}

.criterion-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.criterion-points {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.points-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.points-radio {
  margin: 0;
}

.points-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-content {
  padding: 1.5rem;
}

.bulk-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-select, .form-input, .form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.selected-submissions {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
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
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-secondary);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
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

.btn-ghost {
  background: none;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .teacher-grading {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .grading-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    min-width: auto;
  }
  
  .filters {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .submission-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .submission-meta {
    text-align: left;
  }
  
  .submission-actions {
    flex-direction: column;
  }
  
  .grade-input-group {
    flex-wrap: wrap;
  }
  
  .criterion-points {
    gap: 0.75rem;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .grading-stats {
    grid-template-columns: 1fr;
  }
  
  .student-info {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>