<template>
  <div class="student-dashboard fade-in">
    <div class="content-wrapper">
      <!-- Welcome Header -->
      <div class="quick-actions-section">
        <div class="section-header">
          <div class="welcome-section">
            <h2 class="section-title">Welcome back, {{ user?.name }}!</h2>
            <p class="welcome-subtitle">Continue your learning journey and track your progress</p>
          </div>
          <button @click="refreshData" class="quick-action-btn" :disabled="isRefreshing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
        </div>
        <div class="quick-actions-grid">
          <button @click="browseCourses" class="quick-action-btn primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Browse Courses
          </button>
          <button @click="viewMyCourses" class="quick-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            My Courses
          </button>
          <button @click="viewAssignments" class="quick-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Assignments
          </button>
          <button @click="viewProgress" class="quick-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            My Progress
          </button>
        </div>
      </div>

      <!-- Learning Stats -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Learning Overview</h2>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ enrolledCourses.length }}</div>
              <div class="stat-label">Enrolled Courses</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-number">{{ completedCourses.length }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ averageProgress }}%</div>
              <div class="stat-label">Average Progress</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏰</div>
            <div class="stat-info">
              <div class="stat-number">{{ totalStudyTime }}h</div>
              <div class="stat-label">Study Time</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Learning -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Continue Learning ({{ activeCourses.length }})</h2>
          <button @click="viewMyCourses" class="quick-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
            View All
          </button>
        </div>
        
        <div v-if="activeCourses.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h3 class="empty-title">No active courses</h3>
          <p class="empty-description">Explore and enroll in courses to start learning</p>
          <button class="quick-action-btn primary" @click="browseCourses">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Browse Courses
          </button>
        </div>
        
        <div v-else class="course-grid">
          <div v-for="course in activeCourses.slice(0, 3)" :key="course.id" class="course-card">
            <div class="course-header">
              <h3 class="course-title">{{ course.title }}</h3>
              <span class="course-progress">{{ course.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
            </div>
            <div class="course-actions">
              <button @click="continueCourse(course.id)" class="quick-action-btn primary">
                Continue Learning
              </button>
              <button @click="viewCourse(course.id)" class="quick-action-btn">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Recent Activity</h2>
        </div>
        <div class="activity-list">
          <div v-for="activity in recentActivities.slice(0, 5)" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ activity.timestamp }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Courses -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Recommended for You</h2>
          <button @click="browseCourses" class="quick-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
            View All
          </button>
        </div>
        
        <div class="course-grid">
          <div v-for="course in recommendedCourses.slice(0, 2)" :key="course.id" class="course-card recommended">
            <div class="course-header">
              <h3 class="course-title">{{ course.title }}</h3>
              <span class="course-level" :class="course.level">{{ course.level }}</span>
            </div>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-actions">
              <button @click="viewCourse(course.id)" class="quick-action-btn primary">
                View Course
              </button>
              <button @click="enrollCourse(course.id)" class="quick-action-btn">
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Dashboard Info -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Student Dashboard</h2>
        </div>
        <div class="role-info">
          <p>Welcome to your student dashboard! Here you can track your learning progress, access your courses, and discover new learning opportunities. Use the quick actions above to navigate through your learning journey.</p>
          <div class="role-demo-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Use the User Switcher (bottom-right) to experience different user perspectives</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'StudentDashboard',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const user = computed(() => userStore.currentUser || { name: 'John Doe' })
    const isRefreshing = ref(false)
    
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
        title: 'Assignment Submitted',
        description: 'JavaScript Fundamentals Quiz',
        timestamp: '2 hours ago'
      },
      {
        id: 2,
        title: 'Course Completed',
        description: 'Mobile App Development',
        timestamp: '1 day ago'
      },
      {
        id: 3,
        title: 'Quiz Passed',
        description: 'Vue.js Components Assessment',
        timestamp: '2 days ago'
      },
      {
        id: 4,
        title: 'Achievement Unlocked',
        description: 'First Course Completed',
        timestamp: '3 days ago'
      },
      {
        id: 5,
        title: 'Lesson Completed',
        description: 'Introduction to JavaScript Variables',
        timestamp: '1 week ago'
      }
    ])
    
    const recommendedCourses = ref([
      {
        id: 5,
        title: 'React Native Development',
        description: 'Build mobile apps with React Native',
        level: 'intermediate'
      },
      {
        id: 6,
        title: 'Node.js Backend',
        description: 'Server-side JavaScript development',
        level: 'advanced'
      },
      {
        id: 7,
        title: 'Python Data Science',
        description: 'Analyze data with Python and pandas',
        level: 'beginner'
      }
    ])
    
    // Methods
    const refreshData = async () => {
      isRefreshing.value = true
      // Simulate API call
      setTimeout(() => {
        isRefreshing.value = false
        console.log('Student dashboard data refreshed')
      }, 1000)
    }
    
    const continueCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const viewCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const browseCourses = () => {
      router.push('/courses/list')
    }
    
    const viewMyCourses = () => {
      router.push('/student/courses')
    }
    
    const viewAssignments = () => {
      router.push('/student/assignments')
    }
    
    const viewProgress = () => {
      router.push('/student/progress')
    }
    
    const enrollCourse = (courseId) => {
      console.log('Enrolling in course:', courseId)
      // Add enrollment logic here
    }
    
    onMounted(() => {
      refreshData()
    })
    
    return {
      user,
      enrolledCourses,
      activeCourses,
      completedCourses,
      averageProgress,
      totalStudyTime,
      recentActivities,
      recommendedCourses,
      isRefreshing,
      refreshData,
      continueCourse,
      viewCourse,
      browseCourses,
      viewMyCourses,
      viewAssignments,
      viewProgress,
      enrollCourse
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

/* Quick Actions Section */
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

.welcome-section {
  flex: 1;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.welcome-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
  justify-content: center;
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

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Course Grid */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.course-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-card.recommended {
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(var(--primary-rgb), 0.05) 100%);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.course-progress {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.course-level {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.course-level.beginner {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.course-level.intermediate {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.course-level.advanced {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.course-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
}

.course-actions .quick-action-btn {
  flex: 1;
  justify-content: center;
  padding: 0.75rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.activity-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Role Info */
.role-info {
  color: var(--text-secondary);
  line-height: 1.6;
}

.role-demo-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--interactive-secondary);
  border-radius: 8px;
  color: var(--interactive-primary);
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .course-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>