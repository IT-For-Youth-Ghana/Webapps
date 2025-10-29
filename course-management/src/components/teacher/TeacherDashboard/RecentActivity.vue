<template>
  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">Recent Activity</h2>
      <button class="btn-secondary btn-sm">
        <FunnelIcon class="w-4 h-4" />
        Filter
      </button>
    </div>
    
    <div class="activity-feed">
      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <div class="activity-icon" :class="activity.type">
          <component :is="activity.icon" class="w-5 h-5" />
        </div>
        <div class="activity-content">
          <div class="activity-message">{{ activity.message }}</div>
          <div class="activity-meta">
            <span class="activity-course">{{ activity.course }}</span>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
        <div class="activity-action" v-if="activity.actionLabel">
          <button class="btn-secondary btn-sm">{{ activity.actionLabel }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { DocumentTextIcon, InformationCircleIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'RecentActivity',
  components: {
    DocumentTextIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    FunnelIcon
  },
  data() {
    return {
      activities: [
        {
          id: 1,
          type: 'submission',
          icon: 'DocumentTextIcon',
          message: 'New assignment submission from Sarah Johnson',
          course: 'Web Development Fundamentals',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          actionLabel: 'Review'
        },
        {
          id: 2,
          type: 'question',
          icon: 'InformationCircleIcon',
          message: 'Question posted in course forum by Mike Chen',
          course: 'Advanced Vue.js',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          actionLabel: 'Answer'
        },
        {
          id: 3,
          type: 'completion',
          icon: 'CheckCircleIcon',
          message: 'Module completed by 15 students',
          course: 'Database Design',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ]
    }
  },
  methods: {
    formatTime(date) {
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return `${Math.floor(diff / 86400000)}d ago`
    }
  }
}
</script>

<style scoped>
.content-section {
  margin-bottom: 2rem;
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

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--interactive-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.75rem;
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--interactive-tertiary-hover);
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  gap: 0.25rem;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--border-hover);
}

.activity-icon {
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon.submission {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.activity-icon.question {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.activity-icon.completion {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
</style>