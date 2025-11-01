<template>
  <div class="teacher-dashboard fade-in">
    <div class="content-wrapper">
      <!-- Dashboard Overview Section -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Dashboard Overview</h2>
          <div class="actions">
            <button class="quick-action-btn" @click="refreshDashboard">
              <!-- Refresh Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2v6h-6"/>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              Refresh
            </button>
            <button class="quick-action-btn primary" @click="createNewCourse">
              <!-- Plus Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              New Course
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-number">{{ dashboardStats.totalCourses }}</span>
            <span class="stat-label">Active Courses</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ dashboardStats.totalStudents }}</span>
            <span class="stat-label">Total Students</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ dashboardStats.pendingGrades }}</span>
            <span class="stat-label">Pending Grades</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ dashboardStats.avgProgress }}%</span>
            <span class="stat-label">Avg Progress</span>
          </div>
        </div>
      </div>

      <!-- Active Courses Section -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Active Courses</h2>
          <router-link to="/teacher/courses" class="quick-action-btn">
            View All Courses
          </router-link>
        </div>
        
        <ActiveCourses />
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <div class="main-content">
          <!-- Recent Activity Section -->
          <div class="quick-actions-section">
            <div class="section-header">
              <h2 class="section-title">Recent Activity</h2>
              <button class="quick-action-btn" @click="refreshActivity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2v6h-6"/>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                  <path d="M3 22v-6h6"/>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
                Refresh
              </button>
            </div>
            <RecentActivity />
          </div>
        </div>

        <div class="sidebar-content">
          <!-- Pending Reviews Section -->
          <div class="quick-actions-section">
            <div class="section-header">
              <h2 class="section-title">Pending Reviews</h2>
              <router-link to="/teacher/grading" class="quick-action-btn">
                View All
              </router-link>
            </div>
            <PendingReviews />
          </div>

          <!-- Schedule Section -->
          <div class="quick-actions-section">
            <div class="section-header">
              <h2 class="section-title">Today's Schedule</h2>
              <router-link to="/teacher/schedule" class="quick-action-btn">
                View Calendar
              </router-link>
            </div>
            <UpcomingSchedule />
          </div>

          <!-- Quick Actions Section -->
          <div class="quick-actions-section">
            <div class="section-header">
              <h2 class="section-title">Quick Actions</h2>
            </div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ActiveCourses from '@/components/teacher/TeacherDashboard/ActiveCourses.vue'
import RecentActivity from '@/components/teacher/TeacherDashboard/RecentActivity.vue'
import PendingReviews from '@/components/teacher/TeacherDashboard/PendingReviews.vue'
import UpcomingSchedule from '@/components/teacher/TeacherDashboard/UpcomingSchedule.vue'
import QuickActions from '@/components/teacher/TeacherDashboard/QuickActions.vue'

export default {
  name: 'TeacherDashboard',
  components: {
    ActiveCourses,
    RecentActivity,
    PendingReviews,
    UpcomingSchedule,
    QuickActions
  },
  setup() {
    const router = useRouter()

    // Dashboard statistics
    const dashboardStats = computed(() => ({
      totalCourses: 8,
      totalStudents: 245,
      pendingGrades: 23,
      avgProgress: 78
    }))

    // Methods
    const refreshDashboard = () => {
      console.log('Refreshing dashboard...')
      // Add refresh logic here
    }

    const refreshActivity = () => {
      console.log('Refreshing activity...')
      // Add refresh logic here
    }

    const createNewCourse = () => {
      router.push('/teacher/create-course')
    }

    return {
      dashboardStats,
      refreshDashboard,
      refreshActivity,
      createNewCourse
    }
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

.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.main-content {
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .actions {
    justify-content: flex-end;
  }
  
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>