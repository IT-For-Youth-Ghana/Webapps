<template>
  <div class="chart-container card">
    <div class="section-header">
      <h3 class="section-title">Progress Distribution</h3>
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
</template>

<script>
export default {
  name: 'ProgressDistribution',
  data() {
    return {
      progressDistribution: [
        { range: '90-100%', count: 12, percentage: 24, color: '#10b981' },
        { range: '80-89%', count: 18, percentage: 36, color: '#3b82f6' },
        { range: '70-79%', count: 15, percentage: 30, color: '#f59e0b' },
        { range: '60-69%', count: 4, percentage: 8, color: '#ef4444' },
        { range: '0-59%', count: 1, percentage: 2, color: '#6b7280' }
      ]
    }
  }
}
</script>

<style scoped>
.chart-container {
  padding: 1.5rem;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid var(--border-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-content {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border-radius: 0.25rem;
  min-width: 50px;
  transition: all 0.3s ease;
}

.segment-bar:hover {
  opacity: 0.8;
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
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .progress-segment {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .segment-info {
    width: 100%;
  }
}
</style>