<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>Manage Users</h1>
      <p class="subtitle">View and manage all student accounts</p>
    </div>

    <div class="filters-bar">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search users by name or email..."
        class="search-input"
      />
      <select v-model="statusFilter" class="filter-select">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ user.initials }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </td>
            <td>
              <span class="status-badge" :class="user.status">{{ user.status }}</span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn view" title="View Details">👁️</button>
                <button class="action-btn edit" title="Edit">✏️</button>
                <button class="action-btn delete" title="Suspend">🚫</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="filteredUsers.length === 0" class="empty-state">
      No users found matching your criteria.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI } from '../../utils/api.js'
import { COLORS } from '../../constants/colors.js'

const searchQuery = ref('')
const statusFilter = ref('')
const users = ref([])

onMounted(async () => {
  try {
    const response = await adminAPI.getUsers()
    if (response.data?.success) {
      users.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to load users:', error)
    // Mock data
    users.value = [
      { id: 1, name: 'John Doe', initials: 'JD', email: 'john@example.com', role: 'student', status: 'active', created_at: '2024-01-15' },
      { id: 2, name: 'Jane Smith', initials: 'JS', email: 'jane@example.com', role: 'student', status: 'active', created_at: '2024-02-20' },
      { id: 3, name: 'Bob Wilson', initials: 'BW', email: 'bob@example.com', role: 'student', status: 'pending', created_at: '2024-03-10' },
    ]
  }
})

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = !searchQuery.value ||
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || user.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: v-bind('COLORS.textLight');
  margin: 0;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid v-bind('COLORS.border');
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: v-bind('COLORS.primary');
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid v-bind('COLORS.border');
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid v-bind('COLORS.border');
}

.users-table th {
  background: v-bind('COLORS.background');
  font-weight: 600;
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: v-bind('COLORS.primary');
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge,
.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.student {
  background: v-bind('COLORS.primary + "15"');
  color: v-bind('COLORS.primary');
}

.role-badge.company {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.role-badge.admin {
  background: v-bind('COLORS.warning + "15"');
  color: v-bind('COLORS.warning');
}

.status-badge.active {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.status-badge.pending {
  background: v-bind('COLORS.warning + "15"');
  color: v-bind('COLORS.warning');
}

.status-badge.suspended {
  background: v-bind('COLORS.error + "15"');
  color: v-bind('COLORS.error');
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: v-bind('COLORS.background');
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: v-bind('COLORS.textLight');
}
</style>
