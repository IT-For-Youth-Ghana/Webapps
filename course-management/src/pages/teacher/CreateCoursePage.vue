<template>
  <div class="teacher-create-course fade-in">
    <div class="content-wrapper">
      <!-- Page Header -->
      <div class="quick-actions-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Create Course</h2>
            <p class="section-subtitle">Design and configure your new course</p>
          </div>
          <div class="actions">
            <button class="quick-action-btn" @click="saveDraft">
              <!-- Save Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              Save Draft
            </button>
            <button class="quick-action-btn primary" @click="publishCourse" :disabled="!isFormValid">
              <!-- Publish Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Publish Course
            </button>
          </div>
        </div>
      </div>

      <!-- Course Creation Container -->
      <div class="create-course-container">
        <div class="course-form">
          <!-- Basic Information Section -->
          <div class="quick-actions-section">
            <h3 class="section-title">Basic Information</h3>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label">Course Title *</label>
                <input
                  v-model="courseData.title"
                  type="text"
                  class="input-field"
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select v-model="courseData.category" class="input-field" required>
                  <option value="">Select Category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="ui-ux-design">UI/UX Design</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Duration</label>
                <input
                  v-model="courseData.duration"
                  type="text"
                  class="input-field"
                  placeholder="e.g., 8 weeks"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Level</label>
                <select v-model="courseData.level" class="input-field">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <div class="form-group full-width">
              <label class="form-label">Description *</label>
              <textarea
                v-model="courseData.description"
                class="input-field"
                rows="4"
                placeholder="Describe what students will learn..."
              ></textarea>
            </div>
          </div>

          <!-- Course Settings -->
          <div class="quick-actions-section">
            <h3 class="section-title">Course Settings</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    v-model="courseData.isPublic"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">Make course public</span>
                </label>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    v-model="courseData.allowEnrollment"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">Allow enrollment</span>
                </label>
              </div>
              
              <div class="form-group">
                <label class="form-label">Price (USD)</label>
                <input
                  v-model="courseData.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  placeholder="0.00"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Language</label>
                <select v-model="courseData.language" class="input-field">
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <div class="quick-actions-section">
            <h4 class="section-title">Progress</h4>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: formProgress + '%' }"></div>
            </div>
            <p class="progress-text">{{ formProgress }}% Complete</p>
          </div>
          
          <div class="quick-actions-section">
            <h4 class="section-title">Quick Actions</h4>
            <button class="quick-action-btn full-width" @click="previewCourse">
              <!-- Eye Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview Course
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CreateCoursePage',
  setup() {
    const router = useRouter()
    
    // Reactive data
    const courseData = ref({
      title: '',
      category: '',
      duration: '',
      level: 'beginner',
      description: '',
      isPublic: true,
      allowEnrollment: true,
      price: 0,
      language: 'en'
    })
    
    // Computed properties
    const isFormValid = computed(() => {
      return courseData.value.title && 
             courseData.value.category &&
             courseData.value.description
    })
    
    const formProgress = computed(() => {
      let completedFields = 0
      const totalFields = 5
      
      if (courseData.value.title) completedFields++
      if (courseData.value.category) completedFields++
      if (courseData.value.description) completedFields++
      if (courseData.value.duration) completedFields++
      if (courseData.value.level) completedFields++
      
      return Math.round((completedFields / totalFields) * 100)
    })
    
    // Methods
    const saveDraft = () => {
      console.log('Saving draft...', courseData.value)
      alert('Course saved as draft!')
    }
    
    const publishCourse = () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields before publishing.')
        return
      }
      
      console.log('Publishing course...', courseData.value)
      alert('Course published successfully!')
      router.push('/teacher/courses')
    }
    
    const previewCourse = () => {
      console.log('Previewing course...', courseData.value)
      alert('Course preview functionality coming soon!')
    }
    
    return {
      courseData,
      isFormValid,
      formProgress,
      saveDraft,
      publishCourse,
      previewCourse
    }
  }
}
</script>

<style scoped>
.teacher-create-course {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.create-course-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.input-field {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
}

.checkbox-text {
  font-size: 0.875rem;
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

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.quick-action-btn.full-width {
  width: 100%;
  justify-content: center;
}

.sidebar {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
}

@media (max-width: 1024px) {
  .create-course-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .actions .quick-action-btn {
    flex: 1;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>