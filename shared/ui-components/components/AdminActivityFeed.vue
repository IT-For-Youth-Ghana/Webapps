<template>
  <div class="activity-section">
    <h2 class="section-title">Recent System Activity</h2>
    <div class="activity-feed card">
      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <div class="activity-icon" :class="activity.type">
          {{ getActivityIcon(activity.type) }}
        </div>
        <div class="activity-content">
          <div class="activity-text">{{ activity.description }}</div>
          <div class="activity-meta">
            <span class="activity-user">{{ activity.user }}</span>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
        <div v-if="activity.severity" class="activity-severity" :class="activity.severity">
          {{ activity.severity.toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminActivityFeed',
  props: {
    activities: {
      type: Array,
      default: () => [
        {
          id: 1,
          type: 'user',
          description: 'New institution registered: University of Cape Coast',
          user: 'System',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          severity: 'info'
        },
        {
          id: 2,
          type: 'security',
          description: 'Failed login attempts detected from IP 192.168.1.100',
          user: 'Security Monitor',
          timestamp: new Date(Date.now() - 32 * 60 * 1000),
          severity: 'warning'
        },
        {
          id: 3,
          type: 'system',
          description: 'Database backup completed successfully',
          user: 'System',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          severity: 'success'
        }
      ]
    }
  },
  methods: {
    getActivityIcon(type) {
      const icons = {
        user: 'U',
        security: 'S',
        system: 'T',
        course: 'C',
        institution: 'I'
      }
      return icons[type] || 'A'
    },
    formatTime(timestamp) {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (minutes < 60) {
        return `${minutes} minutes ago`
      } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
      } else {
        const days = Math.floor(hours / 24)
        return `${days} day${days !== 1 ? 's' : ''} ago`
      }
    }
  }
}
</script>

<style scoped>
.activity-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.activity-feed {
  padding: 1.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon.user {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.activity-icon.security {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.activity-icon.system {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
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
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.activity-severity {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
}

.activity-severity.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.activity-severity.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.activity-severity.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

@media (max-width: 768px) {
  .activity-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 0.75rem;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>