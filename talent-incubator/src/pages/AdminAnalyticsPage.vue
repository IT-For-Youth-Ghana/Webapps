<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const timeRange = ref('30')
const selectedMetric = ref('overview')

const analyticsData = ref({
  overview: {
    totalJobs: 45,
    activeJobs: 28,
    totalApplications: 234,
    totalStudents: 156,
    placementRate: 32,
    avgTimeToHire: 18
  },
  jobMetrics: {
    byType: [
      { type: 'Full-time', count: 18, percentage: 64 },
      { type: 'Part-time', count: 8, percentage: 29 },
      { type: 'Internship', count: 12, percentage: 43 },
      { type: 'Contract', count: 7, percentage: 25 }
    ],
    byLocation: [
      { location: 'Accra', count: 23, percentage: 51 },
      { location: 'Kumasi', count: 12, percentage: 27 },
      { location: 'Tamale', count: 6, percentage: 13 },
      { location: 'Cape Coast', count: 4, percentage: 9 }
    ],
    bySalaryRange: [
      { range: '0-5k', count: 15, percentage: 33 },
      { range: '5k-10k', count: 18, percentage: 40 },
      { range: '10k-15k', count: 8, percentage: 18 },
      { range: '15k+', count: 4, percentage: 9 }
    ]
  },
  applicationMetrics: {
    byStatus: [
      { status: 'Pending', count: 45, percentage: 19 },
      { status: 'Reviewing', count: 67, percentage: 29 },
      { status: 'Interview', count: 34, percentage: 15 },
      { status: 'Approved', count: 28, percentage: 12 },
      { status: 'Rejected', count: 60, percentage: 25 }
    ],
    conversionRates: {
      applicationToInterview: 29,
      interviewToOffer: 82,
      offerToAccept: 89
    },
    monthlyTrends: [
      { month: 'Sep', applications: 45, interviews: 12, hires: 8 },
      { month: 'Oct', applications: 67, interviews: 18, hires: 12 },
      { month: 'Nov', applications: 89, interviews: 24, hires: 15 },
      { month: 'Dec', applications: 98, interviews: 28, hires: 18 },
      { month: 'Jan', applications: 78, interviews: 22, hires: 14 }
    ]
  },
  studentMetrics: {
    byStatus: [
      { status: 'Active', count: 89, percentage: 57 },
      { status: 'Job Seeking', count: 34, percentage: 22 },
      { status: 'Employed', count: 28, percentage: 18 },
      { status: 'Inactive', count: 5, percentage: 3 }
    ],
    bySkill: [
      { skill: 'Frontend Development', count: 45, percentage: 29 },
      { skill: 'Backend Development', count: 38, percentage: 24 },
      { skill: 'UI/UX Design', count: 28, percentage: 18 },
      { skill: 'Data Science', count: 23, percentage: 15 },
      { skill: 'Mobile Development', count: 15, percentage: 10 },
      { skill: 'DevOps', count: 7, percentage: 4 }
    ],
    profileCompleteness: {
      excellent: 34, // 80%+
      good: 67, // 60-79%
      fair: 45, // 40-59%
      poor: 10  // <40%
    }
  },
  performanceMetrics: {
    topPerformingJobs: [
      { title: 'Frontend Developer', company: 'TechCorp', applications: 45, views: 234 },
      { title: 'UI/UX Designer', company: 'DesignHub', applications: 38, views: 189 },
      { title: 'Backend Developer', company: 'StartupGH', applications: 34, views: 156 },
      { title: 'Data Analyst', company: 'DataCorp', applications: 28, views: 134 }
    ],
    topStudents: [
      { name: 'Kwame Asante', applications: 8, interviews: 5, profileScore: 92 },
      { name: 'Ama Osei', applications: 6, interviews: 4, profileScore: 89 },
      { name: 'Kofi Mensah', applications: 7, interviews: 3, profileScore: 85 },
      { name: 'Efua Appiah', applications: 5, interviews: 4, profileScore: 88 }
    ]
  }
})

const timeRangeOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '365', label: 'Last year' }
]

const metricOptions = [
  { value: 'overview', label: 'Overview' },
  { value: 'jobs', label: 'Jobs Analytics' },
  { value: 'applications', label: 'Applications Analytics' },
  { value: 'students', label: 'Students Analytics' },
  { value: 'performance', label: 'Performance Metrics' }
]

const getStatusColor = (status) => {
  const colors = {
    'Pending': 'warning',
    'Reviewing': 'info',
    'Interview': 'primary',
    'Approved': 'success',
    'Rejected': 'danger',
    'Active': 'success',
    'Job Seeking': 'warning',
    'Employed': 'primary',
    'Inactive': 'secondary'
  }
  return colors[status] || 'secondary'
}

const getSkillColor = (index) => {
  const colors = ['primary', 'success', 'warning', 'danger', 'info', 'secondary']
  return colors[index % colors.length]
}

const getProfileCompletenessColor = (level) => {
  const colors = {
    excellent: 'success',
    good: 'primary',
    fair: 'warning',
    poor: 'danger'
  }
  return colors[level]
}

const calculateTrend = (data, field) => {
  if (data.length < 2) return 0
  const latest = data[data.length - 1][field]
  const previous = data[data.length - 2][field]
  return ((latest - previous) / previous * 100).toFixed(1)
}

const fetchAnalytics = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Data is already set in the ref above
  } catch (error) {
    console.error('Error fetching analytics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <div class="analytics-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Analytics Dashboard</h1>
        <p class="page-subtitle">Platform insights and performance metrics</p>
      </div>
      <div class="header-controls">
        <select v-model="timeRange" class="time-select">
          <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Metric Tabs -->
    <div class="metric-tabs">
      <button
        v-for="metric in metricOptions"
        :key="metric.value"
        @click="selectedMetric = metric.value"
        :class="['metric-tab', { 'active': selectedMetric === metric.value }]"
      >
        {{ metric.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading analytics...</p>
    </div>

    <div v-else class="analytics-content">
      <!-- Overview Section -->
      <div v-if="selectedMetric === 'overview'" class="section-content">
        <div class="overview-stats">
          <div class="stat-card primary">
            <div class="stat-info">
              <div class="stat-value">{{ analyticsData.overview.totalJobs }}</div>
              <div class="stat-label">Total Jobs Posted</div>
              <div class="stat-detail">{{ analyticsData.overview.activeJobs }} currently active</div>
            </div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-info">
              <div class="stat-value">{{ analyticsData.overview.totalApplications }}</div>
              <div class="stat-label">Total Applications</div>
              <div class="stat-detail">+12% from last month</div>
            </div>
          </div>
          
          <div class="stat-card info">
            <div class="stat-info">
              <div class="stat-value">{{ analyticsData.overview.totalStudents }}</div>
              <div class="stat-label">Registered Students</div>
              <div class="stat-detail">+8% from last month</div>
            </div>
          </div>
          
          <div class="stat-card warning">
            <div class="stat-info">
              <div class="stat-value">{{ analyticsData.overview.placementRate }}%</div>
              <div class="stat-label">Placement Rate</div>
              <div class="stat-detail">{{ analyticsData.overview.avgTimeToHire }} days avg. time to hire</div>
            </div>
          </div>
        </div>

        <!-- Monthly Trends Chart -->
        <div class="chart-section card">
          <h3 class="chart-title">Application Trends</h3>
          <div class="trend-chart">
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color applications"></span>
                <span class="legend-label">Applications</span>
              </div>
              <div class="legend-item">
                <span class="legend-color interviews"></span>
                <span class="legend-label">Interviews</span>
              </div>
              <div class="legend-item">
                <span class="legend-color hires"></span>
                <span class="legend-label">Hires</span>
              </div>
            </div>
            <div class="chart-bars">
              <div
                v-for="month in analyticsData.applicationMetrics.monthlyTrends"
                :key="month.month"
                class="bar-group"
              >
                <div class="bar-label">{{ month.month }}</div>
                <div class="bars">
                  <div class="bar applications" :style="{ height: `${month.applications}%` }">
                    <span class="bar-value">{{ month.applications }}</span>
                  </div>
                  <div class="bar interviews" :style="{ height: `${month.interviews * 3}%` }">
                    <span class="bar-value">{{ month.interviews }}</span>
                  </div>
                  <div class="bar hires" :style="{ height: `${month.hires * 5}%` }">
                    <span class="bar-value">{{ month.hires }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs Analytics -->
      <div v-if="selectedMetric === 'jobs'" class="section-content">
        <div class="analytics-grid">
          <div class="chart-card">
            <h3 class="chart-title">Jobs by Type</h3>
            <div class="metric-list">
              <div
                v-for="item in analyticsData.jobMetrics.byType"
                :key="item.type"
                class="metric-item"
              >
                <div class="metric-info">
                  <span class="metric-name">{{ item.type }}</span>
                  <span class="metric-count">{{ item.count }} jobs</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${item.percentage}%` }"></div>
                </div>
                <span class="metric-percentage">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Jobs by Location</h3>
            <div class="metric-list">
              <div
                v-for="item in analyticsData.jobMetrics.byLocation"
                :key="item.location"
                class="metric-item"
              >
                <div class="metric-info">
                  <span class="metric-name">{{ item.location }}</span>
                  <span class="metric-count">{{ item.count }} jobs</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${item.percentage}%` }"></div>
                </div>
                <span class="metric-percentage">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Salary Distribution</h3>
            <div class="metric-list">
              <div
                v-for="item in analyticsData.jobMetrics.bySalaryRange"
                :key="item.range"
                class="metric-item"
              >
                <div class="metric-info">
                  <span class="metric-name">GHS {{ item.range }}</span>
                  <span class="metric-count">{{ item.count }} jobs</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${item.percentage}%` }"></div>
                </div>
                <span class="metric-percentage">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications Analytics -->
      <div v-if="selectedMetric === 'applications'" class="section-content">
        <div class="conversion-metrics">
          <div class="conversion-card">
            <h4 class="conversion-title">Application to Interview</h4>
            <div class="conversion-rate">{{ analyticsData.applicationMetrics.conversionRates.applicationToInterview }}%</div>
            <div class="conversion-detail">Of all applications</div>
          </div>
          <div class="conversion-card">
            <h4 class="conversion-title">Interview to Offer</h4>
            <div class="conversion-rate">{{ analyticsData.applicationMetrics.conversionRates.interviewToOffer }}%</div>
            <div class="conversion-detail">Of interviews conducted</div>
          </div>
          <div class="conversion-card">
            <h4 class="conversion-title">Offer to Accept</h4>
            <div class="conversion-rate">{{ analyticsData.applicationMetrics.conversionRates.offerToAccept }}%</div>
            <div class="conversion-detail">Of offers made</div>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Application Status Distribution</h3>
          <div class="status-grid">
            <div
              v-for="item in analyticsData.applicationMetrics.byStatus"
              :key="item.status"
              class="status-item"
            >
              <div :class="['status-badge', getStatusColor(item.status)]">
                {{ item.status }}
              </div>
              <div class="status-count">{{ item.count }}</div>
              <div class="status-percentage">{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Analytics -->
      <div v-if="selectedMetric === 'students'" class="section-content">
        <div class="analytics-grid">
          <div class="chart-card">
            <h3 class="chart-title">Students by Status</h3>
            <div class="status-grid">
              <div
                v-for="item in analyticsData.studentMetrics.byStatus"
                :key="item.status"
                class="status-item"
              >
                <div :class="['status-badge', getStatusColor(item.status)]">
                  {{ item.status }}
                </div>
                <div class="status-count">{{ item.count }}</div>
                <div class="status-percentage">{{ item.percentage }}%</div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Skills Distribution</h3>
            <div class="skills-chart">
              <div
                v-for="(skill, index) in analyticsData.studentMetrics.bySkill"
                :key="skill.skill"
                class="skill-bar"
              >
                <div class="skill-info">
                  <span class="skill-name">{{ skill.skill }}</span>
                  <span class="skill-count">{{ skill.count }}</span>
                </div>
                <div class="skill-progress">
                  <div 
                    :class="['skill-fill', getSkillColor(index)]"
                    :style="{ width: `${skill.percentage * 2}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Profile Completeness</h3>
            <div class="completeness-grid">
              <div class="completeness-item excellent">
                <div class="completeness-label">Excellent (80%+)</div>
                <div class="completeness-count">{{ analyticsData.studentMetrics.profileCompleteness.excellent }}</div>
              </div>
              <div class="completeness-item good">
                <div class="completeness-label">Good (60-79%)</div>
                <div class="completeness-count">{{ analyticsData.studentMetrics.profileCompleteness.good }}</div>
              </div>
              <div class="completeness-item fair">
                <div class="completeness-label">Fair (40-59%)</div>
                <div class="completeness-count">{{ analyticsData.studentMetrics.profileCompleteness.fair }}</div>
              </div>
              <div class="completeness-item poor">
                <div class="completeness-label">Poor (<40%)</div>
                <div class="completeness-count">{{ analyticsData.studentMetrics.profileCompleteness.poor }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div v-if="selectedMetric === 'performance'" class="section-content">
        <div class="performance-grid">
          <div class="performance-card">
            <h3 class="chart-title">Top Performing Jobs</h3>
            <div class="performance-list">
              <div
                v-for="(job, index) in analyticsData.performanceMetrics.topPerformingJobs"
                :key="job.title"
                class="performance-item"
              >
                <div class="rank">{{ index + 1 }}</div>
                <div class="performance-info">
                  <div class="performance-title">{{ job.title }}</div>
                  <div class="performance-company">{{ job.company }}</div>
                </div>
                <div class="performance-stats">
                  <div class="stat">{{ job.applications }} applications</div>
                  <div class="stat">{{ job.views }} views</div>
                </div>
              </div>
            </div>
          </div>

          <div class="performance-card">
            <h3 class="chart-title">Most Active Students</h3>
            <div class="performance-list">
              <div
                v-for="(student, index) in analyticsData.performanceMetrics.topStudents"
                :key="student.name"
                class="performance-item"
              >
                <div class="rank">{{ index + 1 }}</div>
                <div class="performance-info">
                  <div class="performance-title">{{ student.name }}</div>
                  <div class="performance-company">Profile: {{ student.profileScore }}%</div>
                </div>
                <div class="performance-stats">
                  <div class="stat">{{ student.applications }} applications</div>
                  <div class="stat">{{ student.interviews }} interviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #8B949E;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 1rem;
}

.time-select {
  padding: 0.75rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 250ms ease;
}

.time-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.metric-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.metric-tab {
  padding: 0.75rem 1.5rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #8B949E;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 250ms ease;
  white-space: nowrap;
}

.metric-tab:hover {
  border-color: #484F58;
  color: #F0F6FC;
}

.metric-tab.active {
  background: #007AFF;
  border-color: #007AFF;
  color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
}

.loading-text {
  color: #8B949E;
  font-size: 0.875rem;
}

.analytics-content {
  animation: fadeIn 300ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-detail {
  font-size: 0.75rem;
  color: #6E7681;
}

.chart-section {
  padding: 1.5rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 1.5rem 0;
}

.trend-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.legend-color.applications { background: #007AFF; }
.legend-color.interviews { background: #FF9F0A; }
.legend-color.hires { background: #32D74B; }

.legend-label {
  font-size: 0.875rem;
  color: #8B949E;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: end;
  height: 200px;
  padding: 1rem 0;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-label {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 500;
}

.bars {
  display: flex;
  gap: 0.25rem;
  align-items: end;
  height: 150px;
}

.bar {
  width: 1.5rem;
  border-radius: 0.25rem 0.25rem 0 0;
  position: relative;
  min-height: 0.25rem;
}

.bar.applications { background: #007AFF; }
.bar.interviews { background: #FF9F0A; }
.bar.hires { background: #32D74B; }

.bar-value {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #F0F6FC;
  font-weight: 500;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-info {
  flex: 1;
  min-width: 0;
}

.metric-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F0F6FC;
  display: block;
}

.metric-count {
  font-size: 0.75rem;
  color: #8B949E;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: #30363D;
  border-radius: 0.25rem;
  overflow: hidden;
  min-width: 4rem;
}

.progress-fill {
  height: 100%;
  background: #007AFF;
  transition: width 300ms ease;
}

.metric-percentage {
  font-size: 0.875rem;
  color: #F0F6FC;
  font-weight: 600;
  min-width: 3rem;
  text-align: right;
}

.conversion-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.conversion-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.conversion-title {
  font-size: 0.875rem;
  color: #8B949E;
  margin: 0 0 0.5rem 0;
}

.conversion-rate {
  font-size: 2.5rem;
  font-weight: 700;
  color: #007AFF;
  margin-bottom: 0.25rem;
}

.conversion-detail {
  font-size: 0.75rem;
  color: #6E7681;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.status-badge.warning {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.status-badge.info {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.status-badge.primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.status-badge.danger {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.status-badge.secondary {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.status-count {
  font-size: 1.5rem;
  font-weight: 600;
  color: #F0F6FC;
}

.status-percentage {
  font-size: 0.875rem;
  color: #8B949E;
}

.skills-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  font-size: 0.875rem;
  color: #F0F6FC;
}

.skill-count {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 600;
}

.skill-progress {
  height: 0.5rem;
  background: #30363D;
  border-radius: 0.25rem;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  transition: width 300ms ease;
}

.skill-fill.primary { background: #007AFF; }
.skill-fill.success { background: #32D74B; }
.skill-fill.warning { background: #FF9F0A; }
.skill-fill.danger { background: #FF453A; }
.skill-fill.info { background: #BF5AF2; }
.skill-fill.secondary { background: #8B949E; }

.completeness-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.completeness-item {
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.completeness-item.excellent {
  background: rgba(50, 215, 75, 0.1);
  border: 1px solid rgba(50, 215, 75, 0.2);
}

.completeness-item.good {
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.completeness-item.fair {
  background: rgba(255, 159, 10, 0.1);
  border: 1px solid rgba(255, 159, 10, 0.2);
}

.completeness-item.poor {
  background: rgba(255, 69, 58, 0.1);
  border: 1px solid rgba(255, 69, 58, 0.2);
}

.completeness-label {
  font-size: 0.75rem;
  color: #8B949E;
  margin-bottom: 0.5rem;
}

.completeness-count {
  font-size: 1.5rem;
  font-weight: 600;
  color: #F0F6FC;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.performance-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
}

.rank {
  width: 2rem;
  height: 2rem;
  background: #007AFF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.performance-info {
  flex: 1;
}

.performance-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #F0F6FC;
  margin-bottom: 0.25rem;
}

.performance-company {
  font-size: 0.75rem;
  color: #8B949E;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
}

.stat {
  font-size: 0.75rem;
  color: #8B949E;
}

@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .metric-tabs {
    justify-content: flex-start;
  }

  .overview-stats {
    grid-template-columns: 1fr;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .conversion-metrics {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .completeness-grid {
    grid-template-columns: 1fr;
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }

  .chart-bars {
    height: 150px;
  }

  .bars {
    height: 100px;
  }
}
</style>