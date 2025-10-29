<template>
  <div class="course-preview-modal">
    <div class="preview-content">
      <div class="preview-header">
        <h3>Course Preview</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="preview-body">
        <div class="course-header">
          <h1>{{ courseData.basicInfo.title }}</h1>
          <div class="course-meta">
            <span class="category">{{ getCategoryName(courseData.basicInfo.category) }}</span>
            <span class="level">{{ courseData.basicInfo.level }}</span>
            <span class="duration">{{ courseData.basicInfo.duration }} weeks</span>
          </div>
        </div>
        
        <div class="course-description">
          <p>{{ courseData.basicInfo.description }}</p>
        </div>
        
        <div class="course-modules" v-if="courseData.modules.length > 0">
          <h3>Course Content</h3>
          <div class="modules-list">
            <div v-for="(module, index) in courseData.modules" :key="module.id" class="module-preview">
              <div class="module-title">
                <span class="module-number">{{ index + 1 }}</span>
                {{ module.title }}
              </div>
              <div class="module-lessons" v-if="module.lessons.length > 0">
                <div v-for="lesson in module.lessons" :key="lesson.id" class="lesson-preview">
                  <span>{{ lesson.title }}</span>
                  <span class="lesson-duration">{{ lesson.duration }}min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="course-info">
          <div class="info-grid">
            <div class="info-item">
              <strong>Max Students:</strong> {{ courseData.basicInfo.maxStudents }}
            </div>
            <div class="info-item">
              <strong>Language:</strong> {{ getLanguageName(courseData.basicInfo.language) }}
            </div>
            <div class="info-item">
              <strong>Passing Grade:</strong> {{ courseData.settings.passingGrade }}%
            </div>
            <div class="info-item">
              <strong>Visibility:</strong> {{ courseData.settings.visibility }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursePreview',
  props: {
    courseData: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  methods: {
    getCategoryName(categoryId) {
      const categories = {
        'web-dev': 'Web Development',
        'mobile-dev': 'Mobile Development',
        'data-science': 'Data Science',
        'cybersecurity': 'Cybersecurity',
        'ui-ux': 'UI/UX Design'
      }
      return categories[categoryId] || categoryId
    },
    getLanguageName(code) {
      const languages = {
        'en': 'English',
        'fr': 'French',
        'ak': 'Akan'
      }
      return languages[code] || code
    }
  }
}
</script>

<style scoped>
.course-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.preview-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.preview-body {
  padding: 2rem;
}

.course-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.course-meta span {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.category {
  background: var(--brand-primary);
  color: white;
}

.level {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.duration {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.course-description {
  margin-bottom: 2rem;
}

.course-description p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.course-modules h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-preview {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  font-weight: 500;
  color: var(--text-primary);
}

.module-number {
  width: 2rem;
  height: 2rem;
  background: var(--brand-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.module-lessons {
  padding: 1rem;
}

.lesson-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.lesson-preview:last-child {
  border-bottom: none;
}

.lesson-duration {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.course-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.info-item strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .preview-content {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .preview-body {
    padding: 1.5rem;
  }
  
  .course-header h1 {
    font-size: 1.5rem;
  }
  
  .course-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>