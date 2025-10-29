<template>
  <div class="content-section">
    <div class="section-header">
      <h2 class="section-title">Assignments ({{ assignments.length }})</h2>
    </div>
    
    <div v-if="assignments.length === 0" class="empty-state">
      <DocumentTextIcon class="w-16 h-16 empty-icon" />
      <h3 class="empty-title">No assignments found</h3>
      <p class="empty-description">Create your first assignment to get started</p>
      <button class="btn-primary" @click="$emit('create-assignment')">
        <PlusIcon class="w-5 h-5" />
        Create Assignment
      </button>
    </div>
    
    <div v-else class="assignment-grid">
      <AssignmentCard 
        v-for="assignment in assignments" 
        :key="assignment.id"
        :assignment="assignment"
        @view-submissions="$emit('view-submissions', $event)"
        @edit="$emit('edit', $event)"
        @grade="$emit('grade', $event)"
      />
    </div>
  </div>
</template>

<script>
import AssignmentCard from './AssignmentCard.vue'
import { DocumentTextIcon, PlusIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'AssignmentsList',
  components: {
    AssignmentCard,
    DocumentTextIcon,
    PlusIcon
  },
  props: {
    assignments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['create-assignment', 'view-submissions', 'edit', 'grade']
}
</script>

<style scoped>
.content-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-tertiary);
  border-radius: 1rem;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.btn-primary:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>