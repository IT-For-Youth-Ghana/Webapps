<template>
  <div class="schedule-stats">
    <StatCard 
      v-for="stat in stats" 
      :key="stat.id"
      :title="stat.label"
      :value="stat.value"
      :icon="stat.icon"
    />
  </div>
</template>

<script>
import StatCard from './StatCard.vue'

export default {
  name: 'ScheduleStats',
  components: {
    StatCard
  },
  props: {
    stats: {
      type: Array,
      default: () => [
        {
          id: 'today',
          label: "Today's Events",
          value: 0,
          icon: 'calendar'
        },
        {
          id: 'weekly',
          label: 'This Week',
          value: 0,
          icon: 'users'
        },
        {
          id: 'office',
          label: 'Office Hours',
          value: 0,
          icon: 'clock'
        },
        {
          id: 'requests',
          label: 'Pending Requests',
          value: 0,
          icon: 'phone'
        }
      ]
    }
  }
}
</script>

<style scoped>
.schedule-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .schedule-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>