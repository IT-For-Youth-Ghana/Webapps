<template>
  <div class="materials-filter">
    <h3 class="filter-title">Filter by Category</h3>
    <div class="filter-list">
      <button
        v-for="filter in filters"
        :key="filter.id"
        :class="['filter-item', { active: modelValue === filter.id }]"
        @click="$emit('update:modelValue', filter.id)"
      >
        <span class="filter-name">{{ filter.name }}</span>
        <span class="filter-count">{{ counts[filter.id] || 0 }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialsFilter',
  props: {
    modelValue: {
      type: String,
      default: 'all'
    },
    filters: {
      type: Array,
      required: true
    },
    counts: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.materials-filter {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.filter-item:hover {
  background: var(--bg-tertiary);
}

.filter-item.active {
  background: var(--brand-primary);
  color: white;
}

.filter-name {
  font-weight: 500;
  color: inherit;
}

.filter-count {
  font-size: 0.875rem;
  color: inherit;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  min-width: 1.5rem;
  text-align: center;
}

.filter-item.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 1024px) {
  .filter-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .filter-item {
    flex: 1;
    min-width: auto;
  }
}
</style>