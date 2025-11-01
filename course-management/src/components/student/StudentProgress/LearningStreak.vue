<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Learning Streak</h2>
    </div>
    
    <div class="streak-container">
      <div class="streak-info">
        <div class="streak-main">
          <div class="streak-icon">
            <!-- Fire Icon -->
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5a2.5 2.5 0 0 0 2.5-2.5zm0-5.5A2.5 2.5 0 0 0 11 7c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5a2.5 2.5 0 0 0 2.5-2.5z"/>
            </svg>
          </div>
          <div class="streak-details">
            <div class="streak-number">{{ currentStreak }}</div>
            <div class="streak-label">Day Streak</div>
          </div>
        </div>
        <div class="streak-stats">
          <div class="streak-stat">
            <span class="stat-label">Best Streak:</span>
            <span class="stat-value">{{ bestStreak }} days</span>
          </div>
          <div class="streak-stat">
            <span class="stat-label">This Week:</span>
            <span class="stat-value">{{ weeklyStudyDays }}/7 days</span>
          </div>
        </div>
      </div>
      
      <div class="streak-calendar">
        <div 
          v-for="day in last7Days"
          :key="day.date"
          class="calendar-day"
          :class="{ active: day.studied, today: day.isToday }"
          :title="day.tooltip"
        >
          <div class="day-label">{{ day.label }}</div>
          <div class="day-indicator">
            <svg v-if="day.studied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LearningStreak',
  props: {
    currentStreak: {
      type: Number,
      default: 0
    },
    bestStreak: {
      type: Number,
      default: 0
    },
    weeklyStudyDays: {
      type: Number,
      default: 0
    },
    last7Days: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.streak-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 2rem;
}

.streak-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.streak-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.streak-icon {
  color: var(--primary);
}

.streak-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.streak-label {
  font-size: 1rem;
  color: var(--text-secondary);
}

.streak-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.streak-stat {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.streak-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.calendar-day.active {
  background: var(--primary);
  color: white;
}

.calendar-day.today {
  border: 2px solid var(--primary);
}

.day-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.day-indicator {
  font-size: 1.2rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .quick-actions-section {
    padding: 1rem;
  }
  
  .streak-container {
    padding: 1.5rem;
  }
  
  .streak-info {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 1.5rem;
  }
  
  .streak-calendar {
    gap: 0.25rem;
  }
  
  .calendar-day {
    padding: 0.5rem 0.25rem;
  }
  
  .day-label {
    font-size: 0.7rem;
  }
  
  .day-indicator {
    font-size: 1rem;
  }
}
</style>