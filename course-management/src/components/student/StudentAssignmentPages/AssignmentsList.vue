<template>
  <div class="assignments-grid">
    <AssignmentCard
      v-for="assignment in assignments"
      :key="assignment.id"
      :assignment="assignment"
      @click="handleCardClick"
      @submit="handleSubmit"
      @view-submission="handleViewSubmission"
      @view-details="handleViewDetails"
    />
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
      required: true
    }
  },
  emits: ['card-click', 'submit', 'view-submission', 'view-details'],
  methods: {
    handleCardClick(assignmentId) {
      this.$emit('card-click', assignmentId)
    },
    
    handleSubmit(assignmentId) {
      this.$emit('submit', assignmentId)
    },
    
    handleViewSubmission(submissionId) {
      this.$emit('view-submission', submissionId)
    },
    
    handleViewDetails(assignmentId) {
      this.$emit('view-details', assignmentId)
    }
  }
}
</script>

<style scoped>
.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .assignments-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>