<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentDetailModal from '../components/admin/StudentDetailModal.vue'

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const skillFilter = ref('all')
const sortBy = ref('newest')

const showDetailModal = ref(false)
const selectedStudent = ref(null)
const students = ref([])

const statusOptions = [
  { value: 'all', label: 'All Students' },
  { value: 'active', label: 'Active' },
  { value: 'job_seeking', label: 'Job Seeking' },
  { value: 'employed', label: 'Employed' },
  { value: 'inactive', label: 'Inactive' }
]

const skillOptions = [
  { value: 'all', label: 'All Skills' },
  { value: 'frontend', label: 'Frontend Development' },
  { value: 'backend', label: 'Backend Development' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'design', label: 'UI/UX Design' },
  { value: 'data', label: 'Data Science' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'devops', label: 'DevOps' }
]

const filteredStudents = computed(() => {
  let filtered = [...students.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.skills.some(skill => skill.toLowerCase().includes(query)) ||
      student.education.toLowerCase().includes(query) ||
      student.location.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(student => student.status === statusFilter.value)
  }

  if (skillFilter.value !== 'all') {
    filtered = filtered.filter(student => 
      student.primarySkill === skillFilter.value ||
      student.skills.some(skill => skill.toLowerCase().includes(skillFilter.value))
    )
  }

  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.joinedDate) - new Date(b.joinedDate))
      break
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'applications':
      filtered.sort((a, b) => b.applicationCount - a.applicationCount)
      break
    case 'profile_score':
      filtered.sort((a, b) => b.profileCompleteness - a.profileCompleteness)
      break
  }

  return filtered
})

const stats = computed(() => {
  const total = students.value.length
  const active = students.value.filter(s => s.status === 'active').length
  const jobSeeking = students.value.filter(s => s.status === 'job_seeking').length
  const employed = students.value.filter(s => s.status === 'employed').length
  const avgProfileScore = students.value.length > 0 
    ? Math.round(students.value.reduce((sum, s) => sum + s.profileCompleteness, 0) / students.value.length)
    : 0

  return { total, active, jobSeeking, employed, avgProfileScore }
})

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  skillFilter.value = 'all'
  sortBy.value = 'newest'
}

const handleViewStudent = (student) => {
  selectedStudent.value = student
  showDetailModal.value = true
}

const handleUpdateStatus = async (studentId, newStatus) => {
  const student = students.value.find(s => s.id === studentId)
  if (student) {
    student.status = newStatus
    student.updatedAt = new Date().toISOString()
    console.log('Student status updated:', studentId, newStatus)
  }
}

const handleSendMessage = (studentId) => {
  const student = students.value.find(s => s.id === studentId)
  console.log('Sending message to student:', student?.name)
  // In real app, this would open a messaging interface
}

const handleExportData = () => {
  console.log('Exporting student data...')
  // In real app, this would generate and download CSV/Excel file
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    job_seeking: 'warning',
    employed: 'primary',
    inactive: 'secondary'
  }
  return colors[status] || 'secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    job_seeking: 'Job Seeking',
    employed: 'Employed',
    inactive: 'Inactive'
  }
  return labels[status] || status
}

const getProfileScoreColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const fetchStudents = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    students.value = [
      {
        id: 1,
        name: 'Kwame Asante',
        email: 'kwame.asante@email.com',
        phone: '+233 24 123 4567',
        location: 'Accra',
        status: 'job_seeking',
        joinedDate: '2023-09-15',
        updatedAt: '2024-01-15',
        profileCompleteness: 85,
        education: 'BSc Computer Science - University of Ghana',
        experience: '2 years',
        primarySkill: 'frontend',
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
        applicationCount: 5,
        interviewCount: 2,
        portfolioUrl: 'https://kwameasante.dev',
        linkedinUrl: 'https://linkedin.com/in/kwame-asante',
        githubUrl: 'https://github.com/kwame-asante',
        bio: 'Passionate frontend developer with experience in React and modern web technologies.',
        preferredSalary: 'GHS 8,000 - 12,000',
        availability: 'Immediately',
        workPreference: 'Full-time'
      },
      {
        id: 2,
        name: 'Ama Osei',
        email: 'ama.osei@email.com',
        phone: '+233 20 987 6543',
        location: 'Kumasi',
        status: 'employed',
        joinedDate: '2023-08-20',
        updatedAt: '2024-01-10',
        profileCompleteness: 92,
        education: 'BA Graphic Design - KNUST',
        experience: '3 years',
        primarySkill: 'design',
        skills: ['Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Prototyping'],
        applicationCount: 8,
        interviewCount: 4,
        portfolioUrl: 'https://amaosei.design',
        linkedinUrl: 'https://linkedin.com/in/ama-osei',
        githubUrl: '',
        bio: 'Creative UI/UX designer focused on user-centered design and digital experiences.',
        preferredSalary: 'GHS 6,000 - 9,000',
        availability: 'Currently employed',
        workPreference: 'Full-time',
        currentEmployer: 'DesignHub Africa'
      },
      {
        id: 3,
        name: 'Kofi Mensah',
        email: 'kofi.mensah@email.com',
        phone: '+233 26 555 7890',
        location: 'Tamale',
        status: 'active',
        joinedDate: '2023-10-05',
        updatedAt: '2024-01-08',
        profileCompleteness: 78,
        education: 'BSc Information Technology - UDS',
        experience: '4 years',
        primarySkill: 'backend',
        skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'AWS'],
        applicationCount: 3,
        interviewCount: 1,
        portfolioUrl: '',
        linkedinUrl: 'https://linkedin.com/in/kofi-mensah',
        githubUrl: 'https://github.com/kofi-mensah',
        bio: 'Backend developer with expertise in scalable server-side applications.',
        preferredSalary: 'GHS 7,000 - 11,000',
        availability: '2 weeks notice',
        workPreference: 'Full-time'
      },
      {
        id: 4,
        name: 'Akosua Darko',
        email: 'akosua.darko@email.com',
        phone: '+233 23 444 5678',
        location: 'Cape Coast',
        status: 'job_seeking',
        joinedDate: '2023-11-12',
        updatedAt: '2024-01-05',
        profileCompleteness: 65,
        education: 'BSc Mathematics - UCC',
        experience: 'Fresh Graduate',
        primarySkill: 'data',
        skills: ['Python', 'SQL', 'Excel', 'Statistics', 'Data Visualization'],
        applicationCount: 2,
        interviewCount: 0,
        portfolioUrl: '',
        linkedinUrl: 'https://linkedin.com/in/akosua-darko',
        githubUrl: 'https://github.com/akosua-darko',
        bio: 'Recent mathematics graduate interested in data analysis and business intelligence.',
        preferredSalary: 'GHS 3,000 - 5,000',
        availability: 'Immediately',
        workPreference: 'Full-time, Internship'
      },
      {
        id: 5,
        name: 'Yaw Owusu',
        email: 'yaw.owusu@email.com',
        phone: '+233 24 777 8888',
        location: 'Ho',
        status: 'active',
        joinedDate: '2023-12-01',
        updatedAt: '2024-01-03',
        profileCompleteness: 55,
        education: 'Diploma in Web Development - Ho Technical University',
        experience: '1 year',
        primarySkill: 'frontend',
        skills: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
        applicationCount: 1,
        interviewCount: 0,
        portfolioUrl: 'https://yawowusu.netlify.app',
        linkedinUrl: '',
        githubUrl: 'https://github.com/yaw-owusu',
        bio: 'Junior web developer eager to learn and grow in the tech industry.',
        preferredSalary: 'GHS 2,500 - 4,000',
        availability: 'Immediately',
        workPreference: 'Full-time, Part-time'
      },
      {
        id: 6,
        name: 'Efua Appiah',
        email: 'efua.appiah@email.com',
        phone: '+233 20 333 9999',
        location: 'Accra',
        status: 'employed',
        joinedDate: '2023-07-10',
        updatedAt: '2024-01-01',
        profileCompleteness: 88,
        education: 'MSc Computer Engineering - University of Ghana',
        experience: '5 years',
        primarySkill: 'devops',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform'],
        applicationCount: 6,
        interviewCount: 3,
        portfolioUrl: '',
        linkedinUrl: 'https://linkedin.com/in/efua-appiah',
        githubUrl: 'https://github.com/efua-appiah',
        bio: 'Senior DevOps engineer with expertise in cloud infrastructure and automation.',
        preferredSalary: 'GHS 12,000 - 18,000',
        availability: 'Open to opportunities',
        workPreference: 'Full-time',
        currentEmployer: 'CloudTech Solutions'
      }
    ]
  } catch (error) {
    console.error('Error fetching students:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudents()
})
</script>

<template>
  <div class="students-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Student Management</h1>
        <p class="page-subtitle">Manage and track student profiles and progress</p>
      </div>
      <button @click="handleExportData" class="btn-secondary">
        Export Data
      </button>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">Active Students</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ stats.jobSeeking }}</div>
          <div class="stat-label">Job Seeking</div>
        </div>
        <div class="stat-card info">
          <div class="stat-value">{{ stats.employed }}</div>
          <div class="stat-label">Employed</div>
        </div>
        <div class="stat-card rate">
          <div class="stat-value">{{ stats.avgProfileScore }}%</div>
          <div class="stat-label">Avg Profile Score</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section card">
      <div class="filters-header">
        <h3 class="filters-title">Filter Students</h3>
        <button @click="clearFilters" class="btn-secondary">
          Clear Filters
        </button>
      </div>

      <div class="filters-content">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by name, email, skills, education, or location..."
          >
        </div>

        <div class="filter-selects">
          <select v-model="statusFilter" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="skillFilter" class="filter-select">
            <option v-for="option in skillOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">By Name</option>
            <option value="applications">Most Applications</option>
            <option value="profile_score">Profile Score</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <p class="results-count">
        <span class="count-number">{{ filteredStudents.length }}</span>
        {{ filteredStudents.length === 1 ? 'student' : 'students' }}
        <span v-if="searchQuery" class="search-term">matching "{{ searchQuery }}"</span>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading students...</p>
    </div>

    <!-- Students Grid -->
    <div v-else-if="filteredStudents.length > 0" class="students-grid">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="student-card"
        @click="handleViewStudent(student)"
      >
        <div class="card-header">
          <div class="student-info">
            <h3 class="student-name">{{ student.name }}</h3>
            <p class="student-location">{{ student.location }}</p>
          </div>
          <span :class="['status-badge', getStatusColor(student.status)]">
            {{ getStatusLabel(student.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="student-details">
            <div class="detail-item">
              <span class="detail-label">Education:</span>
              <span class="detail-value">{{ student.education.split(' - ')[0] }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Experience:</span>
              <span class="detail-value">{{ student.experience }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Primary Skill:</span>
              <span class="detail-value">{{ skillOptions.find(s => s.value === student.primarySkill)?.label || student.primarySkill }}</span>
            </div>
          </div>

          <div class="skills-section">
            <div class="skills-list">
              <span
                v-for="skill in student.skills.slice(0, 3)"
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span v-if="student.skills.length > 3" class="skill-more">
                +{{ student.skills.length - 3 }} more
              </span>
            </div>
          </div>

          <div class="profile-progress">
            <div class="progress-header">
              <span class="progress-label">Profile Completeness</span>
              <span :class="['progress-value', getProfileScoreColor(student.profileCompleteness)]">
                {{ student.profileCompleteness }}%
              </span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :class="getProfileScoreColor(student.profileCompleteness)"
                :style="{ width: `${student.profileCompleteness}%` }"
              ></div>
            </div>
          </div>

          <div class="activity-stats">
            <div class="stat-item">
              <span class="stat-value">{{ student.applicationCount }}</span>
              <span class="stat-label">Applications</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ student.interviewCount }}</span>
              <span class="stat-label">Interviews</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="join-date">
            Joined {{ formatDate(student.joinedDate) }}
          </div>
          <div class="card-actions">
            <button
              @click.stop="handleSendMessage(student.id)"
              class="action-btn message"
              title="Send Message"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3 class="empty-title">No students found</h3>
        <p class="empty-description">
          {{ searchQuery ? 'Try adjusting your search or filter criteria.' : 'No students have registered yet.' }}
        </p>
        <button v-if="searchQuery" @click="clearFilters" class="btn-primary">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Student Detail Modal -->
    <StudentDetailModal
      v-if="showDetailModal && selectedStudent"
      :student="selectedStudent"
      @update-status="handleUpdateStatus"
      @close="showDetailModal = false"
    />
  </div>
</template>

<style scoped>
.students-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #8B949E;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
}

.stat-card.primary::before { background: #007AFF; }
.stat-card.success::before { background: #32D74B; }
.stat-card.warning::before { background: #FF9F0A; }
.stat-card.info::before { background: #BF5AF2; }
.stat-card.rate::before { background: #FF453A; }

.stat-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #8B949E;
  font-weight: 500;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filters-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  transition: all 250ms ease;
}

.search-input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.search-input::placeholder {
  color: #6E7681;
}

.filter-selects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 250ms ease;
}

.filter-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.results-summary {
  margin-bottom: 1.5rem;
}

.results-count {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0;
}

.count-number {
  color: #F0F6FC;
  font-weight: 600;
}

.search-term {
  color: #007AFF;
  font-weight: 500;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
}

.loading-text {
  color: #8B949E;
  font-size: 0.875rem;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.student-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.student-card:hover {
  border-color: #484F58;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.student-location {
  font-size: 0.875rem;
  color: #8B949E;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.success {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.status-badge.warning {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.status-badge.primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.status-badge.secondary {
  background: rgba(139, 148, 158, 0.1);
  color: #8B949E;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #8B949E;
  min-width: 5rem;
}

.detail-value {
  font-size: 0.875rem;
  color: #F0F6FC;
  text-align: right;
  font-weight: 500;
}

.skills-section {
  padding: 1rem 0;
  border-top: 1px solid #30363D;
  border-bottom: 1px solid #30363D;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.skill-more {
  color: #8B949E;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.profile-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.875rem;
  color: #8B949E;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-value.success { color: #32D74B; }
.progress-value.warning { color: #FF9F0A; }
.progress-value.danger { color: #FF453A; }

.progress-bar {
  height: 0.5rem;
  background: #30363D;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 300ms ease;
}

.progress-fill.success { background: #32D74B; }
.progress-fill.warning { background: #FF9F0A; }
.progress-fill.danger { background: #FF453A; }

.activity-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-item .stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F0F6FC;
}

.stat-item .stat-label {
  font-size: 0.75rem;
  color: #8B949E;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.join-date {
  font-size: 0.75rem;
  color: #8B949E;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  text-decoration: none;
}

.action-btn.message {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.action-btn.message:hover {
  background: rgba(0, 122, 255, 0.2);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 20rem;
}

.empty-content {
  text-align: center;
  max-width: 28rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #F0F6FC;
  margin-bottom: 1rem;
}

.empty-description {
  color: #8B949E;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .students-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-content {
    gap: 0.75rem;
  }

  .filter-selects {
    grid-template-columns: 1fr;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>