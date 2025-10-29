<template>
  <div class="assignment-tabs">
    <button 
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-button"
      :class="{ active: activeTab === tab.id }"
      @click="$emit('tab-change', tab.id)"
    >
      <component :is="tab.icon" class="w-5 h-5" />
      <span class="tab-label">{{ tab.label }}</span>
      <span class="tab-count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script>
import { BookOpenIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'AssignmentTabs',
  components: {
    BookOpenIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon
  },
  props: {
    activeTab: {
      type: String,
      default: 'all'
    }
  },
  emits: ['tab-change'],
  data() {
    return {
      tabs: [
        {
          id: 'all',
          icon: 'BookOpenIcon',
          label: 'All Assignments',
          count: 24
        },
        {
          id: 'active',
          icon: 'DocumentTextIcon',
          label: 'Active',
          count: 12
        },
        {
          id: 'pending',
          icon: 'ClockIcon',
          label: 'Pending Review',
          count: 8
        },
        {
          id: 'completed',
          icon: 'CheckCircleIcon',
          label: 'Completed',
          count: 4
        }
      ]
    }
  }
}
</script>

<style scoped>
.assignment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.tab-button:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.tab-button.active {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.tab-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-inverse);
}
</style>