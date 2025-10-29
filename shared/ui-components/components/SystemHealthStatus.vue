<template>
  <div class="system-health card">
    <div class="status-header">
      <h2 class="status-title">System Status</h2>
      <div class="status-indicator" :class="healthData.status">
        {{ healthData.status.toUpperCase() }}
      </div>
    </div>
    <div class="status-metrics">
      <div class="metric-item">
        <span class="metric-label">Uptime:</span>
        <span class="metric-value">{{ healthData.uptime }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Response Time:</span>
        <span class="metric-value">{{ healthData.responseTime }}ms</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Active Users:</span>
        <span class="metric-value">{{ healthData.activeUsers }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Storage Used:</span>
        <span class="metric-value">{{ healthData.storageUsed }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemHealthStatus',
  props: {
    healthData: {
      type: Object,
      default: () => ({
        status: 'healthy',
        uptime: '99.9%',
        responseTime: 156,
        activeUsers: 2847,
        storageUsed: 67
      })
    }
  }
}
</script>

<style scoped>
.system-health {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.status-indicator.healthy {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.metric-value {
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .status-metrics {
    grid-template-columns: 1fr;
  }
}
</style>