<template>
  <div class="jobs-table-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading jobs...</p>
    </div>

    <div v-else-if="jobs.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M20 6H4V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2z" :fill="COLORS.TEXT.TERTIARY"/>
        <path d="M4 8h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8z" :fill="COLORS.TEXT.TERTIARY"/>
      </svg>
      <h3>No jobs found</h3>
      <p>Try adjusting your filters or create a new job.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="jobs-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            <th>Type</th>
            <th>Location</th>
            <th>Applications</th>
            <th>Status</th>
            <th>Posted Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <JobTableRow
            v-for="job in jobs"
            :key="job.id"
            :job="job"
            @edit="$emit('edit-job', job)"
            @delete="$emit('delete-job', job.id)"
            @toggle-status="$emit('toggle-status', job)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { COLORS } from '../../../constants/colors.js'
import JobTableRow from './JobTableRow.vue'

defineProps({
  jobs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit-job', 'delete-job', 'toggle-status'])
</script>

<style scoped>
.jobs-table-container {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-top: 3px solid v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
}

.empty-state h3 {
  color: v-bind('COLORS.TEXT.PRIMARY');
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  color: v-bind('COLORS.TEXT.SECONDARY');
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.jobs-table {
  width: 100%;
  border-collapse: collapse;
}

.jobs-table th {
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  white-space: nowrap;
}

.jobs-table th:first-child {
  padding-left: 1.5rem;
}

.jobs-table th:last-child {
  padding-right: 1.5rem;
}
</style>