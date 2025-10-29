<template>
  <div class="course-basic-info card">
    <h3 class="section-title">Course Information</h3>
    
    <div class="form-grid">
      <div class="form-group">
        <label for="title">Course Title *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          class="input-field"
          placeholder="e.g. Web Development Fundamentals"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="category">Category *</label>
        <select id="category" v-model="formData.category" class="input-field" required>
          <option value="">Select Category</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group full-width">
        <label for="description">Description *</label>
        <textarea
          id="description"
          v-model="formData.description"
          class="input-field"
          rows="4"
          placeholder="Describe what students will learn..."
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="level">Difficulty Level</label>
        <select id="level" v-model="formData.level" class="input-field">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="duration">Duration (weeks)</label>
        <input
          id="duration"
          v-model.number="formData.duration"
          type="number"
          class="input-field"
          min="1"
          max="52"
        />
      </div>
      
      <div class="form-group">
        <label for="maxStudents">Max Students</label>
        <input
          id="maxStudents"
          v-model.number="formData.maxStudents"
          type="number"
          class="input-field"
          min="1"
          max="100"
        />
      </div>
      
      <div class="form-group">
        <label for="language">Language</label>
        <select id="language" v-model="formData.language" class="input-field">
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="ak">Akan</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseBasicInfo',
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      default: () => [
        { id: 'web-dev', name: 'Web Development' },
        { id: 'mobile-dev', name: 'Mobile Development' },
        { id: 'data-science', name: 'Data Science' },
        { id: 'cybersecurity', name: 'Cybersecurity' },
        { id: 'ui-ux', name: 'UI/UX Design' }
      ]
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
.course-basic-info {
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
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

textarea.input-field {
  resize: vertical;
  min-height: 100px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .course-basic-info {
    padding: 1.5rem;
  }
}
</style>