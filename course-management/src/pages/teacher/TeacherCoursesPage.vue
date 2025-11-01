<template>
  <div class="teacher-courses fade-in">
    <div class="content-wrapper">
      <CoursesFilters
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:category-filter="categoryFilter"
        v-model:sort-by="sortBy"
      />

      <CoursesList 
        :courses="filteredCourses"
        @create-course="createNewCourse"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CoursesFilters from '@/components/teacher/TeacherCoursesPage/CoursesFilters.vue'
import CoursesList from '@/components/teacher/TeacherCoursesPage/CoursesList.vue'

export default {
  name: 'TeacherCoursesPage',
  components: {
    CoursesFilters,
    CoursesList
  },
  setup() {
    const router = useRouter()
    
    // Reactive data
    const viewMode = ref('grid')
    const searchQuery = ref('')
    const statusFilter = ref('')
    const categoryFilter = ref('')
    const sortBy = ref('created')
    
    // Mock courses data
    const courses = ref([
      {
        id: 1,
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript from scratch to build modern websites',
        enrolledStudents: 28,
        avgProgress: 75,
        status: 'active',
        totalLessons: 24,
        duration: '12 weeks'
      },
      {
        id: 2,
        title: 'Vue.js Advanced Concepts',
        description: 'Master advanced Vue.js patterns, Vuex, Vue Router, and best practices',
        enrolledStudents: 15,
        avgProgress: 60,
        status: 'active',
        totalLessons: 18,
        duration: '10 weeks'
      },
      {
        id: 3,
        title: 'Database Design & SQL',
        description: 'Comprehensive guide to database design principles and SQL programming',
        enrolledStudents: 22,
        avgProgress: 85,
        status: 'completed',
        totalLessons: 20,
        duration: '8 weeks'
      }
    ])
    
    // Computed properties
    const filteredCourses = computed(() => {
      let filtered = courses.value
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
        )
      }
      
      // Apply status filter
      if (statusFilter.value) {
        filtered = filtered.filter(course => course.status === statusFilter.value)
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'students':
            return b.enrolledStudents - a.enrolledStudents
          default:
            return 0
        }
      })
      
      return filtered
    })
    
    const totalCourses = computed(() => courses.value.length)
    const totalStudents = computed(() => 
      courses.value.reduce((sum, course) => sum + course.enrolledStudents, 0)
    )
    const activeCourses = computed(() => 
      courses.value.filter(course => course.status === 'active').length
    )
    const averageRating = computed(() => {
      return '4.8'
    })
    
    // Methods
    const toggleView = () => {
      viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
    }
    
    const createNewCourse = () => {
      router.push('/teacher/courses/create')
    }
    
    return {
      viewMode,
      searchQuery,
      statusFilter,
      categoryFilter,
      sortBy,
      filteredCourses,
      totalCourses,
      totalStudents,
      activeCourses,
      averageRating,
      toggleView,
      createNewCourse
    }
  }
}
</script>

<style scoped>
.teacher-courses {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}
</style>