<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Course Statistics</h2>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-number">{{ course.enrolledStudents }}</div>
          <div class="stat-label">Enrolled Students</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-number">{{ course.avgProgress }}%</div>
          <div class="stat-label">Average Progress</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-number">{{ course.totalLessons }}</div>
          <div class="stat-label">Total Lessons</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseStatistics',
  props: {
    course: {
      type: Object,
      required: true
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.stat-icon {
  color: var(--interactive-primary);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>