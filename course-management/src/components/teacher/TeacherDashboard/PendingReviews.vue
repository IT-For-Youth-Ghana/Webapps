<template>
  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">Pending Reviews</h2>
      <span class="notification-badge">{{ reviews.length }}</span>
    </div>
    
    <div class="pending-list">
      <div v-for="item in reviews" :key="item.id" class="pending-item">
        <div class="pending-content">
          <h4 class="pending-title">{{ item.title }}</h4>
          <p class="pending-course">{{ item.course }}</p>
          <div class="pending-meta">
            <span class="pending-count">{{ item.count }} submissions</span>
            <span class="pending-due">Due: {{ formatDate(item.dueDate) }}</span>
          </div>
        </div>
        <router-link :to="`/teacher/grading/${item.id}`" class="btn-primary btn-sm">
          Review
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PendingReviews',
  data() {
    return {
      reviews: [
        {
          id: 1,
          title: 'Portfolio Project',
          course: 'Web Development',
          count: 15,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          title: 'Component Assignment',
          course: 'Vue.js Advanced',
          count: 8,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      ]
    }
  },
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }
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

.notification-badge {
  background: var(--status-error);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  min-width: 1.5rem;
  text-align: center;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
}

.pending-content {
  flex: 1;
}

.pending-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.pending-course {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.pending-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-weight: 500;
  font-size: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  gap: 0.25rem;
}
</style>