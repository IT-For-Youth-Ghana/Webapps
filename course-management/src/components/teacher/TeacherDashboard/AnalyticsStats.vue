<template>
  <div class="analytics-stats">
    <div class="dashboard-stat">
      <div class="stat-icon students">
        <UserGroupIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalStudents }}</div>
        <div class="stat-label">Total Students</div>
        <div class="stat-change positive">+12% this month</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon progress">
        <ChartBarIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ averageProgress }}%</div>
        <div class="stat-label">Average Progress</div>
        <div class="stat-change positive">+8% this week</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon rating">
        <StarIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ averageRating.toFixed(1) }}</div>
        <div class="stat-label">Course Rating</div>
        <div class="stat-change positive">+0.3 this month</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon completion">
        <CheckCircleIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ completionRate }}%</div>
        <div class="stat-label">Completion Rate</div>
        <div class="stat-change warning">-5% this month</div>
      </div>
    </div>
  </div>
</template>

<script>
import { UserGroupIcon, ChartBarIcon, StarIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'AnalyticsStats',
  components: {
    UserGroupIcon,
    ChartBarIcon,
    StarIcon,
    CheckCircleIcon
  },
  data() {
    return {
      totalStudents: 50,
      averageProgress: 78,
      averageRating: 4.7,
      completionRate: 82
    }
  }
}
</script>

<style scoped>
.analytics-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: rgba(59, 130, 246, 0.05);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-primary);
}

.dashboard-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.students {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-icon.progress {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.stat-icon.rating {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

.stat-icon.completion {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--status-success-text);
}

.stat-change.warning {
  color: var(--status-warning-text);
}
</style>