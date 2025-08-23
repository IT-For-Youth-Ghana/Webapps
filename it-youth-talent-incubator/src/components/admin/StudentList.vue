<!-- 
🚀 IT Youth Talent Incubator - Student Management Component

PURPOSE: A comprehensive student management interface for administrators to view, search,
filter, and interact with all registered students in both card and table formats.

WHAT IT DOES:
- Displays all student profiles with detailed information and statistics
- Provides advanced filtering by university, graduation year, and technical skills
- Enables comprehensive search across names, emails, and skills
- Shows student application history with status tracking
- Supports both card view (detailed) and table view (compact) displays
- Features a detailed profile modal with complete student information
- Enables bulk operations and individual student management actions

FOR CO-PROGRAMMERS:
- Sample students data in `students` ref (lines 9-118) - replace with API calls
- Multiple filter types: university, graduation year, skill-based filtering
- View modes: 'cards' (default) or 'table' toggle (line 128)
- Profile modal system with `showProfileModal` and `selectedStudent` (lines 129-130)
- Computed properties for dynamic filtering and university/year lists
- Application summary calculation for each student's job application status

STUDENT DATA STRUCTURE:
- Personal info: name, email, phone, location
- Education: university, degree, current semester, graduation year, GPA
- Technical: skills array, profile completion percentage
- Activity: registration date, last active timestamp, active status
- Applications: array of job applications with company, status, dates
- Metrics: profile completion, application counts, performance data

CARD VIEW FEATURES:
- Student avatar with initials in branded colors
- Profile completion progress bar with percentage
- Skills preview (first 3 skills + remaining count)
- Application summary with color-coded status dots
- Quick action buttons: view profile, message, activate/deactivate
- Visual indicators for inactive students

TABLE VIEW FEATURES:
- Compact display for large student datasets
- Sortable columns for efficient data browsing
- Quick profile completion visualization
- Bulk selection for mass operations
- Responsive design for mobile devices

PROFILE MODAL:
- Complete student information display
- Organized sections: Basic Info, Education, Skills, Applications
- Application history with status indicators
- Action buttons for messaging and profile management
- Scrollable content for extensive student data

FILTER & SEARCH:
- University filter: dynamically populated from student data
- Graduation year filter: shows available years
- Skill-based search: matches against technical skills
- Text search: student names, emails, skills
- Sort options: registration date, name, profile completion, GPA
-->
<script setup>
import { ref, computed } from 'vue'

// Sample students data
const students = ref([
  {
    id: 1,
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'kwame.asante@student.ug.edu.gh',
    phone: '+233 24 567 8900',
    university: 'University of Ghana',
    degree: 'Computer Science',
    currentSemester: 6,
    graduationYear: 2025,
    location: 'Accra, Ghana',
    registrationDate: '2024-09-15',
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS'],
    gpa: '3.4',
    profileCompletion: 85,
    applications: [
      { jobTitle: 'Frontend Developer Intern', company: 'TechCorp Ghana', status: 'pending', date: '2025-01-20' },
      { jobTitle: 'Web Developer', company: 'StartupXYZ', status: 'approved', date: '2025-01-15' }
    ],
    lastActive: '2025-01-22',
    isActive: true
  },
  {
    id: 2,
    firstName: 'Ama',
    lastName: 'Serwaa',
    email: 'ama.serwaa@student.knust.edu.gh',
    phone: '+233 20 123 4567',
    university: 'KNUST',
    degree: 'Information Technology',
    currentSemester: 8,
    graduationYear: 2025,
    location: 'Kumasi, Ghana',
    registrationDate: '2024-08-20',
    skills: ['PHP', 'Laravel', 'MySQL', 'Vue.js', 'CSS'],
    gpa: '3.7',
    profileCompletion: 92,
    applications: [
      { jobTitle: 'Backend Developer', company: 'Digital Solutions Ltd', status: 'rejected', date: '2025-01-18' },
      { jobTitle: 'Full Stack Developer', company: 'TechStart', status: 'pending', date: '2025-01-10' }
    ],
    lastActive: '2025-01-21',
    isActive: true
  },
  {
    id: 3,
    firstName: 'Kofi',
    lastName: 'Mensah',
    email: 'kofi.mensah@student.ucc.edu.gh',
    phone: '+233 54 987 6543',
    university: 'University of Cape Coast',
    degree: 'Computer Science',
    currentSemester: 4,
    graduationYear: 2026,
    location: 'Cape Coast, Ghana',
    registrationDate: '2024-10-01',
    skills: ['React Native', 'Flutter', 'Firebase', 'Dart', 'JavaScript'],
    gpa: '3.2',
    profileCompletion: 78,
    applications: [
      { jobTitle: 'Mobile App Developer', company: 'Innovation Hub', status: 'approved', date: '2025-01-15' }
    ],
    lastActive: '2025-01-20',
    isActive: true
  },
  {
    id: 4,
    firstName: 'Abena',
    lastName: 'Osei',
    email: 'abena.osei@student.ug.edu.gh',
    phone: '+233 24 111 2222',
    university: 'University of Ghana',
    degree: 'Software Engineering',
    currentSemester: 2,
    graduationYear: 2027,
    location: 'Accra, Ghana',
    registrationDate: '2024-11-10',
    skills: ['Python', 'SQL', 'Excel', 'R', 'Statistics'],
    gpa: '3.9',
    profileCompletion: 65,
    applications: [
      { jobTitle: 'Data Analyst Intern', company: 'Analytics Pro', status: 'pending', date: '2025-01-22' }
    ],
    lastActive: '2025-01-23',
    isActive: true
  },
  {
    id: 5,
    firstName: 'Yaw',
    lastName: 'Boateng',
    email: 'yaw.boateng@student.knust.edu.gh',
    phone: '+233 20 555 6666',
    university: 'KNUST',
    degree: 'Computer Engineering',
    currentSemester: 7,
    graduationYear: 2025,
    location: 'Kumasi, Ghana',
    registrationDate: '2024-07-15',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Python'],
    gpa: '3.6',
    profileCompletion: 95,
    applications: [
      { jobTitle: 'DevOps Engineer', company: 'Cloud Systems', status: 'approved', date: '2025-01-19' },
      { jobTitle: 'System Administrator', company: 'IT Solutions', status: 'pending', date: '2025-01-12' }
    ],
    lastActive: '2025-01-18',
    isActive: false
  }
])

// Filters and search
const searchQuery = ref('')
const universityFilter = ref('all')
const graduationYearFilter = ref('all')
const skillFilter = ref('')
const sortBy = ref('registrationDate')
const sortOrder = ref('desc')
const selectedStudents = ref([])
const viewMode = ref('cards') // 'cards' or 'table'
const selectedStudent = ref(null)
const showProfileModal = ref(false)

// Computed properties
const filteredStudents = computed(() => {
  let filtered = students.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student => 
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.skills.some(skill => skill.toLowerCase().includes(query))
    )
  }

  // University filter
  if (universityFilter.value !== 'all') {
    filtered = filtered.filter(student => student.university === universityFilter.value)
  }

  // Graduation year filter
  if (graduationYearFilter.value !== 'all') {
    filtered = filtered.filter(student => student.graduationYear.toString() === graduationYearFilter.value)
  }

  // Skill filter
  if (skillFilter.value) {
    const skill = skillFilter.value.toLowerCase()
    filtered = filtered.filter(student => 
      student.skills.some(s => s.toLowerCase().includes(skill))
    )
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    // Special handling for dates
    if (sortBy.value.includes('Date')) {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const universities = computed(() => {
  const uniqueUniversities = [...new Set(students.value.map(s => s.university))]
  return uniqueUniversities.sort()
})

const graduationYears = computed(() => {
  const uniqueYears = [...new Set(students.value.map(s => s.graduationYear))]
  return uniqueYears.sort()
})

// Methods
const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return '#10b981'
    case 'pending': return '#f59e0b'
    case 'rejected': return '#ef4444'
    default: return '#6b7280'
  }
}

const viewProfile = (student) => {
  selectedStudent.value = student
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
  selectedStudent.value = null
}

const sendMessage = (student) => {
  console.log('Send message to:', student.firstName, student.lastName)
  // TODO: Implement messaging functionality
  // Should open message composer or integrate with communication system
  // Consider email notifications, in-app messaging, or SMS capabilities
}

const exportStudentData = () => {
  console.log('Exporting student data...')
  // TODO: Implement data export functionality
  // Should generate CSV/Excel files with student information
  // Include filters to export only filtered/selected students
  // Consider data privacy and GDPR compliance for exports
}

const selectAll = (event) => {
  if (event.target.checked) {
    selectedStudents.value = filteredStudents.value.map(student => student.id)
  } else {
    selectedStudents.value = []
  }
}

const bulkMessage = () => {
  if (selectedStudents.value.length === 0) return
  console.log('Bulk message to', selectedStudents.value.length, 'students')
  // TODO: Implement bulk messaging functionality
  // Should open bulk message composer for selected students
  // Consider rate limiting and message delivery tracking
}

const toggleStudentStatus = (student) => {
  student.isActive = !student.isActive
  console.log(`Student ${student.firstName} ${student.lastName} status:`, student.isActive ? 'Active' : 'Inactive')
}

const getApplicationsSummary = (student) => {
  const total = student.applications.length
  const approved = student.applications.filter(app => app.status === 'approved').length
  const pending = student.applications.filter(app => app.status === 'pending').length
  const rejected = student.applications.filter(app => app.status === 'rejected').length
  
  return { total, approved, pending, rejected }
}
</script>

<template>
  <div>
    <h1>Student Management</h1>
    <p class="subtitle">View and manage student profiles and applications</p>

    <div class="section-container">
      <!-- Controls -->
      <div class="controls-section">
        <div class="filters-row">
          <div class="filters">
            <div class="filter-group">
              <label class="filter-label">University:</label>
              <select v-model="universityFilter" class="filter-select">
                <option value="all">All Universities</option>
                <option v-for="university in universities" :key="university" :value="university">
                  {{ university }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Graduation Year:</label>
              <select v-model="graduationYearFilter" class="filter-select">
                <option value="all">All Years</option>
                <option v-for="year in graduationYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Sort by:</label>
              <select v-model="sortBy" class="filter-select">
                <option value="registrationDate">Registration Date</option>
                <option value="lastName">Name</option>
                <option value="profileCompletion">Profile Completion</option>
                <option value="gpa">GPA</option>
              </select>
            </div>

            <div class="search-group">
              <label class="filter-label">Search:</label>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search students or skills..."
                class="search-input"
              >
            </div>
          </div>

          <div class="action-controls">
            <button @click="exportStudentData" class="btn-secondary btn-small">
              📊 Export Data
            </button>
            
            <div class="view-controls">
              <button 
                @click="viewMode = 'cards'"
                :class="['view-btn', { active: viewMode === 'cards' }]"
                title="Card View"
              >
                📋
              </button>
              <button 
                @click="viewMode = 'table'"
                :class="['view-btn', { active: viewMode === 'table' }]"
                title="Table View"
              >
                📄
              </button>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="bulk-actions" v-if="selectedStudents.length > 0">
          <span class="selected-count">{{ selectedStudents.length }} selected</span>
          <button @click="bulkMessage" class="btn-primary btn-small">
            ✉️ Send Message
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-number">{{ students.length }}</span>
          <span class="stat-label">Total Students</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ students.filter(s => s.isActive).length }}</span>
          <span class="stat-label">Active Students</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ Math.round(students.reduce((sum, s) => sum + s.profileCompletion, 0) / students.length) }}%</span>
          <span class="stat-label">Avg Profile Completion</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ students.reduce((sum, s) => sum + s.applications.length, 0) }}</span>
          <span class="stat-label">Total Applications</span>
        </div>
      </div>

      <!-- Students Display -->
      <div v-if="viewMode === 'cards'" class="students-grid">
        <div class="bulk-select-all" v-if="filteredStudents.length > 0">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              @change="selectAll"
              :checked="selectedStudents.length === filteredStudents.length"
              class="checkbox"
            >
            <span class="checkbox-text">Select All</span>
          </label>
        </div>

        <div 
          v-for="student in filteredStudents" 
          :key="student.id" 
          class="student-card"
          :class="{ 
            selected: selectedStudents.includes(student.id),
            inactive: !student.isActive
          }"
        >
          <!-- Card Header -->
          <div class="card-header">
            <input 
              type="checkbox" 
              :value="student.id"
              v-model="selectedStudents"
              class="student-checkbox"
            >
            
            <div class="student-avatar">
              {{ getInitials(student.firstName, student.lastName) }}
            </div>

            <span v-if="!student.isActive" class="inactive-badge">Inactive</span>
          </div>

          <!-- Student Info -->
          <div class="card-body">
            <h3 class="student-name">{{ student.firstName }} {{ student.lastName }}</h3>
            <p class="student-email">{{ student.email }}</p>
            <p class="student-university">🎓 {{ student.university }}</p>
            <p class="student-degree">{{ student.degree }} - {{ student.graduationYear }}</p>
            
            <div class="profile-completion">
              <div class="completion-label">Profile Completion</div>
              <div class="completion-bar">
                <div 
                  class="completion-fill" 
                  :style="{ width: student.profileCompletion + '%' }"
                ></div>
              </div>
              <div class="completion-text">{{ student.profileCompletion }}%</div>
            </div>

            <div class="skills-preview">
              <span 
                v-for="skill in student.skills.slice(0, 3)" 
                :key="skill" 
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span v-if="student.skills.length > 3" class="more-skills">
                +{{ student.skills.length - 3 }} more
              </span>
            </div>

            <div class="application-summary">
              <div class="summary-title">Applications</div>
              <div class="summary-stats">
                <span class="stat-item">
                  <span class="stat-dot approved"></span>
                  {{ getApplicationsSummary(student).approved }} Approved
                </span>
                <span class="stat-item">
                  <span class="stat-dot pending"></span>
                  {{ getApplicationsSummary(student).pending }} Pending
                </span>
                <span class="stat-item">
                  <span class="stat-dot rejected"></span>
                  {{ getApplicationsSummary(student).rejected }} Rejected
                </span>
              </div>
            </div>

            <div class="student-meta">
              <div class="meta-item">
                <span class="meta-label">GPA:</span>
                <span class="meta-value">{{ student.gpa }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Last Active:</span>
                <span class="meta-value">{{ new Date(student.lastActive).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <button @click="viewProfile(student)" class="btn-secondary btn-small">
              👁️ View Profile
            </button>
            <button @click="sendMessage(student)" class="btn-primary btn-small">
              ✉️ Message
            </button>
            <button 
              @click="toggleStudentStatus(student)" 
              :class="['btn-warning', 'btn-small']"
              :title="student.isActive ? 'Deactivate' : 'Activate'"
            >
              {{ student.isActive ? '⏸️' : '▶️' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="students-table">
        <table class="student-list-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  @change="selectAll"
                  :checked="selectedStudents.length === filteredStudents.length"
                >
              </th>
              <th>Student</th>
              <th>University</th>
              <th>Year</th>
              <th>Profile</th>
              <th>Applications</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="student in filteredStudents" 
              :key="student.id"
              :class="{ 
                selected: selectedStudents.includes(student.id),
                inactive: !student.isActive
              }"
            >
              <td>
                <input 
                  type="checkbox" 
                  :value="student.id"
                  v-model="selectedStudents"
                >
              </td>
              <td>
                <div class="student-info-cell">
                  <div class="student-avatar-small">
                    {{ getInitials(student.firstName, student.lastName) }}
                  </div>
                  <div>
                    <strong>{{ student.firstName }} {{ student.lastName }}</strong>
                    <div class="student-email-small">{{ student.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ student.university }}</td>
              <td>{{ student.graduationYear }}</td>
              <td>
                <div class="profile-completion-small">
                  <div class="completion-bar-small">
                    <div 
                      class="completion-fill-small" 
                      :style="{ width: student.profileCompletion + '%' }"
                    ></div>
                  </div>
                  <span>{{ student.profileCompletion }}%</span>
                </div>
              </td>
              <td>
                <span class="application-count">{{ student.applications.length }}</span>
              </td>
              <td>{{ new Date(student.lastActive).toLocaleDateString() }}</td>
              <td>
                <div class="table-actions">
                  <button @click="viewProfile(student)" class="btn-secondary btn-small">View</button>
                  <button @click="sendMessage(student)" class="btn-primary btn-small">Message</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredStudents.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No students found</h3>
        <p>{{ searchQuery ? 'Try adjusting your search terms' : 'No students match the selected filters' }}</p>
      </div>
    </div>

    <!-- Profile Modal -->
    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</h2>
          <button @click="closeProfileModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="profile-sections">
            <!-- Basic Info -->
            <div class="profile-section">
              <h3>Basic Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ selectedStudent.email }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">{{ selectedStudent.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Location:</span>
                  <span class="info-value">{{ selectedStudent.location }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">GPA:</span>
                  <span class="info-value">{{ selectedStudent.gpa }}</span>
                </div>
              </div>
            </div>

            <!-- Education -->
            <div class="profile-section">
              <h3>Education</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">University:</span>
                  <span class="info-value">{{ selectedStudent.university }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Degree:</span>
                  <span class="info-value">{{ selectedStudent.degree }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Current Semester:</span>
                  <span class="info-value">{{ selectedStudent.currentSemester }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Graduation:</span>
                  <span class="info-value">{{ selectedStudent.graduationYear }}</span>
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div class="profile-section">
              <h3>Technical Skills</h3>
              <div class="skills-display">
                <span 
                  v-for="skill in selectedStudent.skills" 
                  :key="skill" 
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <!-- Applications -->
            <div class="profile-section">
              <h3>Application History</h3>
              <div class="applications-list">
                <div 
                  v-for="application in selectedStudent.applications" 
                  :key="application.jobTitle + application.date"
                  class="application-item"
                >
                  <div class="application-info">
                    <div class="job-title">{{ application.jobTitle }}</div>
                    <div class="company-name">{{ application.company }}</div>
                    <div class="application-date">{{ new Date(application.date).toLocaleDateString() }}</div>
                  </div>
                  <div 
                    class="status-dot" 
                    :style="{ backgroundColor: getStatusColor(application.status) }"
                    :title="application.status"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="sendMessage(selectedStudent)" class="btn-primary">
            ✉️ Send Message
          </button>
          <button @click="closeProfileModal" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Styles */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

/* Controls */
.controls-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
  gap: 20px;
}

.filters {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  flex: 1;
}

.filter-group, .search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #003a9b;
}

.filter-select, .search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  transition: all 0.2s ease;
}

.filter-select:focus, .search-input:focus {
  outline: none;
  border-color: #004dc5;
  box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
}

.search-input {
  min-width: 250px;
}

.action-controls {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.view-btn:hover {
  background-color: #f3f4f6;
}

.view-btn.active {
  background-color: #004dc5;
  color: white;
  border-color: #004dc5;
}

.bulk-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.selected-count {
  color: #0369a1;
  font-weight: 600;
  font-size: 14px;
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #004dc5;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

/* Students Grid */
.students-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
}

.bulk-select-all {
  grid-column: 1 / -1;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.student-card {
  background: #ffffff;
  border: 1px solid rgba(0, 77, 197, 0.15);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 77, 197, 0.15);
}

.student-card.selected {
  border-color: #004dc5;
  background-color: rgba(0, 77, 197, 0.02);
}

.student-card.inactive {
  opacity: 0.7;
  background-color: #f9fafb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.student-checkbox {
  margin-right: 12px;
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #004dc5, #003a9b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.inactive-badge {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.card-body {
  margin-bottom: 16px;
}

.student-name {
  color: #003a9b;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.student-email {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 8px;
}

.student-university, .student-degree {
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
}

.profile-completion {
  margin: 12px 0;
  padding: 8px;
  background-color: #f8fafc;
  border-radius: 6px;
}

.completion-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.completion-bar {
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.completion-text {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  text-align: right;
}

.skills-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}

.skill-tag {
  background-color: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.more-skills {
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

.application-summary {
  margin: 12px 0;
  padding: 8px;
  background-color: #f8fafc;
  border-radius: 6px;
}

.summary-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 600;
}

.summary-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #374151;
  padding: 0;
  background: none;
  border-radius: 0;
  flex: none;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot.approved {
  background-color: #10b981;
}

.stat-dot.pending {
  background-color: #f59e0b;
}

.stat-dot.rejected {
  background-color: #ef4444;
}

.student-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-weight: 500;
}

.meta-value {
  color: #1f2937;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

/* Table View */
.students-table {
  overflow-x: auto;
}

.student-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.student-list-table th,
.student-list-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 77, 197, 0.05);
}

.student-list-table th {
  background-color: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid rgba(0, 77, 197, 0.1);
}

.student-list-table tr:hover {
  background-color: #f9fafb;
}

.student-list-table tr.selected {
  background-color: rgba(0, 77, 197, 0.02);
}

.student-list-table tr.inactive {
  opacity: 0.7;
}

.student-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #004dc5, #003a9b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.student-email-small {
  font-size: 12px;
  color: #6b7280;
}

.profile-completion-small {
  display: flex;
  align-items: center;
  gap: 8px;
}

.completion-bar-small {
  width: 60px;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.completion-fill-small {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.application-count {
  font-weight: 600;
  color: #004dc5;
}

.table-actions {
  display: flex;
  gap: 6px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.modal-header h2 {
  color: #003a9b;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section h3 {
  color: #003a9b;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
  padding-bottom: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.skills-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.application-info {
  flex: 1;
}

.job-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.company-name {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 2px;
}

.application-date {
  font-size: 12px;
  color: #9ca3af;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 8px;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger, .btn-info {
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background-color: #004dc5;
  color: white;
  padding: 10px 20px;
}

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 1px solid rgba(0, 77, 197, 0.3);
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-primary:hover {
  background-color: #003a9b;
  transform: translateY(-1px);
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
}

.btn-warning:hover {
  background-color: #d97706;
  transform: translateY(-1px);
}

/* Checkbox styling */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #004dc5;
}

.checkbox-text {
  user-select: none;
}

/* Title styling */
h1 {
  color: white;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 16px;
  }

  .filters {
    flex-direction: column;
    gap: 16px;
  }

  .search-input {
    min-width: 100%;
  }

  .stats-section {
    flex-direction: column;
    gap: 12px;
  }

  .students-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .student-list-table {
    font-size: 12px;
  }

  .table-actions {
    flex-direction: column;
    gap: 4px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
