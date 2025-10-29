<template>
  <div class="course-tips card">
    <h4 class="tips-title">Course Creation Tips</h4>
    
    <div class="tips-list">
      <div v-for="tip in tips" :key="tip.id" class="tip-item">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          <h5>{{ tip.title }}</h5>
          <p>{{ tip.description }}</p>
        </div>
      </div>
    </div>
    
    <div class="tips-footer">
      <button class="btn btn-sm btn-secondary" @click="showMoreTips">
        More Tips
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseTips',
  data() {
    return {
      tips: [
        {
          id: 1,
          title: 'Clear Learning Objectives',
          description: 'Define what students will achieve by the end of each module.'
        },
        {
          id: 2,
          title: 'Engaging Content',
          description: 'Mix videos, readings, and interactive exercises for better engagement.'
        },
        {
          id: 3,
          title: 'Regular Assessments',
          description: 'Include quizzes and assignments to track student progress.'
        },
        {
          id: 4,
          title: 'Community Building',
          description: 'Enable discussions to foster peer-to-peer learning.'
        }
      ]
    }
  },
  methods: {
    showMoreTips() {
      console.log('Opening tips guide...')
    }
  }
}
</script>

<style scoped>
.course-tips {
  padding: 1.5rem;
}

.tips-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tip-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.tip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tip-content h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.tip-content p {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.tips-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-primary);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}
</style>