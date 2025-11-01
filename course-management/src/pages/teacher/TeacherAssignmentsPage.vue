<template>
  <div class="teacher-assignments fade-in">
    <div class="content-wrapper">
      <AssignmentsStats 
        :total-assignments="totalAssignments"
        :pending-submissions="pendingSubmissions"
        :graded-assignments="gradedAssignments"
        :average-score="averageScore"
      />

      <AssignmentTabs 
        :active-tab="activeTab"
        @tab-change="activeTab = $event"
      />

      <AssignmentFilters
        v-model:search-query="searchQuery"
        v-model:course-filter="courseFilter"
        v-model:type-filter="typeFilter"
        v-model:sort-by="sortBy"
      />

      <AssignmentsList 
        :assignments="filteredAssignments"
        @create-assignment="showCreateModal = true"
        @view-submissions="viewSubmissions"
        @edit="editAssignment"
        @grade="gradeAssignment"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AssignmentsStats from '@/components/teacher/TeacherAssignmentPages/AssignmentsStats.vue'
import AssignmentTabs from '@/components/teacher/TeacherAssignmentPages/AssignmentTabs.vue'
import AssignmentFilters from '@/components/teacher/TeacherAssignmentPages/AssignmentFilters.vue'
import AssignmentsList from '@/components/teacher/TeacherAssignmentPages/AssignmentsList.vue'

export default {
  name: 'TeacherAssignmentsPage',
  components: {
    AssignmentsStats,
    AssignmentTabs,
    AssignmentFilters,
    AssignmentsList
  },
  setup() {
    const router = useRouter()
    
    // Reactive data
    const showTemplates = ref(false)
    const showCreateModal = ref(false)
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
        description: 'Test your knowledge of JavaScript basics including variables, functions, and control structures.',
        courseId: 1,
        type: 'quiz',
        status: 'published',
        dueDate: '2024-04-15',
        duration: 60,
        totalStudents: 45,
        submissions: 32,
        maxPoints: 100
      },
      {
        id: 2,
        title: 'Portfolio Website Project',
        description: 'Create a personal portfolio website showcasing your web development projects and skills.',
        courseId: 1,
        type: 'project',
        status: 'published',
        dueDate: '2024-04-20',
        duration: 180,
        totalStudents: 45,
        submissions: 28,
        maxPoints: 150
      },
      {
        id: 3,
        title: 'Database Design Essay',
        description: 'Write a comprehensive essay on database normalization principles and best practices.',
        courseId: 3,
        type: 'essay',
        status: 'draft',
        dueDate: '2024-04-25',
        duration: 120,
        totalStudents: 22,
        submissions: 0,
        maxPoints: 80
      }
    ])
    
    // Computed properties
    const filteredAssignments = computed(() => {
      let filtered = assignments.value
      
      // Apply tab filter
      if (activeTab.value === 'active') {
        filtered = filtered.filter(a => a.status === 'published')
      } else if (activeTab.value === 'pending') {
        filtered = filtered.filter(a => a.submissions > 0)
      } else if (activeTab.value === 'completed') {
        filtered = filtered.filter(a => a.status === 'closed')
      }
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (courseFilter.value) {
        filtered = filtered.filter(a => a.courseId === parseInt(courseFilter.value))
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
          case 'created':
            return b.id - a.id
          case 'submissions':
            return b.submissions - a.submissions
          case 'title':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
      
      return filtered
    })
    
    const totalAssignments = computed(() => assignments.value.length)
    const pendingSubmissions = computed(() => 
      assignments.value.filter(a => a.submissions > 0 && a.status === 'published').length
    )
    const gradedAssignments = computed(() => 
      assignments.value.filter(a => a.status === 'closed').length
    )
    const averageScore = computed(() => 85)
    
    // Methods
    const viewSubmissions = (assignmentId) => {
      router.push(`/teacher/assignments/${assignmentId}/submissions`)
    }
    
    const editAssignment = (assignmentId) => {
      router.push(`/teacher/assignments/${assignmentId}/edit`)
    }
    
    const gradeAssignment = (assignmentId) => {
      router.push(`/teacher/assignments/${assignmentId}/grade`)
    }
    
    return {
      showTemplates,
      showCreateModal,
      activeTab,
      searchQuery,
      courseFilter,
      typeFilter,
      sortBy,
      filteredAssignments,
      totalAssignments,
      pendingSubmissions,
      gradedAssignments,
      averageScore,
      viewSubmissions,
      editAssignment,
      gradeAssignment
    }
  }
}
</script>

<style scoped>
.teacher-assignments {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}
</style>