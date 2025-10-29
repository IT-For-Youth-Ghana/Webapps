<template>
  <div class="dashboard-layout">
    <div class="layout-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardLayout'
}
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.layout-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .layout-content {
    padding: 1rem;
  }
}
</style>