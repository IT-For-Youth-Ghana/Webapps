<template>
  <div class="course-modules card">
    <div class="section-header">
      <h3 class="section-title">Course Modules</h3>
      <button class="btn btn-primary" @click="addModule">
        Add Module
      </button>
    </div>
    
    <div class="modules-list">
      <div 
        v-for="(module, index) in modules" 
        :key="module.id"
        class="module-item"
      >
        <div class="module-header">
          <div class="module-drag-handle">≡</div>
          <div class="module-number">{{ index + 1 }}</div>
          <input
            v-model="module.title"
            type="text"
            class="module-title-input"
            placeholder="Module title..."
          />
          <button class="btn-icon delete-btn" @click="removeModule(index)">
            ×
          </button>
        </div>
        
        <div class="module-content">
          <textarea
            v-model="module.description"
            class="module-description"
            placeholder="Module description..."
            rows="2"
          ></textarea>
          
          <div class="module-lessons">
            <div class="lessons-header">
              <span class="lessons-label">Lessons</span>
              <button class="btn btn-sm btn-secondary" @click="addLesson(index)">
                Add Lesson
              </button>
            </div>
            
            <div class="lessons-list">
              <div 
                v-for="(lesson, lessonIndex) in module.lessons"
                :key="lesson.id"
                class="lesson-item"
              >
                <input
                  v-model="lesson.title"
                  type="text"
                  class="lesson-input"
                  placeholder="Lesson title..."
                />
                <input
                  v-model.number="lesson.duration"
                  type="number"
                  class="lesson-duration"
                  placeholder="Min"
                  min="1"
                />
                <button class="btn-icon" @click="removeLesson(index, lessonIndex)">
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="modules.length === 0" class="empty-state">
      <p>No modules added yet. Click "Add Module" to get started.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseModules',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  computed: {
    modules: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    addModule() {
      const newModule = {
        id: Date.now(),
        title: '',
        description: '',
        lessons: []
      }
      this.modules = [...this.modules, newModule]
    },
    
    removeModule(index) {
      this.modules = this.modules.filter((_, i) => i !== index)
    },
    
    addLesson(moduleIndex) {
      const newLesson = {
        id: Date.now(),
        title: '',
        duration: 30
      }
      const updatedModules = [...this.modules]
      updatedModules[moduleIndex].lessons.push(newLesson)
      this.modules = updatedModules
    },
    
    removeLesson(moduleIndex, lessonIndex) {
      const updatedModules = [...this.modules]
      updatedModules[moduleIndex].lessons.splice(lessonIndex, 1)
      this.modules = updatedModules
    }
  }
}
</script>

<style scoped>
.course-modules {
  padding: 2rem;
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

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.module-item {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.module-drag-handle {
  color: var(--text-secondary);
  cursor: grab;
  font-weight: bold;
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

.module-title-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1rem;
  outline: none;
}

.module-title-input::placeholder {
  color: var(--text-secondary);
}

.delete-btn {
  color: var(--status-error-text);
}

.module-content {
  padding: 1rem;
}

.module-description {
  width: 100%;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  margin-bottom: 1rem;
}

.lessons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.lessons-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.lesson-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  font-size: 0.875rem;
}

.lesson-duration {
  width: 80px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  text-align: center;
  font-size: 0.75rem;
}

.btn-icon {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .course-modules {
    padding: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .lesson-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .lesson-duration {
    width: 100%;
  }
}
</style>