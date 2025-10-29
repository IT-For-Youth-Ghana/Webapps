<template>
  <div class="stat-card card">
    <div class="stat-icon" :style="{ background: iconBackground }">
      <span class="icon-text">{{ getIconChar() }}</span>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="change" class="stat-change" :class="changeClass">
        {{ change }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    change: {
      type: String,
      default: null
    },
    changeClass: {
      type: String,
      default: 'neutral'
    },
    iconBackground: {
      type: String,
      default: 'var(--brand-primary)'
    }
  },
  methods: {
    getIconChar() {
      const iconMap = {
        'Courses': 'C',
        'Progress': 'P',
        'Time': 'T',
        'Complete': '✓',
        'Students': 'S',
        'Assignments': 'A',
        'Rating': 'R'
      }
      return iconMap[this.icon] || this.icon.charAt(0).toUpperCase()
    }
  }
}
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  color: white;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.stat-change.positive {
  color: var(--status-success-text);
}

.stat-change.negative {
  color: var(--status-error-text);
}

.stat-change.warning {
  color: var(--status-warning-text);
}

.stat-change.neutral {
  color: var(--text-tertiary);
}
</style>