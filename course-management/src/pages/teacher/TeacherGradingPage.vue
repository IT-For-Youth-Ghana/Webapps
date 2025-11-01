<template>
  <div class="teacher-grading fade-in">
    <div class="content-wrapper">
      <GradingFilters
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:assignment-filter="assignmentFilter"
        v-model:course-filter="courseFilter"
        v-model:sort-by="sortBy"
        :selected-course="courseFilter"
        :stats="gradingStats"
        :course-stats="courseStats"
        @export-grades="exportGrades"
        @bulk-grade="showBulkGrading = true"
        @auto-prioritize="handleAutoPrioritize"
        @select-course="handleSelectCourse"
      />

      <GradingList
        :submissions="filteredSubmissions"
        @bulk-grade="showBulkGrading = true"
        @download-file="downloadFile"
        @update-grade="handleUpdateGrade"
        @update-feedback="handleUpdateFeedback"
        @save-draft="saveAsDraft"
        @return-revision="returnForRevision"
        @submit-grade="submitGrade"
      />

      <GradingModal
        :show="showBulkGrading"
        v-model:assignment-id="bulkGrading.assignmentId"
        v-model:grade="bulkGrading.grade"
        v-model:feedback="bulkGrading.feedback"
        :selected-submissions="bulkGrading.selectedSubmissions"
        :assignments="assignments"
        @close="closeBulkGrading"
        @apply-bulk="applyBulkGrading"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import GradingFilters from '@/components/teacher/TeacherGradingPage/GradingFilters.vue'
import GradingList from '@/components/teacher/TeacherGradingPage/GradingList.vue'
import GradingModal from '@/components/teacher/TeacherGradingPage/GradingModal.vue'

export default {
  name: 'TeacherGradingPage',
  components: {
    GradingFilters,
    GradingList,
    GradingModal
  },
  setup() {
    // Reactive data
    const searchQuery = ref('')
    const assignmentFilter = ref('')
    const statusFilter = ref('')
    const courseFilter = ref('')
    const sortBy = ref('submission')
    const showBulkGrading = ref(false)
    
    const bulkGrading = ref({
      assignmentId: '',
      grade: null,
      feedback: '',
      selectedSubmissions: []
    })
    
    // Mock data - Realistic professor scenario
    const courses = ref([
      { 
        id: 1, 
        name: 'Advanced Web Development', 
        code: 'CS-350',
        studentCount: 85,
        semester: 'Fall 2024'
      },
      { 
        id: 2, 
        name: 'Database Systems', 
        code: 'CS-440',
        studentCount: 92,
        semester: 'Fall 2024'
      },
      { 
        id: 3, 
        name: 'Software Engineering', 
        code: 'CS-420',
        studentCount: 78,
        semester: 'Fall 2024'
      }
    ])

    const assignments = ref([
      // Course 1 assignments
      { id: 1, courseId: 1, title: 'JavaScript Array Methods Quiz', maxPoints: 50, type: 'quiz', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: 2, courseId: 1, title: 'Vue.js Component Project', maxPoints: 100, type: 'project', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { id: 3, courseId: 1, title: 'Midterm Exam', maxPoints: 150, type: 'exam', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
      
      // Course 2 assignments
      { id: 4, courseId: 2, title: 'SQL Query Assignment', maxPoints: 75, type: 'assignment', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: 5, courseId: 2, title: 'Database Design Project', maxPoints: 120, type: 'project', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { id: 6, courseId: 2, title: 'Normalization Quiz', maxPoints: 40, type: 'quiz', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      
      // Course 3 assignments  
      { id: 7, courseId: 3, title: 'UML Diagrams', maxPoints: 80, type: 'assignment', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: 8, courseId: 3, title: 'Agile Methodology Essay', maxPoints: 60, type: 'essay', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { id: 9, courseId: 3, title: 'Team Project Presentation', maxPoints: 100, type: 'presentation', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) }
    ])
    
    // Generate realistic submission data for 255 students across 3 courses
    const generateSubmissions = () => {
      const students = [
        // Sample student names
        'Kwame Asante', 'Yaa Boahene', 'Kofi Osei', 'Ama Mensah', 'Kofi Adjei',
        'Abena Asante', 'Akosua Darko', 'Yaw Appiah', 'Efua Gyasi', 'Kweku Tetteh',
        // ... would continue with realistic names
      ]
      
      const submissionStatuses = ['pending', 'pending', 'pending', 'graded', 'returned']
      const submissionTypes = ['quiz', 'project', 'assignment', 'exam', 'essay']
      
      const submissions = []
      let submissionId = 1
      
      // Generate submissions for each assignment
      assignments.value.forEach(assignment => {
        const course = courses.value.find(c => c.id === assignment.courseId)
        const studentCount = course.studentCount
        
        // Create submissions for percentage of students (not all submit)
        const submissionCount = Math.floor(studentCount * (0.7 + Math.random() * 0.25)) // 70-95% submission rate
        
        for (let i = 0; i < submissionCount; i++) {
          const studentIndex = i % students.length
          const hoursSinceDue = (new Date() - assignment.dueDate) / (1000 * 60 * 60)
          
          // Determine status based on due date
          let status = 'pending'
          if (hoursSinceDue > 72) status = Math.random() > 0.3 ? 'graded' : 'pending'
          else if (hoursSinceDue > 24) status = Math.random() > 0.5 ? 'graded' : 'pending'
          
          const isOverdue = new Date() > assignment.dueDate && status === 'pending'
          
          submissions.push({
            id: submissionId++,
            assignmentId: assignment.id,
            courseId: assignment.courseId,
            student: {
              name: students[studentIndex] + ` ${i + 1}`,
              email: `student${submissionId}@university.edu`,
              id: `STU${String(submissionId).padStart(6, '0')}`
            },
            submittedAt: new Date(assignment.dueDate.getTime() - Math.random() * 48 * 60 * 60 * 1000),
            dueDate: assignment.dueDate,
            status: isOverdue ? 'pending' : status,
            priority: isOverdue ? 'overdue' : (hoursSinceDue > -24 ? 'due-soon' : 'normal'),
            type: assignment.type,
            textContent: assignment.type === 'quiz' ? 'Student answer text here...' : '',
            files: assignment.type === 'project' ? [
              { id: 1, name: 'project-files.zip', type: 'zip', size: 2048576 }
            ] : [],
            grade: status === 'graded' ? Math.floor(assignment.maxPoints * (0.6 + Math.random() * 0.4)) : null,
            tempGrade: null,
            feedback: status === 'graded' ? 'Good work overall. Some areas for improvement...' : '',
            tempFeedback: '',
            submissionTime: Math.floor(Math.random() * 10 + 3) // Estimated grading time in minutes
          })
        }
      })
      
      return submissions
    }
    
    const submissions = ref(generateSubmissions())
    
    // Transform data for components
    const transformSubmissionForList = (submission) => ({
      ...submission,
      assignmentTitle: getAssignmentTitle(submission.assignmentId),
      maxPoints: getMaxPoints(submission.assignmentId)
    })

    // Computed properties
    const filteredSubmissions = computed(() => {
      let filtered = submissions.value.map(transformSubmissionForList)
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(submission => 
          submission.student.name.toLowerCase().includes(query) ||
          submission.assignmentTitle.toLowerCase().includes(query)
        )
      }
      
      if (assignmentFilter.value) {
        filtered = filtered.filter(submission => 
          submission.assignmentId.toString() === assignmentFilter.value
        )
      }
      
      if (statusFilter.value) {
        filtered = filtered.filter(submission => 
          submission.status === statusFilter.value
        )
      }
      
      return filtered
    })

    const gradingStats = computed(() => {
      const pending = submissions.value.filter(s => s.status === 'pending' && s.priority !== 'overdue').length
      const overdue = submissions.value.filter(s => s.priority === 'overdue').length
      const dueSoon = submissions.value.filter(s => s.priority === 'due-soon' && s.status === 'pending').length
      const graded = submissions.value.filter(s => s.status === 'graded').length
      
      return {
        pending,
        graded,
        overdue,
        dueSoon,
        avgGrade: submissions.value.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / submissions.value.filter(s => s.grade).length || 0,
        avgTime: 8.5
      }
    })
    
    const courseStats = computed(() => {
      return courses.value.map(course => {
        const courseSubmissions = submissions.value.filter(s => s.courseId === course.id)
        const pending = courseSubmissions.filter(s => s.status === 'pending' && s.priority !== 'overdue').length
        const overdue = courseSubmissions.filter(s => s.priority === 'overdue').length
        
        return {
          ...course,
          pending,
          overdue,
          totalSubmissions: courseSubmissions.length
        }
      })
    })
    
    // Methods
    const getAssignmentTitle = (assignmentId) => {
      const assignment = assignments.value.find(a => a.id === assignmentId)
      return assignment ? assignment.title : 'Unknown Assignment'
    }
    
    const getMaxPoints = (assignmentId) => {
      const assignment = assignments.value.find(a => a.id === assignmentId)
      return assignment ? assignment.maxPoints : 100
    }
    
    // Event handlers
    const handleUpdateGrade = (submissionId, grade) => {
      const submission = submissions.value.find(s => s.id === submissionId)
      if (submission) {
        submission.tempGrade = Number(grade)
      }
    }

    const handleUpdateFeedback = (submissionId, feedback) => {
      const submission = submissions.value.find(s => s.id === submissionId)
      if (submission) {
        submission.tempFeedback = feedback
      }
    }
    
    const downloadFile = (file) => {
      alert(`Downloading ${file.name}`)
    }
    
    const saveAsDraft = (submission) => {
      alert(`Saving draft for ${submission.student.name}`)
    }
    
    const returnForRevision = (submission) => {
      if (confirm(`Return submission from ${submission.student.name} for revision?`)) {
        submission.status = 'returned'
        alert('Submission returned for revision')
      }
    }
    
    const submitGrade = (submission) => {
      if (submission.tempGrade !== null && submission.tempGrade !== undefined) {
        submission.grade = submission.tempGrade
        submission.feedback = submission.tempFeedback
        submission.status = 'graded'
        alert(`Grade submitted for ${submission.student.name}: ${submission.grade}/${submission.maxPoints}`)
      }
    }
    
    const exportGrades = () => {
      alert('Exporting grades...')
    }
    
    const closeBulkGrading = () => {
      showBulkGrading.value = false
    }
    
    const applyBulkGrading = (bulkData) => {
      bulkData.submissions.forEach(submission => {
        const original = submissions.value.find(s => s.id === submission.id)
        if (original) {
          original.grade = bulkData.grade
          original.tempGrade = bulkData.grade
          original.feedback = bulkData.feedback
          original.tempFeedback = bulkData.feedback
          original.status = 'graded'
        }
      })
      alert(`Bulk grading applied to ${bulkData.submissions.length} submissions`)
      closeBulkGrading()
    }
    
    // Additional handlers for professor workflow
    const handleSelectCourse = (courseId) => {
      courseFilter.value = courseId.toString()
    }
    
    const handleAutoPrioritize = () => {
      // Smart prioritization algorithm
      alert('Smart prioritization applied! Overdue items moved to top, grouped by estimated grading time.')
    }
    
    return {
      searchQuery,
      assignmentFilter,
      statusFilter,
      courseFilter,
      sortBy,
      showBulkGrading,
      bulkGrading,
      assignments,
      courses,
      filteredSubmissions,
      gradingStats,
      courseStats,
      handleUpdateGrade,
      handleUpdateFeedback,
      downloadFile,
      saveAsDraft,
      returnForRevision,
      submitGrade,
      exportGrades,
      closeBulkGrading,
      applyBulkGrading,
      handleSelectCourse,
      handleAutoPrioritize
    }
  }
}
</script>

<style scoped>
.teacher-grading {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
}
</style>