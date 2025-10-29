<template>
  <DashboardLayout>
    <div class="dashboard fade-in">
      <!-- Dashboard Header -->
      <DashboardHeader 
        :title="`Welcome back, ${user?.name}!`"
        subtitle="Continue your learning journey and track your progress"
      >
        <template #actions>
          <button class="btn btn-primary" @click="browseCourses">
            Browse Courses
          </button>
        </template>
      </DashboardHeader>
      
      <!-- Quick Stats -->
      <div class="stats-grid">
        <StatCard 
          icon="Courses" 
          :value="enrolledCourses.length" 
          label="Enrolled Courses"
        />
        <StatCard 
          icon="Progress" 
          :value="`${averageProgress}%`" 
          label="Average Progress"
        />
        <StatCard 
          icon="Time" 
          :value="`${totalStudyTime}h`" 
          label="Study Time"
        />
        <StatCard 
          icon="Complete" 
          :value="completedCourses.length" 
          label="Completed"
        />
      </div>
      
      <!-- Continue Learning -->
      <DashboardSection title="Continue Learning">
        <div class="courses-grid">
          <CourseCard 
            v-for="course in activeCourses"
            :key="course.id"
            :course="course"
            @click="continueCourse(course.id)"
          >
            <template #action>
              <button class="btn btn-primary">
                Continue Learning
              </button>
            </template>
          </CourseCard>
        </div>
      </DashboardSection>
      
      <!-- Recent Activity -->
      <DashboardSection title="Recent Activity">
        <div class="activity-list">
          <ActivityCard 
            v-for="activity in recentActivities"
            :key="activity.id"
            :icon="activity.icon"
            :title="activity.title"
            :description="activity.description"
            :timestamp="activity.timestamp"
          />
        </div>
      </DashboardSection>
      
      <!-- Recommended Courses -->
      <DashboardSection title="Recommended Courses">
        <div class="courses-grid">
          <CourseCard 
            v-for="course in recommendedCourses"
            :key="course.id"
            :course="course"
            @click="viewCourse(course.id)"
          >
            <template #action>
              <button class="btn btn-secondary">
                View Details
              </button>
            </template>
          </CourseCard>
        </div>
      </DashboardSection>
    </div>
  </DashboardLayout>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import DashboardHeader from '../../components/common/DashboardHeader.vue'
import DashboardSection from '../../components/common/DashboardSection.vue'
import StatCard from '@shared/ui-components/components/StatCard.vue'
import ActivityCard from '@shared/ui-components/components/ActivityCard.vue'
import CourseCard from '@shared/ui-components/components/CourseCard.vue'
import { useStudentData } from '../../composables/useStudentData.js'

export default {
  name: 'StudentDashboard',
  components: {
    DashboardLayout,
    DashboardHeader,
    DashboardSection,
    StatCard,
    ActivityCard,
    CourseCard
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const user = computed(() => userStore.currentUser)
    
    const {
      enrolledCourses,
      activeCourses,
      completedCourses,
      recentActivities,
      recommendedCourses,
      averageProgress,
      totalStudyTime
    } = useStudentData()
    
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
      recentActivities,
      recommendedCourses,
      averageProgress,
      totalStudyTime,
      continueCourse,
      viewCourse,
      browseCourses
    }
  }
}
</script>

<style scoped>
@import '@shared/styles/dashboard.css';
</style>