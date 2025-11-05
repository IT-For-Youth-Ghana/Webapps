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
        duration: '12 weeks',
        category: 'web-development',
        schedule: 'Mo 09:00-11:00, Mi 14:00-16:00',
        createdAt: new Date('2024-10-15'),
        backgroundImage: '#2383e2'
      },
      {
        id: 2,
        title: 'Vue.js Advanced Concepts',
        description: 'Master advanced Vue.js patterns, Vuex, Vue Router, and best practices',
        enrolledStudents: 15,
        avgProgress: 60,
        status: 'active',
        totalLessons: 18,
        duration: '10 weeks',
        category: 'web-development',
        schedule: 'Di 10:00-12:00, Do 15:00-17:00',
        createdAt: new Date('2024-11-01')
      },
      {
        id: 3,
        title: 'Database Design & SQL',
        description: 'Comprehensive guide to database design principles and SQL programming',
        enrolledStudents: 22,
        avgProgress: 85,
        status: 'completed',
        totalLessons: 20,
        duration: '8 weeks',
        category: 'database',
        schedule: 'Fr 13:00-15:00',
        createdAt: new Date('2024-09-20')
      },
      {
        id: 4,
        title: 'Mobile App Development',
        description: 'Build native and cross-platform mobile applications',
        enrolledStudents: 18,
        avgProgress: 45,
        status: 'active',
        totalLessons: 16,
        duration: '8 weeks',
        category: 'mobile-development',
        schedule: 'Mo 14:00-16:00, Do 09:00-11:00',
        createdAt: new Date('2024-10-30')
      },
      {
        id: 5,
        title: 'UI/UX Design Principles',
        description: 'Learn the fundamentals of user interface and user experience design',
        enrolledStudents: 12,
        avgProgress: 30,
        status: 'draft',
        totalLessons: 14,
        duration: '6 weeks',
        category: 'design',
        schedule: 'Mi 16:00-18:00',
        createdAt: new Date('2024-11-02')
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
      
      // Apply category filter
      if (categoryFilter.value) {
        filtered = filtered.filter(course => course.category === categoryFilter.value)
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'created':
            return new Date(b.createdAt) - new Date(a.createdAt)
          case 'updated':
            return new Date(b.createdAt) - new Date(a.createdAt) // Using createdAt for demo
          case 'students':
            return b.enrolledStudents - a.enrolledStudents
          case 'rating':
            return 0 // Not implemented
          case 'alphabetical':
            return a.title.localeCompare(b.title)
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