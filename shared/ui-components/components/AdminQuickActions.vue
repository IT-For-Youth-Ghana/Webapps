<template>
  <div class="quick-actions">
    <h2 class="section-title">Quick Management</h2>
    <div class="action-grid">
      <div
        v-for="action in actions"
        :key="action.id"
        class="action-card card"
        @click="$emit('action-click', action)"
      >
        <div class="action-icon">
          <span>{{ getActionIcon(action.type) }}</span>
        </div>
        <div class="action-content">
          <h3>{{ action.title }}</h3>
          <p>{{ action.description }}</p>
          <div class="action-stats">
            <span>{{ action.stats }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminQuickActions',
  props: {
    actions: {
      type: Array,
      default: () => [
        {
          id: 'users',
          type: 'users',
          title: 'User Management',
          description: 'Manage teachers, students, and admin accounts',
          stats: '23 pending registrations',
          route: '/admin/users'
        },
        {
          id: 'institutions',
          type: 'institutions',
          title: 'Institution Setup',
          description: 'Configure schools and university departments',
          stats: '5 new this month',
          route: '/admin/institutions'
        },
        {
          id: 'security',
          type: 'security',
          title: 'Security & Auth',
          description: 'Manage roles, permissions, and 2FA settings',
          stats: '2 security alerts',
          route: '/admin/security'
        },
        {
          id: 'localization',
          type: 'localization',
          title: 'Localization',
          description: 'Multi-language support and regional settings',
          stats: '4 languages',
          route: '/admin/localization'
        },
        {
          id: 'system',
          type: 'system',
          title: 'Offline & Cloud',
          description: 'Configure caching and cloud backend settings',
          stats: '65% users offline-enabled',
          route: '/admin/system'
        },
        {
          id: 'analytics',
          type: 'analytics',
          title: 'System Analytics',
          description: 'Usage statistics and performance metrics',
          stats: '1876 daily active users',
          route: '/admin/analytics'
        }
      ]
    }
  },
  emits: ['action-click'],
  methods: {
    getActionIcon(type) {
      const icons = {
        users: 'U',
        institutions: 'I',
        security: 'S',
        localization: 'L',
        system: 'C',
        analytics: 'A'
      }
      return icons[type] || 'M'
    }
  }
}
</script>

<style scoped>
.quick-actions {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  width: 3rem;
  height: 3rem;
  background: var(--brand-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.action-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.action-stats {
  font-size: 0.8rem;
  color: var(--brand-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>