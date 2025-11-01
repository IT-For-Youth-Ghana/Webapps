<template>
  <section class="activity-section">
    <div class="section-header">
      <h2 class="section-title">Recent Activity</h2>
      <button @click="$emit('refresh')" class="refresh-btn" :disabled="isRefreshing">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 2v6h-6"/>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
          <path d="M3 22v-6h6"/>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
        Refresh
      </button>
    </div>

    <div class="activity-list">
      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <div class="activity-icon" :class="activity.type">
          <svg v-if="activity.type === 'course'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <svg v-else-if="activity.type === 'assignment'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <svg v-else-if="activity.type === 'grade'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div class="activity-content">
          <div class="activity-message">{{ activity.message }}</div>
          <div class="activity-meta">
            <span class="activity-role">{{ activity.role }}</span>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
        <div v-if="activity.action" class="activity-action">
          <router-link :to="activity.action.to" class="action-btn">
            {{ activity.action.label }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RecentActivityList',
  props: {
    activities: {
      type: Array,
      default: () => []
    },
    isRefreshing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['refresh'],
  methods: {
    formatTime(timestamp) {
      const now = new Date()
      const activityTime = new Date(timestamp)
      const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return activityTime.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.activity-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e5e5;
}

.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activity-list {
  padding: 1.5rem 2rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 0.875rem;
  color: #111;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.activity-action {
  flex-shrink: 0;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: #111;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  text-decoration: none;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #374151;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .activity-icon {
    align-self: flex-start;
  }
}
</style>