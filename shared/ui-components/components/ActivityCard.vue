<template>
  <div class="activity-item card">
    <div class="activity-icon" :class="getActivityType()">
      <span class="activity-indicator"></span>
    </div>
    <div class="activity-content">
      <h4 class="activity-title">{{ title }}</h4>
      <p class="activity-description">{{ description }}</p>
      <span class="activity-time">{{ formattedTime }}</span>
    </div>
    <div v-if="$slots.action" class="activity-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivityCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  },
  computed: {
    formattedTime() {
      const now = new Date()
      const diff = now - this.timestamp
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`
      } else {
        return this.timestamp.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    }
  },
  methods: {
    getActivityType() {
      const typeMap = {
        'lesson-complete': 'activity-success',
        'assignment-submit': 'activity-info',
        'achievement': 'activity-warning',
        'course-enroll': 'activity-primary'
      }
      
      // Map icons to types
      if (this.icon.includes('✅') || this.title.toLowerCase().includes('completed')) {
        return 'activity-success'
      } else if (this.icon.includes('📝') || this.title.toLowerCase().includes('submit')) {
        return 'activity-info'
      } else if (this.icon.includes('🏆') || this.title.toLowerCase().includes('achievement')) {
        return 'activity-warning'
      } else {
        return 'activity-primary'
      }
    }
  }
}
</script>

<style scoped>
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--border-hover);
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.activity-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--brand-primary);
}

.activity-icon.activity-success .activity-indicator {
  background: var(--status-success-text);
}

.activity-icon.activity-info .activity-indicator {
  background: var(--status-info-text);
}

.activity-icon.activity-warning .activity-indicator {
  background: var(--status-warning-text);
}

.activity-icon.activity-primary .activity-indicator {
  background: var(--brand-primary);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.activity-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.activity-action {
  flex-shrink: 0;
}
</style>