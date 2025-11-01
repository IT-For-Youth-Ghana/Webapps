<template>
  <div class="chart-container card">
    <div class="section-header">
      <h3 class="section-title">Student Engagement Over Time</h3>
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
</template>

<script>
export default {
  name: 'EngagementChart',
  data() {
    return {
      engagementData: [
        { label: 'Mon', active: 85, submissions: 65 },
        { label: 'Tue', active: 92, submissions: 78 },
        { label: 'Wed', active: 78, submissions: 55 },
        { label: 'Thu', active: 88, submissions: 82 },
        { label: 'Fri', active: 95, submissions: 70 },
        { label: 'Sat', active: 45, submissions: 25 },
        { label: 'Sun', active: 32, submissions: 15 }
      ]
    }
  }
}
</script>

<style scoped>
.chart-container {
  padding: 1.5rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid var(--border-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
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

@media (max-width: 768px) {
  .chart-content {
    height: 250px;
  }
}
</style>