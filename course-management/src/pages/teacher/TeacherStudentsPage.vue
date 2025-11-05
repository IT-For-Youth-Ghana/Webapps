<template>
  <div class="teacher-students-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Student Management</h1>
        <p class="page-subtitle">Manage your students across all courses</p>
      </div>
      <div class="header-actions">
        <button class="quick-action-btn primary" @click="showBulkActions = true">
          <!-- Plus Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add Students
        </button>
        <button class="quick-action-btn" @click="exportData">
          <!-- Download Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters-section">
      <div class="search-bar">
        <!-- Search Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search students by name, email, or student ID..."
          class="search-input"
        />
      </div>
      
      <div class="filters">
        <select v-model="courseFilter" class="filter-select">
          <option value="">All Courses</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.name }}
          </option>
        </select>
        
        <select v-model="performanceFilter" class="filter-select">
          <option value="">All Performance</option>
          <option value="excellent">Excellent (90-100%)</option>
          <option value="good">Good (75-89%)</option>
          <option value="average">Average (60-74%)</option>
          <option value="at-risk">At Risk (Below 60%)</option>
        </select>
        
        <select v-model="enrollmentStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="selectedStudents.length > 0" class="bulk-actions-bar">
      <span class="selected-count">{{ selectedStudents.length }} students selected</span>
      <div class="bulk-actions">
        <button class="quick-action-btn" @click="sendBulkEmail">
          <!-- Mail Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Email
        </button>
        <button class="quick-action-btn" @click="addToCourse">
          <!-- User Plus Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Add to Course
        </button>
        <button class="quick-action-btn" @click="clearSelection">
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <!-- Users Icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ totalStudents }}</span>
          <span class="stat-label">Total Students</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <!-- Trending Up Icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ activeStudents }}</span>
          <span class="stat-label">Active Students</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <!-- Alert Icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ atRiskStudents }}</span>
          <span class="stat-label">At Risk</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <!-- Star Icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ averagePerformance }}%</span>
          <span class="stat-label">Avg Performance</span>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="students-table-section">
      <div class="table-controls">
        <div class="results-info">
          Showing {{ paginatedStudents.length }} of {{ filteredStudents.length }} students
        </div>
        <div class="pagination-controls">
          <select v-model="pageSize" class="page-size-select">
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>
      
      <div class="students-table">
        <table>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  @change="toggleAllSelection"
                  :checked="allSelected"
                  class="checkbox"
                />
              </th>
              <th>Student</th>
              <th>Email</th>
              <th>Enrolled Courses</th>
              <th>Average Performance</th>
              <th>Status</th>
              <th>Last Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in paginatedStudents" :key="student.id" class="student-row">
              <td>
                <input 
                  type="checkbox" 
                  v-model="selectedStudents"
                  :value="student.id"
                  class="checkbox"
                />
              </td>
              <td>
                <div class="student-info">
                  <img :src="student.avatar" :alt="student.name" class="student-avatar">
                  <div>
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-id">ID: {{ student.studentId }}</div>
                  </div>
                </div>
              </td>
              <td class="student-email">{{ student.email }}</td>
              <td>
                <div class="courses-badge">{{ student.enrolledCourses.length }} courses</div>
              </td>
              <td>
                <div class="performance-badge" :class="getPerformanceClass(student.averagePerformance)">
                  {{ student.averagePerformance }}%
                </div>
              </td>
              <td>
                <span class="status-badge" :class="student.status">{{ student.status }}</span>
              </td>
              <td class="last-activity">{{ formatDate(student.lastActivity) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="viewStudentProfile(student.id)" title="View Profile">
                    <!-- User Icon -->
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </button>
                  <button class="action-btn" @click="messageStudent(student.id)" title="Send Message">
                    <!-- Mail Icon -->
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </button>
                  <button class="action-btn" @click="viewProgress(student.id)" title="View Progress">
                    <!-- Chart Icon -->
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="pagination">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Previous
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="{ active: currentPage === page }"
            class="page-number"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'TeacherStudentsPage',
  setup() {
    const searchQuery = ref('')
    const courseFilter = ref('')
    const performanceFilter = ref('')
    const enrollmentStatus = ref('')
    const selectedStudents = ref([])
    const currentPage = ref(1)
    const pageSize = ref(25)
    
    // Mock data - in real app, this would come from API
    const students = ref([
      {
        id: 1,
        name: 'Emma Johnson',
        email: 'emma.j@school.edu',
        studentId: 'STU001',
        avatar: 'https://picsum.photos/seed/emma/100/100.jpg',
        enrolledCourses: [1, 2],
        averagePerformance: 92,
        status: 'active',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: 2,
        name: 'Michael Chen',
        email: 'michael.chen@school.edu',
        studentId: 'STU002',
        avatar: 'https://picsum.photos/seed/michael/100/100.jpg',
        enrolledCourses: [1, 3],
        averagePerformance: 78,
        status: 'active',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: 3,
        name: 'Sarah Williams',
        email: 'sarah.w@school.edu',
        studentId: 'STU003',
        avatar: 'https://picsum.photos/seed/sarah/100/100.jpg',
        enrolledCourses: [2],
        averagePerformance: 88,
        status: 'active',
        lastActivity: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: 4,
        name: 'James Davis',
        email: 'james.davis@school.edu',
        studentId: 'STU004',
        avatar: 'https://picsum.photos/seed/james/100/100.jpg',
        enrolledCourses: [1, 2, 3],
        averagePerformance: 55,
        status: 'active',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 72)
      },
      {
        id: 5,
        name: 'Lisa Anderson',
        email: 'lisa.anderson@school.edu',
        studentId: 'STU005',
        avatar: 'https://picsum.photos/seed/lisa/100/100.jpg',
        enrolledCourses: [3],
        averagePerformance: 95,
        status: 'active',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 1)
      }
    ])

    const courses = ref([
      { id: 1, name: 'Web Development Fundamentals' },
      { id: 2, name: 'Advanced Vue.js' },
      { id: 3, name: 'Database Design' }
    ])

    // Computed properties
    const filteredStudents = computed(() => {
      let filtered = students.value

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(student => 
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query)
        )
      }

      // Course filter
      if (courseFilter.value) {
        filtered = filtered.filter(student => 
          student.enrolledCourses.includes(parseInt(courseFilter.value))
        )
      }

      // Performance filter
      if (performanceFilter.value) {
        filtered = filtered.filter(student => {
          const perf = student.averagePerformance
          switch (performanceFilter.value) {
            case 'excellent': return perf >= 90
            case 'good': return perf >= 75 && perf < 90
            case 'average': return perf >= 60 && perf < 75
            case 'at-risk': return perf < 60
            default: return true
          }
        })
      }

      // Status filter
      if (enrollmentStatus.value) {
        filtered = filtered.filter(student => 
          student.status === enrollmentStatus.value
        )
      }

      return filtered
    })

    const paginatedStudents = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredStudents.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / pageSize.value)
    })

    const visiblePages = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      const delta = 2
      
      const range = []
      const rangeWithDots = []
      
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }
      
      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      }
      rangeWithDots.push(...range)
      if (current + delta < total - 1) {
        rangeWithDots.push('...', total)
      }
      
      return rangeWithDots
    })

    const totalStudents = computed(() => students.value.length)
    const activeStudents = computed(() => students.value.filter(s => s.status === 'active').length)
    const atRiskStudents = computed(() => students.value.filter(s => s.averagePerformance < 60).length)
    const averagePerformance = computed(() => {
      const sum = students.value.reduce((acc, s) => acc + s.averagePerformance, 0)
      return Math.round(sum / students.value.length)
    })

    const allSelected = computed(() => {
      return selectedStudents.value.length === paginatedStudents.value.length && 
             paginatedStudents.value.length > 0
    })

    // Methods
    const toggleAllSelection = () => {
      if (allSelected.value) {
        selectedStudents.value = []
      } else {
        selectedStudents.value = paginatedStudents.value.map(s => s.id)
      }
    }

    const clearSelection = () => {
      selectedStudents.value = []
    }

    const goToPage = (page) => {
      currentPage.value = page
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const getPerformanceClass = (performance) => {
      if (performance >= 90) return 'excellent'
      if (performance >= 75) return 'good'
      if (performance >= 60) return 'average'
      return 'at-risk'
    }

    const formatDate = (date) => {
      const now = new Date()
      const diff = now - date
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)

      if (hours < 1) return 'Just now'
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return date.toLocaleDateString()
    }

    const viewStudentProfile = (studentId) => {
      // Navigate to student profile
      console.log('View student profile:', studentId)
    }

    const messageStudent = (studentId) => {
      // Open message dialog
      console.log('Message student:', studentId)
    }

    const viewProgress = (studentId) => {
      // Navigate to student progress
      console.log('View progress:', studentId)
    }

    const sendBulkEmail = () => {
      // Open bulk email dialog
      console.log('Send bulk email to:', selectedStudents.value)
    }

    const addToCourse = () => {
      // Open course selection dialog
      console.log('Add students to course:', selectedStudents.value)
    }

    const exportData = () => {
      // Export student data
      console.log('Export student data')
    }

    onMounted(() => {
      // Load students data
    })

    return {
      // Data
      searchQuery,
      courseFilter,
      performanceFilter,
      enrollmentStatus,
      selectedStudents,
      currentPage,
      pageSize,
      courses,
      
      // Computed
      filteredStudents,
      paginatedStudents,
      totalPages,
      visiblePages,
      totalStudents,
      activeStudents,
      atRiskStudents,
      averagePerformance,
      allSelected,
      
      // Methods
      toggleAllSelection,
      clearSelection,
      goToPage,
      previousPage,
      nextPage,
      getPerformanceClass,
      formatDate,
      viewStudentProfile,
      messageStudent,
      viewProgress,
      sendBulkEmail,
      addToCourse,
      exportData
    }
  }
}
</script>

<style scoped>
.teacher-students-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

/* Search and Filters */
.search-filters-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.search-bar svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

/* Quick Actions */
.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
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

/* Bulk Actions Bar */
.bulk-actions-bar {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--primary);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.selected-count {
  font-weight: 600;
  color: var(--primary);
}

.bulk-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--interactive-primary);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Students Table */
.students-table-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.results-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-size-select {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.students-table {
  overflow-x: auto;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.students-table table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: var(--bg-secondary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.students-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.student-row:hover {
  background: var(--bg-secondary);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.student-name {
  font-weight: 600;
  color: var(--text-primary);
}

.student-id {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.student-email {
  color: var(--text-secondary);
}

.courses-badge {
  background: var(--interactive-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.performance-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.performance-badge.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: var(--status-success);
}

.performance-badge.good {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}

.performance-badge.average {
  background: rgba(245, 158, 11, 0.1);
  color: var(--status-warning);
}

.performance-badge.at-risk {
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-error);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--status-success);
}

.status-badge.inactive {
  background: rgba(245, 158, 11, 0.1);
  color: var(--status-warning);
}

.status-badge.dropped {
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-error);
}

.last-activity {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--interactive-primary);
  color: white;
  transform: translateY(-1px);
}

.checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
  min-width: 2.5rem;
}

.page-number:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.page-number.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .teacher-students-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .students-table {
    font-size: 0.75rem;
  }
  
  .students-table th,
  .students-table td {
    padding: 0.5rem;
  }
  
  .student-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>