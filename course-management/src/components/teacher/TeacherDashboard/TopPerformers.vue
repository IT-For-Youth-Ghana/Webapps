<template>
  <div class="chart-container card">
    <div class="section-header">
      <h3 class="section-title">Top Performers</h3>
    </div>
    <div class="chart-content">
      <div class="performers-list">
        <div v-for="(student, index) in topPerformers" :key="student.id" class="performer-item">
          <div class="performer-rank">{{ index + 1 }}</div>
          <div class="performer-avatar">
            <img :src="student.avatar" :alt="student.name" />
          </div>
          <div class="performer-info">
            <div class="performer-name">{{ student.name }}</div>
            <div class="performer-course">{{ getCourseTitle(student.courseId) }}</div>
          </div>
          <div class="performer-score">{{ student.score }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopPerformers',
  data() {
    return {
      topPerformers: [
        { id: 1, name: 'Kwame Asante', courseId: 1, score: 98, avatar: 'https://picsum.photos/seed/student1/100/100.jpg' },
        { id: 2, name: 'Yaa Boahene', courseId: 2, score: 96, avatar: 'https://picsum.photos/seed/student2/100/100.jpg' },
        { id: 3, name: 'Joseph Osei', courseId: 1, score: 94, avatar: 'https://picsum.photos/seed/student3/100/100.jpg' },
        { id: 4, name: 'Ama Serwaa', courseId: 3, score: 92, avatar: 'https://picsum.photos/seed/student4/100/100.jpg' },
        { id: 5, name: 'Kofi Mensah', courseId: 2, score: 90, avatar: 'https://picsum.photos/seed/student5/100/100.jpg' }
      ],
      courses: [
        { id: 1, title: 'Web Development Fundamentals' },
        { id: 2, title: 'Vue.js Complete Guide' },
        { id: 3, title: 'Mobile App Development' }
      ]
    }
  },
  methods: {
    getCourseTitle(courseId) {
      const course = this.courses.find(c => c.id === courseId)
      return course ? course.title : 'Unknown Course'
    }
  }
}
</script>

<style scoped>
.chart-container {
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid var(--border-primary);
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

.chart-content {
  height: 300px;
}

.performers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.performer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.performer-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.performer-rank {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--interactive-primary);
  min-width: 30px;
  text-align: center;
}

.performer-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.performer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.performer-info {
  flex: 1;
}

.performer-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.performer-course {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.performer-score {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--interactive-primary);
}
</style>