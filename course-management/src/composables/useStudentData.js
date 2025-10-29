import { ref, computed } from 'vue'

export function useStudentData() {
  // Mock data for enrolled courses
  const enrolledCourses = ref([
    {
      id: 1,
      title: 'Web Development Fundamentals',
      instructor: 'Dr. Kwame Asante',
      image: 'https://picsum.photos/seed/webdev/300/200.jpg',
      progress: 75,
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: 'Vue.js Complete Guide',
      instructor: 'Yaa Boahene',
      image: 'https://picsum.photos/seed/vuejs/300/200.jpg',
      progress: 45,
      lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      title: 'Mobile App Development',
      instructor: 'Joseph Osei',
      image: 'https://picsum.photos/seed/mobile/300/200.jpg',
      progress: 20,
      lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ])
  
  // Mock recent activities
  const recentActivities = ref([
    {
      id: 1,
      icon: '✅',
      title: 'Completed Lesson',
      description: 'Finished "JavaScript Arrays & Objects" in Web Development',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      icon: '📝',
      title: 'Submitted Assignment',
      description: 'Submitted Vue.js project assignment',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 3,
      icon: '🏆',
      title: 'Achievement Unlocked',
      description: 'Earned "Quick Learner" badge',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      icon: '📚',
      title: 'Course Enrolled',
      description: 'Enrolled in Mobile App Development',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ])
  
  // Mock recommended courses
  const recommendedCourses = ref([
    {
      id: 4,
      title: 'Data Science Basics',
      description: 'Learn data analysis with Python and pandas',
      instructor: 'Dr. Adelaide Mensah',
      image: 'https://picsum.photos/seed/datascience/300/200.jpg',
      rating: 4.9,
      duration: '8 weeks',
      level: 'beginner'
    },
    {
      id: 5,
      title: 'UI/UX Design Fundamentals',
      description: 'Master the principles of user interface design',
      instructor: 'Michael Owusu',
      image: 'https://picsum.photos/seed/design/300/200.jpg',
      rating: 4.7,
      duration: '6 weeks',
      level: 'intermediate'
    },
    {
      id: 6,
      title: 'Database Design',
      description: 'Learn SQL and database design principles',
      instructor: 'Nana Ama',
      image: 'https://picsum.photos/seed/database/300/200.jpg',
      rating: 4.8,
      duration: '10 weeks',
      level: 'intermediate'
    }
  ])
  
  // Computed properties
  const activeCourses = computed(() => 
    enrolledCourses.value.filter(course => course.progress < 100)
  )
  
  const completedCourses = computed(() => 
    enrolledCourses.value.filter(course => course.progress === 100)
  )
  
  const averageProgress = computed(() => {
    if (enrolledCourses.value.length === 0) return 0
    const total = enrolledCourses.value.reduce((sum, course) => sum + course.progress, 0)
    return Math.round(total / enrolledCourses.value.length)
  })
  
  const totalStudyTime = computed(() => {
    // Mock calculation based on course progress
    return Math.round(enrolledCourses.value.reduce((sum, course) => sum + (course.progress * 0.5), 0))
  })
  
  return {
    enrolledCourses,
    activeCourses,
    completedCourses,
    recentActivities,
    recommendedCourses,
    averageProgress,
    totalStudyTime
  }
}