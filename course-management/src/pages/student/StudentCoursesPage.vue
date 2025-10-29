<template>
  <div class="courses-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">📚 My Courses</h1>
        <p class="page-subtitle">Track your progress and manage your enrollments</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="browseAllCourses">
          <span class="btn-icon">➕</span>
          Browse Courses
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Courses Grid -->
    <div class="courses-grid">
      <div 
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card glass-card"
        :class="{ 'completed': course.progress === 100 }"
      >
        <!-- Course Header -->
        <div class="course-header">
          <div class="course-image">
            <img :src="course.image" :alt="course.title" />
            <div class="course-overlay">
              <div class="course-badge" :class="course.level">
                {{ formatLevel(course.level) }}
              </div>
              <div v-if="course.featured" class="featured-badge">
                <span class="badge-icon">⭐</span>
                Featured
              </div>
            </div>
          </div>
        </div>

        <!-- Course Content -->
        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <p class="course-description">{{ course.description }}</p>
          
          <!-- Instructor Info -->
          <div class="instructor-info">
            <div class="instructor-avatar">
              <img :src="course.instructor.avatar" :alt="course.instructor.name" />
            </div>
            <div class="instructor-details">
              <span class="instructor-name">{{ course.instructor.name }}</span>
              <span class="instructor-title">{{ course.instructor.title }}</span>
            </div>
          </div>

          <!-- Course Stats -->
          <div class="course-stats">
            <div class="stat">
              <span class="stat-icon">📊</span>
              <span class="stat-value">{{ course.rating }}/5</span>
              <span class="stat-label">Rating</span>
            </div>
            <div class="stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">{{ course.duration }}</span>
              <span class="stat-label">Duration</span>
            </div>
            <div class="stat">
              <span class="stat-icon">📚</span>
              <span class="stat-value">{{ course.modules }}</span>
              <span class="stat-label">Modules</span>
            </div>
          </div>

          <!-- Progress Section -->
          <div v-if="course.progress !== undefined" class="progress-section">
            <div class="progress-header">
              <span class="progress-label">Progress</span>
              <span class="progress-value">{{ course.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :class="getProgressClass(course.progress)"
                :style="{ width: course.progress + '%' }"
              ></div>
            </div>
            <div v-if="course.lastAccessed" class="last-accessed">
              Last accessed: {{ formatDate(course.lastAccessed) }}
            </div>
          </div>

          <!-- Status Badge -->
          <div v-if="course.status" class="status-badge" :class="course.status">
            {{ formatStatus(course.status) }}
          </div>
        </div>

        <!-- Course Actions -->
        <div class="course-actions">
          <button 
            v-if="course.progress < 100"
            class="btn btn-primary"
            @click="continueCourse(course.id)"
          >
            Continue Learning
          </button>
          <button 
            v-else
            class="btn btn-secondary"
            @click="reviewCourse(course.id)"
          >
            Review Course
          </button>
          <button 
            class="btn btn-outline"
            @click="viewDetails(course.id)"
          >
            View Details
          </button>
          <button 
            class="btn btn-outline"
            @click="downloadCertificate(course.id)"
            v-if="course.progress === 100"
          >
            <span class="btn-icon">🏆</span>
            Certificate
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCourses.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📚</div>
        <h3 class="empty-title">{{ getEmptyTitle() }}</h3>
        <p class="empty-description">{{ getEmptyDescription() }}</p>
        <button class="btn btn-primary" @click="browseAllCourses">
          Browse Available Courses
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'StudentCoursesPage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const activeTab = ref('active')
    
    // Tabs
    const tabs = computed(() => [
      {
        id: 'active',
        label: 'Active',
        icon: '📚',
        count: enrolledCourses.value.filter(c => c.progress < 100).length
      },
      {
        id: 'completed',
        label: 'Completed',
        icon: '✅',
        count: enrolledCourses.value.filter(c => c.progress === 100).length
      },
      {
        id: 'bookmarked',
        label: 'Bookmarked',
        icon: '🔖',
        count: enrolledCourses.value.filter(c => c.bookmarked).length
      }
    ])
    
    // Mock enrolled courses
    const enrolledCourses = ref([
      {
        id: 1,
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript from scratch with hands-on projects',
        level: 'beginner',
        category: 'Web Development',
        duration: '8 weeks',
        modules: 12,
        rating: 4.9,
        enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        progress: 75,
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        featured: true,
        bookmarked: true,
        instructor: {
          name: 'Dr. Kwame Asante',
          title: 'Senior Web Developer',
          avatar: 'https://picsum.photos/seed/instructor1/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/webdev/400/250.jpg'
      },
      {
        id: 2,
        title: 'Vue.js Complete Guide',
        description: 'Master modern Vue.js development with practical projects and best practices',
        level: 'intermediate',
        category: 'Frontend Frameworks',
        duration: '6 weeks',
        modules: 8,
        rating: 4.8,
        enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        progress: 100,
        lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        featured: false,
        bookmarked: false,
        instructor: {
          name: 'Yaa Boahene',
          title: 'Vue.js Expert',
          avatar: 'https://picsum.photos/seed/instructor2/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/vuejs/400/250.jpg'
      },
      {
        id: 3,
        title: 'Mobile App Development',
        description: 'Build native mobile applications using React Native and Expo',
        level: 'advanced',
        category: 'Mobile Development',
        duration: '10 weeks',
        modules: 15,
        rating: 4.7,
        enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        progress: 45,
        lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        featured: false,
        bookmarked: true,
        instructor: {
          name: 'Joseph Osei',
          title: 'Mobile Developer',
          avatar: 'https://picsum.photos/seed/instructor3/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/mobile/400/250.jpg'
      },
      {
        id: 4,
        title: 'Data Science Basics',
        description: 'Introduction to data analysis, visualization, and machine learning concepts',
        level: 'beginner',
        category: 'Data Science',
        duration: '8 weeks',
        modules: 10,
        rating: 4.9,
        enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        progress: 20,
        lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        featured: true,
        bookmarked: false,
        instructor: {
          name: 'Dr. Adelaide Mensah',
          title: 'Data Scientist',
          avatar: 'https://picsum.photos/seed/instructor4/100/100.jpg'
        },
        image: 'https://picsum.photos/seed/datascience/400/250.jpg'
      }
    ])
    
    // Filtered courses based on active tab
    const filteredCourses = computed(() => {
      switch (activeTab.value) {
        case 'active':
          return enrolledCourses.value.filter(course => course.progress < 100)
        case 'completed':
          return enrolledCourses.value.filter(course => course.progress === 100)
        case 'bookmarked':
          return enrolledCourses.value.filter(course => course.bookmarked)
        default:
          return enrolledCourses.value
      }
    })
    
    // Methods
    const formatLevel = (level) => {
      const levels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
      return levels[level] || level
    }
    
    const formatStatus = (status) => {
      const statuses = {
        in_progress: 'In Progress',
        completed: 'Completed',
        not_started: 'Not Started'
      }
      return statuses[status] || status
    }
    
    const getProgressClass = (progress) => {
      if (progress < 33) return 'progress-low'
      if (progress < 66) return 'progress-medium'
      return 'progress-high'
    }
    
    const formatDate = (date) => {
      const diff = new Date() - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 1) return 'Yesterday'
      if (days < 7) return `${days} days ago`
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    const getEmptyTitle = () => {
      switch (activeTab.value) {
        case 'active': return 'No Active Courses'
        case 'completed': return 'No Completed Courses'
        case 'bookmarked': return 'No Bookmarked Courses'
        default: return 'No Courses Found'
      }
    }
    
    const getEmptyDescription = () => {
      switch (activeTab.value) {
        case 'active': return 'You haven\'t enrolled in any courses yet. Browse our catalog to get started!'
        case 'completed': return 'You haven\'t completed any courses yet. Keep learning to achieve your goals!'
        case 'bookmarked': return 'You haven\'t bookmarked any courses yet. Mark your favorites to find them easily!'
        default: return 'Start exploring courses to build your skills!'
      }
    }
    
    const continueCourse = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const viewDetails = (courseId) => {
      router.push(`/courses/course/${courseId}`)
    }
    
    const reviewCourse = (courseId) => {
      router.push(`/courses/course/${courseId}/review`)
    }
    
    const downloadCertificate = (courseId) => {
      console.log('Downloading certificate for course:', courseId)
      // Implement certificate download
    }
    
    const browseAllCourses = () => {
      router.push('/courses/list')
    }
    
    return {
      activeTab,
      tabs,
      filteredCourses,
      formatLevel,
      formatStatus,
      getProgressClass,
      formatDate,
      getEmptyTitle,
      getEmptyDescription,
      continueCourse,
      viewDetails,
      reviewCourse,
      downloadCertificate,
      browseAllCourses
    }
  }
}
</script>

<style scoped>
.courses-page {
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

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.25rem;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--brand-primary);
  color: white;
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-label {
  font-size: 1rem;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.course-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.course-card.completed {
  border-left: 4px solid #10b981;
}

.course-header {
  position: relative;
}

.course-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}

.course-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.course-badge.beginner {
  background: #10b981;
}

.course-badge.intermediate {
  background: #f59e0b;
}

.course-badge.advanced {
  background: #ef4444;
}

.featured-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}

.badge-icon {
  font-size: 0.8rem;
}

.course-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.course-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex-grow: 1;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.instructor-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.instructor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instructor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.instructor-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.instructor-title {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.course-stats {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.stat-icon {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-section {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-value {
  font-weight: 600;
  color: var(--brand-primary);
}

.progress-bar {
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.last-accessed {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
}

.status-badge {
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.course-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--brand-secondary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .courses-page {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .filter-tabs {
    flex-direction: column;
    padding: 0.125rem;
  }
  
  .tab-btn {
    justify-content: center;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .course-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat {
    flex-direction: row;
    justify-content: center;
  }
  
  .course-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .course-content {
    padding: 1rem;
  }
  
  .course-actions {
    padding: 1rem;
  }
  
  .btn {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>