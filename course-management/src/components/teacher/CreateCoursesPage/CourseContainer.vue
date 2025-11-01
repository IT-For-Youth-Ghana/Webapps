<template>
  <div class="create-course-container">
    <div class="form-section">
      <CourseForm 
        :course-data="courseData"
        :categories="categories"
        :show-preview="showPreview"
        @update:course-data="$emit('update:courseData', $event)"
        @update:show-preview="$emit('update:showPreview', $event)"
      />
    </div>
    
    <div class="sidebar-section">
      <CourseSidebar 
        :progress="progress"
        @preview-course="$emit('preview-course')"
        @import-template="$emit('import-template')"
        @duplicate-course="$emit('duplicate-course')"
      />
    </div>
  </div>
</template>

<script>
import CourseForm from './CourseForm.vue'
import CourseSidebar from './CourseSidebar.vue'

export default {
  name: 'CourseContainer',
  components: {
    CourseForm,
    CourseSidebar
  },
  props: {
    courseData: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    },
    showPreview: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:courseData', 'update:showPreview', 'preview-course', 'import-template', 'duplicate-course']
}
</script>

<style scoped>
.create-course-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .create-course-container {
    grid-template-columns: 1fr;
  }
}
</style>