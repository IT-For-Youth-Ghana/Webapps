<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Course Content</h2>
      <button class="quick-action-btn" @click="showAddLessonModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Add Lesson
      </button>
    </div>
    <div class="lessons-list">
      <div v-for="lesson in lessons" :key="lesson.id" class="lesson-item">
        <div class="lesson-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
        <div class="lesson-content">
          <h4 class="lesson-title">{{ lesson.title }}</h4>
          <p class="lesson-description">{{ lesson.description }}</p>
          <div class="lesson-meta">
            <span class="lesson-duration">{{ lesson.duration }} min</span>
            <span class="lesson-type">{{ lesson.type }}</span>
            <span v-if="lesson.lessonDate" class="lesson-date">Uploaded: {{ formatDate(lesson.lessonDate) }}</span>
          </div>
        </div>
        <div class="lesson-actions">
          <button class="quick-action-btn btn-sm" @click="editLesson(lesson.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
            Edit
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Lesson Modal -->
    <AddLessonModal 
      :is-visible="showAddLessonModal"
      @close="showAddLessonModal = false"
      @add-lesson="handleAddLesson"
    />
    
    <!-- Add/Edit Lesson Modal -->
    <AddLessonModal 
      :is-visible="showAddLessonModal"
      :is-edit-mode="isEditMode"
      :lesson-to-edit="editingLesson"
      @close="closeModal"
      @add-lesson="handleAddLesson"
      @update-lesson="handleUpdateLesson"
    />
  </div>
</template>

<script>
import AddLessonModal from './AddLessonModal.vue'

export default {
  name: 'CourseContent',
  components: {
    AddLessonModal
  },
  props: {
    lessons: {
      type: Array,
      required: true
    }
  },
  emits: ['add-lesson', 'update-lesson'],
  data() {
    return {
      showAddLessonModal: false,
      isEditMode: false,
      editingLesson: null
    }
  },
  methods: {
    handleAddLesson(lessonData) {
      this.$emit('add-lesson', lessonData)
      this.closeModal()
    },
    handleUpdateLesson(lessonData) {
      this.$emit('update-lesson', lessonData)
      this.closeModal()
    },
    closeModal() {
      this.showAddLessonModal = false
      this.isEditMode = false
      this.editingLesson = null
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('en-US', options)
    },
    editLesson(lessonId) {
      const lesson = this.lessons.find(l => l.id === lessonId)
      if (lesson) {
        this.editingLesson = { ...lesson }
        this.isEditMode = true
        this.showAddLessonModal = true
      }
    }
  }
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
  justify-content: center;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  gap: 0.5rem;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.lesson-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.lesson-icon {
  color: var(--interactive-primary);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.lesson-content {
  flex: 1;
}

.lesson-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.lesson-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.lesson-meta {
  display: flex;
  gap: 1rem;
}

.lesson-duration,
.lesson-type,
.lesson-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.lesson-date {
  background: var(--interactive-secondary);
  color: var(--interactive-primary);
  font-weight: 500;
}

.lesson-actions {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>