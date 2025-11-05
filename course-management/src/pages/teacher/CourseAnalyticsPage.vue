<template>
  <div class="course-analytics-page">
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/teacher/courses" class="breadcrumb-link">Courses</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Analytics</span>
        </div>
        <h1 class="page-title">{{ course.name }} - Analytics</h1>
        <p class="page-subtitle">Track student performance and engagement metrics</p>
      </div>
      <div class="header-actions">
        <button class="quick-action-btn" @click="exportReport">
          <!-- Download Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Report
        </button>
        <button class="quick-action-btn" @click="refreshData" :disabled="isRefreshing">
          <!-- Refresh Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotating': isRefreshing }">
            <path d="M21 2v6h-6"/>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
            <path d="M3 22v-6h6"/>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Time Period Selector -->
    <div class="time-period-section">
      <div class="period-tabs">
        <button 
          v-for="period in timePeriods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="{ active: selectedPeriod === period.value }"
          class="period-tab"
        >
          {{ period.label }}
        </button>
      </div>
      <div class="date-range">
        <input 
          type="date" 
          v-model="dateRange.start" 
          class="date-input"
          @change="handleDateRangeChange"
        >
        <span>to</span>
        <input 
          type="date" 
          v-model="dateRange.end" 
          class="date-input"
          @change="handleDateRangeChange"
        >
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="overview-stats">
      <div class="stat-card primary">
        <div class="stat-header">
          <div class="stat-icon">
            <!-- Users Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-trend" :class="getTrendClass(enrollmentTrend)">
            {{ getTrendIcon(enrollmentTrend) }}
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ overviewStats.totalStudents }}</div>
          <div class="stat-label">Total Students</div>
          <div class="stat-change">{{ enrollmentTrend.value }}% this {{ enrollmentTrend.period }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon">
            <!-- Trending Up Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="17,6 23,6 23,12"/>
            </svg>
          </div>
          <div class="stat-trend" :class="getTrendClass(performanceTrend)">
            {{ getTrendIcon(performanceTrend) }}
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ overviewStats.averagePerformance }}%</div>
          <div class="stat-label">Average Performance</div>
          <div class="stat-change">{{ performanceTrend.value }}% this {{ performanceTrend.period }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon">
            <!-- Clock Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 12"/>
            </svg>
          </div>
          <div class="stat-trend" :class="getTrendClass(engagementTrend)">
            {{ getTrendIcon(engagementTrend) }}
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ overviewStats.averageEngagement }}%</div>
          <div class="stat-label">Engagement Rate</div>
          <div class="stat-change">{{ engagementTrend.value }}% this {{ engagementTrend.period }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon">
            <!-- Check Circle Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="stat-trend" :class="getTrendClass(completionTrend)">
            {{ getTrendIcon(completionTrend) }}
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ overviewStats.completionRate }}%</div>
          <div class="stat-label">Completion Rate</div>
          <div class="stat-change">{{ completionTrend.value }}% this {{ completionTrend.period }}</div>
        </div>
      </div>
    </div>

    <!-- Main Analytics Grid -->
    <div class="analytics-grid">
      <div class="analytics-main">
        <!-- Performance Distribution -->
        <div class="analytics-section">
          <h2 class="section-title">Performance Distribution</h2>
          <div class="performance-chart">
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color excellent"></div>
                <span>Excellent (90-100%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color good"></div>
                <span>Good (75-89%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color average"></div>
                <span>Average (60-74%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color at-risk"></div>
                <span>At Risk (<60%)</span>
              </div>
            </div>
            <div class="performance-bars">
              <div v-for="tier in performanceDistribution" :key="tier.range" class="performance-tier">
                <div class="tier-info">
                  <span class="tier-label">{{ tier.label }}</span>
                  <span class="tier-count">{{ tier.count }} students</span>
                  <span class="tier-percentage">{{ tier.percentage }}%</span>
                </div>
                <div class="tier-bar">
                  <div class="tier-fill" :class="tier.class" :style="{ width: tier.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Engagement Over Time -->
        <div class="analytics-section">
          <h2 class="section-title">Engagement Over Time</h2>
          <div class="engagement-chart">
            <div class="chart-container">
              <!-- Simple line chart representation -->
              <div class="chart-grid">
                <div class="chart-y-axis">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                <div class="chart-content">
                  <div class="chart-line" :style="{ height: engagementData.maxValue + '%' }"></div>
                  <div class="chart-points">
                    <div 
                      v-for="(point, index) in engagementData.points" 
                      :key="index"
                      class="chart-point"
                      :style="{ left: point.x + '%', bottom: point.y + '%' }"
                      :title="point.tooltip"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="chart-x-axis">
                <span v-for="label in engagementData.labels" :key="label">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Assignment Performance -->
        <div class="analytics-section">
          <h2 class="section-title">Assignment Performance</h2>
          <div class="assignment-performance">
            <div class="assignment-table">
              <table>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Submissions</th>
                    <th>Average Score</th>
                    <th>Completion Rate</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="assignment in assignmentPerformance" :key="assignment.id">
                    <td class="assignment-name">{{ assignment.name }}</td>
                    <td>{{ assignment.submissions }}/{{ assignment.totalStudents }}</td>
                    <td>
                      <span class="score-badge" :class="getScoreClass(assignment.averageScore)">
                        {{ assignment.averageScore }}%
                      </span>
                    </td>
                    <td>
                      <span class="completion-badge">{{ assignment.completionRate }}%</span>
                    </td>
                    <td>{{ formatDate(assignment.dueDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-sidebar">
        <!-- Top Performers -->
        <div class="analytics-section">
          <h2 class="section-title">Top Performers</h2>
          <div class="top-performers">
            <div v-for="(student, index) in topPerformers" :key="student.id" class="performer-item">
              <div class="performer-rank">{{ index + 1 }}</div>
              <div class="performer-avatar">
                <img :src="student.avatar" :alt="student.name">
              </div>
              <div class="performer-info">
                <div class="performer-name">{{ student.name }}</div>
                <div class="performer-stats">
                  <span class="score">{{ student.averageScore }}%</span>
                  <span class="assignments">{{ student.completedAssignments }}/{{ student.totalAssignments }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Students Needing Attention -->
        <div class="analytics-section">
          <h2 class="section-title">Students Needing Attention</h2>
          <div class="at-risk-students">
            <div v-for="student in atRiskStudents" :key="student.id" class="at-risk-item">
              <div class="risk-indicator"></div>
              <div class="at-risk-info">
                <div class="student-name">{{ student.name }}</div>
                <div class="risk-reason">{{ student.reason }}</div>
                <div class="last-activity">Last active: {{ formatDate(student.lastActivity) }}</div>
              </div>
              <button class="action-btn" @click="contactStudent(student.id)" title="Contact Student">
                <!-- Mail Icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Activity Insights -->
        <div class="analytics-section">
          <h2 class="section-title">Activity Insights</h2>
          <div class="activity-insights">
            <div class="insight-item">
              <div class="insight-icon">
                <!-- Calendar Icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="insight-content">
                <div class="insight-title">Peak Activity</div>
                <div class="insight-value">Tuesdays & Thursdays</div>
                <div class="insight-detail">2-4 PM highest engagement</div>
              </div>
            </div>
            
            <div class="insight-item">
              <div class="insight-icon">
                <!-- Clock Icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 12"/>
                </svg>
              </div>
              <div class="insight-content">
                <div class="insight-title">Avg Time on Course</div>
                <div class="insight-value">{{ activityInsights.avgTimeSpent }} min/day</div>
                <div class="insight-detail">{{ activityInsights.timeTrend }}% vs last period</div>
              </div>
            </div>
            
            <div class="insight-item">
              <div class="insight-icon">
                <!-- Target Icon -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div class="insight-content">
                <div class="insight-title">Goal Achievement</div>
                <div class="insight-value">{{ activityInsights.goalAchievement }}%</div>
                <div class="insight-detail">students meeting objectives</div>
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
import { useRoute } from 'vue-router'

export default {
  name: 'CourseAnalyticsPage',
  setup() {
    const route = useRoute()
    const isRefreshing = ref(false)
    const selectedPeriod = ref('month')
    
    const timePeriods = ref([
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
      { label: 'Quarter', value: 'quarter' },
      { label: 'Year', value: 'year' }
    ])

    const dateRange = ref({
      start: '',
      end: ''
    })

    // Mock course data
    const course = ref({
      id: route.params.id,
      name: 'Web Development Fundamentals',
      totalStudents: 45
    })

    // Mock analytics data
    const overviewStats = ref({
      totalStudents: 45,
      averagePerformance: 82,
      averageEngagement: 76,
      completionRate: 68
    })

    const enrollmentTrend = ref({ value: 12, period: 'month' })
    const performanceTrend = ref({ value: 5, period: 'month' })
    const engagementTrend = ref({ value: -3, period: 'month' })
    const completionTrend = ref({ value: 8, period: 'month' })

    const performanceDistribution = ref([
      { range: '90-100', label: 'Excellent', class: 'excellent', count: 12, percentage: 27 },
      { range: '75-89', label: 'Good', class: 'good', count: 18, percentage: 40 },
      { range: '60-74', label: 'Average', class: 'average', count: 10, percentage: 22 },
      { range: '0-59', label: 'At Risk', class: 'at-risk', count: 5, percentage: 11 }
    ])

    const engagementData = ref({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      points: [
        { x: 10, y: 65, tooltip: 'Monday: 65%' },
        { x: 25, y: 78, tooltip: 'Tuesday: 78%' },
        { x: 40, y: 82, tooltip: 'Wednesday: 82%' },
        { x: 55, y: 85, tooltip: 'Thursday: 85%' },
        { x: 70, y: 72, tooltip: 'Friday: 72%' },
        { x: 85, y: 45, tooltip: 'Saturday: 45%' },
        { x: 95, y: 30, tooltip: 'Sunday: 30%' }
      ],
      maxValue: 85
    })

    const assignmentPerformance = ref([
      {
        id: 1,
        name: 'HTML & CSS Basics',
        submissions: 42,
        totalStudents: 45,
        averageScore: 88,
        completionRate: 93,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      },
      {
        id: 2,
        name: 'JavaScript Fundamentals',
        submissions: 38,
        totalStudents: 45,
        averageScore: 76,
        completionRate: 84,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        id: 3,
        name: 'React Components',
        submissions: 31,
        totalStudents: 45,
        averageScore: 72,
        completionRate: 69,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ])

    const topPerformers = ref([
      {
        id: 1,
        name: 'Emma Johnson',
        avatar: 'https://picsum.photos/seed/emma/100/100.jpg',
        averageScore: 95,
        completedAssignments: 8,
        totalAssignments: 8
      },
      {
        id: 2,
        name: 'Michael Chen',
        avatar: 'https://picsum.photos/seed/michael/100/100.jpg',
        averageScore: 92,
        completedAssignments: 7,
        totalAssignments: 8
      },
      {
        id: 3,
        name: 'Sarah Williams',
        avatar: 'https://picsum.photos/seed/sarah/100/100.jpg',
        averageScore: 89,
        completedAssignments: 7,
        totalAssignments: 8
      }
    ])

    const atRiskStudents = ref([
      {
        id: 1,
        name: 'James Davis',
        reason: 'Below 60% average score',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 72)
      },
      {
        id: 2,
        name: 'Alex Martinez',
        reason: 'Missing assignments',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48)
      }
    ])

    const activityInsights = ref({
      avgTimeSpent: 45,
      timeTrend: 12,
      goalAchievement: 73
    })

    // Methods
    const refreshData = async () => {
      isRefreshing.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Refresh data here
      } finally {
        isRefreshing.value = false
      }
    }

    const exportReport = () => {
      // Export analytics report
      console.log('Exporting report for course:', course.value.id)
    }

    const handleDateRangeChange = () => {
      // Update analytics based on date range
      console.log('Date range changed:', dateRange.value)
    }

    const getTrendClass = (trend) => {
      if (trend.value > 0) return 'positive'
      if (trend.value < 0) return 'negative'
      return 'neutral'
    }

    const getTrendIcon = (trend) => {
      if (trend.value > 0) return '↑'
      if (trend.value < 0) return '↓'
      return '→'
    }

    const getScoreClass = (score) => {
      if (score >= 90) return 'excellent'
      if (score >= 75) return 'good'
      if (score >= 60) return 'average'
      return 'at-risk'
    }

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const contactStudent = (studentId) => {
      // Open message dialog for student
      console.log('Contact student:', studentId)
    }

    onMounted(() => {
      // Load analytics data
      refreshData()
    })

    return {
      // Data
      course,
      isRefreshing,
      selectedPeriod,
      timePeriods,
      dateRange,
      overviewStats,
      enrollmentTrend,
      performanceTrend,
      engagementTrend,
      completionTrend,
      performanceDistribution,
      engagementData,
      assignmentPerformance,
      topPerformers,
      atRiskStudents,
      activityInsights,
      
      // Methods
      refreshData,
      exportReport,
      handleDateRangeChange,
      getTrendClass,
      getTrendIcon,
      getScoreClass,
      formatDate,
      contactStudent
    }
  }
}
</script>

<style scoped>
.course-analytics-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary);
}

.breadcrumb-separator {
  color: var(--text-secondary);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

/* Quick Actions */
.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.quick-action-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Time Period Selector */
.time-period-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.period-tabs {
  display: flex;
  gap: 0.5rem;
}

.period-tab {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.period-tab:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.period-tab.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* Overview Stats */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  position: relative;
}

.stat-card.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: white;
  border-color: var(--primary);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--interactive-primary);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-trend {
  font-size: 1.2rem;
  font-weight: 700;
}

.stat-trend.positive {
  color: var(--status-success);
}

.stat-trend.negative {
  color: var(--status-error);
}

.stat-trend.neutral {
  color: var(--text-secondary);
}

.stat-content {
  margin-left: 1rem;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.analytics-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analytics-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

/* Performance Distribution */
.performance-chart {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.excellent { background: var(--status-success); }
.legend-color.good { background: var(--primary); }
.legend-color.average { background: var(--status-warning); }
.legend-color.at-risk { background: var(--status-error); }

.performance-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performance-tier {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tier-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.tier-percentage {
  font-weight: 600;
  color: var(--text-primary);
}

.tier-bar {
  height: 24px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.tier-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.tier-fill.excellent { background: var(--status-success); }
.tier-fill.good { background: var(--primary); }
.tier-fill.average { background: var(--status-warning); }
.tier-fill.at-risk { background: var(--status-error); }

/* Engagement Chart */
.engagement-chart {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  height: 300px;
}

.chart-container {
  height: 100%;
  position: relative;
}

.chart-grid {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  height: 100%;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.chart-content {
  position: relative;
  height: calc(100% - 2rem);
  margin: 1rem 0;
}

.chart-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  background: linear-gradient(to top, var(--primary), rgba(59, 130, 246, 0.2));
  border-radius: 4px 4px 0 0;
}

.chart-points {
  position: relative;
  height: 100%;
}

.chart-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--primary);
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-point:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Assignment Performance */
.assignment-performance {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.assignment-table {
  width: 100%;
  border-collapse: collapse;
}

.assignment-table th {
  background: var(--bg-secondary);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-light);
}

.assignment-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.assignment-name {
  font-weight: 500;
  color: var(--text-primary);
}

.score-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.score-badge.excellent { background: rgba(16, 185, 129, 0.1); color: var(--status-success); }
.score-badge.good { background: rgba(59, 130, 246, 0.1); color: var(--primary); }
.score-badge.average { background: rgba(245, 158, 11, 0.1); color: var(--status-warning); }
.score-badge.at-risk { background: rgba(239, 68, 68, 0.1); color: var(--status-error); }

.completion-badge {
  background: var(--interactive-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Top Performers */
.top-performers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.performer-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.performer-rank {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary);
  min-width: 30px;
  text-align: center;
}

.performer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
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

.performer-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.score {
  font-weight: 600;
  color: var(--primary);
}

/* At Risk Students */
.at-risk-students {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.at-risk-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid var(--status-error);
  border-radius: 8px;
}

.risk-indicator {
  width: 8px;
  height: 8px;
  background: var(--status-error);
  border-radius: 50%;
  flex-shrink: 0;
}

.at-risk-info {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.risk-reason {
  font-size: 0.875rem;
  color: var(--status-error);
  margin-bottom: 0.25rem;
}

.last-activity {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.action-btn {
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--primary);
  color: white;
}

/* Activity Insights */
.activity-insights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.insight-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--interactive-primary);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.insight-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.insight-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .course-analytics-page {
    padding: 1rem;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .time-period-section {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .performance-chart .chart-legend {
    grid-template-columns: 1fr;
  }
  
  .assignment-table {
    font-size: 0.75rem;
  }
  
  .assignment-table th,
  .assignment-table td {
    padding: 0.5rem;
  }
}
</style>