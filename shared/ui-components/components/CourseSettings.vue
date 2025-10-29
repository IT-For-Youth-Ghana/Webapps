<template>
  <div class="course-settings card">
    <h3 class="section-title">Course Settings</h3>
    
    <div class="settings-grid">
      <div class="setting-group">
        <label class="setting-label">Visibility</label>
        <div class="radio-group">
          <label class="radio-option">
            <input 
              v-model="formData.visibility" 
              type="radio" 
              value="public"
              class="radio-input"
            />
            <span class="radio-custom"></span>
            <span class="radio-text">
              <strong>Public</strong>
              <small>Anyone can find and enroll</small>
            </span>
          </label>
          
          <label class="radio-option">
            <input 
              v-model="formData.visibility" 
              type="radio" 
              value="private"
              class="radio-input"
            />
            <span class="radio-custom"></span>
            <span class="radio-text">
              <strong>Private</strong>
              <small>Invitation or enrollment code required</small>
            </span>
          </label>
        </div>
      </div>
      
      <div class="setting-group">
        <label class="setting-label">Enrollment</label>
        <div class="checkbox-group">
          <label class="checkbox-option">
            <input 
              v-model="formData.settings.requireApproval" 
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Require approval</span>
          </label>
          
          <label class="checkbox-option">
            <input 
              v-model="formData.settings.allowSelfEnrollment" 
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Allow self-enrollment</span>
          </label>
          
          <label class="checkbox-option">
            <input 
              v-model="formData.settings.limitedTime" 
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Limited time enrollment</span>
          </label>
        </div>
      </div>
      
      <div class="setting-group">
        <label for="enrollmentCode" class="setting-label">Enrollment Code</label>
        <input
          id="enrollmentCode"
          v-model="formData.enrollmentCode"
          type="text"
          class="input-field"
          placeholder="Optional code for enrollment"
        />
        <small class="help-text">
          Students will need this code to join the course
        </small>
      </div>
      
      <div class="setting-group">
        <label class="setting-label">Course Dates</label>
        <div class="date-inputs">
          <div class="date-group">
            <label for="startDate">Start Date</label>
            <input
              id="startDate"
              v-model="formData.startDate"
              type="date"
              class="input-field"
            />
          </div>
          <div class="date-group">
            <label for="endDate">End Date</label>
            <input
              id="endDate"
              v-model="formData.endDate"
              type="date"
              class="input-field"
            />
          </div>
        </div>
      </div>
      
      <div class="setting-group">
        <label class="setting-label">Communication</label>
        <div class="checkbox-group">
          <label class="checkbox-option">
            <input 
              v-model="formData.settings.enableDiscussions" 
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Enable course discussions</span>
          </label>
          
          <label class="checkbox-option">
            <input 
              v-model="formData.settings.enableAnnouncements" 
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Enable announcements</span>
          </label>
          
          <label class="checkbox-option">
            <input 
              v-model="formData.settings.allowPeerReview" 
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Allow peer review</span>
          </label>
        </div>
      </div>
      
      <div class="setting-group">
        <label class="setting-label">Grading</label>
        <div class="grading-settings">
          <div class="input-group">
            <label for="passingGrade">Passing Grade (%)</label>
            <input
              id="passingGrade"
              v-model.number="formData.settings.passingGrade"
              type="number"
              class="input-field"
              min="0"
              max="100"
            />
          </div>
          
          <div class="checkbox-group">
            <label class="checkbox-option">
              <input 
                v-model="formData.settings.showGradesSummary" 
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Show grades summary to students</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseSettings',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  computed: {
    formData: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style scoped>
.course-settings {
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: grid;
  gap: 2rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

.radio-option:hover,
.checkbox-option:hover {
  background: var(--bg-tertiary);
}

.radio-input,
.checkbox-input {
  opacity: 0;
  position: absolute;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
}

.radio-input:checked + .radio-custom {
  border-color: var(--brand-primary);
}

.radio-input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: var(--brand-primary);
  border-radius: 50%;
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
  font-size: 0.75rem;
  font-weight: bold;
}

.radio-text,
.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.radio-text small {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.help-text {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.date-group {
  display: flex;
  flex-direction: column;
}

.date-group label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.grading-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

@media (max-width: 768px) {
  .course-settings {
    padding: 1.5rem;
  }
  
  .date-inputs {
    grid-template-columns: 1fr;
  }
  
  .radio-option,
  .checkbox-option {
    padding: 0.5rem;
  }
}
</style>