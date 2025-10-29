<template>
  <div class="admin-users">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage teachers, students, and admin accounts</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportUsers">
          Export Users
        </button>
        <button class="btn btn-secondary" @click="showBulkImport = true">
          Bulk Import
        </button>
        <button class="btn btn-primary" @click="showCreateUser = true">
          Add User
        </button>
      </div>
    </div>

    <!-- User Statistics -->
    <div class="user-stats">
      <div class="stat-card">
        <div class="stat-icon teachers"></div>
        <div class="stat-content">
          <div class="stat-value">{{ teacherCount }}</div>
          <div class="stat-label">Teachers</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon students"></div>
        <div class="stat-content">
          <div class="stat-value">{{ studentCount }}</div>
          <div class="stat-label">Students</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon admins"></div>
        <div class="stat-content">
          <div class="stat-value">{{ adminCount }}</div>
          <div class="stat-label">Admins</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending"></div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Search users by name, email, or ID..."
          class="search-input"
        />
      </div>
      
      <div class="filters">
        <select v-model="roleFilter" class="filter-select">
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
        
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        
        <select v-model="institutionFilter" class="filter-select">
          <option value="">All Institutions</option>
          <option v-for="institution in institutions" :key="institution.id" :value="institution.id">
            {{ institution.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="users-table">
      <div class="table-header">
        <h3>{{ filteredUsers.length }} Users</h3>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" @click="selectAll">
            {{ selectedUsers.length > 0 ? 'Deselect All' : 'Select All' }}
          </button>
          <button 
            v-if="selectedUsers.length > 0" 
            class="btn btn-sm btn-warning" 
            @click="bulkAction('suspend')"
          >
            Suspend Selected ({{ selectedUsers.length }})
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="users-table-content">
          <thead>
            <tr>
              <th><input type="checkbox" @change="toggleSelectAll" /></th>
              <th>User</th>
              <th>Role</th>
              <th>Institution</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
              <td>
                <input 
                  type="checkbox" 
                  :value="user.id" 
                  v-model="selectedUsers"
                />
              </td>
              <td class="user-info">
                <div class="user-avatar">
                  <img :src="user.avatar" :alt="user.name" />
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="user.role">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="institution-cell">
                {{ getInstitutionName(user.institutionId) }}
              </td>
              <td>
                <span class="status-badge" :class="user.status">
                  {{ formatStatus(user.status) }}
                </span>
              </td>
              <td class="last-login">
                {{ formatLastLogin(user.lastLogin) }}
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button class="action-btn" @click="viewUser(user)" title="View Details">
                    View
                  </button>
                  <button class="action-btn" @click="editUser(user)" title="Edit User">
                    Edit
                  </button>
                  <button class="action-btn" @click="resetPassword(user)" title="Reset Password">
                    Reset
                  </button>
                  <button 
                    class="action-btn"
                    :class="user.status === 'active' ? 'warning' : 'success'"
                    @click="toggleUserStatus(user)" 
                    :title="user.status === 'active' ? 'Suspend User' : 'Activate User'"
                  >
                    {{ user.status === 'active' ? 'Suspend' : 'Activate' }}
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
          class="pagination-btn" 
          @click="currentPage--" 
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ filteredUsers.length }} users)
        </span>
        <button 
          class="pagination-btn" 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateUser" class="modal-overlay" @click="closeCreateUser">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingUser ? 'Edit User' : 'Create New User' }}</h2>
          <button class="btn btn-ghost btn-sm" @click="closeCreateUser">Close</button>
        </div>
        
        <div class="modal-content">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" v-model="userForm.name" class="form-input" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" v-model="userForm.email" class="form-input" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Role</label>
              <select v-model="userForm.role" class="form-select">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Institution</label>
              <select v-model="userForm.institutionId" class="form-select">
                <option value="">Select Institution</option>
                <option v-for="institution in institutions" :key="institution.id" :value="institution.id">
                  {{ institution.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" v-model="userForm.phone" class="form-input" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Registration Method</label>
            <div class="registration-options">
              <label class="radio-label">
                <input type="radio" value="email" v-model="userForm.registrationMethod" />
                Email Invitation
              </label>
              <label class="radio-label">
                <input type="radio" value="code" v-model="userForm.registrationMethod" />
                Registration Code
              </label>
              <label class="radio-label">
                <input type="radio" value="manual" v-model="userForm.registrationMethod" />
                Manual Creation
              </label>
            </div>
          </div>
          
          <div v-if="userForm.registrationMethod === 'code'" class="form-group">
            <label class="form-label">Registration Code</label>
            <div class="code-input">
              <input type="text" v-model="generatedCode" class="form-input" readonly />
              <button class="btn btn-secondary btn-sm" @click="generateCode">Generate New</button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCreateUser">Cancel</button>
          <button class="btn btn-primary" @click="saveUser">
            {{ editingUser ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Import Modal -->
    <div v-if="showBulkImport" class="modal-overlay" @click="showBulkImport = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Bulk Import Users</h2>
          <button class="btn btn-ghost btn-sm" @click="showBulkImport = false">Close</button>
        </div>
        
        <div class="modal-content">
          <div class="import-instructions">
            <h3>Import Instructions</h3>
            <ul>
              <li>Upload a CSV file with columns: name, email, role, institution</li>
              <li>First row should contain headers</li>
              <li>Maximum 1000 users per import</li>
              <li>Duplicate emails will be skipped</li>
            </ul>
          </div>
          
          <div class="file-upload">
            <input type="file" ref="csvFile" accept=".csv" @change="handleCSVUpload" />
            <button class="btn btn-secondary" @click="$refs.csvFile.click()">
              Choose CSV File
            </button>
          </div>
          
          <div v-if="importPreview.length > 0" class="import-preview">
            <h4>Preview ({{ importPreview.length }} users)</h4>
            <div class="preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Institution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in importPreview.slice(0, 5)" :key="index">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.institution }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="importPreview.length > 5" class="preview-more">
                ...and {{ importPreview.length - 5 }} more users
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showBulkImport = false">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="processBulkImport"
            :disabled="importPreview.length === 0"
          >
            Import {{ importPreview.length }} Users
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const institutionFilter = ref('')
const selectedUsers = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showCreateUser = ref(false)
const showBulkImport = ref(false)
const editingUser = ref(null)
const generatedCode = ref('')
const importPreview = ref([])

const userForm = ref({
  name: '',
  email: '',
  role: 'student',
  institutionId: '',
  phone: '',
  registrationMethod: 'email'
})

// Mock data
const users = ref([
  {
    id: 'USR001',
    name: 'Kwame Asante',
    email: 'kwame.asante@email.com',
    role: 'student',
    institutionId: 1,
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    avatar: 'https://picsum.photos/seed/user1/100/100.jpg'
  },
  {
    id: 'USR002',
    name: 'Dr. Yaa Boahene',
    email: 'yaa.boahene@university.edu',
    role: 'teacher',
    institutionId: 1,
    status: 'active',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    avatar: 'https://picsum.photos/seed/user2/100/100.jpg'
  },
  {
    id: 'USR003',
    name: 'Joseph Osei',
    email: 'joseph.osei@admin.com',
    role: 'admin',
    institutionId: 2,
    status: 'active',
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
    avatar: 'https://picsum.photos/seed/user3/100/100.jpg'
  },
  {
    id: 'USR004',
    name: 'Ama Serwaa',
    email: 'ama.serwaa@student.com',
    role: 'student',
    institutionId: 1,
    status: 'pending',
    lastLogin: null,
    avatar: 'https://picsum.photos/seed/user4/100/100.jpg'
  }
])

const institutions = ref([
  { id: 1, name: 'University of Ghana' },
  { id: 2, name: 'Kwame Nkrumah University' },
  { id: 3, name: 'University of Cape Coast' }
])

// Computed properties
const teacherCount = computed(() => users.value.filter(u => u.role === 'teacher').length)
const studentCount = computed(() => users.value.filter(u => u.role === 'student').length)
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const pendingCount = computed(() => users.value.filter(u => u.status === 'pending').length)

const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    )
  }
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }
  
  if (institutionFilter.value) {
    filtered = filtered.filter(user => user.institutionId === parseInt(institutionFilter.value))
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

// Methods
const formatRole = (role) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getInstitutionName = (institutionId) => {
  const institution = institutions.value.find(i => i.id === institutionId)
  return institution ? institution.name : 'N/A'
}

const formatLastLogin = (lastLogin) => {
  if (!lastLogin) return 'Never'
  
  const now = new Date()
  const diff = now - lastLogin
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

const selectAll = () => {
  if (selectedUsers.value.length > 0) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = filteredUsers.value.map(u => u.id)
  }
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedUsers.value = paginatedUsers.value.map(u => u.id)
  } else {
    selectedUsers.value = []
  }
}

const bulkAction = (action) => {
  console.log(`Performing ${action} on users:`, selectedUsers.value)
  selectedUsers.value = []
  alert(`Bulk ${action} completed successfully!`)
}

const viewUser = (user) => {
  console.log('Viewing user:', user)
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = { ...user }
  showCreateUser.value = true
}

const resetPassword = (user) => {
  console.log('Resetting password for:', user.email)
  alert(`Password reset email sent to ${user.email}`)
}

const toggleUserStatus = (user) => {
  const newStatus = user.status === 'active' ? 'suspended' : 'active'
  user.status = newStatus
  alert(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`)
}

const generateCode = () => {
  generatedCode.value = Math.random().toString(36).substring(2, 10).toUpperCase()
}

const closeCreateUser = () => {
  showCreateUser.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    role: 'student',
    institutionId: '',
    phone: '',
    registrationMethod: 'email'
  }
}

const saveUser = () => {
  if (editingUser.value) {
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    users.value[index] = { ...users.value[index], ...userForm.value }
    alert('User updated successfully!')
  } else {
    const newUser = {
      id: 'USR' + String(Date.now()).slice(-3),
      ...userForm.value,
      status: 'active',
      lastLogin: null,
      avatar: `https://picsum.photos/seed/user${Date.now()}/100/100.jpg`
    }
    users.value.push(newUser)
    alert('User created successfully!')
  }
  closeCreateUser()
}

const exportUsers = () => {
  console.log('Exporting users...')
  alert('User data exported successfully!')
}

const handleCSVUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target.result
      const lines = csv.split('\n')
      const headers = lines[0].split(',')
      
      const preview = []
      for (let i = 1; i < Math.min(lines.length, 101); i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',')
          preview.push({
            name: values[0],
            email: values[1],
            role: values[2],
            institution: values[3]
          })
        }
      }
      importPreview.value = preview
    }
    reader.readAsText(file)
  }
}

const processBulkImport = () => {
  console.log('Processing bulk import:', importPreview.value)
  alert(`Successfully imported ${importPreview.value.length} users!`)
  showBulkImport.value = false
  importPreview.value = []
}
</script>

<style scoped>
.admin-users {
  max-width: 1400px;
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
  font-weight: 700;
  color: var(--text-primary);
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

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--interactive-primary);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.filters-section {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
  flex-wrap: wrap;
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.users-table {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 1rem;
}

.table-container {
  overflow-x: auto;
}

.users-table-content {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

.users-table-content th,
.users-table-content td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-secondary);
}

.users-table-content th {
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.user-row:hover {
  background: var(--bg-tertiary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  min-width: 200px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.user-id {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.role-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.role-badge.student {
  background: var(--interactive-secondary);
  color: var(--interactive-primary);
}

.role-badge.teacher {
  background: var(--status-success);
  color: var(--text-primary);
}

.role-badge.admin {
  background: var(--status-error);
  color: white;
}

.status-badge.active {
  background: var(--status-success);
  color: white;
}

.status-badge.inactive {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.status-badge.pending {
  background: var(--status-warning);
  color: var(--text-primary);
}

.status-badge.suspended {
  background: var(--status-error);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.25rem;
  background: var(--interactive-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: var(--interactive-primary);
  color: white;
}

.action-btn.warning:hover {
  background: var(--status-warning);
}

.action-btn.success:hover {
  background: var(--status-success);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--interactive-primary);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.registration-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.code-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.import-instructions {
  margin-bottom: 1.5rem;
}

.import-instructions h3 {
  margin: 0 0 1rem 0;
}

.import-instructions ul {
  margin: 0;
  padding-left: 1.5rem;
}

.import-instructions li {
  margin-bottom: 0.5rem;
}

.file-upload {
  margin-bottom: 1.5rem;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.preview-table th,
.preview-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-secondary);
}

.preview-table th {
  background: var(--bg-tertiary);
  font-weight: 600;
}

.preview-more {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--interactive-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--interactive-primary-hover);
}

.btn-secondary {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--interactive-tertiary-hover);
}

.btn-warning {
  background: var(--status-warning);
  color: white;
}

.btn-warning:hover {
  background: var(--status-warning);
}

.btn-ghost {
  background: none;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--interactive-tertiary);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-users {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .user-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    min-width: auto;
  }
  
  .filters {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-actions {
    justify-content: stretch;
  }
  
  .table-actions .btn {
    flex: 1;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .user-stats {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>