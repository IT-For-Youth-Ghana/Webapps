<template>
  <div class="admin-courses">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Course Management</h1>
        <p class="page-subtitle">Manage courses, enrollment, and access control</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportCourses">
          Export Data
        </button>
        <button class="btn btn-primary" @click="createNewCourse">
          Create Course
        </button>
      </div>
    </div>

    <!-- Course Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"></div>
        <div class="stat-content">
          <div class="stat-value">{{ courseStats.total }}</div>
          <div class="stat-label">Total Courses</div>
          <div class="stat-breakdown">{{ courseStats.active }} active</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success"></div>
        <div class="stat-content">
          <div class="stat-value">{{ courseStats.totalStudents }}</div>
          <div class="stat-label">Enrolled Students</div>
          <div class="stat-breakdown">{{ courseStats.averagePerCourse }} avg per course</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning"></div>
        <div class="stat-content">
          <div class="stat-value">{{ courseStats.pendingRequests }}</div>
          <div class="stat-label">Pending Enrollments</div>
          <div class="stat-breakdown">Require approval</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon info"></div>
        <div class="stat-content">
          <div class="stat-value">{{ courseStats.completionRate }}%</div>
          <div class="stat-label">Completion Rate</div>
          <div class="stat-breakdown">Average across all courses</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-header">
        <h3>Filter Courses</h3>
        <button class="btn btn-ghost btn-sm" @click="resetFilters">Reset Filters</button>
      </div>
      
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Search</label>
          <div class="search-input-container">
            <input 
              type="text" 
              v-model="filters.search"
              placeholder="Search by course name, code, or instructor..."
              class="search-input"
            />
            <span class="search-icon"></span>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Access Type</label>
          <select v-model="filters.accessType" class="filter-select">
            <option value="">All Types</option>
            <option value="open">Open Enrollment</option>
            <option value="code">Enrollment Code</option>
            <option value="invitation">Invitation Only</option>
            <option value="approval">Requires Approval</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Institution</label>
          <select v-model="filters.institution" class="filter-select">
            <option value="">All Institutions</option>
            <option value="ug">University of Ghana</option>
            <option value="ashesi">Ashesi University</option>
            <option value="unilag">University of Lagos</option>
            <option value="uon">University of Nairobi</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Category</label>
          <select v-model="filters.category" class="filter-select">
            <option value="">All Categories</option>
            <option value="programming">Programming</option>
            <option value="web-dev">Web Development</option>
            <option value="data-science">Data Science</option>
            <option value="mobile-dev">Mobile Development</option>
            <option value="cybersecurity">Cybersecurity</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Level</label>
          <select v-model="filters.level" class="filter-select">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Courses Table -->
    <div class="courses-table">
      <div class="table-header">
        <div class="table-controls">
          <div class="showing-count">
            Showing {{ filteredCourses.length }} of {{ courses.length }} courses
          </div>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" @click="selectAll">
              {{ selectedCourses.length === filteredCourses.length ? 'Deselect All' : 'Select All' }}
            </button>
            <button 
              class="btn btn-secondary btn-sm"
              :disabled="selectedCourses.length === 0"
              @click="bulkActions"
            >
              Bulk Actions ({{ selectedCourses.length }})
            </button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="courses-grid">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  :checked="selectedCourses.length === filteredCourses.length && filteredCourses.length > 0"
                  @change="selectAll"
                  class="checkbox"
                />
              </th>
              <th @click="sortBy('title')" class="sortable">
                Course
                <span class="sort-icon">{{ getSortIcon('title') }}</span>
              </th>
              <th @click="sortBy('instructor')" class="sortable">
                Instructor
                <span class="sort-icon">{{ getSortIcon('instructor') }}</span>
              </th>
              <th @click="sortBy('enrollmentCode')" class="sortable">
                Enrollment
                <span class="sort-icon">{{ getSortIcon('enrollmentCode') }}</span>
              </th>
              <th @click="sortBy('students')" class="sortable">
                Students
                <span class="sort-icon">{{ getSortIcon('students') }}</span>
              </th>
              <th @click="sortBy('status')" class="sortable">
                Status
                <span class="sort-icon">{{ getSortIcon('status') }}</span>
              </th>
              <th @click="sortBy('lastActivity')" class="sortable">
                Last Activity
                <span class="sort-icon">{{ getSortIcon('lastActivity') }}</span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="course in paginatedCourses" 
              :key="course.id"
              class="course-row"
              :class="{ selected: selectedCourses.includes(course.id) }"
            >
              <td>
                <input 
                  type="checkbox" 
                  :checked="selectedCourses.includes(course.id)"
                  @change="toggleSelection(course.id)"
                  class="checkbox"
                />
              </td>
              <td>
                <div class="course-info">
                  <div class="course-image">
                    <img :src="course.image" :alt="course.title" />
                  </div>
                  <div class="course-details">
                    <div class="course-title">{{ course.title }}</div>
                    <div class="course-code">{{ course.code }}</div>
                    <div class="course-category">{{ course.category }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="instructor-info">
                  <div class="instructor-name">{{ course.instructor.name }}</div>
                  <div class="instructor-email">{{ course.instructor.email }}</div>
                </div>
              </td>
              <td>
                <div class="enrollment-info">
                  <div class="enrollment-type" :class="course.accessType">
                    {{ getAccessTypeIcon(course.accessType) }} {{ formatAccessType(course.accessType) }}
                  </div>
                  <div v-if="course.enrollmentCode" class="enrollment-code">
                    Code: {{ course.enrollmentCode }}
                  </div>
                  <div v-if="course.pendingRequests > 0" class="pending-requests">
                    {{ course.pendingRequests }} pending
                  </div>
                </div>
              </td>
              <td>
                <div class="student-count">
                  <div class="count-number">{{ course.enrolledStudents }}</div>
                  <div class="count-details">
                    <span class="active-students">{{ course.activeStudents }} active</span>
                    <span class="completion-rate">{{ course.completionRate }}% completion</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="course.status">
                  {{ getStatusIcon(course.status) }} {{ formatStatus(course.status) }}
                </span>
              </td>
              <td>
                <div class="activity-info">
                  <div class="activity-date">{{ formatDate(course.lastActivity) }}</div>
                  <div class="activity-ago">{{ getTimeAgo(course.lastActivity) }}</div>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-ghost btn-sm" @click="viewCourse(course)" title="View Details">
                    View
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="editCourse(course)" title="Edit">
                    Edit
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="manageEnrollments(course)" title="Manage Enrollments">
                    Manage
                  </button>
                  <div class="dropdown">
                    <button class="btn btn-ghost btn-sm dropdown-toggle" @click="toggleDropdown(course.id)">
                      ⋮
                    </button>
                    <div v-if="activeDropdown === course.id" class="dropdown-menu">
                      <button @click="duplicateCourse(course)">Duplicate</button>
                      <button @click="exportCourseData(course)">Export Data</button>
                      <button @click="viewEnrollmentRequests(course)">Enrollment Requests</button>
                      <button @click="generateInviteLink(course)">Generate Invite Link</button>
                      <button @click="resetEnrollmentCode(course)">Reset Code</button>
                      <button 
                        @click="toggleCourseStatus(course)"
                        :class="course.status === 'active' ? 'warning' : 'success'"
                      >
                        {{ course.status === 'active' ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button @click="archiveCourse(course)" class="warning">Archive</button>
                      <button @click="deleteCourse(course)" class="danger">Delete</button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredCourses.length) }} of {{ filteredCourses.length }} entries
        </div>
        <div class="pagination-controls">
          <button 
            class="btn btn-ghost btn-sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            ‹ Previous
          </button>
          <span class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="btn btn-ghost btn-sm"
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </span>
          <button 
            class="btn btn-ghost btn-sm"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Course Modal -->
    <div v-if="showCourseModal" class="modal-overlay" @click="closeCourseModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCourse ? 'Edit Course' : 'Create New Course' }}</h2>
          <button class="btn btn-ghost btn-sm" @click="closeCourseModal">Close</button>
        </div>
        
        <div class="modal-content">
          <div class="form-tabs">
            <button 
              v-for="tab in courseTabs" 
              :key="tab.id"
              class="form-tab"
              :class="{ active: activeCourseTab === tab.id }"
              @click="activeCourseTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Basic Information Tab -->
          <div v-if="activeCourseTab === 'basic'" class="form-section">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Course Title *</label>
                <input 
                  type="text" 
                  v-model="courseForm.title"
                  class="form-input"
                  placeholder="Enter course title..."
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Course Code *</label>
                <input 
                  type="text" 
                  v-model="courseForm.code"
                  class="form-input"
                  placeholder="e.g., CS101, WEB-DEV-2024"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="courseForm.category" class="form-select">
                  <option value="programming">Programming</option>
                  <option value="web-dev">Web Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="mobile-dev">Mobile Development</option>
                  <option value="cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Level</label>
                <select v-model="courseForm.level" class="form-select">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Description</label>
                <textarea 
                  v-model="courseForm.description"
                  class="form-textarea"
                  rows="4"
                  placeholder="Enter course description..."
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Duration (weeks)</label>
                <input 
                  type="number" 
                  v-model="courseForm.duration"
                  class="form-input"
                  min="1"
                  max="52"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Course Image URL</label>
                <input 
                  type="url" 
                  v-model="courseForm.image"
                  class="form-input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <!-- Access Control Tab -->
          <div v-if="activeCourseTab === 'access'" class="form-section">
            <div class="access-settings">
              <div class="setting-group">
                <label class="setting-label">Access Type</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" value="open" v-model="courseForm.accessType" />
                    <div class="radio-content">
                      <div class="radio-title">Open Enrollment</div>
                      <div class="radio-description">Anyone can join without approval</div>
                    </div>
                  </label>
                  
                  <label class="radio-option">
                    <input type="radio" value="code" v-model="courseForm.accessType" />
                    <div class="radio-content">
                      <div class="radio-title">Enrollment Code</div>
                      <div class="radio-description">Students need a code to join</div>
                    </div>
                  </label>
                  
                  <label class="radio-option">
                    <input type="radio" value="invitation" v-model="courseForm.accessType" />
                    <div class="radio-content">
                      <div class="radio-title">Invitation Only</div>
                      <div class="radio-description">Students must be invited by instructor</div>
                    </div>
                  </label>
                  
                  <label class="radio-option">
                    <input type="radio" value="approval" v-model="courseForm.accessType" />
                    <div class="radio-content">
                      <div class="radio-title">Requires Approval</div>
                      <div class="radio-description">Students request to join, instructor approves</div>
                    </div>
                  </label>
                </div>
              </div>

              <div v-if="courseForm.accessType === 'code'" class="code-settings">
                <div class="form-group">
                  <label class="form-label">Enrollment Code</label>
                  <div class="code-input-group">
                    <input 
                      type="text" 
                      v-model="courseForm.enrollmentCode"
                      class="form-input"
                      placeholder="Enter custom code or leave blank to auto-generate"
                    />
                    <button class="btn btn-secondary" @click="generateEnrollmentCode">
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="courseForm.allowSelfUnenroll"
                    class="setting-checkbox"
                  />
                  Allow students to unenroll themselves
                </label>
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="courseForm.limitEnrollment"
                    class="setting-checkbox"
                  />
                  Limit enrollment
                </label>
                <div v-if="courseForm.limitEnrollment" class="sub-setting">
                  <label class="form-label">Maximum students</label>
                  <input 
                    type="number" 
                    v-model="courseForm.maxStudents"
                    class="form-input"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule Tab -->
          <div v-if="activeCourseTab === 'schedule'" class="form-section">
            <div class="schedule-settings">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input 
                  type="date" 
                  v-model="courseForm.startDate"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">End Date</label>
                <input 
                  type="date" 
                  v-model="courseForm.endDate"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Enrollment Deadline</label>
                <input 
                  type="date" 
                  v-model="courseForm.enrollmentDeadline"
                  class="form-input"
                />
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="courseForm.allowLateEnrollment"
                    class="setting-checkbox"
                  />
                  Allow enrollment after start date
                </label>
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="courseForm.selfPaced"
                    class="setting-checkbox"
                  />
                  Self-paced course (no fixed schedule)
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCourseModal">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="saveCourse"
            :disabled="!courseForm.title || !courseForm.code"
          >
            {{ editingCourse ? 'Update Course' : 'Create Course' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Enrollment Management Modal -->
    <div v-if="showEnrollmentModal" class="modal-overlay" @click="closeEnrollmentModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedCourseForEnrollment?.title }} - Manage Enrollments</h2>
          <button class="btn btn-ghost btn-sm" @click="closeEnrollmentModal">Close</button>
        </div>
        
        <div class="modal-content">
          <div class="enrollment-tabs">
            <button 
              v-for="tab in enrollmentTabs" 
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeEnrollmentTab === tab.id }"
              @click="activeEnrollmentTab = tab.id"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
              <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
            </button>
          </div>

          <!-- Current Students -->
          <div v-if="activeEnrollmentTab === 'students'" class="enrollment-section">
            <div class="section-header">
              <h3>Enrolled Students ({{ enrolledStudents.length }})</h3>
              <div class="section-actions">
                <button class="btn btn-secondary btn-sm" @click="inviteStudents">
                  Invite Students
                </button>
                <button class="btn btn-primary btn-sm" @click="addStudentsManually">
                  Add Manually
                </button>
              </div>
            </div>
            
            <div class="students-list">
              <div 
                v-for="student in enrolledStudents" 
                :key="student.id"
                class="student-item"
              >
                <div class="student-info">
                  <img :src="student.avatar" :alt="student.name" class="student-avatar" />
                  <div class="student-details">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-email">{{ student.email }}</div>
                    <div class="student-meta">
                      Enrolled: {{ formatDate(student.enrolledAt) }} • 
                      Progress: {{ student.progress }}%
                    </div>
                  </div>
                </div>
                <div class="student-actions">
                  <button class="btn btn-ghost btn-sm" @click="viewStudentProgress(student)">
                    Progress
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="removeStudent(student)" title="Remove from course">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Requests -->
          <div v-if="activeEnrollmentTab === 'pending'" class="enrollment-section">
            <div class="section-header">
              <h3>Pending Enrollment Requests ({{ pendingRequests.length }})</h3>
              <div class="section-actions">
                <button class="btn btn-secondary btn-sm" @click="approveAll">
                  Approve All
                </button>
                <button class="btn btn-secondary btn-sm" @click="rejectAll">
                  Reject All
                </button>
              </div>
            </div>
            
            <div class="requests-list">
              <div 
                v-for="request in pendingRequests" 
                :key="request.id"
                class="request-item"
              >
                <div class="request-info">
                  <img :src="request.avatar" :alt="request.name" class="request-avatar" />
                  <div class="request-details">
                    <div class="request-name">{{ request.name }}</div>
                    <div class="request-email">{{ request.email }}</div>
                    <div class="request-meta">
                      Requested: {{ formatDate(request.requestedAt) }}
                      <span v-if="request.message" class="request-message">
                        • "{{ request.message }}"
                      </span>
                    </div>
                  </div>
                </div>
                <div class="request-actions">
                  <button class="btn btn-success btn-sm" @click="approveRequest(request)">
                    Approve
                  </button>
                  <button class="btn btn-danger btn-sm" @click="rejectRequest(request)">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Enrollment Settings -->
          <div v-if="activeEnrollmentTab === 'settings'" class="enrollment-section">
            <div class="enrollment-settings">
              <div class="setting-group">
                <h3>Current Enrollment Code</h3>
                <div class="code-display">
                  <span class="enrollment-code-text">{{ selectedCourseForEnrollment?.enrollmentCode || 'No code set' }}</span>
                  <button class="btn btn-secondary btn-sm" @click="copyEnrollmentCode">
                    Copy
                  </button>
                  <button class="btn btn-secondary btn-sm" @click="regenerateCode">
                    Regenerate
                  </button>
                </div>
              </div>

              <div class="setting-group">
                <h3>Invitation Link</h3>
                <div class="link-display">
                  <input 
                    type="text" 
                    :value="generateInvitationLink()"
                    readonly
                    class="invitation-link-input"
                  />
                  <button class="btn btn-secondary btn-sm" @click="copyInvitationLink">
                    Copy Link
                  </button>
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="enrollmentSettings.requireApproval"
                    class="setting-checkbox"
                  />
                  Require instructor approval for new enrollments
                </label>
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="enrollmentSettings.sendWelcomeEmail"
                    class="setting-checkbox"
                  />
                  Send welcome email to new students
                </label>
              </div>

              <div class="setting-group">
                <label class="setting-label">
                  <input 
                    type="checkbox" 
                    v-model="enrollmentSettings.notifyInstructor"
                    class="setting-checkbox"
                  />
                  Notify instructor of new enrollments
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEnrollmentModal">Close</button>
          <button class="btn btn-primary" @click="saveEnrollmentSettings">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'AdminCoursesPage',
  setup() {
    const courses = ref([])
    const selectedCourses = ref([])
    const filters = ref({
      search: '',
      status: '',
      accessType: '',
      institution: '',
      category: '',
      level: ''
    })
    const sortField = ref('title')
    const sortDirection = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(20)
    const activeDropdown = ref(null)
    
    // Modal states
    const showCourseModal = ref(false)
    const showEnrollmentModal = ref(false)
    const editingCourse = ref(null)
    const selectedCourseForEnrollment = ref(null)
    const activeCourseTab = ref('basic')
    const activeEnrollmentTab = ref('students')
    
    // Course form
    const courseForm = ref({
      title: '',
      code: '',
      category: 'programming',
      level: 'beginner',
      description: '',
      duration: 12,
      image: '',
      accessType: 'code',
      enrollmentCode: '',
      allowSelfUnenroll: true,
      limitEnrollment: false,
      maxStudents: 50,
      startDate: '',
      endDate: '',
      enrollmentDeadline: '',
      allowLateEnrollment: false,
      selfPaced: false
    })
    
    // Course stats
    const courseStats = ref({
      total: 45,
      active: 42,
      totalStudents: 1847,
      averagePerCourse: 41,
      pendingRequests: 23,
      completionRate: 78.5
    })
    
    // Form tabs
    const courseTabs = ref([
      { id: 'basic', label: 'Basic Info' },
      { id: 'access', label: 'Access Control' },
      { id: 'schedule', label: 'Schedule' }
    ])
    
    const enrollmentTabs = ref([
      { id: 'students', label: 'Students', icon: '👥', count: 0 },
      { id: 'pending', label: 'Pending', icon: '⏳', count: 0 },
      { id: 'settings', label: 'Settings', icon: '⚙️', count: 0 }
    ])
    
    // Mock data
    const enrolledStudents = ref([
      {
        id: 1,
        name: 'Kwame Asante',
        email: 'kwame.asante@student.ug.edu.gh',
        avatar: 'https://picsum.photos/seed/student1/100/100.jpg',
        enrolledAt: new Date('2024-01-15'),
        progress: 85
      },
      {
        id: 2,
        name: 'Afia Mensah',
        email: 'afia.mensah@student.ug.edu.gh',
        avatar: 'https://picsum.photos/seed/student2/100/100.jpg',
        enrolledAt: new Date('2024-01-18'),
        progress: 72
      }
    ])
    
    const pendingRequests = ref([
      {
        id: 1,
        name: 'John Osei',
        email: 'john.osei@student.ug.edu.gh',
        avatar: 'https://picsum.photos/seed/pending1/100/100.jpg',
        requestedAt: new Date('2024-01-22'),
        message: 'I am very interested in learning web development'
      }
    ])
    
    const enrollmentSettings = ref({
      requireApproval: false,
      sendWelcomeEmail: true,
      notifyInstructor: true
    })
    
    // Initialize mock data
    const initializeData = () => {
      courses.value = [
        {
          id: 1,
          title: 'Web Development Fundamentals',
          code: 'WEB-DEV-101',
          category: 'web-dev',
          level: 'beginner',
          description: 'Learn HTML, CSS, JavaScript, and modern web technologies',
          image: 'https://picsum.photos/seed/webdev/300/200.jpg',
          instructor: {
            name: 'Dr. Kwame Asante',
            email: 'kwame.asante@ug.edu.gh'
          },
          accessType: 'code',
          enrollmentCode: 'WEB2024',
          enrolledStudents: 45,
          activeStudents: 42,
          completionRate: 78,
          pendingRequests: 3,
          status: 'active',
          lastActivity: new Date('2024-01-22'),
          startDate: '2024-01-15',
          endDate: '2024-04-15',
          duration: 12
        },
        {
          id: 2,
          title: 'Vue.js Complete Guide',
          code: 'VUE-ADV-201',
          category: 'web-dev',
          level: 'intermediate',
          description: 'Master Vue.js 3 with Composition API and modern tooling',
          image: 'https://picsum.photos/seed/vue/300/200.jpg',
          instructor: {
            name: 'Yaa Boahene',
            email: 'yaa.boahene@ashesi.edu.gh'
          },
          accessType: 'approval',
          enrollmentCode: '',
          enrolledStudents: 28,
          activeStudents: 26,
          completionRate: 82,
          pendingRequests: 5,
          status: 'active',
          lastActivity: new Date('2024-01-21'),
          startDate: '2024-01-20',
          endDate: '2024-04-20',
          duration: 12
        },
        {
          id: 3,
          title: 'Mobile App Development',
          code: 'MOB-DEV-301',
          category: 'mobile-dev',
          level: 'advanced',
          description: 'Build native mobile apps with React Native and Flutter',
          image: 'https://picsum.photos/seed/mobile/300/200.jpg',
          instructor: {
            name: 'Joseph Osei',
            email: 'joseph.osei@unilag.edu.ng'
          },
          accessType: 'invitation',
          enrollmentCode: '',
          enrolledStudents: 18,
          activeStudents: 17,
          completionRate: 65,
          pendingRequests: 0,
          status: 'active',
          lastActivity: new Date('2024-01-20'),
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          duration: 14
        }
      ]
      
      // Update enrollment tab counts
      enrollmentTabs.value[0].count = enrolledStudents.value.length
      enrollmentTabs.value[1].count = pendingRequests.value.length
    }
    
    // Computed properties
    const filteredCourses = computed(() => {
      let filtered = courses.value
      
      // Search filter
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(course =>
          course.title.toLowerCase().includes(search) ||
          course.code.toLowerCase().includes(search) ||
          course.instructor.name.toLowerCase().includes(search)
        )
      }
      
      // Status filter
      if (filters.value.status) {
        filtered = filtered.filter(course => course.status === filters.value.status)
      }
      
      // Access type filter
      if (filters.value.accessType) {
        filtered = filtered.filter(course => course.accessType === filters.value.accessType)
      }
      
      // Category filter
      if (filters.value.category) {
        filtered = filtered.filter(course => course.category === filters.value.category)
      }
      
      // Level filter
      if (filters.value.level) {
        filtered = filtered.filter(course => course.level === filters.value.level)
      }
      
      // Sort
      filtered.sort((a, b) => {
        let aValue = a[sortField.value]
        let bValue = b[sortField.value]
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (sortDirection.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
    })
    
    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredCourses.value.slice(start, end)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredCourses.value.length / itemsPerPage.value)
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      const end = Math.min(totalPages.value, start + maxVisible - 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    // Methods
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }
    
    const getSortIcon = (field) => {
      if (sortField.value !== field) return '↕'
      return sortDirection.value === 'asc' ? '↑' : '↓'
    }
    
    const resetFilters = () => {
      filters.value = {
        search: '',
        status: '',
        accessType: '',
        institution: '',
        category: '',
        level: ''
      }
      currentPage.value = 1
    }
    
    const selectAll = () => {
      if (selectedCourses.value.length === filteredCourses.value.length) {
        selectedCourses.value = []
      } else {
        selectedCourses.value = filteredCourses.value.map(course => course.id)
      }
    }
    
    const toggleSelection = (id) => {
      const index = selectedCourses.value.indexOf(id)
      if (index > -1) {
        selectedCourses.value.splice(index, 1)
      } else {
        selectedCourses.value.push(id)
      }
    }
    
    const toggleDropdown = (id) => {
      activeDropdown.value = activeDropdown.value === id ? null : id
    }
    
    // Utility functions
    const getAccessTypeIcon = (type) => {
      return ''
    }
    
    const formatAccessType = (type) => {
      const types = {
        open: 'Open',
        code: 'Code Required',
        invitation: 'Invitation Only',
        approval: 'Requires Approval'
      }
      return types[type] || type
    }
    
    const getStatusIcon = (status) => {
      return ''
    }
    
    const formatStatus = (status) => {
      const statuses = {
        active: 'Active',
        inactive: 'Inactive',
        draft: 'Draft',
        archived: 'Archived'
      }
      return statuses[status] || status
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const getTimeAgo = (date) => {
      const now = new Date()
      const diff = now - new Date(date)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return 'Today'
      if (days === 1) return 'Yesterday'
      if (days < 7) return `${days} days ago`
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`
      return `${Math.floor(days / 30)} months ago`
    }
    
    // Course Management
    const createNewCourse = () => {
      editingCourse.value = null
      courseForm.value = {
        title: '',
        code: '',
        category: 'programming',
        level: 'beginner',
        description: '',
        duration: 12,
        image: '',
        accessType: 'code',
        enrollmentCode: '',
        allowSelfUnenroll: true,
        limitEnrollment: false,
        maxStudents: 50,
        startDate: '',
        endDate: '',
        enrollmentDeadline: '',
        allowLateEnrollment: false,
        selfPaced: false
      }
      activeCourseTab.value = 'basic'
      showCourseModal.value = true
    }
    
    const editCourse = (course) => {
      editingCourse.value = course
      courseForm.value = { ...course }
      showCourseModal.value = true
    }
    
    const closeCourseModal = () => {
      showCourseModal.value = false
      editingCourse.value = null
    }
    
    const saveCourse = () => {
      if (editingCourse.value) {
        // Update existing course
        const index = courses.value.findIndex(c => c.id === editingCourse.value.id)
        if (index > -1) {
          courses.value[index] = { ...courseForm.value, id: editingCourse.value.id }
        }
        alert('Course updated successfully!')
      } else {
        // Create new course
        const newCourse = {
          ...courseForm.value,
          id: Date.now(),
          instructor: {
            name: 'Current User',
            email: 'current.user@institution.edu'
          },
          enrolledStudents: 0,
          activeStudents: 0,
          completionRate: 0,
          pendingRequests: 0,
          status: 'draft',
          lastActivity: new Date()
        }
        
        if (!newCourse.enrollmentCode && newCourse.accessType === 'code') {
          newCourse.enrollmentCode = generateRandomCode()
        }
        
        courses.value.push(newCourse)
        alert('Course created successfully!')
      }
      closeCourseModal()
    }
    
    const generateEnrollmentCode = () => {
      courseForm.value.enrollmentCode = generateRandomCode()
    }
    
    const generateRandomCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }
    
    // Enrollment Management
    const manageEnrollments = (course) => {
      selectedCourseForEnrollment.value = course
      activeEnrollmentTab.value = 'students'
      showEnrollmentModal.value = true
    }
    
    const closeEnrollmentModal = () => {
      showEnrollmentModal.value = false
      selectedCourseForEnrollment.value = null
    }
    
    const generateInvitationLink = () => {
      if (!selectedCourseForEnrollment.value) return ''
      return `${window.location.origin}/enroll/${selectedCourseForEnrollment.value.id}?code=${selectedCourseForEnrollment.value.enrollmentCode}`
    }
    
    const copyEnrollmentCode = () => {
      if (selectedCourseForEnrollment.value?.enrollmentCode) {
        navigator.clipboard.writeText(selectedCourseForEnrollment.value.enrollmentCode)
        alert('Enrollment code copied to clipboard!')
      }
    }
    
    const copyInvitationLink = () => {
      navigator.clipboard.writeText(generateInvitationLink())
      alert('Invitation link copied to clipboard!')
    }
    
    const regenerateCode = () => {
      if (selectedCourseForEnrollment.value) {
        selectedCourseForEnrollment.value.enrollmentCode = generateRandomCode()
        alert('New enrollment code generated!')
      }
    }
    
    const approveRequest = (request) => {
      // Move from pending to enrolled
      const student = {
        id: request.id,
        name: request.name,
        email: request.email,
        avatar: request.avatar,
        enrolledAt: new Date(),
        progress: 0
      }
      enrolledStudents.value.push(student)
      
      const index = pendingRequests.value.findIndex(r => r.id === request.id)
      if (index > -1) {
        pendingRequests.value.splice(index, 1)
      }
      
      // Update counts
      enrollmentTabs.value[0].count = enrolledStudents.value.length
      enrollmentTabs.value[1].count = pendingRequests.value.length
      
      alert(`${request.name} has been enrolled in the course!`)
    }
    
    const rejectRequest = (request) => {
      const index = pendingRequests.value.findIndex(r => r.id === request.id)
      if (index > -1) {
        pendingRequests.value.splice(index, 1)
      }
      
      enrollmentTabs.value[1].count = pendingRequests.value.length
      alert(`${request.name}'s enrollment request has been rejected.`)
    }
    
    const approveAll = () => {
      if (confirm(`Approve all ${pendingRequests.value.length} enrollment requests?`)) {
        pendingRequests.value.forEach(request => {
          const student = {
            id: request.id,
            name: request.name,
            email: request.email,
            avatar: request.avatar,
            enrolledAt: new Date(),
            progress: 0
          }
          enrolledStudents.value.push(student)
        })
        
        pendingRequests.value = []
        enrollmentTabs.value[0].count = enrolledStudents.value.length
        enrollmentTabs.value[1].count = 0
        
        alert('All enrollment requests have been approved!')
      }
    }
    
    const rejectAll = () => {
      if (confirm(`Reject all ${pendingRequests.value.length} enrollment requests?`)) {
        pendingRequests.value = []
        enrollmentTabs.value[1].count = 0
        alert('All enrollment requests have been rejected.')
      }
    }
    
    const removeStudent = (student) => {
      if (confirm(`Remove ${student.name} from the course?`)) {
        const index = enrolledStudents.value.findIndex(s => s.id === student.id)
        if (index > -1) {
          enrolledStudents.value.splice(index, 1)
        }
        enrollmentTabs.value[0].count = enrolledStudents.value.length
        alert(`${student.name} has been removed from the course.`)
      }
    }
    
    const saveEnrollmentSettings = () => {
      console.log('Saving enrollment settings:', enrollmentSettings.value)
      alert('Enrollment settings saved successfully!')
    }
    
    // Other actions
    const viewCourse = (course) => {
      console.log('View course:', course.title)
      alert(`Viewing course: ${course.title}`)
    }
    
    const duplicateCourse = (course) => {
      const duplicate = {
        ...course,
        id: Date.now(),
        title: `${course.title} (Copy)`,
        code: `${course.code}-COPY`,
        enrollmentCode: generateRandomCode(),
        enrolledStudents: 0,
        activeStudents: 0,
        status: 'draft',
        lastActivity: new Date()
      }
      courses.value.push(duplicate)
      alert('Course duplicated successfully!')
      activeDropdown.value = null
    }
    
    const toggleCourseStatus = (course) => {
      const newStatus = course.status === 'active' ? 'inactive' : 'active'
      course.status = newStatus
      course.lastActivity = new Date()
      alert(`Course ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
      activeDropdown.value = null
    }
    
    const deleteCourse = (course) => {
      if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
        const index = courses.value.findIndex(c => c.id === course.id)
        if (index > -1) {
          courses.value.splice(index, 1)
          alert('Course deleted successfully!')
        }
      }
      activeDropdown.value = null
    }
    
    const exportCourses = () => {
      console.log('Exporting courses data...')
      alert('Courses data exported successfully!')
    }
    
    const bulkActions = () => {
      console.log('Bulk actions for courses:', selectedCourses.value)
      alert(`Bulk actions applied to ${selectedCourses.value.length} courses`)
    }
    
    // Placeholder functions
    const viewEnrollmentRequests = (course) => {
      manageEnrollments(course)
      activeEnrollmentTab.value = 'pending'
    }
    
    const generateInviteLink = (course) => {
      const link = `${window.location.origin}/enroll/${course.id}?code=${course.enrollmentCode}`
      navigator.clipboard.writeText(link)
      alert('Invite link copied to clipboard!')
      activeDropdown.value = null
    }
    
    const resetEnrollmentCode = (course) => {
      course.enrollmentCode = generateRandomCode()
      alert('Enrollment code reset successfully!')
      activeDropdown.value = null
    }
    
    const archiveCourse = (course) => {
      course.status = 'archived'
      course.lastActivity = new Date()
      alert('Course archived successfully!')
      activeDropdown.value = null
    }
    
    const exportCourseData = (course) => {
      console.log('Exporting data for:', course.title)
      alert(`Data for ${course.title} exported successfully!`)
      activeDropdown.value = null
    }
    
    const inviteStudents = () => {
      alert('Email invitation feature would be implemented here.')
    }
    
    const addStudentsManually = () => {
      alert('Manual student addition feature would be implemented here.')
    }
    
    const viewStudentProgress = (student) => {
      alert(`Viewing progress for ${student.name}`)
    }
    
    onMounted(() => {
      initializeData()
    })
    
    return {
      courses,
      selectedCourses,
      filters,
      sortField,
      sortDirection,
      currentPage,
      itemsPerPage,
      activeDropdown,
      showCourseModal,
      showEnrollmentModal,
      editingCourse,
      selectedCourseForEnrollment,
      activeCourseTab,
      activeEnrollmentTab,
      courseForm,
      courseStats,
      courseTabs,
      enrollmentTabs,
      enrolledStudents,
      pendingRequests,
      enrollmentSettings,
      filteredCourses,
      paginatedCourses,
      totalPages,
      visiblePages,
      sortBy,
      getSortIcon,
      resetFilters,
      selectAll,
      toggleSelection,
      toggleDropdown,
      getAccessTypeIcon,
      formatAccessType,
      getStatusIcon,
      formatStatus,
      formatDate,
      getTimeAgo,
      createNewCourse,
      editCourse,
      closeCourseModal,
      saveCourse,
      generateEnrollmentCode,
      manageEnrollments,
      closeEnrollmentModal,
      generateInvitationLink,
      copyEnrollmentCode,
      copyInvitationLink,
      regenerateCode,
      approveRequest,
      rejectRequest,
      approveAll,
      rejectAll,
      removeStudent,
      saveEnrollmentSettings,
      viewCourse,
      duplicateCourse,
      toggleCourseStatus,
      deleteCourse,
      exportCourses,
      bulkActions,
      viewEnrollmentRequests,
      generateInviteLink,
      resetEnrollmentCode,
      archiveCourse,
      exportCourseData,
      inviteStudents,
      addStudentsManually,
      viewStudentProgress
    }
  }
}
</script>

<style scoped>
.admin-courses {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
}

.stat-icon {
  font-size: 2.5rem;
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.primary {
  background: var(--interactive-primary);
  color: white;
}

.stat-icon.success {
  background: var(--status-success);
  color: white;
}

.stat-icon.warning {
  background: var(--status-warning);
  color: white;
}

.stat-icon.info {
  background: var(--interactive-secondary);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-breakdown {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.filters-section {
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.search-input-container {
  position: relative;
}

.search-input, .filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input {
  padding-left: 2.5rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.courses-table {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.showing-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.table-actions {
  display: flex;
  gap: 1rem;
}

.table-container {
  overflow-x: auto;
}

.courses-grid {
  width: 100%;
  border-collapse: collapse;
}

.courses-grid th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--glass-border);
  background: var(--bg-tertiary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.courses-grid td {
  padding: 1rem;
  border-bottom: 1px solid var(--glass-border);
  vertical-align: middle;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.sortable:hover {
  background: var(--bg-secondary);
}

.sort-icon {
  margin-left: 0.5rem;
  opacity: 0.6;
}

.course-row {
  transition: background-color 0.3s ease;
}

.course-row:hover {
  background: var(--bg-tertiary);
}

.course-row.selected {
  background: rgba(59, 130, 246, 0.1);
}

.course-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.course-image img {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.course-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.course-code {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: monospace;
  margin-bottom: 0.25rem;
}

.course-category {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.instructor-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.instructor-email {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.enrollment-type {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.enrollment-type.open {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.enrollment-type.code {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.enrollment-type.invitation {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.enrollment-type.approval {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.enrollment-code {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: monospace;
  margin-bottom: 0.25rem;
}

.pending-requests {
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: 600;
}

.student-count {
  text-align: center;
}

.count-number {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.count-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.7rem;
}

.active-students {
  color: #10b981;
}

.completion-rate {
  color: var(--text-secondary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-badge.draft {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge.archived {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.activity-date {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-ago {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
}

.dropdown-menu button:hover {
  background: var(--bg-tertiary);
}

.dropdown-menu button.danger {
  color: #ef4444;
}

.dropdown-menu button.warning {
  color: #f59e0b;
}

.dropdown-menu button.success {
  color: #10b981;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.pagination-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--brand-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.form-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--glass-border);
}

.form-tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.form-tab.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}

.form-section {
  min-height: 300px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input, .form-select, .form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.access-settings {
  max-height: 400px;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover {
  background: var(--bg-tertiary);
}

.radio-option input {
  margin-top: 0.125rem;
  accent-color: var(--brand-primary);
}

.radio-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.radio-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.code-settings {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.code-input-group {
  display: flex;
  gap: 0.5rem;
}

.setting-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--brand-primary);
}

.sub-setting {
  margin-left: 2rem;
  margin-top: 0.5rem;
}

.schedule-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.enrollment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.25rem;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
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

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.enrollment-section {
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.students-list, .requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.student-item, .request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.student-item:hover, .request-item:hover {
  background: var(--bg-tertiary);
}

.student-info, .request-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.student-avatar, .request-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.student-name, .request-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.student-email, .request-email {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.student-meta, .request-meta {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.request-message {
  font-style: italic;
  color: var(--text-secondary);
}

.student-actions, .request-actions {
  display: flex;
  gap: 0.5rem;
}

.enrollment-settings {
  padding: 1rem 0;
}

.enrollment-settings .setting-group {
  margin-bottom: 2rem;
}

.enrollment-settings h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.code-display, .link-display {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.enrollment-code-text {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--brand-primary);
  background: var(--bg-tertiary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  flex: 1;
}

.invitation-link-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: monospace;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-secondary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.btn-ghost {
  background: none;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-ghost.active {
  background: var(--brand-primary);
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .table-container {
    overflow-x: scroll;
  }
  
  .courses-grid {
    min-width: 1200px;
  }
}

@media (max-width: 768px) {
  .admin-courses {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .enrollment-tabs {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .section-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .code-display, .link-display {
    flex-direction: column;
    align-items: stretch;
  }
  
  .student-item, .request-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .student-actions, .request-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>