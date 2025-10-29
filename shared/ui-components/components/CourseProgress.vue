<template>
  <div class="course-progress card">
    <h4 class="progress-title">Course Progress</h4>
    
    <div class="progress-circle">
      <svg viewBox="0 0 100 100" class="progress-svg">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--border-primary)"
          stroke-width="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--brand-primary)"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeOffset"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="progress-text">
        <span class="percentage">{{ progress.percentage }}%</span>
        <span class="label">Complete</span>
      </div>
    </div>
    
    <div class="progress-details">
      <div class="progress-item">
        <span class="item-label">Sections Completed</span>
        <span class="item-value">{{ progress.completed }} / {{ progress.total }}</span>
      </div>
      
      <div class="progress-checklist">
        <div class="checklist-item" :class="{ completed: basicInfoComplete }">
          <span class="check">{{ basicInfoComplete ? '✓' : '○' }}</span>
          <span>Basic Information</span>
        </div>
        <div class="checklist-item" :class="{ completed: modulesComplete }">
          <span class="check">{{ modulesComplete ? '✓' : '○' }}</span>
          <span>Course Modules</span>
        </div>
        <div class="checklist-item" :class="{ completed: settingsComplete }">
          <span class="check">{{ settingsComplete ? '✓' : '○' }}</span>
          <span>Settings</span>
        </div>
        <div class="checklist-item" :class="{ completed: materialsComplete }">
          <span class="check">{{ materialsComplete ? '✓' : '○' }}</span>
          <span>Materials (Optional)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseProgress',
  props: {
    progress: {
      type: Object,
      required: true
    }
  },
  computed: {
    circumference() {
      return 2 * Math.PI * 45
    },
    strokeOffset() {
      return this.circumference - (this.progress.percentage / 100) * this.circumference
    },
    basicInfoComplete() {
      return this.progress.completed >= 1
    },
    modulesComplete() {
      return this.progress.completed >= 2
    },
    settingsComplete() {
      return this.progress.completed >= 3
    },
    materialsComplete() {
      return this.progress.completed >= 4
    }
  }
}
</script>

<style scoped>
.course-progress {
  padding: 1.5rem;
}

.progress-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-primary);
}

.label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.item-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.item-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.checklist-item.completed {
  color: var(--text-primary);
}

.check {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  transition: all 0.2s ease;
}

.checklist-item.completed .check {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: white;
}

@media (max-width: 768px) {
  .progress-circle {
    width: 100px;
    height: 100px;
  }
  
  .percentage {
    font-size: 1.25rem;
  }
}
</style>