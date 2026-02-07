<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>Manage Companies</h1>
      <p class="subtitle">Review and manage company accounts</p>
    </div>

    <div class="filters-bar">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search companies..."
        class="search-input"
      />
      <select v-model="statusFilter" class="filter-select">
        <option value="">All Status</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending Review</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div class="companies-grid">
      <div v-for="company in filteredCompanies" :key="company.id" class="company-card">
        <div class="company-header">
          <div class="company-logo">
            <img v-if="company.logo" :src="company.logo" :alt="company.name" />
            <span v-else class="logo-placeholder">{{ company.initials }}</span>
          </div>
          <div class="company-info">
            <h3>{{ company.name }}</h3>
            <span class="industry">{{ company.industry }}</span>
          </div>
          <span class="status-badge" :class="company.status">{{ company.status }}</span>
        </div>

        <div class="company-details">
          <p>{{ company.description }}</p>
          <div class="detail-row">
            <span class="label">Location:</span>
            <span>{{ company.location }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Size:</span>
            <span>{{ company.size }} employees</span>
          </div>
          <div class="detail-row">
            <span class="label">Jobs Posted:</span>
            <span>{{ company.jobs_count }}</span>
          </div>
        </div>

        <div class="company-actions">
          <button v-if="company.status === 'pending'" @click="approveCompany(company.id)" class="btn btn-success">
            Approve
          </button>
          <button v-if="company.status === 'pending'" @click="rejectCompany(company.id)" class="btn btn-danger">
            Reject
          </button>
          <button class="btn btn-secondary">View Details</button>
        </div>
      </div>
    </div>

    <p v-if="filteredCompanies.length === 0" class="empty-state">
      No companies found matching your criteria.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI } from '../../utils/api.js'
import { COLORS } from '../../constants/colors.js'

const searchQuery = ref('')
const statusFilter = ref('')
const companies = ref([])

onMounted(async () => {
  try {
    const response = await adminAPI.getCompanies()
    if (response.data?.success) {
      companies.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to load companies:', error)
    // Mock data
    companies.value = [
      {
        id: 1,
        name: 'TechCorp Ghana',
        initials: 'TG',
        industry: 'Technology',
        description: 'Leading software development company in West Africa.',
        location: 'Accra, Ghana',
        size: '51-200',
        jobs_count: 5,
        status: 'approved'
      },
      {
        id: 2,
        name: 'FinServe Ltd',
        initials: 'FL',
        industry: 'Finance',
        description: 'Digital financial services provider.',
        location: 'Kumasi, Ghana',
        size: '11-50',
        jobs_count: 2,
        status: 'pending'
      },
    ]
  }
})

const filteredCompanies = computed(() => {
  return companies.value.filter(company => {
    const matchesSearch = !searchQuery.value ||
      company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || company.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

async function approveCompany(id) {
  try {
    await adminAPI.approveCompany(id)
    const company = companies.value.find(c => c.id === id)
    if (company) company.status = 'approved'
  } catch (error) {
    console.error('Failed to approve company:', error)
  }
}

async function rejectCompany(id) {
  try {
    await adminAPI.rejectCompany(id)
    const company = companies.value.find(c => c.id === id)
    if (company) company.status = 'rejected'
  } catch (error) {
    console.error('Failed to reject company:', error)
  }
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

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid v-bind('COLORS.border');
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.company-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.company-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.company-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: v-bind('COLORS.background');
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  font-size: 1.25rem;
  font-weight: 700;
  color: v-bind('COLORS.primary');
}

.company-info {
  flex: 1;
}

.company-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.text');
  margin: 0 0 0.25rem 0;
}

.industry {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
}

.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.approved {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.status-badge.pending {
  background: v-bind('COLORS.warning + "15"');
  color: v-bind('COLORS.warning');
}

.status-badge.rejected {
  background: v-bind('COLORS.error + "15"');
  color: v-bind('COLORS.error');
}

.company-details {
  margin-bottom: 1rem;
}

.company-details p {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 0.375rem 0;
  border-bottom: 1px solid v-bind('COLORS.border');
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: v-bind('COLORS.textLight');
}

.company-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid v-bind('COLORS.border');
}

.btn {
  flex: 1;
  padding: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-success {
  background: v-bind('COLORS.success');
  color: white;
}

.btn-success:hover {
  opacity: 0.9;
}

.btn-danger {
  background: v-bind('COLORS.error');
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: v-bind('COLORS.background');
  color: v-bind('COLORS.text');
}

.btn-secondary:hover {
  background: v-bind('COLORS.border');
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: v-bind('COLORS.textLight');
}
</style>
