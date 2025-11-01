<template>
  <div class="student-dashboard fade-in">
    <div class="content-wrapper">
      <DashboardHeader 
        :title="`Welcome back, ${user?.name}!`"
        subtitle="Continue your learning journey and track your progress"
        @browse-courses="browseCourses"
      />
      
      <QuickStats 
        :enrolled-courses="enrolledCourses"
        :completed-courses="completedCourses"
        :average-progress="averageProgress"
        :total-study-time="totalStudyTime"
      />
      
      <ContinueLearning 
        :active-courses="activeCourses"
        @continue-course="continueCourse"
      />
      
      <RecentActivity :recent-activities="recentActivities" />
      
      <RecommendedCourses 
        :recommended-courses="recommendedCourses"
        @view-course="viewCourse"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import DashboardHeader from '../StudentDashboard/DashboardHeader.vue'
import QuickStats from '../StudentDashboard/QuickStats.vue'
import ContinueLearning from '../StudentDashboard/ContinueLearning.vue'
import RecentActivity from '../StudentDashboard/RecentActivity.vue'
import RecommendedCourses from '../StudentDashboard/RecommendedCourses.vue'

export default {
  name: 'StudentDashboard',
  components: {
    DashboardHeader,
    QuickStats,
    ContinueLearning,
    RecentActivity,
    RecommendedCourses
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const user = computed(() => userStore.currentUser)
    
    // Mock data
    const enrolledCourses = ref([
      { id: 1, title: 'Web Development Fundamentals', progress: 75 },
      { id: 2, title: 'Vue.js Complete Guide', progress: 45 },
      { id: 3, title: 'Mobile App Development', progress: 100 },
      { id: 4, title: 'Database Design', progress: 20 }
    ])
    
    const activeCourses = computed(() => 
      enrolledCourses.value.filter(c => c.progress < 100)
    )
    
    const completedCourses = computed(() => 
      enrolledCourses.value.filter(c => c.progress === 100)
    )
    
    const averageProgress = computed(() => {
      if (enrolledCourses.value.length === 0) return 0
      const total = enrolledCourses.value.reduce((sum, course) => sum + course.progress, 0)
      return Math.round(total / enrolledCourses.value.length)
    })
    
    const totalStudyTime = computed(() => 45)
    
    const recentActivities = ref([
      {
        id: 1,
        icon: 'assignment',
        title: 'Assignment Submitted',
        description: 'JavaScript Fundamentals Quiz',
        timestamp: '2 hours ago'
      },
      {
        id: 2,
        icon: 'course',
        title: 'Course Completed',
        description: 'Mobile App Development',
        timestamp: '1 day ago'
      },
      {
        id: 3,
        icon: 'quiz',
        title: 'Quiz Passed',
        description: 'Vue.js Components Assessment',
        timestamp: '2 days ago'
      },
      {
        id: 4,
        icon: 'achievement',
        title: 'Achievement Unlocked',
        description: 'First Course Completed',
        timestamp: '3 days ago'
      }
    ])
    
    const recommendedCourses = ref([
      {
        id: 5,
        title: 'React Native Development',
        description: 'Build mobile apps with React Native',
        level: 'intermediate',
        image: 'https://picsum.photos/seed/reactnative/400/250.jpg',
        featured: true,
        progress: undefined
      },
      {
        id: 6,
        title: 'Node.js Backend',
        description: 'Server-side JavaScript development',
        level: 'advanced',
        image: 'https://picsum.photos/seed/nodejs/400/250.jpg',
        featured: false,
        progress: undefined
      }
    ])
    
    const continueCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const viewCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const browseCourses = () => {
      router.push('/courses/list')
    }
    
    return {
      user,
      enrolledCourses,
      activeCourses,
      completedCourses,
      averageProgress,
      totalStudyTime,
      recentActivities,
      recommendedCourses,
      continueCourse,
      viewCourse,
      browseCourses
    }
  }
}
</script>

<style scoped>
.student-dashboard {
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