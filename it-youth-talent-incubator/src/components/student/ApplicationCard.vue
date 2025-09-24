<script setup>
import { computed } from 'vue'

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-details', 'withdraw'])

const statusConfig = computed(() => {
  const configs = {
    pending: {
      label: 'Pending Review',
      class: 'status-pending',
      description: 'Your application is in the review queue'
    },
    reviewing: {
      label: 'Under Review',
      class: 'status-reviewing',
      description: 'The employer is reviewing your application'
    },
    approved: {
      label: 'Approved',
      class: 'status-approved',
      description: 'Congratulations! Your application was approved'
    },
    rejected: {
      label: 'Not Selected',
      class: 'status-rejected',
      description: 'Unfortunately, your application was not selected'
    },
    interview: {
      label: 'Interview Scheduled',
      class: 'status-interview',
      description: 'You have been invited for an interview'
    }
  }
  return configs[props.application.status] || configs.pending
})

const timeAgo = computed(() => {
  const now = new Date()
  const applied = new Date(props.application.appliedDate)
  const diffTime = Math.abs(now - applied)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
})

const canWithdraw = computed(() => {
  return ['pending', 'reviewing'].includes(props.application.status)
})

const handleViewDetails = () => {
  emit('view-details', props.application.id)
}

const handleWithdraw = () => {
  if (canWithdraw.value) {
    emit('withdraw', props.application.id)
  }
}
</script>

<template>
  <div class="application-card">
    <div class="application-header">
      <div class="application-info">
        <h3 class="application-title">{{ application.jobTitle }}</h3>
        <p class="application-company">{{ application.company }}</p>
        <p class="application-date">Applied {{ timeAgo }}</p>
      </div>
      
      <div class="application-status">
        <span 
          :class="['status-badge', statusConfig.class]"
        >
          {{ statusConfig.label }}
        </span>
      </div>
    </div>

    <div class="application-body">
      <p class="status-description">{{ statusConfig.description }}</p>
      
      <div v-if="application.notes" class="application-notes">
        <h4 class="notes-title">Notes</h4>
        <p class="notes-content">{{ application.notes }}</p>
      </div>
    </div>

    <div class="application-footer">
      <div class="application-actions">
        <button
          @click="handleViewDetails"
          class="btn-secondary"
          type="button"
        >
          View Details
        </button>
        
        <button
          v-if="canWithdraw"
          @click="handleWithdraw"
          class="btn-danger"
          type="button"
        >
          Withdraw
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.application-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.application-info {
  flex: 1;
}

.application-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.application-company {
  font-size: 0.875rem;
  color: #007AFF;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.application-date {
  font-size: 0.75rem;
  color: #8B949E;
  margin: 0;
}

.application-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
  border: 1px solid rgba(255, 159, 10, 0.2);
}

.status-reviewing {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.status-approved {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
  border: 1px solid rgba(50, 215, 75, 0.2);
}

.status-rejected {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.2);
}

.status-interview {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
  border: 1px solid rgba(191, 90, 242, 0.2);
}

.application-body {
  flex: 1;
}

.status-description {
  color: #8B949E;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.application-notes {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  padding: 1rem;
}

.notes-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.notes-content {
  color: #8B949E;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.application-footer {
  border-top: 1px solid #30363D;
  padding-top: 1rem;
}

.application-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .application-card {
    padding: 1rem;
  }

  .application-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .application-status {
    align-self: flex-start;
  }

  .application-actions {
    justify-content: stretch;
  }

  .application-actions button {
    flex: 1;
  }
}
</style>