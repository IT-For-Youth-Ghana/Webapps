<template>
  <div class="student-progress fade-in">
    <div class="content-wrapper">
      <ProgressHeader 
        title="Your Learning Progress"
        subtitle="Track your achievements and course completion status"
      />
      
      <ProgressOverview
        :overall-progress="overallProgress"
        :completed-courses="completedCourses"
        :total-courses="totalCourses"
        :total-study-hours="totalStudyHours"
        :achievements-earned="achievementsEarned"
      />
      
      <CourseProgressList
        :course-progress="courseProgress"
        @continue-course="continueCourse"
        @start-course="startCourse"
        @view-certificate="viewCertificate"
      />
      
      <LearningStreak
        :current-streak="currentStreak"
        :best-streak="bestStreak"
        :weekly-study-days="weeklyStudyDays"
        :last7-days="last7Days"
      />
      
      <Achievements :achievements="achievements" />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import ProgressHeader from '../StudentDashboard/DashboardHeader.vue'
import ProgressOverview from '../StudentProgress/ProgressOverview.vue'
import CourseProgressList from '../StudentProgress/CourseProgressList.vue'
import LearningStreak from '../StudentProgress/LearningStreak.vue'
import Achievements from '../StudentProgress/Achievements.vue'

export default {
  name: 'StudentProgressPage',
  components: {
    ProgressHeader,
    ProgressOverview,
    CourseProgressList,
    LearningStreak,
    Achievements
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // Mock progress data
    const courseProgress = ref([
      {
        id: 1,
        title: 'Web Development Fundamentals',
        instructor: 'Dr. Kwame Asante',
        progress: 75,
        status: 'in_progress',
        completedLessons: 15,
        totalLessons: 20,
        completedAssignments: 3,
        totalAssignments: 4,
        studyTime: 28
      },
      {
        id: 2,
        title: 'Vue.js Complete Guide',
        instructor: 'Yaa Boahene',
        progress: 45,
        status: 'in_progress',
        completedLessons: 9,
        totalLessons: 20,
        completedAssignments: 2,
        totalAssignments: 5,
        studyTime: 18
      },
      {
        id: 3,
        title: 'Mobile App Development',
        instructor: 'Joseph Osei',
        progress: 100,
        status: 'completed',
        completedLessons: 25,
        totalLessons: 25,
        completedAssignments: 6,
        totalAssignments: 6,
        studyTime: 45
      },
      {
        id: 4,
        title: 'Database Design',
        instructor: 'Nana Ama',
        progress: 0,
        status: 'not_started',
        completedLessons: 0,
        totalLessons: 18,
        completedAssignments: 0,
        totalAssignments: 4,
        studyTime: 0
      }
    ])

    const achievements = ref([
      {
        id: 1,
        title: 'First Steps',
        description: 'Complete your first lesson',
        earned: true,
        earnedDate: new Date('2024-01-15')
      },
      {
        id: 2,
        title: 'Course Completer',
        description: 'Complete your first course',
        earned: true,
        earnedDate: new Date('2024-02-20')
      },
      {
        id: 3,
        title: 'Speed Learner',
        description: 'Complete 5 lessons in one day',
        earned: false,
        current: 3,
        target: 5
      },
      {
        id: 4,
        title: 'Consistent Learner',
        description: 'Study for 7 days in a row',
        earned: false,
        current: 4,
        target: 7
      },
      {
        id: 5,
        title: 'Assignment Master',
        description: 'Submit 10 assignments',
        earned: false,
        current: 7,
        target: 10
      },
      {
        id: 6,
        title: 'Knowledge Seeker',
        description: 'Enroll in 5 different courses',
        earned: false,
        current: 3,
        target: 5
      }
    ])

    const currentStreak = ref(4)
    const bestStreak = ref(12)
    const weeklyStudyDays = ref(5)

    // Generate last 7 days data
    const last7Days = computed(() => {
      const days = []
      const today = new Date()
      const studiedDays = [true, true, false, true, true, true, false] // Mock data
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        days.push({
          date: date.toISOString().split('T')[0],
          label: dayNames[date.getDay()],
          studied: studiedDays[6 - i],
          isToday: i === 0,
          tooltip: i === 0 ? 'Today' : `${i} day${i > 1 ? 's' : ''} ago`
        })
      }
      return days
    })

    // Computed properties
    const totalCourses = computed(() => courseProgress.value.length)
    const completedCourses = computed(() => courseProgress.value.filter(c => c.status === 'completed').length)
    const overallProgress = computed(() => {
      if (courseProgress.value.length === 0) return 0
      const total = courseProgress.value.reduce((sum, course) => sum + course.progress, 0)
      return Math.round(total / courseProgress.value.length)
    })
    const totalStudyHours = computed(() => 
      courseProgress.value.reduce((sum, course) => sum + course.studyTime, 0)
    )
    const achievementsEarned = computed(() => 
      achievements.value.filter(a => a.earned).length
    )

    const continueCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }

    const startCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }

    const viewCertificate = (courseId) => {
      router.push(`/courses/course/${courseId}/certificate`)
    }
    
    return {
      courseProgress,
      achievements,
      currentStreak,
      bestStreak,
      weeklyStudyDays,
      last7Days,
      totalCourses,
      completedCourses,
      overallProgress,
      totalStudyHours,
      achievementsEarned,
      continueCourse,
      startCourse,
      viewCertificate
    }
  }
}
</script>

<style scoped>
.student-progress {
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