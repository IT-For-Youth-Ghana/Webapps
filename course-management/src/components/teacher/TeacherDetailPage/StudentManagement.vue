<template>
  <div class="quick-actions-section">
    <div class="section-header" @click="toggleSection">
      <h2 class="section-title">Student Management</h2>
      <div class="header-actions">
        <button class="quick-action-btn export-btn" @click.stop="exportStudentData">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Data
        </button>
        <div class="toggle-icon" :class="{ expanded: isExpanded }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div v-if="isExpanded" class="students-overview">
  
      <!-- Students Table -->
      <div class="students-table">
        <h3>Enrolled Students</h3>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Institution</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assignments</th>
                <th>Participation</th>
                <th>Final Grade</th>
                <th>Progress</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td class="student-cell">
                  <div class="student-info">
                    <div class="student-avatar">{{ student.name.charAt(0) }}</div>
                    <div class="student-details">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="student-id">ID: {{ student.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="institution-cell">{{ student.institution }}</td>
                <td class="email-cell">
                  <a :href="`mailto:${student.email}`" class="contact-link">
                    {{ student.email }}
                  </a>
                </td>
                <td class="phone-cell">
                  <a :href="`tel:${student.phone}`" class="contact-link">
                    {{ student.phone }}
                  </a>
                </td>
                <td class="grades-cell">
                  <div class="grade-input-container">
                    <input 
                      v-model.number="student.assignmentGrade" 
                      type="number" 
                      min="0" 
                      max="100"
                      class="grade-input"
                      @change="updateGrade(student.id, 'assignmentGrade', $event.target.value)"
                    />
                    <span class="grade-label">%</span>
                  </div>
                </td>
                <td class="grades-cell">
                  <div class="grade-input-container">
                    <input 
                      v-model.number="student.participationGrade" 
                      type="number" 
                      min="0" 
                      max="100"
                      class="grade-input"
                      @change="updateGrade(student.id, 'participationGrade', $event.target.value)"
                    />
                    <span class="grade-label">%</span>
                  </div>
                </td>
                <td class="final-grade-cell">
                  <div class="grade-input-container">
                    <input 
                      v-model.number="student.finalGrade" 
                      type="number" 
                      min="0" 
                      max="100"
                      class="grade-input final-grade"
                      @change="updateGrade(student.id, 'finalGrade', $event.target.value)"
                    />
                    <span class="grade-label">%</span>
                  </div>
                </td>
                <td class="progress-cell">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: student.progress + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ student.progress }}%</span>
                </td>
                <td class="comments-cell">
                  <div class="comment-section">
                    <textarea 
                      v-model="student.comments" 
                      class="comment-input"
                      placeholder="Add comments..."
                      @change="updateComments(student.id, $event.target.value)"
                    ></textarea>
                    <button @click="viewStudentDetails(student)" class="view-details-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"/>
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentManagement',
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  emits: ['view-all-assignments'],
  data() {
    return {
      isExpanded: false,
      students: [
        {
          id: 'STU001',
          name: 'Alex Chen',
          institution: 'MIT',
          email: 'alex.chen@mit.edu',
          phone: '+1 (555) 123-4567',
          assignmentGrade: 92,
          participationGrade: 88,
          finalGrade: 90,
          progress: 85
        },
        {
          id: 'STU002',
          name: 'Maria Garcia',
          institution: 'Stanford',
          email: 'maria.garcia@stanford.edu',
          phone: '+1 (555) 234-5678',
          assignmentGrade: 78,
          participationGrade: 95,
          finalGrade: 87,
          progress: 72
        },
        {
          id: 'STU003',
          name: 'John Smith',
          institution: 'Harvard',
          email: 'john.smith@harvard.edu',
          phone: '+1 (555) 345-6789',
          assignmentGrade: 85,
          participationGrade: 76,
          finalGrade: 80,
          progress: 68
        },
        {
          id: 'STU004',
          name: 'Sarah Johnson',
          institution: 'UC Berkeley',
          email: 'sarah.johnson@berkeley.edu',
          phone: '+1 (555) 456-7890',
          assignmentGrade: 96,
          participationGrade: 92,
          finalGrade: 94,
          progress: 95
        },
        {
          id: 'STU005',
          name: 'David Kim',
          institution: 'Yale',
          email: 'david.kim@yale.edu',
          phone: '+1 (555) 567-8901',
          assignmentGrade: 74,
          participationGrade: 68,
          finalGrade: 71,
          progress: 65
        }
      ]
    }
  },
  computed: {
    averageGrade() {
      const total = this.students.reduce((sum, student) => sum + student.finalGrade, 0)
      return Math.round(total / this.students.length)
    },
    completionRate() {
      const completed = this.students.filter(student => student.progress >= 80).length
      return Math.round((completed / this.students.length) * 100)
    }
  },
  methods: {
    toggleSection() {
      this.isExpanded = !this.isExpanded
    },
    getGradeClass(grade) {
      if (grade >= 90) return 'grade-excellent'
      if (grade >= 80) return 'grade-good'
      if (grade >= 70) return 'grade-average'
      return 'grade-below-average'
    },
    updateGrade(studentId, gradeType, value) {
      const student = this.students.find(s => s.id === studentId)
      if (student) {
        student[gradeType] = parseInt(value) || 0
        console.log(`Updated ${gradeType} for student ${studentId}: ${value}`)
      }
    },
    updateComments(studentId, comments) {
      const student = this.students.find(s => s.id === studentId)
      if (student) {
        student.comments = comments
        console.log(`Updated comments for student ${studentId}: ${comments}`)
      }
    },
    viewStudentDetails(student) {
      console.log('Viewing details for student:', student.name)
      alert(`Viewing detailed information for ${student.name}\n\nEmail: ${student.email}\nPhone: ${student.phone}\nInstitution: ${student.institution}`)
    },
    exportStudentData() {
      const csvContent = this.generateCSV()
      this.downloadCSV(csvContent, 'student_data.csv')
      console.log('Student data exported successfully')
    },
    generateCSV() {
      const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Institution', 'Assignment Grade', 'Participation Grade', 'Final Grade', 'Progress', 'Comments']
      const rows = this.students.map(student => [
        student.id,
        student.name,
        student.email,
        student.phone,
        student.institution,
        student.assignmentGrade,
        student.participationGrade,
        student.finalGrade,
        student.progress,
        student.comments || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    },
    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }
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
  cursor: pointer;
  user-select: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
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
  justify-content: center;
}

.quick-action-btn:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.students-table {
  margin-top: 1rem;
}

.students-table h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.table-responsive {
  overflow-x: auto;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th {
  background: var(--bg-tertiary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

tr:hover {
  background: var(--bg-secondary);
}

.student-cell {
  min-width: 200px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  background: var(--interactive-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.student-details {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.student-id {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.institution-cell {
  font-weight: 500;
  color: var(--text-primary);
  min-width: 120px;
}

.email-cell, .phone-cell {
  min-width: 180px;
}

.contact-link {
  color: var(--interactive-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--interactive-primary-hover);
  text-decoration: underline;
}

.grades-cell {
  text-align: center;
  min-width: 100px;
}

.final-grade-cell {
  text-align: center;
  min-width: 100px;
}

.grade-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.grade-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.grade-input:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.1);
}

.grade-input.final-grade {
  border-color: var(--interactive-primary);
  background: rgba(35, 131, 226, 0.05);
  font-weight: 700;
}

.grade-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.comments-cell {
  min-width: 200px;
}

.comment-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-input {
  width: 100%;
  min-height: 60px;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.8rem;
  resize: vertical;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 2px rgba(35, 131, 226, 0.1);
}

.view-details-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  gap: 0.25rem;
  align-self: flex-end;
}

.view-details-btn:hover {
  background: var(--interactive-primary);
  color: white;
  border-color: var(--interactive-primary);
}

.export-btn {
  background: rgba(35, 131, 226, 0.1);
  color: #2383e2;
  border-color: #2383e2;
}

.export-btn:hover {
  background: #2383e2;
  color: white;
  border-color: #2383e2;
}

.grade-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  min-width: 60px;
}

.grade-excellent {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.grade-good {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.grade-average {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.grade-below-average {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.progress-cell {
  min-width: 150px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--interactive-primary), var(--interactive-primary-hover));
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 1200px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .table-responsive {
    font-size: 0.75rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
  
  .student-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quick-action-btn {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
  }
}
</style>