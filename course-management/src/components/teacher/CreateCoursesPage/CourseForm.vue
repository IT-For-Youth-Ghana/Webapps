<template>
  <div class="course-form">
    <CourseBasicInfo 
      v-model="courseData.basicInfo" 
      :categories="categories"
    />
    
    <CourseModules v-model="courseData.modules" />
    
    <CourseSettings v-model="courseData.settings" />
    
    <CourseMaterials v-model="courseData.materials" />
    
    <CoursePreview 
      v-if="showPreview"
      :course-data="courseData"
      @close="showPreview = false"
    />
  </div>
</template>

<script>
import CourseBasicInfo from '@shared/ui-components/components/CourseBasicInfo.vue'
import CourseModules from '@shared/ui-components/components/CourseModules.vue'
import CourseSettings from '@shared/ui-components/components/CourseSettings.vue'
import CourseMaterials from '@shared/ui-components/components/CourseMaterials.vue'
import CoursePreview from '@shared/ui-components/components/CoursePreview.vue'

export default {
  name: 'CourseForm',
  components: {
    CourseBasicInfo,
    CourseModules,
    CourseSettings,
    CourseMaterials,
    CoursePreview
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
    }
  },
  emits: ['update:courseData', 'update:showPreview']
}
</script>

<style scoped>
.course-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.course-form > div {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
}
</style>