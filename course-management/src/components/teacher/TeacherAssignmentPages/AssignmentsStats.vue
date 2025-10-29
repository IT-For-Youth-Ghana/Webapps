<template>
  <div class="stats-grid">
    <div class="dashboard-stat">
      <div class="stat-icon assignments">
        <DocumentTextIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalAssignments }}</div>
        <div class="stat-label">Total Assignments</div>
        <div class="stat-change positive">+{{ Math.floor(Math.random() * 5) + 1 }} this month</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon pending">
        <ClockIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ pendingSubmissions }}</div>
        <div class="stat-label">Pending Submissions</div>
        <div class="stat-change warning">{{ Math.floor(Math.random() * 3) + 1 }} urgent</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon graded">
        <CheckCircleIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ gradedAssignments }}</div>
        <div class="stat-label">Graded</div>
        <div class="stat-change positive">{{ Math.floor(Math.random() * 10) + 5 }} today</div>
      </div>
    </div>
    
    <div class="dashboard-stat">
      <div class="stat-icon score">
        <ChartBarIcon class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ averageScore }}%</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-change positive">+{{ Math.floor(Math.random() * 3) + 1 }}% this week</div>
      </div>
    </div>
  </div>
</template>

<script>
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'AssignmentsStats',
  components: {
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ChartBarIcon
  },
  props: {
    totalAssignments: {
      type: Number,
      default: 24
    },
    pendingSubmissions: {
      type: Number,
      default: 12
    },
    gradedAssignments: {
      type: Number,
      default: 18
    },
    averageScore: {
      type: Number,
      default: 85
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.stat-icon.assignments {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-icon.pending {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.stat-icon.graded {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-icon.score {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
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