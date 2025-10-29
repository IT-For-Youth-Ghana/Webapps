<template>
  <div class="dashboard-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <div v-if="$slots.action" class="section-action">
        <slot name="action"></slot>
      </div>
    </div>
    <div class="section-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardSection',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.dashboard-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-action {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style>