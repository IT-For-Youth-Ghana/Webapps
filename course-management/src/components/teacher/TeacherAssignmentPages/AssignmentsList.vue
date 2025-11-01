<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Your Assignments ({{ assignments.length }})</h2>
      <router-link to="/teacher/assignments" class="quick-action-btn">
        <!-- Arrow Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
        View All
      </router-link>
    </div>
    
    <div v-if="assignments.length === 0" class="empty-state">
      <div class="empty-icon">
        <!-- Document Icon -->
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      </div>
      <h3 class="empty-title">No assignments found</h3>
      <p class="empty-description">Create your first assignment to get started</p>
      <button class="quick-action-btn primary" @click="$emit('create-assignment')">
        <!-- Plus Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
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

export default {
  name: 'AssignmentsList',
  components: {
    AssignmentCard
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
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
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

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  margin: 0 auto;
  justify-content: center;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}
</style>