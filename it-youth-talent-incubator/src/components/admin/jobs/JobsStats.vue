<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 6H4V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2z" :fill="COLORS.BRAND.PRIMARY"/>
          <path d="M4 8h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8z" :fill="COLORS.BRAND.ACCENT"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">Total Jobs</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" :fill="COLORS.STATUS.SUCCESS"/>
          <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.active }}</div>
        <div class="stat-label">Active Jobs</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" :fill="COLORS.STATUS.WARNING"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.draft }}</div>
        <div class="stat-label">Draft Jobs</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" :fill="COLORS.BRAND.SECONDARY"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.totalApplications }}</div>
        <div class="stat-label">Total Applications</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { COLORS } from '../../../constants/colors.js'

defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  transform: translateY(-2px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border-radius: 8px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-weight: 500;
}
</style>