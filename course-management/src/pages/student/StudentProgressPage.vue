<template>
  <div class="student-progress">
    <!-- Progress Header -->
    <div class="progress-header">
      <h1 class="page-title">📊 Your Learning Progress</h1>
      <p class="page-subtitle">Track your achievements and course completion status</p>
    </div>

    <!-- Overall Progress Stats -->
    <div class="progress-overview">
      <div class="overview-card glass-card">
        <div class="overview-icon">🎯</div>
        <div class="overview-content">
          <div class="overview-value">{{ overallProgress }}%</div>
          <div class="overview-label">Overall Progress</div>
        </div>
      </div>
      
      <div class="overview-card glass-card">
        <div class="overview-icon">📚</div>
        <div class="overview-content">
          <div class="overview-value">{{ completedCourses }}/{{ totalCourses }}</div>
          <div class="overview-label">Courses Completed</div>
        </div>
      </div>
      
      <div class="overview-card glass-card">
        <div class="overview-icon">⏱️</div>
        <div class="overview-content">
          <div class="overview-value">{{ totalStudyHours }}h</div>
          <div class="overview-label">Study Time</div>
        </div>
      </div>
      
      <div class="overview-card glass-card">
        <div class="overview-icon">🏆</div>
        <div class="overview-content">
          <div class="overview-value">{{ achievementsEarned }}</div>
          <div class="overview-label">Achievements</div>
        </div>
      </div>
    </div>

    <!-- Course Progress -->
    <div class="progress-section">
      <h2 class="section-title">📈 Course Progress</h2>
      <div class="courses-progress">
        <div 
          v-for="course in courseProgress"
          :key="course.id"
          class="course-progress-card glass-card"
        >
          <div class="course-header">
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-instructor">{{ course.instructor }}</p>
            </div>
            <div class="course-status" :class="course.status">
              {{ formatStatus(course.status) }}
            </div>
          </div>
          
          <div class="progress-details">
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: course.progress + '%' }"
                ></div>
              </div>
              <span class="progress-percentage">{{ course.progress }}%</span>
            </div>
            
            <div class="course-metrics">
              <div class="metric">
                <span class="metric-label">Lessons:</span>
                <span class="metric-value">{{ course.completedLessons }}/{{ course.totalLessons }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Assignments:</span>
                <span class="metric-value">{{ course.completedAssignments }}/{{ course.totalAssignments }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Study Time:</span>
                <span class="metric-value">{{ course.studyTime }}h</span>
              </div>
            </div>
          </div>
          
          <div class="course-actions">
            <button 
              v-if="course.status === 'in_progress'"
              class="btn btn-primary"
              @click="continueCourse(course.id)"
            >
              Continue Learning
            </button>
            <button 
              v-else-if="course.status === 'completed'"
              class="btn btn-secondary"
              @click="viewCertificate(course.id)"
            >
              View Certificate
            </button>
            <button 
              v-else
              class="btn btn-outline"
              @click="startCourse(course.id)"
            >
              Start Course
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Learning Streaks -->
    <div class="progress-section">
      <h2 class="section-title">🔥 Learning Streak</h2>
      <div class="streak-container glass-card">
        <div class="streak-info">
          <div class="streak-main">
            <div class="streak-icon">🔥</div>
            <div class="streak-details">
              <div class="streak-number">{{ currentStreak }}</div>
              <div class="streak-label">Day Streak</div>
            </div>
          </div>
          <div class="streak-stats">
            <div class="streak-stat">
              <span class="stat-label">Best Streak:</span>
              <span class="stat-value">{{ bestStreak }} days</span>
            </div>
            <div class="streak-stat">
              <span class="stat-label">This Week:</span>
              <span class="stat-value">{{ weeklyStudyDays }}/7 days</span>
            </div>
          </div>
        </div>
        
        <div class="streak-calendar">
          <div 
            v-for="day in last7Days"
            :key="day.date"
            class="calendar-day"
            :class="{ active: day.studied, today: day.isToday }"
            :title="day.tooltip"
          >
            <div class="day-label">{{ day.label }}</div>
            <div class="day-indicator">
              {{ day.studied ? '✅' : '⭕' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div class="progress-section">
      <h2 class="section-title">🏆 Achievements</h2>
      <div class="achievements-grid">
        <div 
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-card glass-card"
          :class="{ earned: achievement.earned }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-content">
            <h3 class="achievement-title">{{ achievement.title }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div class="achievement-progress" v-if="!achievement.earned">
              <div class="progress-bar mini">
                <div 
                  class="progress-fill" 
                  :style="{ width: (achievement.current / achievement.target) * 100 + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ achievement.current }}/{{ achievement.target }}</span>
            </div>
            <div v-else class="achievement-earned">
              <span class="earned-date">Earned {{ formatDate(achievement.earnedDate) }}</span>
            </div>
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
  name: 'StudentProgressPage',
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
        icon: '👶',
        earned: true,
        earnedDate: new Date('2024-01-15')
      },
      {
        id: 2,
        title: 'Course Completer',
        description: 'Complete your first course',
        icon: '🎓',
        earned: true,
        earnedDate: new Date('2024-02-20')
      },
      {
        id: 3,
        title: 'Speed Learner',
        description: 'Complete 5 lessons in one day',
        icon: '⚡',
        earned: false,
        current: 3,
        target: 5
      },
      {
        id: 4,
        title: 'Consistent Learner',
        description: 'Study for 7 days in a row',
        icon: '🔥',
        earned: false,
        current: 4,
        target: 7
      },
      {
        id: 5,
        title: 'Assignment Master',
        description: 'Submit 10 assignments',
        icon: '📝',
        earned: false,
        current: 7,
        target: 10
      },
      {
        id: 6,
        title: 'Knowledge Seeker',
        description: 'Enroll in 5 different courses',
        icon: '🔍',
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

    // Methods
    const formatStatus = (status) => {
      const statusMap = {
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'not_started': 'Not Started'
      }
      return statusMap[status] || status
    }

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }

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
      formatStatus,
      formatDate,
      continueCourse,
      startCourse,
      viewCertificate
    }
  }
}
</script>

<style scoped>
.student-progress {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.progress-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.overview-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.overview-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.courses-progress {
  display: grid;
  gap: 1.5rem;
}

.course-progress-card {
  padding: 2rem;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.course-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.course-instructor {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin: 0;
}

.course-status {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.course-status.completed {
  background: #dcfce7;
  color: #166534;
}

.course-status.in_progress {
  background: #fef3c7;
  color: #92400e;
}

.course-status.not_started {
  background: #f3f4f6;
  color: #6b7280;
}

.progress-details {
  margin-bottom: 1.5rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-bar.mini {
  height: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-primary), var(--brand-accent));
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 3rem;
  text-align: right;
}

.course-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.course-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--brand-secondary);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-outline {
  background: transparent;
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.btn-outline:hover {
  background: var(--brand-primary);
  color: white;
}

.streak-container {
  padding: 2rem;
}

.streak-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.streak-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.streak-icon {
  font-size: 3rem;
}

.streak-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
}

.streak-label {
  font-size: 1rem;
  color: var(--text-secondary);
}

.streak-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.streak-stat {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.streak-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  text-align: center;
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  transition: all 0.3s ease;
}

.calendar-day.active {
  background: var(--brand-primary);
  color: white;
}

.calendar-day.today {
  border: 2px solid var(--brand-accent);
}

.day-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.day-indicator {
  font-size: 1.2rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
}

.achievement-card.earned {
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
  border: 1px solid #f59e0b;
}

.achievement-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.achievement-earned {
  color: #92400e;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .student-progress {
    padding: 1rem 0.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .progress-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .overview-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .course-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .course-actions {
    flex-direction: column;
  }
  
  .streak-info {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .progress-overview {
    grid-template-columns: 1fr;
  }
  
  .course-metrics {
    grid-template-columns: 1fr;
  }
  
  .streak-calendar {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }
  
  .calendar-day {
    padding: 0.5rem 0.25rem;
  }
}
</style>