<template>
  <DashboardLayout>
    <div class="dashboard fade-in">
      <DashboardHeader 
        title="Create Course"
        subtitle="Design and configure your new course"
      >
        <template #actions>
          <button class="btn btn-secondary" @click="saveDraft">
            Save Draft
          </button>
          <button class="btn btn-primary" @click="publishCourse" :disabled="!isValid">
            Publish Course
          </button>
        </template>
      </DashboardHeader>

      <div class="create-course-container">
        <div class="course-form">
          <CourseBasicInfo 
            v-model="courseData.basicInfo" 
            :categories="courseCategories"
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
        
        <div class="sidebar">
          <CourseProgress :progress="courseProgress" />
          
          <div class="quick-actions card">
            <h4>Quick Actions</h4>
            <button class="btn btn-secondary btn-block" @click="showPreview = true">
              Preview Course
            </button>
            <button class="btn btn-secondary btn-block" @click="importTemplate">
              Import Template
            </button>
            <button class="btn btn-secondary btn-block" @click="duplicateCourse">
              Duplicate Existing
            </button>
          </div>
          
          <CourseTips />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@shared/ui-components/layouts/DashboardLayout.vue'
import DashboardHeader from '@shared/ui-components/components/DashboardHeader.vue'
import CourseBasicInfo from '@shared/ui-components/components/CourseBasicInfo.vue'
import CourseModules from '@shared/ui-components/components/CourseModules.vue'
import CourseSettings from '@shared/ui-components/components/CourseSettings.vue'
import CourseMaterials from '@shared/ui-components/components/CourseMaterials.vue'
import CoursePreview from '@shared/ui-components/components/CoursePreview.vue'
import CourseProgress from '@shared/ui-components/components/CourseProgress.vue'
import CourseTips from '@shared/ui-components/components/CourseTips.vue'
import { useCourseCreation } from '@shared/composables/useCourseCreation.js'
import { courseCategories } from '@shared/data/course.data.js'

export default {
  name: 'CreateCoursePage',
  components: {
    DashboardLayout,
    DashboardHeader,
    CourseBasicInfo,
    CourseModules,
    CourseSettings,
    CourseMaterials,
    CoursePreview,
    CourseProgress,
    CourseTips
  },
  setup() {
    const router = useRouter()
    const showPreview = ref(false)
    
    const {
      courseData,
      courseProgress,
      isValid,
      saveDraft,
      publishCourse: publish,
      importTemplate,
      duplicateCourse
    } = useCourseCreation()
    
    const publishCourse = async () => {
      const result = await publish()
      if (result.success) {
        router.push(`/teacher/courses/${result.courseId}`)
      }
    }
    
    return {
      courseData,
      courseProgress,
      isValid,
      showPreview,
      courseCategories,
      saveDraft,
      publishCourse,
      importTemplate,
      duplicateCourse
    }
  }
}
</script>

<style scoped>
.create-course-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.course-form {
  display: flex;
  flex-direction: column;
}

.sidebar {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quick-actions {
  padding: 1.5rem;
}

.quick-actions h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.btn-block {
  width: 100%;
  margin-bottom: 0.75rem;
}

.btn-block:last-child {
  margin-bottom: 0;
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
  .create-course-container {
    gap: 1rem;
  }
  
  .quick-actions {
    padding: 1rem;
  }
}
</style>