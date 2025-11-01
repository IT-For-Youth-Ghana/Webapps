<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Progress Overview</h2>
    </div>
    
    <div class="progress-overview">
      <div class="overview-card">
        <div class="overview-icon">
          <!-- Target Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ overallProgress }}%</div>
          <div class="overview-label">Overall Progress</div>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="overview-icon">
          <!-- Book Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ completedCourses }}/{{ totalCourses }}</div>
          <div class="overview-label">Courses Completed</div>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="overview-icon">
          <!-- Clock Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ totalStudyHours }}h</div>
          <div class="overview-label">Study Time</div>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="overview-icon">
          <!-- Trophy Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M3.5 9a2.5 2.5 0 0 1 5 0"/>
            <path d="M20.5 9a2.5 2.5 0 0 0-5 0"/>
            <path d="M16 14.5a2.5 2.5 0 0 1-5 0"/>
            <path d="M13 14.5a2.5 2.5 0 0 0-5 0"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ achievementsEarned }}</div>
          <div class="overview-label">Achievements</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressOverview',
  props: {
    overallProgress: {
      type: Number,
      default: 0
    },
    completedCourses: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    totalStudyHours: {
      type: Number,
      default: 0
    },
    achievementsEarned: {
      type: Number,
      default: 0
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

.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.overview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.overview-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .quick-actions-section {
    padding: 1rem;
  }
  
  .progress-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .overview-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .overview-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .overview-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .progress-overview {
    grid-template-columns: 1fr;
  }
}
</style>