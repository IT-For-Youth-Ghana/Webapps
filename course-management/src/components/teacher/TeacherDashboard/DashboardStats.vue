<template>
  <div class="stats-grid">
    <div class="dashboard-stat" v-for="stat in stats" :key="stat.label">
      <div class="stat-icon" :class="stat.iconClass">
        <component :is="stat.icon" class="w-8 h-8" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-change" :class="stat.changeClass">
          {{ stat.change }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BookOpenIcon, UserGroupIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'DashboardStats',
  components: {
    BookOpenIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon
  },
  data() {
    return {
      stats: [
        {
          label: 'Active Courses',
          value: '8',
          change: '+2 this month',
          changeClass: 'positive',
          icon: 'BookOpenIcon',
          iconClass: 'courses'
        },
        {
          label: 'Total Students',
          value: '247',
          change: '+18 this week',
          changeClass: 'positive',
          icon: 'UserGroupIcon',
          iconClass: 'students'
        },
        {
          label: 'Pending Reviews',
          value: '12',
          change: '3 urgent',
          changeClass: 'warning',
          icon: 'DocumentTextIcon',
          iconClass: 'assignments'
        },
        {
          label: 'Course Rating',
          value: '4.9',
          change: '+0.2 this month',
          changeClass: 'positive',
          icon: 'ChartBarIcon',
          iconClass: 'rating'
        }
      ]
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

.stat-icon.courses {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.stat-icon.students {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-icon.assignments {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-icon.rating {
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