<template>
  <div class="student-job-grid">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-grid">
        <div 
          v-for="n in 6"
          :key="n"
          class="job-card-skeleton"
        >
          <div class="skeleton-header"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
          </div>
          <div class="skeleton-footer"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="jobs.length === 0" class="empty-state">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <path d="M20 6H4V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2z" :fill="COLORS.TEXT.TERTIARY"/>
        <path d="M4 8h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8z" :fill="COLORS.TEXT.TERTIARY"/>
      </svg>
      <h3>No jobs found</h3>
      <p>Try adjusting your search filters to find more opportunities.</p>
    </div>

    <!-- Jobs Grid -->
    <div v-else class="jobs-grid">
      <JobCard
        v-for="job in jobs"
        :key="job.id"
        :job="job"
        @apply="$emit('apply-job', job)"
        @view="$emit('view-job', job)"
        @bookmark="$emit('bookmark-job', job)"
      />
    </div>
  </div>
</template>

<script setup>
import { COLORS } from '../../../constants/colors.js'
import JobCard from '../JobCard.vue'

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

defineEmits(['apply-job', 'view-job', 'bookmark-job'])
</script>

<style scoped>
.student-job-grid {
  min-height: 400px;
}

.loading-container {
  padding: 1rem 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.job-card-skeleton {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 16px;
  padding: 1.5rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  height: 60px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border-radius: 8px;
  margin-bottom: 1rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.skeleton-line {
  height: 16px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border-radius: 4px;
}

.skeleton-line.short {
  width: 70%;
}

.skeleton-footer {
  height: 40px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border-radius: 8px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1.5rem;
}

.empty-state h3 {
  color: v-bind('COLORS.TEXT.PRIMARY');
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  color: v-bind('COLORS.TEXT.SECONDARY');
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .jobs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .loading-grid {
    grid-template-columns: 1fr;
  }
  
  .empty-state {
    padding: 3rem 1rem;
  }
}
</style>