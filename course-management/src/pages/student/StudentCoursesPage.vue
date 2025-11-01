<template>
  <div class="student-courses">
    <div class="content-wrapper">
      <CoursesHeader @browse-courses="browseAllCourses" />
      
      <CourseTabs 
        :tabs="tabs"
        :active-tab="activeTab"
        @tab-change="activeTab = $event"
      />
      
      <CourseGrid 
        :courses="filteredCourses"
        @continue-course="continueCourse"
        @review-course="reviewCourse"
        @view-details="viewDetails"
        @download-certificate="downloadCertificate"
      />
      
      <CourseEmptyState 
        :courses="filteredCourses"
        :title="getEmptyTitle()"
        :description="getEmptyDescription()"
        @browse-courses="browseAllCourses"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import CoursesHeader from '../../components/student/StudentCoursesPage/CoursesHeader.vue'
import CourseTabs from '../../components/student/StudentCoursesPage/CourseTabs.vue'
import CourseGrid from '../../components/student/StudentCoursesPage/CourseGrid.vue'
import CourseEmptyState from '../../components/student/StudentCoursesPage/CourseEmptyState.vue'

export default {
  name: 'StudentCoursesPage',
  components: {
    CoursesHeader,
    CourseTabs,
    CourseGrid,
    CourseEmptyState
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const activeTab = ref('active')
    
    // Tabs
    const tabs = computed(() => [
      {
        id: 'active',
        label: 'Active',
        count: enrolledCourses.value.filter(c => c.progress < 100).length
      },
      {
        id: 'completed',
        label: 'Completed',
        count: enrolledCourses.value.filter(c => c.progress === 100).length
      },
      {
        id: 'bookmarked',
        label: 'Bookmarked',
        count: enrolledCourses.value.filter(c => c.bookmarked).length
      }
    ])
    
    // Mock enrolled courses
    const enrolledCourses = ref([
      {
        id: 1,
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript from scratch with hands-on projects',
        level: 'beginner',
        category: 'Web Development',
        duration: '8 weeks',
        modules: 12,
        rating: 4.9,
        enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        progress: 75,
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        featured: true,
        bookmarked: true,
        instructor: {
          name: 'Dr. Kwame Asante',
          title: 'Senior Web Developer',
          avatar: 'https://picsum.photos/seed/instructor1/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/webdev/400/250.jpg'
      },
      {
        id: 2,
        title: 'Vue.js Complete Guide',
        description: 'Master modern Vue.js development with practical projects and best practices',
        level: 'intermediate',
        category: 'Frontend Frameworks',
        duration: '6 weeks',
        modules: 8,
        rating: 4.8,
        enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        progress: 100,
        lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        featured: false,
        bookmarked: false,
        instructor: {
          name: 'Yaa Boahene',
          title: 'Vue.js Expert',
          avatar: 'https://picsum.photos/seed/instructor2/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/vuejs/400/250.jpg'
      },
      {
        id: 3,
        title: 'Mobile App Development',
        description: 'Build native mobile applications using React Native and Expo',
        level: 'advanced',
        category: 'Mobile Development',
        duration: '10 weeks',
        modules: 15,
        rating: 4.7,
        enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        progress: 45,
        lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        featured: false,
        bookmarked: true,
        instructor: {
          name: 'Joseph Osei',
          title: 'Mobile Developer',
          avatar: 'https://picsum.photos/seed/instructor3/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/mobile/400/250.jpg'
      },
      {
        id: 4,
        title: 'Data Science Basics',
        description: 'Introduction to data analysis, visualization, and machine learning concepts',
        level: 'beginner',
        category: 'Data Science',
        duration: '8 weeks',
        modules: 10,
        rating: 4.9,
        enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        progress: 20,
        lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        featured: true,
        bookmarked: false,
        instructor: {
          name: 'Dr. Adelaide Mensah',
          title: 'Data Scientist',
          avatar: 'https://picsum.photos/seed/instructor4/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/datascience/400/250.jpg'
      }
    ])
    
    // Filtered courses based on active tab
    const filteredCourses = computed(() => {
      switch (activeTab.value) {
        case 'active':
          return enrolledCourses.value.filter(course => course.progress < 100)
        case 'completed':
          return enrolledCourses.value.filter(course => course.progress === 100)
        case 'bookmarked':
          return enrolledCourses.value.filter(course => course.bookmarked)
        default:
          return enrolledCourses.value
      }
    })
    
    // Methods
    
    const getEmptyTitle = () => {
      switch (activeTab.value) {
        case 'active': return 'No Active Courses'
        case 'completed': return 'No Completed Courses'
        case 'bookmarked': return 'No Bookmarked Courses'
        default: return 'No Courses Found'
      }
    }
    
    const getEmptyDescription = () => {
      switch (activeTab.value) {
        case 'active': return 'You haven\'t enrolled in any courses yet. Browse our catalog to get started!'
        case 'completed': return 'You haven\'t completed any courses yet. Keep learning to achieve your goals!'
        case 'bookmarked': return 'You haven\'t bookmarked any courses yet. Mark your favorites to find them easily!'
        default: return 'Start exploring courses to build your skills!'
      }
    }
    
    const continueCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const viewDetails = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const reviewCourse = (courseId) => {
      router.push(`/courses/course/${courseId}/review`)
    }
    
    const downloadCertificate = (courseId) => {
      console.log('Downloading certificate for course:', courseId)
      // Implement certificate download
    }
    
    const browseAllCourses = () => {
      router.push('/courses/list')
    }
    
    return {
      activeTab,
      tabs,
      filteredCourses,
      getEmptyTitle,
      getEmptyDescription,
      continueCourse,
      viewDetails,
      reviewCourse,
      downloadCertificate,
      browseAllCourses
    }
  }
}
</script>

<style scoped>
.student-courses {
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