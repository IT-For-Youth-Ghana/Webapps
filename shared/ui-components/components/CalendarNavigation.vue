<template>
  <div class="calendar-navigation card">
    <div class="nav-controls">
      <button class="nav-btn" @click="$emit('previous')">
        <span>‹</span>
      </button>
      <div class="current-period">
        <h2 class="period-title">{{ periodTitle }}</h2>
        <p class="period-subtitle">{{ periodRange }}</p>
      </div>
      <button class="nav-btn" @click="$emit('next')">
        <span>›</span>
      </button>
    </div>
    
    <div class="view-controls">
      <button 
        v-for="view in views"
        :key="view.id"
        class="view-btn"
        :class="{ active: currentView === view.id }"
        @click="$emit('view-change', view.id)"
      >
        {{ view.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarNavigation',
  props: {
    periodTitle: {
      type: String,
      required: true
    },
    periodRange: {
      type: String,
      required: true
    },
    currentView: {
      type: String,
      default: 'week'
    },
    views: {
      type: Array,
      default: () => [
        { id: 'day', label: 'Day' },
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' }
      ]
    }
  },
  emits: ['previous', 'next', 'view-change']
}
</script>

<style scoped>
.calendar-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--brand-primary);
}

.current-period {
  text-align: center;
  min-width: 200px;
}

.period-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.period-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.view-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--brand-primary);
  color: white;
  border-color: var(--brand-primary);
}

@media (max-width: 768px) {
  .calendar-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .current-period {
    min-width: auto;
  }
}
</style>