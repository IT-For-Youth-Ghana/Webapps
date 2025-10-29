<template>
  <div class="teacher-dashboard fade-in">
    <TeacherHeader />
    
    <div class="content-wrapper">
      <DashboardStats />

      <div class="content-grid">
        <div class="main-content">
          <ActiveCourses />
          <RecentActivity />
        </div>

        <div class="sidebar-content">
          <PendingReviews />
          <UpcomingSchedule />
          <QuickActions />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TeacherHeader from '@/components/teacher/TeacherHeader.vue'
import DashboardStats from '@/components/teacher/TeacherDashboard/DashboardStats.vue'
import ActiveCourses from '@/components/teacher/TeacherDashboard/ActiveCourses.vue'
import RecentActivity from '@/components/teacher/TeacherDashboard/RecentActivity.vue'
import PendingReviews from '@/components/teacher/TeacherDashboard/PendingReviews.vue'
import UpcomingSchedule from '@/components/teacher/TeacherDashboard/UpcomingSchedule.vue'
import QuickActions from '@/components/teacher/TeacherDashboard/QuickActions.vue'

export default {
  name: 'TeacherDashboard',
  components: {
    TeacherHeader,
    DashboardStats,
    ActiveCourses,
    RecentActivity,
    PendingReviews,
    UpcomingSchedule,
    QuickActions
  }
}
</script>

<style scoped>
.teacher-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>