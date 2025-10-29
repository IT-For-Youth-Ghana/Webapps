<template>
  <div class="teacher-analytics">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Analytics Dashboard</h1>
        <p class="page-subtitle">Monitor student progress, engagement, and course performance</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportReport">
 
          Export Report
        </button>
        <select v-model="selectedPeriod" class="period-select">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card glass-card">
        <div class="metric-header">
          <div class="metric-icon">👥</div>
          <div class="metric-trend up">+12%</div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ totalStudents }}</div>
          <div class="metric-label">Total Students</div>
        </div>
      </div>
      
      <div class="metric-card glass-card">
        <div class="metric-header">
         
          <div class="metric-trend up">+8%</div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ averageProgress }}%</div>
          <div class="metric-label">Avg Progress</div>
        </div>
      </div>
      
      <div class="metric-card glass-card">
        <div class="metric-header">
    
          <div class="metric-trend up">+0.3</div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ averageRating.toFixed(1) }}</div>
          <div class="metric-label">Course Rating</div>
        </div>
      </div>
      
      <div class="metric-card glass-card">
        <div class="metric-header">
          <div class="metric-icon">✅</div>
          <div class="metric-trend down">-5%</div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ completionRate }}%</div>
          <div class="metric-label">Completion Rate</div>
        </div>
      </div>
    </div>

    <!-- Course Filter -->
    <div class="course-filter glass-card">
      <label class="filter-label">Filter by Course:</label>
      <select v-model="selectedCourse" class="course-select">
        <option value="">All Courses</option>
        <option v-for="course in courses" :key="course.id" :value="course.id">
          {{ course.title }}
        </option>
      </select>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <!-- Engagement Chart -->
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3 class="chart-title">📈 Student Engagement Over Time</h3>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color" style="background: #3b82f6;"></div>
              <span>Active Students</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #10b981;"></div>
              <span>Assignment Submissions</span>
            </div>
          </div>
        </div>
        <div class="chart-content">
          <div class="mock-chart engagement-chart">
            <div v-for="(bar, index) in engagementData" :key="index" class="chart-bar">
              <div class="bar-active" :style="{ height: bar.active + '%' }"></div>
              <div class="bar-submissions" :style="{ height: bar.submissions + '%' }"></div>
              <div class="bar-label">{{ bar.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Distribution -->
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3 class="chart-title">🎯 Progress Distribution</h3>
        </div>
        <div class="chart-content">
          <div class="progress-distribution">
            <div v-for="segment in progressDistribution" :key="segment.range" class="progress-segment">
              <div class="segment-bar" :style="{ width: segment.percentage + '%', background: segment.color }"></div>
              <div class="segment-info">
                <span class="segment-label">{{ segment.range }}</span>
                <span class="segment-count">{{ segment.count }} students ({{ segment.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3 class="chart-title">🏆 Top Performers</h3>
        </div>
        <div class="chart-content">
          <div class="performers-list">
            <div v-for="(student, index) in topPerformers" :key="student.id" class="performer-item">
              <div class="performer-rank">{{ index + 1 }}</div>
              <div class="performer-avatar">
                <img :src="student.avatar" :alt="student.name" />
              </div>
              <div class="performer-info">
                <div class="performer-name">{{ student.name }}</div>
                <div class="performer-course">{{ getCourseTitle(student.courseId) }}</div>
              </div>
              <div class="performer-score">{{ student.score }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Performance -->
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3 class="chart-title">📝 Assignment Performance</h3>
        </div>
        <div class="chart-content">
          <div class="assignment-performance">
            <div v-for="assignment in assignmentPerformance" :key="assignment.id" class="assignment-item">
              <div class="assignment-header">
                <div class="assignment-name">{{ assignment.title }}</div>
                <div class="assignment-avg">Avg: {{ assignment.averageScore }}%</div>
              </div>
              <div class="assignment-bar">
                <div class="score-distribution">
                  <div 
                    v-for="grade in assignment.gradeDistribution" 
                    :key="grade.range"
                    class="grade-segment"
                    :style="{ width: grade.percentage + '%', background: grade.color }"
                    :title="`${grade.range}: ${grade.count} students`"
                  ></div>
                </div>
              </div>
              <div class="assignment-stats">
                <span class="stat">{{ assignment.submitted }}/{{ assignment.total }} submitted</span>
                <span class="stat">{{ assignment.graded }} graded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Tracking -->
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3 class="chart-title">📅 Attendance Overview</h3>
        </div>
        <div class="chart-content">
          <div class="attendance-overview">
            <div class="attendance-summary">
              <div class="summary-item">
                <div class="summary-value">{{ overallAttendance }}%</div>
                <div class="summary-label">Overall Attendance</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">{{ averageSessionTime }}</div>
                <div class="summary-label">Avg Session Time</div>
              </div>
            </div>
            <div class="attendance-heatmap">
              <div class="heatmap-header">
                <div class="day-label" v-for="day in weekDays" :key="day">{{ day }}</div>
              </div>
              <div class="heatmap-grid">
                <div 
                  v-for="(week, weekIndex) in attendanceHeatmap" 
                  :key="weekIndex"
                  class="heatmap-week"
                >
                  <div 
                    v-for="(day, dayIndex) in week" 
                    :key="dayIndex"
                    class="heatmap-day"
                    :class="getAttendanceLevel(day)"
                    :title="`${day}% attendance`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Activity Feed -->
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3 class="chart-title"> Recent Student Activity</h3>
        </div>
        <div class="chart-content">
          <div class="activity-feed">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">{{ getActivityIcon(activity.type) }}</div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.description }}</div>
                <div class="activity-meta">
                  <span class="activity-student">{{ activity.studentName }}</span>
                  <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'TeacherAnalyticsPage',
  setup() {
    // Reactive data
    const selectedPeriod = ref('month')
    const selectedCourse = ref('')
    
    // Mock data
    const courses = ref([
      { id: 1, title: 'Web Development Fundamentals' },
      { id: 2, title: 'Vue.js Complete Guide' },
      { id: 3, title: 'Mobile App Development' }
    ])
    
    const engagementData = ref([
      { label: 'Mon', active: 85, submissions: 65 },
      { label: 'Tue', active: 92, submissions: 78 },
      { label: 'Wed', active: 78, submissions: 55 },
      { label: 'Thu', active: 88, submissions: 82 },
      { label: 'Fri', active: 95, submissions: 70 },
      { label: 'Sat', active: 45, submissions: 25 },
      { label: 'Sun', active: 32, submissions: 15 }
    ])
    
    const progressDistribution = ref([
      { range: '90-100%', count: 12, percentage: 24, color: '#10b981' },
      { range: '80-89%', count: 18, percentage: 36, color: '#3b82f6' },
      { range: '70-79%', count: 15, percentage: 30, color: '#f59e0b' },
      { range: '60-69%', count: 4, percentage: 8, color: '#ef4444' },
      { range: '0-59%', count: 1, percentage: 2, color: '#6b7280' }
    ])
    
    const topPerformers = ref([
      { id: 1, name: 'Kwame Asante', courseId: 1, score: 98, avatar: 'https://picsum.photos/seed/student1/100/100.jpg' },
      { id: 2, name: 'Yaa Boahene', courseId: 2, score: 96, avatar: 'https://picsum.photos/seed/student2/100/100.jpg' },
      { id: 3, name: 'Joseph Osei', courseId: 1, score: 94, avatar: 'https://picsum.photos/seed/student3/100/100.jpg' },
      { id: 4, name: 'Ama Serwaa', courseId: 3, score: 92, avatar: 'https://picsum.photos/seed/student4/100/100.jpg' },
      { id: 5, name: 'Kofi Mensah', courseId: 2, score: 90, avatar: 'https://picsum.photos/seed/student5/100/100.jpg' }
    ])
    
    const assignmentPerformance = ref([
      {
        id: 1,
        title: 'JavaScript Arrays Quiz',
        averageScore: 87,
        submitted: 24,
        total: 25,
        graded: 22,
        gradeDistribution: [
          { range: 'A', count: 8, percentage: 35, color: '#10b981' },
          { range: 'B', count: 10, percentage: 43, color: '#3b82f6' },
          { range: 'C', count: 4, percentage: 17, color: '#f59e0b' },
          { range: 'F', count: 1, percentage: 5, color: '#ef4444' }
        ]
      },
      {
        id: 2,
        title: 'Vue Component Project',
        averageScore: 92,
        submitted: 14,
        total: 15,
        graded: 12,
        gradeDistribution: [
          { range: 'A', count: 9, percentage: 64, color: '#10b981' },
          { range: 'B', count: 4, percentage: 29, color: '#3b82f6' },
          { range: 'C', count: 1, percentage: 7, color: '#f59e0b' },
          { range: 'F', count: 0, percentage: 0, color: '#ef4444' }
        ]
      }
    ])
    
    const attendanceHeatmap = ref([
      [78, 85, 92, 88, 75, 45, 32],
      [82, 88, 95, 90, 78, 52, 38],
      [75, 82, 88, 85, 82, 48, 35],
      [80, 85, 90, 92, 80, 50, 40]
    ])
    
    const weekDays = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    
    const recentActivities = ref([
      {
        id: 1,
        type: 'submission',
        description: 'submitted JavaScript Arrays assignment',
        studentName: 'Kwame Asante',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 2,
        type: 'login',
        description: 'logged in and started Vue.js lesson',
        studentName: 'Yaa Boahene',
        timestamp: new Date(Date.now() - 32 * 60 * 1000)
      },
      {
        id: 3,
        type: 'completion',
        description: 'completed CSS Flexbox module',
        studentName: 'Joseph Osei',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        id: 4,
        type: 'question',
        description: 'asked a question in the forum',
        studentName: 'Ama Serwaa',
        timestamp: new Date(Date.now() - 78 * 60 * 1000)
      }
    ])
    
    // Computed properties
    const totalStudents = computed(() => 50)
    const averageProgress = computed(() => 78)
    const averageRating = computed(() => 4.7)
    const completionRate = computed(() => 82)
    const overallAttendance = computed(() => 78)
    const averageSessionTime = computed(() => '42 min')
    
    // Methods
    const getCourseTitle = (courseId) => {
      const course = courses.value.find(c => c.id === courseId)
      return course ? course.title : 'Unknown Course'
    }
    
    const getAttendanceLevel = (percentage) => {
      if (percentage >= 80) return 'high'
      if (percentage >= 60) return 'medium'
      if (percentage >= 40) return 'low'
      return 'very-low'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        submission: '📝',
        login: '🟢',
        completion: '✅',
        question: '❓',
        grade: '📊'
      }
      return icons[type] || '📋'
    }
    
    const formatTime = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (minutes < 60) {
        return `${minutes} min ago`
      } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else {
        return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
    
    const exportReport = () => {
      console.log('Exporting analytics report...')
      alert('Analytics report exported successfully!')
    }
    
    return {
      selectedPeriod,
      selectedCourse,
      courses,
      engagementData,
      progressDistribution,
      topPerformers,
      assignmentPerformance,
      attendanceHeatmap,
      weekDays,
      recentActivities,
      totalStudents,
      averageProgress,
      averageRating,
      completionRate,
      overallAttendance,
      averageSessionTime,
      getCourseTitle,
      getAttendanceLevel,
      getActivityIcon,
      formatTime,
      exportReport
    }
  }
}
</script>

<style scoped>
.teacher-analytics {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

.period-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  padding: 1.5rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.metric-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-trend {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.metric-trend.up {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.metric-trend.down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.metric-content {
  text-align: center;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.course-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.course-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-container {
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-content {
  height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.mock-chart.engagement-chart {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 100%;
  width: 100%;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar-active, .bar-submissions {
  width: 20px;
  border-radius: 2px 2px 0 0;
  margin-bottom: 0.5rem;
  position: absolute;
  bottom: 20px;
}

.bar-active {
  background: #3b82f6;
  left: 0;
}

.bar-submissions {
  background: #10b981;
  right: 0;
}

.bar-label {
  position: absolute;
  bottom: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.progress-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.progress-segment {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.segment-bar {
  height: 30px;
  border-radius: var(--radius-sm);
  min-width: 50px;
}

.segment-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.segment-label {
  font-weight: 600;
  color: var(--text-primary);
}

.segment-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.performers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.performer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.performer-rank {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--brand-primary);
  min-width: 30px;
  text-align: center;
}

.performer-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.performer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.performer-info {
  flex: 1;
}

.performer-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.performer-course {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.performer-score {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--brand-primary);
}

.assignment-performance {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.assignment-item {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  background: var(--bg-tertiary);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.assignment-name {
  font-weight: 600;
  color: var(--text-primary);
}

.assignment-avg {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.assignment-bar {
  margin-bottom: 0.75rem;
}

.score-distribution {
  display: flex;
  height: 20px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.grade-segment {
  transition: opacity 0.3s ease;
}

.grade-segment:hover {
  opacity: 0.8;
}

.assignment-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.attendance-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.attendance-summary {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.summary-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.attendance-heatmap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.heatmap-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.day-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.heatmap-day {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
}

.heatmap-day.very-low {
  background: #f3f4f6;
}

.heatmap-day.low {
  background: #fbbf24;
}

.heatmap-day.medium {
  background: #3b82f6;
}

.heatmap-day.high {
  background: #10b981;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon.submission {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.activity-icon.login {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.activity-icon.completion {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.activity-icon.question {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .teacher-analytics {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .course-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .chart-content {
    height: 250px;
  }
  
  .assignment-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .attendance-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .heatmap-day {
    width: 15px;
    height: 15px;
  }
  
  .performer-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .assignment-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>