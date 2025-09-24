<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['apply', 'view-details'])

const isLoading = ref(false)

const timeAgo = computed(() => {
  const now = new Date()
  const posted = new Date(props.job.postedDate)
  const diffTime = Math.abs(now - posted)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
})

const daysUntilDeadline = computed(() => {
  const now = new Date()
  const deadline = new Date(props.job.deadline)
  const diffTime = deadline - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const deadlineStatus = computed(() => {
  const days = daysUntilDeadline.value
  if (days < 0) return { text: 'Expired', color: 'red' }
  if (days <= 3) return { text: `${days} days left`, color: 'orange' }
  if (days <= 7) return { text: `${days} days left`, color: 'yellow' }
  return { text: `${days} days left`, color: 'green' }
})

const handleApply = async () => {
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('apply', props.job.id)
  } catch (error) {
    console.error('Error applying to job:', error)
  } finally {
    isLoading.value = false
  }
}

const handleViewDetails = () => {
  emit('view-details', props.job.id)
}
</script>

<template>
  <div class="job-card">
    <div class="job-header">
      <div class="job-info">
        <h3 class="job-title">{{ job.title }}</h3>
        <p class="job-company">{{ job.company }}</p>
        <div class="job-meta">
          <span class="job-location">{{ job.location }}</span>
          <span class="job-type">{{ job.type }}</span>
          <span class="job-posted">{{ timeAgo }}</span>
        </div>
      </div>
      <div class="job-actions">
        <div class="job-salary">{{ job.salary }}</div>
      </div>
    </div>

    <div class="job-description">
      <p>{{ job.description }}</p>
    </div>

    <div class="job-requirements">
      <h4 class="requirements-title">Required Skills</h4>
      <div class="requirements-tags">
        <span
          v-for="skill in job.requirements"
          :key="skill"
          class="requirement-tag"
        >
          {{ skill }}
        </span>
      </div>
    </div>

    <div class="job-footer">
      <div class="job-deadline">
        <span 
          class="deadline-badge"
          :class="`deadline-${deadlineStatus.color}`"
        >
          {{ deadlineStatus.text }}
        </span>
      </div>
      
      <div class="job-buttons">
        <button
          @click="handleViewDetails"
          class="btn-secondary"
          type="button"
        >
          View Details
        </button>
        <button
          @click="handleApply"
          :disabled="isLoading || daysUntilDeadline <= 0"
          class="btn-primary"
          type="button"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>{{ daysUntilDeadline <= 0 ? 'Expired' : 'Apply Now' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: fit-content;
}

.job-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.job-info {
  flex: 1;
}

.job-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.job-company {
  font-size: 0.875rem;
  color: #007AFF;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.job-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #8B949E;
}

.job-meta span {
  position: relative;
}

.job-meta span:not(:last-child)::after {
  content: '•';
  position: absolute;
  right: -0.5rem;
  color: #6E7681;
}

.job-salary {
  font-size: 0.875rem;
  font-weight: 600;
  color: #32D74B;
  background: rgba(50, 215, 75, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(50, 215, 75, 0.2);
  white-space: nowrap;
}

.job-description {
  color: #8B949E;
  font-size: 0.875rem;
  line-height: 1.5;
}

.job-description p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-requirements {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirements-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.requirements-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.requirement-tag {
  background: rgba(255, 255, 255, 0.05);
  color: #8B949E;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #30363D;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #30363D;
}

.deadline-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.deadline-green {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
  border: 1px solid rgba(50, 215, 75, 0.2);
}

.deadline-yellow {
  background: rgba(255, 214, 10, 0.1);
  color: #FFD60A;
  border: 1px solid rgba(255, 214, 10, 0.2);
}

.deadline-orange {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
  border: 1px solid rgba(255, 159, 10, 0.2);
}

.deadline-red {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.2);
}

.job-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-primary:disabled {
  background: #30363D;
  color: #6E7681;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:disabled:hover {
  background: #30363D;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .job-card {
    padding: 1rem;
  }

  .job-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .job-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .job-buttons {
    justify-content: stretch;
  }

  .job-buttons button {
    flex: 1;
  }

  .deadline-badge {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .job-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .job-meta span::after {
    display: none;
  }

  .requirements-tags {
    gap: 0.25rem;
  }

  .requirement-tag {
    font-size: 0.6875rem;
  }
}
</style>