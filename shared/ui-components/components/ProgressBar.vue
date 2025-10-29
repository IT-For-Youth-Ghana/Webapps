<template>
  <div class="progress-section">
    <div class="progress-header" v-if="showHeader">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-value">{{ value }}%</span>
    </div>
    <div class="progress-bar" :class="size">
      <div 
        class="progress-fill" 
        :class="getProgressClass(value)"
        :style="{ width: value + '%' }"
      ></div>
    </div>
    <div v-if="subtitle" class="progress-subtitle">
      {{ subtitle }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    value: {
      type: Number,
      required: true,
      validator: (val) => val >= 0 && val <= 100
    },
    label: {
      type: String,
      default: 'Progress'
    },
    subtitle: {
      type: String,
      default: null
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: (val) => ['small', 'medium', 'large'].includes(val)
    }
  },
  methods: {
    getProgressClass(progress) {
      if (progress < 33) return 'progress-low'
      if (progress < 66) return 'progress-medium'
      return 'progress-high'
    }
  }
}
</script>

<style scoped>
.progress-section {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--brand-primary);
}

.progress-bar {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-bar.small {
  height: 0.25rem;
}

.progress-bar.medium {
  height: 0.5rem;
}

.progress-bar.large {
  height: 0.75rem;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-subtitle {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 0.5rem;
}
</style>