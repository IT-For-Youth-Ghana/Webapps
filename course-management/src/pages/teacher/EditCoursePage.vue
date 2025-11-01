<template>
  <div class="edit-course fade-in">
    <TeacherHeader 
      :show-create-button="true"
      :create-button-text="'Preview'"
      @create-new="previewCourse"
    />

    <div class="content-wrapper">

    <!-- Course Edit Form -->
    <div class="course-form">
      <!-- Basic Information -->
      <div class="form-section card">
        <h2 class="section-title">Basic Information</h2>
        
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="courseTitle" class="form-label">Course Title *</label>
            <input
              id="courseTitle"
              v-model="course.title"
              type="text"
              class="input-field"
              placeholder="Enter course title"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="courseCategory" class="form-label">Category *</label>
            <select id="courseCategory" v-model="course.category" class="input-field" required>
              <option value="">Select Category</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="data-science">Data Science</option>
              <option value="ui-ux-design">UI/UX Design</option>
              <option value="database">Database</option>
              <option value="devops">DevOps</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="courseLevel" class="form-label">Level *</label>
            <select id="courseLevel" v-model="course.level" class="form-select" required>
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="courseDuration" class="form-label">Duration (weeks)</label>
            <input
              id="courseDuration"
              v-model.number="course.duration"
              type="number"
              class="form-input"
              placeholder="8"
              min="1"
              max="52"
            />
          </div>
          
          <div class="form-group">
            <label for="coursePrice" class="form-label">Price (GHS)</label>
            <input
              id="coursePrice"
              v-model.number="course.price"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          
          <div class="form-group full-width">
            <label for="courseDescription" class="form-label">Description *</label>
            <textarea
              id="courseDescription"
              v-model="course.description"
              class="form-textarea"
              placeholder="Describe what students will learn in this course"
              rows="4"
              required
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Course Image -->
      <div class="form-section glass-card">
        <h2 class="section-title">🖼️ Course Image</h2>
        
        <div class="image-upload-section">
          <div class="current-image" v-if="course.image">
            <img :src="course.image" :alt="course.title" class="course-image-preview" />
          </div>
          
          <div class="upload-area">
            <input
              type="file"
              ref="imageInput"
              @change="handleImageUpload"
              accept="image/*"
              class="file-input"
              hidden
            />
            <button type="button" class="btn btn-outline" @click="$refs.imageInput.click()">
              <span class="btn-icon">📎</span>
              {{ course.image ? 'Change Image' : 'Upload Image' }}
            </button>
            <p class="upload-hint">Recommended size: 800x450px (16:9 ratio)</p>
          </div>
        </div>
      </div>

      <!-- Learning Objectives -->
      <div class="form-section glass-card">
        <h2 class="section-title">🎯 Learning Objectives</h2>
        
        <div class="objectives-list">
          <div
            v-for="(objective, index) in course.objectives"
            :key="index"
            class="objective-item"
          >
            <input
              v-model="course.objectives[index]"
              type="text"
              class="form-input"
              placeholder="What will students learn?"
            />
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click="removeObjective(index)"
            >
              ✕
            </button>
          </div>
          
          <button
            type="button"
            class="btn btn-secondary btn-add"
            @click="addObjective"
          >
            <span class="btn-icon">➕</span>
            Add Objective
          </button>
        </div>
      </div>

      <!-- Prerequisites -->
      <div class="form-section glass-card">
        <h2 class="section-title">📚 Prerequisites</h2>
        
        <div class="prerequisites-list">
          <div
            v-for="(prerequisite, index) in course.prerequisites"
            :key="index"
            class="prerequisite-item"
          >
            <input
              v-model="course.prerequisites[index]"
              type="text"
              class="form-input"
              placeholder="What should students know beforehand?"
            />
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click="removePrerequisite(index)"
            >
              ✕
            </button>
          </div>
          
          <button
            type="button"
            class="btn btn-secondary btn-add"
            @click="addPrerequisite"
          >
            <span class="btn-icon">➕</span>
            Add Prerequisite
          </button>
        </div>
      </div>

      <!-- Course Settings -->
      <div class="form-section glass-card">
        <h2 class="section-title">⚙️ Course Settings</h2>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="checkbox-label">
              <input
                v-model="course.settings.isPublic"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Make course publicly visible</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="checkbox-label">
              <input
                v-model="course.settings.allowDiscussions"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Enable course discussions</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="checkbox-label">
              <input
                v-model="course.settings.requireApproval"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Require enrollment approval</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label class="checkbox-label">
              <input
                v-model="course.settings.certificateEnabled"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Issue completion certificates</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Course Syllabus -->
      <div class="form-section glass-card">
        <h2 class="section-title">📖 Course Syllabus</h2>
        
        <div class="syllabus-list">
          <div
            v-for="(module, moduleIndex) in course.syllabus"
            :key="moduleIndex"
            class="module-item"
          >
            <div class="module-header">
              <input
                v-model="module.title"
                type="text"
                class="form-input module-title-input"
                placeholder="Module title"
              />
              <button
                type="button"
                class="btn btn-danger btn-sm"
                @click="removeModule(moduleIndex)"
              >
                ✕
              </button>
            </div>
            
            <div class="lessons-list">
              <div
                v-for="(lesson, lessonIndex) in module.lessons"
                :key="lessonIndex"
                class="lesson-item"
              >
                <input
                  v-model="lesson.title"
                  type="text"
                  class="form-input lesson-input"
                  placeholder="Lesson title"
                />
                <select v-model="lesson.type" class="form-select lesson-type">
                  <option value="video">Video</option>
                  <option value="text">Reading</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
                <button
                  type="button"
                  class="btn btn-danger btn-xs"
                  @click="removeLesson(moduleIndex, lessonIndex)"
                >
                  ✕
                </button>
              </div>
              
              <button
                type="button"
                class="btn btn-outline btn-sm"
                @click="addLesson(moduleIndex)"
              >
                ➕ Add Lesson
              </button>
            </div>
          </div>
          
          <button
            type="button"
            class="btn btn-secondary btn-add"
            @click="addModule"
          >
            <span class="btn-icon">➕</span>
            Add Module
          </button>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" @click="cancelEdit">
          Cancel
        </button>
        <button type="button" class="btn btn-outline" @click="saveDraft">
          Save as Draft
        </button>
        <button type="button" class="btn btn-primary" @click="saveCourse" :disabled="!isFormValid">
          <span class="btn-icon">💾</span>
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'EditCoursePage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    const imageInput = ref(null)
    
    // Course data
    const course = ref({
      id: null,
      title: '',
      description: '',
      category: '',
      level: '',
      duration: 8,
      price: 0,
      image: '',
      objectives: [''],
      prerequisites: [''],
      settings: {
        isPublic: true,
        allowDiscussions: true,
        requireApproval: false,
        certificateEnabled: true
      },
      syllabus: [
        {
          title: '',
          lessons: [
            { title: '', type: 'video' }
          ]
        }
      ]
    })
    
    // Form validation
    const isFormValid = computed(() => {
      return course.value.title.trim() &&
             course.value.description.trim() &&
             course.value.category &&
             course.value.level
    })
    
    // Load course data
    const loadCourse = async () => {
      const courseId = route.params.id
      // Mock data - in real app, fetch from API
      const mockCourse = {
        id: courseId,
        title: 'Vue.js Complete Guide',
        description: 'Master Vue.js framework with hands-on projects and real-world examples',
        category: 'web-development',
        level: 'intermediate',
        duration: 6,
        price: 299.99,
        image: 'https://picsum.photos/seed/vuejs/800/450.jpg',
        objectives: [
          'Build dynamic web applications with Vue.js',
          'Understand the Vue component system',
          'Manage application state with Vuex',
          'Handle routing with Vue Router'
        ],
        prerequisites: [
          'Basic knowledge of HTML and CSS',
          'JavaScript fundamentals',
          'Understanding of ES6+ features'
        ],
        settings: {
          isPublic: true,
          allowDiscussions: true,
          requireApproval: false,
          certificateEnabled: true
        },
        syllabus: [
          {
            title: 'Vue.js Fundamentals',
            lessons: [
              { title: 'Introduction to Vue.js', type: 'video' },
              { title: 'Vue Instance and Data Binding', type: 'video' },
              { title: 'Directives and Event Handling', type: 'video' },
              { title: 'Vue Fundamentals Quiz', type: 'quiz' }
            ]
          },
          {
            title: 'Components and Communication',
            lessons: [
              { title: 'Creating Components', type: 'video' },
              { title: 'Props and Custom Events', type: 'video' },
              { title: 'Component Communication Exercise', type: 'assignment' }
            ]
          },
          {
            title: 'Advanced Vue Features',
            lessons: [
              { title: 'Vue Router Setup', type: 'video' },
              { title: 'State Management with Vuex', type: 'video' },
              { title: 'Final Project', type: 'assignment' }
            ]
          }
        ]
      }
      
      course.value = { ...mockCourse }
    }
    
    // Methods
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          course.value.image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const addObjective = () => {
      course.value.objectives.push('')
    }
    
    const removeObjective = (index) => {
      if (course.value.objectives.length > 1) {
        course.value.objectives.splice(index, 1)
      }
    }
    
    const addPrerequisite = () => {
      course.value.prerequisites.push('')
    }
    
    const removePrerequisite = (index) => {
      if (course.value.prerequisites.length > 1) {
        course.value.prerequisites.splice(index, 1)
      }
    }
    
    const addModule = () => {
      course.value.syllabus.push({
        title: '',
        lessons: [{ title: '', type: 'video' }]
      })
    }
    
    const removeModule = (index) => {
      if (course.value.syllabus.length > 1) {
        course.value.syllabus.splice(index, 1)
      }
    }
    
    const addLesson = (moduleIndex) => {
      course.value.syllabus[moduleIndex].lessons.push({
        title: '',
        type: 'video'
      })
    }
    
    const removeLesson = (moduleIndex, lessonIndex) => {
      const module = course.value.syllabus[moduleIndex]
      if (module.lessons.length > 1) {
        module.lessons.splice(lessonIndex, 1)
      }
    }
    
    const previewCourse = () => {
      router.push(`/teacher/courses/${course.value.id}/preview`)
    }
    
    const saveCourse = async () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields')
        return
      }
      
      try {
        // Filter out empty objectives and prerequisites
        course.value.objectives = course.value.objectives.filter(obj => obj.trim())
        course.value.prerequisites = course.value.prerequisites.filter(pre => pre.trim())
        
        // Mock save - in real app, send to API
        console.log('Saving course:', course.value)
        
        // Show success message
        alert('Course updated successfully!')
        
        // Redirect to course management
        router.push('/teacher/courses')
      } catch (error) {
        console.error('Error saving course:', error)
        alert('Failed to save course. Please try again.')
      }
    }
    
    const saveDraft = async () => {
      try {
        console.log('Saving course as draft:', course.value)
        alert('Course saved as draft!')
      } catch (error) {
        console.error('Error saving draft:', error)
        alert('Failed to save draft. Please try again.')
      }
    }
    
    const cancelEdit = () => {
      if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
        router.push('/teacher/courses')
      }
    }
    
    // Initialize
    onMounted(() => {
      loadCourse()
    })
    
    return {
      course,
      imageInput,
      isFormValid,
      handleImageUpload,
      addObjective,
      removeObjective,
      addPrerequisite,
      removePrerequisite,
      addModule,
      removeModule,
      addLesson,
      removeLesson,
      previewCourse,
      saveCourse,
      saveDraft,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.edit-course {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.course-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input, .form-select, .form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.image-upload-section {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.current-image {
  flex-shrink: 0;
}

.course-image-preview {
  width: 200px;
  height: 112px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin: 0;
}

.objectives-list, .prerequisites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.objective-item, .prerequisite-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.objective-item .form-input, .prerequisite-item .form-input {
  flex: 1;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.checkbox-input {
  opacity: 0;
  position: absolute;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.syllabus-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.module-item {
  padding: 1.5rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
}

.module-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.module-title-input {
  flex: 1;
  font-weight: 600;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-left: 1rem;
}

.lesson-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.lesson-input {
  flex: 1;
}

.lesson-type {
  width: 120px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 2rem;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-secondary);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.btn-outline:hover {
  background: var(--brand-primary);
  color: white;
}

.btn-ghost {
  background: none;
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

.btn-add {
  margin-top: 1rem;
  align-self: flex-start;
}

/* Responsive Design */
@media (max-width: 768px) {
  .edit-course {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .image-upload-section {
    flex-direction: column;
  }
  
  .current-image {
    align-self: center;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .lesson-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .lesson-type {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .objective-item, .prerequisite-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .module-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .checkbox-label {
    font-size: 0.8rem;
  }
}
</style>