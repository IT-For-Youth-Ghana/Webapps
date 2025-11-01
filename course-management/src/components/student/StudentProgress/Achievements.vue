<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Achievements</h2>
    </div>
    
    <div class="achievements-grid">
      <div 
        v-for="achievement in achievements"
        :key="achievement.id"
        class="achievement-card"
        :class="{ earned: achievement.earned }"
      >
        <div class="achievement-icon">
          <svg v-if="achievement.id === 1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <svg v-else-if="achievement.id === 2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
            <path d="M12 3v12"/>
            <path d="M5 20h14"/>
          </svg>
          <svg v-else-if="achievement.id === 3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <svg v-else-if="achievement.id === 4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5a2.5 2.5 0 0 0 2.5-2.5zm0-5.5A2.5 2.5 0 0 0 11 7c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5a2.5 2.5 0 0 0 2.5-2.5z"/>
          </svg>
          <svg v-else-if="achievement.id === 5" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <svg v-else-if="achievement.id === 6" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <div class="achievement-content">
          <h3 class="achievement-title">{{ achievement.title }}</h3>
          <p class="achievement-description">{{ achievement.description }}</p>
          <div class="achievement-progress" v-if="!achievement.earned">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (achievement.current / achievement.target) * 100 + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ achievement.current }}/{{ achievement.target }}</span>
          </div>
          <div v-else class="achievement-earned">
            <span class="earned-date">Earned {{ formatDate(achievement.earnedDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Achievements',
  props: {
    achievements: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
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

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.achievement-card.earned {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
  border-color: rgba(251, 191, 36, 0.3);
}

.achievement-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-weight: 600;
  min-width: 3rem;
  text-align: right;
}

.achievement-earned {
  color: #92400e;
  font-size: 0.8rem;
  font-weight: 600;
}

.earned-date {
  display: block;
}

@media (max-width: 768px) {
  .quick-actions-section {
    padding: 1rem;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-card {
    padding: 1rem;
  }
  
  .achievement-icon {
    font-size: 2rem;
  }
  
  .achievement-progress {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .progress-text {
    text-align: left;
    min-width: auto;
  }
}
</style>