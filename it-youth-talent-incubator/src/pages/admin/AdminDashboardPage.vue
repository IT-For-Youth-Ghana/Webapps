<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">Overview of the IT Youth Talent Incubator platform</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon students">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.totalStudents }}</span>
          <span class="stat-label">Total Students</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon companies">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.totalCompanies }}</span>
          <span class="stat-label">Companies</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon jobs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.activeJobs }}</span>
          <span class="stat-label">Active Jobs</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon applications">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.pendingApplications }}</span>
          <span class="stat-label">Pending Applications</span>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="content-card">
        <div class="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div class="quick-actions">
          <router-link to="/admin/users" class="action-btn">
            <span class="action-icon">👥</span>
            <span>Manage Users</span>
          </router-link>
          <router-link to="/admin/companies" class="action-btn">
            <span class="action-icon">🏢</span>
            <span>Review Companies</span>
          </router-link>
          <router-link to="/admin/jobs" class="action-btn">
            <span class="action-icon">💼</span>
            <span>Manage Jobs</span>
          </router-link>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <h3>Pending Approvals</h3>
          <span class="badge">{{ stats.pendingCompanies }}</span>
        </div>
        <p class="placeholder-text">
          Companies awaiting approval will appear here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '../../utils/api.js'
import { COLORS } from '../../constants/colors.js'

const stats = ref({
  totalStudents: 0,
  totalCompanies: 0,
  activeJobs: 0,
  pendingApplications: 0,
  pendingCompanies: 0
})

onMounted(async () => {
  try {
    const response = await adminAPI.getDashboardStats()
    if (response.data?.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to load admin stats:', error)
    // Use mock data for now
    stats.value = {
      totalStudents: 156,
      totalCompanies: 23,
      activeJobs: 47,
      pendingApplications: 89,
      pendingCompanies: 3
    }
  }
})
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-icon.students {
  background: v-bind('COLORS.primary + "15"');
  color: v-bind('COLORS.primary');
}

.stat-icon.companies {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.stat-icon.jobs {
  background: v-bind('COLORS.info + "15"');
  color: v-bind('COLORS.info');
}

.stat-icon.applications {
  background: v-bind('COLORS.warning + "15"');
  color: v-bind('COLORS.warning');
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
}

.stat-label {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.text');
  margin: 0;
}

.badge {
  background: v-bind('COLORS.warning');
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: v-bind('COLORS.background');
  border-radius: 8px;
  text-decoration: none;
  color: v-bind('COLORS.text');
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: v-bind('COLORS.primary + "10"');
  color: v-bind('COLORS.primary');
}

.action-icon {
  font-size: 1.25rem;
}

.placeholder-text {
  color: v-bind('COLORS.textLight');
  font-size: 0.875rem;
  text-align: center;
  padding: 2rem 0;
}
</style>
