<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-number">{{ enrolledCourses.length }}</h3>
        <p class="stat-label">Enrolled Courses</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-number">{{ averageProgress }}%</h3>
        <p class="stat-label">Average Progress</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-number">{{ totalStudyTime }}h</h3>
        <p class="stat-label">Study Time</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
          <path d="M12 3v12"/>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-number">{{ completedCourses.length }}</h3>
        <p class="stat-label">Completed</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickStats',
  props: {
    enrolledCourses: {
      type: Array,
      default: () => []
    },
    completedCourses: {
      type: Array,
      default: () => []
    },
    averageProgress: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
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

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stat-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .stat-content h3 {
    font-size: 1.25rem;
  }
  
  .stat-content p {
    font-size: 0.8rem;
  }
}
</style>