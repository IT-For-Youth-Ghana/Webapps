<template>
  <div class="dashboard-header">
    <div class="header-content">
      <div class="welcome-section">
        <h1 class="dashboard-title">{{ title }}</h1>
        <p v-if="subtitle" class="dashboard-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  margin-bottom: 3rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.8rem;
  }
}
</style>