// Course Creation composable
import { ref, computed } from 'vue'

export function useCourseCreation() {
  const courseData = ref({
    basicInfo: {
      title: '',
      category: '',
      description: '',
      level: 'beginner',
      duration: 8,
      maxStudents: 30,
      language: 'en'
    },
    modules: [],
    settings: {
      visibility: 'public',
      enrollmentCode: '',
      startDate: '',
      endDate: '',
      requireApproval: false,
      allowSelfEnrollment: true,
      limitedTime: false,
      enableDiscussions: true,
      enableAnnouncements: true,
      allowPeerReview: false,
      passingGrade: 70,
      showGradesSummary: true
    },
    materials: []
  })
  
  const courseProgress = computed(() => {
    let completedSections = 0
    let totalSections = 4
    
    // Basic info validation
    if (courseData.value.basicInfo.title && 
        courseData.value.basicInfo.category && 
        courseData.value.basicInfo.description) {
      completedSections++
    }
    
    // Modules validation
    if (courseData.value.modules.length > 0) {
      completedSections++
    }
    
    // Settings validation (always considered complete as has defaults)
    completedSections++
    
    // Materials validation (optional)
    if (courseData.value.materials.length > 0) {
      completedSections++
    }
    
    return {
      completed: completedSections,
      total: totalSections,
      percentage: Math.round((completedSections / totalSections) * 100)
    }
  })
  
  const isValid = computed(() => {
    return courseData.value.basicInfo.title &&
           courseData.value.basicInfo.category &&
           courseData.value.basicInfo.description &&
           courseData.value.modules.length > 0
  })
  
  const saveDraft = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.setItem('course-draft', JSON.stringify(courseData.value))
      
      return {
        success: true,
        message: 'Draft saved successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save draft'
      }
    }
  }
  
  const publishCourse = async () => {
    if (!isValid.value) {
      return {
        success: false,
        message: 'Please complete all required fields'
      }
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const courseId = `course-${Date.now()}`
      
      // Clear draft
      localStorage.removeItem('course-draft')
      
      return {
        success: true,
        courseId,
        message: 'Course published successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to publish course'
      }
    }
  }
  
  const importTemplate = () => {
    // Simulate template import
    courseData.value = {
      ...courseData.value,
      basicInfo: {
        ...courseData.value.basicInfo,
        title: 'Web Development Fundamentals',
        category: 'web-dev',
        description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
        level: 'beginner',
        duration: 12
      },
      modules: [
        {
          id: 1,
          title: 'Introduction to HTML',
          description: 'Learn HTML basics and structure',
          lessons: [
            { id: 1, title: 'HTML Basics', duration: 45 },
            { id: 2, title: 'HTML Structure', duration: 60 }
          ]
        },
        {
          id: 2,
          title: 'CSS Fundamentals',
          description: 'Styling with CSS',
          lessons: [
            { id: 3, title: 'CSS Selectors', duration: 45 },
            { id: 4, title: 'CSS Layout', duration: 90 }
          ]
        }
      ]
    }
  }
  
  const duplicateCourse = () => {
    // Simulate course duplication
    console.log('Duplicating existing course...')
  }
  
  // Load draft on initialization
  const loadDraft = () => {
    const saved = localStorage.getItem('course-draft')
    if (saved) {
      try {
        courseData.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }
  
  // Load draft automatically
  loadDraft()
  
  return {
    courseData,
    courseProgress,
    isValid,
    saveDraft,
    publishCourse,
    importTemplate,
    duplicateCourse
  }
}