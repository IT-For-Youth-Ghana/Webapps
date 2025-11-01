<template>
  <div class="student-assignments fade-in">
    <div class="content-wrapper">
      <AssignmentsStats 
        :total-assignments="totalAssignments"
        :urgent-assignments="urgentAssignments"
        :submitted-count="submittedCount"
        :graded-assignments="gradedCount"
        :average-grade="averageGrade"
      />

      <AssignmentTabs 
        :active-tab="activeTab"
        :tabs="tabs"
        @tab-change="activeTab = $event"
      />

      <AssignmentFilters
        v-model:search-query="searchQuery"
        v-model:course-filter="courseFilter"
        v-model:type-filter="typeFilter"
        v-model:sort-by="sortBy"
        :courses="courses"
      />

      <!-- Assignments Grid -->
      <AssignmentsList
        v-if="filteredAssignments.length > 0"
        :assignments="filteredAssignments"
        @card-click="viewAssignment"
        @submit="submitAssignment"
        @view-submission="viewSubmission"
        @view-details="viewDetails"
      />

      <!-- Empty State -->
      <EmptyState
        v-else
        :active-tab-label="getActiveTabLabel()"
        :description="getEmptyDescription()"
        @browse-courses="browseCourses"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AssignmentsStats from '@/components/student/StudentAssignmentPages/AssignmentsStats.vue'
import AssignmentTabs from '@/components/student/StudentAssignmentPages/AssignmentTabs.vue'
import AssignmentFilters from '@/components/student/StudentAssignmentPages/AssignmentFilters.vue'
import AssignmentsList from '@/components/student/StudentAssignmentPages/AssignmentsList.vue'
import EmptyState from '@/components/student/StudentAssignmentPages/EmptyState.vue'

export default {
  name: 'StudentAssignmentsPage',
  components: {
    AssignmentsStats,
    AssignmentTabs,
    AssignmentFilters,
    AssignmentsList,
    EmptyState
  },
  setup() {
    const router = useRouter()
    
    // Reactive data
    const activeTab = ref('all')
    const searchQuery = ref('')
    const courseFilter = ref('')
    const typeFilter = ref('')
    const sortBy = ref('dueDate')
    
    // Mock assignments data
    const assignments = ref([
      {
        id: 1,
        title: 'JavaScript Fundamentals Quiz',
        description: 'Test your knowledge of basic JavaScript concepts including variables, functions, and data types',
        courseName: 'Web Development Fundamentals',
        type: 'quiz',
        maxPoints: 50,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'not_started',
        grade: null
      }
    ])
    
    // Mock courses data
    const courses = ref([
      { id: 1, name: 'Web Development Fundamentals' },
      { id: 2, name: 'Vue.js Complete Guide' },
      { id: 3, name: 'Advanced Web Development' },
      { id: 4, name: 'Database Design' }
    ])
    
    // Tabs
    const tabs = computed(() => [
      {
        id: 'all',
        label: 'All',
        count: assignments.value.length
      },
      {
        id: 'todo',
        label: 'To Do',
        count: assignments.value.filter(a => !a.submission || a.submission.status === 'draft').length
      },
      {
        id: 'submitted',
        label: 'Submitted',
        count: assignments.value.filter(a => a.submission && a.submission.status === 'submitted').length
      },
      {
        id: 'graded',
        label: 'Graded',
        count: assignments.value.filter(a => a.grade !== null).length
      },
      {
        id: 'overdue',
        label: 'Overdue',
        count: assignments.value.filter(a => isOverdue(a.dueDate) && (!a.submission || a.submission.status === 'draft')).length
      }
    ])
    
    // Computed properties
    const filteredAssignments = computed(() => {
      let filtered = assignments.value
      
      // Apply tab filter
      if (activeTab.value === 'todo') {
        filtered = filtered.filter(a => !a.submission || a.submission.status === 'draft')
      } else if (activeTab.value === 'submitted') {
        filtered = filtered.filter(a => a.submission && a.submission.status === 'submitted')
      } else if (activeTab.value === 'graded') {
        filtered = filtered.filter(a => a.grade !== null)
      } else if (activeTab.value === 'overdue') {
        filtered = filtered.filter(a => isOverdue(a.dueDate) && (!a.submission || a.submission.status === 'draft'))
      }
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.courseName.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (courseFilter.value) {
        filtered = filtered.filter(a => {
          const course = courses.value.find(c => c.name === a.courseName)
          return course && course.id === parseInt(courseFilter.value)
        })
      }
      
      // Apply type filter
      if (typeFilter.value) {
        filtered = filtered.filter(a => a.type === typeFilter.value)
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'dueDate':
            return new Date(a.dueDate) - new Date(b.dueDate)
          case 'title':
            return a.title.localeCompare(b.title)
          case 'course':
            return a.courseName.localeCompare(b.courseName)
          case 'points':
            return b.maxPoints - a.maxPoints
          default:
            return 0
        }
      })
      
      return filtered
    })
    
    const totalAssignments = computed(() => assignments.value.length)
    const urgentAssignments = computed(() => 
      assignments.value.filter(a => {
        const dueDate = new Date(a.dueDate)
        const now = new Date()
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
        return daysUntilDue <= 3 && daysUntilDue >= 0 && (!a.submission || a.submission.status === 'draft')
      }).length
    )
    const submittedCount = computed(() => 
      assignments.value.filter(a => a.submission && a.submission.status === 'submitted').length
    )
    const gradedCount = computed(() => assignments.value.filter(a => a.grade !== null).length)
    const averageGrade = computed(() => {
      const graded = assignments.value.filter(a => a.grade !== null)
      if (graded.length === 0) return 0
      const totalScore = graded.reduce((sum, a) => sum + (a.grade / a.maxPoints * 100), 0)
      return Math.round(totalScore / graded.length)
    })
    
    // Methods
    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date()
    }
    
    const getActiveTabLabel = () => {
      const tab = tabs.value.find(t => t.id === activeTab.value)
      return tab ? tab.label : 'All'
    }
    
    const getEmptyDescription = () => {
      switch (activeTab.value) {
        case 'todo':
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
    
    const viewAssignment = (assignmentId) => {
      console.log('Viewing assignment:', assignmentId)
      router.push(`/assignments/${assignmentId}`)
    }
    
    const viewCalendar = () => {
      router.push('/assignments/calendar')
    }
    
    const browseCourses = () => {
      router.push('/courses/list')
    }
    
    return {
      activeTab,
      searchQuery,
      courseFilter,
      typeFilter,
      sortBy,
      courses,
      tabs,
      filteredAssignments,
      totalAssignments,
      urgentAssignments,
      submittedCount,
      gradedCount,
      averageGrade,
      getActiveTabLabel,
      getEmptyDescription,
      submitAssignment,
      viewSubmission,
      viewDetails,
      viewAssignment,
      viewCalendar,
      browseCourses
    }
  }
}
</script>

<style scoped>
.student-assignments {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

@media (max-width: 768px) {
  .student-assignments {
    padding: 1rem 0;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 0.75rem;
  }
}
</style>