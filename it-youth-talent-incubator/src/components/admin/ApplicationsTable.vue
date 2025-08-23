<!-- 
🚀 IT Youth Talent Incubator - Application Management Component

PURPOSE: A comprehensive table interface for administrators to review, filter, and manage
all student job applications with advanced sorting, searching, and bulk action capabilities.

WHAT IT DOES:
- Displays all student applications in a sortable, filterable table format
- Provides application status management (pending, approved, rejected)
- Enables bulk operations for multiple applications simultaneously
- Shows detailed student information, applied positions, and application dates
- Supports pagination for large datasets with configurable page sizes
- Offers real-time search across student names, emails, and job titles

FOR CO-PROGRAMMERS:
- Sample applications in `applications` ref (lines 9-85) - replace with API data
- Filtering/search logic in computed `filteredApplications` (lines 99-130)
- Pagination computed properties: `paginatedApplications`, `totalPages` (lines 132-140)
- Status management functions: `updateStatus()`, `bulkApprove()`, `bulkReject()` (lines 143-216)
- Sortable columns with `sortTable()` function - click headers to sort
- Bulk selection with `selectAll()` and `selectedApplications` tracking

APPLICATION DATA STRUCTURE:
- Student info: name, email, phone, university, degree, experience
- Job info: title, company applied to
- Application metadata: date applied, status, skills, cover letter
- Skills array for technical competencies
- Status values: 'pending', 'approved', 'rejected'

TABLE FEATURES:
- Sortable columns: student name, email, job title, applied date, status
- Status badges with color coding for quick visual identification
- Individual action buttons: view details, approve, reject, delete
- Bulk selection checkboxes for mass operations
- Pagination controls with page info display

FILTER & SEARCH CAPABILITIES:
- Status filter dropdown: all, pending, approved, rejected
- Text search across: student name, email, job title
- Sort order toggle: ascending/descending for all sortable columns
- Real-time filtering without page refresh

BULK OPERATIONS:
- Select all applications on current page
- Bulk approve selected pending applications  
- Bulk reject selected pending applications
- Visual feedback showing number of selected items
-->
<script setup>
import { ref, computed } from 'vue'

// Sample applications data
const applications = ref([
  {
    id: 1,
    studentName: 'Kwame Asante',
    email: 'kwame.asante@student.ug.edu.gh',
    phone: '+233 24 567 8900',
    university: 'University of Ghana',
    degree: 'Computer Science',
    jobTitle: 'Frontend Developer Intern',
    company: 'TechCorp Ghana',
    appliedDate: '2025-01-20',
    status: 'pending',
    experience: '2 years',
    skills: ['JavaScript', 'React', 'HTML/CSS'],
    coverLetter: 'I am excited to apply for this position...'
  },
  {
    id: 2,
    studentName: 'Ama Serwaa',
    email: 'ama.serwaa@student.knust.edu.gh',
    phone: '+233 20 123 4567',
    university: 'KNUST',
    degree: 'Information Technology',
    jobTitle: 'Backend Developer',
    company: 'Digital Solutions Ltd',
    appliedDate: '2025-01-18',
    status: 'approved',
    experience: '1 year',
    skills: ['PHP', 'Laravel', 'MySQL'],
    coverLetter: 'With my background in IT...'
  },
  {
    id: 3,
    studentName: 'Kofi Mensah',
    email: 'kofi.mensah@student.ucc.edu.gh',
    phone: '+233 54 987 6543',
    university: 'University of Cape Coast',
    degree: 'Computer Science',
    jobTitle: 'Mobile App Developer',
    company: 'Innovation Hub',
    appliedDate: '2025-01-15',
    status: 'rejected',
    experience: '6 months',
    skills: ['React Native', 'Flutter', 'Firebase'],
    coverLetter: 'I have a passion for mobile development...'
  },
  {
    id: 4,
    studentName: 'Abena Osei',
    email: 'abena.osei@student.ug.edu.gh',
    phone: '+233 24 111 2222',
    university: 'University of Ghana',
    degree: 'Software Engineering',
    jobTitle: 'Data Analyst Intern',
    company: 'Analytics Pro',
    appliedDate: '2025-01-22',
    status: 'pending',
    experience: '1 year',
    skills: ['Python', 'SQL', 'Excel'],
    coverLetter: 'My analytical skills and experience...'
  },
  {
    id: 5,
    studentName: 'Yaw Boateng',
    email: 'yaw.boateng@student.knust.edu.gh',
    phone: '+233 20 555 6666',
    university: 'KNUST',
    degree: 'Computer Engineering',
    jobTitle: 'DevOps Engineer',
    company: 'Cloud Systems',
    appliedDate: '2025-01-19',
    status: 'approved',
    experience: '3 years',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    coverLetter: 'I have extensive experience in cloud technologies...'
  }
])

// Filters and sorting
const statusFilter = ref('all')
const searchQuery = ref('')
const sortBy = ref('appliedDate')
const sortOrder = ref('desc')
const selectedApplications = ref([])

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed properties
const filteredApplications = computed(() => {
  let filtered = applications.value

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === statusFilter.value)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(app => 
      app.studentName.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.jobTitle.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredApplications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / itemsPerPage.value)
})

// Methods
const updateStatus = (application, newStatus) => {
  application.status = newStatus
  console.log(`Updated application ${application.id} to ${newStatus}`)
  // TODO: Make API call to update application status in database
  // Should also send notification email to student about status change
}

const viewApplication = (application) => {
  console.log('View application:', application)
  // TODO: Navigate to detailed application view showing:
  // - Full student profile and resume
  // - Complete cover letter and motivation
  // - Skills assessment and portfolio links
  // - Application timeline and admin notes
}

const deleteApplication = (application) => {
  if (confirm(`Delete application from ${application.studentName}?`)) {
    const index = applications.value.findIndex(app => app.id === application.id)
    if (index > -1) {
      applications.value.splice(index, 1)
    }
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'status-pending'
    case 'approved': return 'status-approved'
    case 'rejected': return 'status-rejected'
    default: return 'status-pending'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Pending'
    case 'approved': return 'Approved'
    case 'rejected': return 'Rejected'
    default: return 'Pending'
  }
}

const sortTable = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const selectAll = (event) => {
  if (event.target.checked) {
    selectedApplications.value = paginatedApplications.value.map(app => app.id)
  } else {
    selectedApplications.value = []
  }
}

const bulkApprove = () => {
  if (selectedApplications.value.length === 0) return
  
  applications.value.forEach(app => {
    if (selectedApplications.value.includes(app.id)) {
      app.status = 'approved'
    }
  })
  selectedApplications.value = []
}

const bulkReject = () => {
  if (selectedApplications.value.length === 0) return
  
  applications.value.forEach(app => {
    if (selectedApplications.value.includes(app.id)) {
      app.status = 'rejected'
    }
  })
  selectedApplications.value = []
}
</script>

<template>
  <div>
    <h1>Application Management</h1>
    <p class="subtitle">Review and manage student job applications</p>

    <div class="section-container">
      <!-- Controls -->
      <div class="controls-section">
        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">Status:</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="search-group">
            <label class="filter-label">Search:</label>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by name, email, or job title..."
              class="search-input"
            >
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="bulk-actions" v-if="selectedApplications.length > 0">
          <span class="selected-count">{{ selectedApplications.length }} selected</span>
          <button @click="bulkApprove" class="btn-success btn-small">
            ✅ Approve Selected
          </button>
          <button @click="bulkReject" class="btn-danger btn-small">
            ❌ Reject Selected
          </button>
        </div>
      </div>

      <!-- Applications Table -->
      <div class="table-container">
        <table class="applications-table">
          <thead>
            <tr>
              <th class="checkbox-column">
                <input 
                  type="checkbox" 
                  @change="selectAll"
                  :checked="selectedApplications.length === paginatedApplications.length"
                >
              </th>
              <th @click="sortTable('studentName')" class="sortable">
                Student Name
                <span class="sort-indicator" v-if="sortBy === 'studentName'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortTable('email')" class="sortable">
                Email
                <span class="sort-indicator" v-if="sortBy === 'email'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortTable('jobTitle')" class="sortable">
                Job Applied
                <span class="sort-indicator" v-if="sortBy === 'jobTitle'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortTable('appliedDate')" class="sortable">
                Applied Date
                <span class="sort-indicator" v-if="sortBy === 'appliedDate'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortTable('status')" class="sortable">
                Status
                <span class="sort-indicator" v-if="sortBy === 'status'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="application in paginatedApplications" 
              :key="application.id"
              class="table-row"
            >
              <td>
                <input 
                  type="checkbox" 
                  :value="application.id"
                  v-model="selectedApplications"
                >
              </td>
              <td class="student-info">
                <div class="student-name">{{ application.studentName }}</div>
                <div class="student-university">{{ application.university }}</div>
              </td>
              <td>{{ application.email }}</td>
              <td class="job-info">
                <div class="job-title">{{ application.jobTitle }}</div>
                <div class="company-name">{{ application.company }}</div>
              </td>
              <td>{{ new Date(application.appliedDate).toLocaleDateString() }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(application.status)]">
                  {{ getStatusText(application.status) }}
                </span>
              </td>
              <td class="actions-column">
                <div class="action-buttons">
                  <button 
                    @click="viewApplication(application)" 
                    class="btn-info btn-small"
                    title="View Details"
                  >
                    👁️
                  </button>
                  
                  <button 
                    v-if="application.status === 'pending'"
                    @click="updateStatus(application, 'approved')" 
                    class="btn-success btn-small"
                    title="Approve"
                  >
                    ✅
                  </button>
                  
                  <button 
                    v-if="application.status === 'pending'"
                    @click="updateStatus(application, 'rejected')" 
                    class="btn-danger btn-small"
                    title="Reject"
                  >
                    ❌
                  </button>
                  
                  <button 
                    @click="deleteApplication(application)" 
                    class="btn-danger btn-small"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn-secondary btn-small"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }} 
          ({{ filteredApplications.length }} total applications)
        </span>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn-secondary btn-small"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container - same as other components */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

/* Controls Section */
.controls-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.filters {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 16px;
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
  min-width: 300px;
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

/* Table Styles */
.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid rgba(0, 77, 197, 0.1);
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.applications-table th {
  background-color: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 2px solid rgba(0, 77, 197, 0.1);
}

.applications-table th.sortable {
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.applications-table th.sortable:hover {
  background-color: #f1f5f9;
}

.sort-indicator {
  margin-left: 4px;
  color: #004dc5;
  font-weight: 700;
}

.applications-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.05);
}

.table-row:hover {
  background-color: #f9fafb;
}

.checkbox-column {
  width: 40px;
}

.student-info .student-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.student-info .student-university {
  color: #6b7280;
  font-size: 12px;
}

.job-info .job-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.job-info .company-name {
  color: #6b7280;
  font-size: 12px;
}

/* Status Badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Action Buttons */
.actions-column {
  width: 150px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}

/* Buttons - same style as other components */
.btn-primary, .btn-secondary, .btn-success, .btn-danger, .btn-info {
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
}

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 1px solid rgba(0, 77, 197, 0.3);
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-info {
  background-color: #3b82f6;
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

.btn-success:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.btn-danger:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

.btn-info:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

.page-info {
  color: #6b7280;
  font-size: 14px;
}

/* Title styling - same as other components */
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
  .section-container {
    padding: 20px;
  }

  .filters {
    flex-direction: column;
    gap: 16px;
  }

  .search-input {
    min-width: 100%;
  }

  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .applications-table {
    font-size: 12px;
  }

  .applications-table th,
  .applications-table td {
    padding: 8px 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
