<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>Manage Jobs</h1>
      <p class="subtitle">Review and moderate job listings</p>
    </div>

    <div class="filters-bar">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search jobs..."
        class="search-input"
      />
      <select v-model="statusFilter" class="filter-select">
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="closed">Closed</option>
        <option value="flagged">Flagged</option>
      </select>
    </div>

    <div class="jobs-table-container">
      <table class="jobs-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            <th>Type</th>
            <th>Applications</th>
            <th>Status</th>
            <th>Posted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in filteredJobs" :key="job.id">
            <td>
              <div class="job-title-cell">
                <strong>{{ job.title }}</strong>
                <span class="location">{{ job.location }}</span>
              </div>
            </td>
            <td>{{ job.company_name }}</td>
            <td>
              <span class="type-badge">{{ job.type }}</span>
            </td>
            <td>{{ job.applications_count }}</td>
            <td>
              <span class="status-badge" :class="job.status">{{ job.status }}</span>
            </td>
            <td>{{ formatDate(job.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn view" title="View">👁️</button>
                <button class="action-btn edit" title="Edit">✏️</button>
                <button v-if="job.status === 'published'" class="action-btn flag" title="Flag">🚩</button>
                <button class="action-btn delete" title="Remove">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="filteredJobs.length === 0" class="empty-state">
      No jobs found matching your criteria.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminAPI } from '../../utils/api.js'
import { COLORS } from '../../constants/colors.js'

const searchQuery = ref('')
const statusFilter = ref('')
const jobs = ref([])

onMounted(async () => {
  try {
    const response = await adminAPI.getJobs()
    if (response.data?.success) {
      jobs.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to load jobs:', error)
    // Mock data
    jobs.value = [
      {
        id: 1,
        title: 'Frontend Developer Intern',
        company_name: 'TechCorp Ghana',
        location: 'Accra, Ghana',
        type: 'Internship',
        applications_count: 24,
        status: 'published',
        created_at: '2024-03-15'
      },
      {
        id: 2,
        title: 'Backend Developer',
        company_name: 'FinServe Ltd',
        location: 'Remote',
        type: 'Full-time',
        applications_count: 18,
        status: 'published',
        created_at: '2024-03-20'
      },
      {
        id: 3,
        title: 'UI/UX Designer',
        company_name: 'CreativeHub',
        location: 'Kumasi, Ghana',
        type: 'Part-time',
        applications_count: 7,
        status: 'draft',
        created_at: '2024-03-22'
      },
    ]
  }
})

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = !searchQuery.value ||
      job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || job.status === statusFilter.value
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

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid v-bind('COLORS.border');
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
}

.jobs-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.jobs-table {
  width: 100%;
  border-collapse: collapse;
}

.jobs-table th,
.jobs-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid v-bind('COLORS.border');
}

.jobs-table th {
  background: v-bind('COLORS.background');
  font-weight: 600;
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
}

.job-title-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.job-title-cell strong {
  color: v-bind('COLORS.text');
}

.location {
  font-size: 0.75rem;
  color: v-bind('COLORS.textLight');
}

.type-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: v-bind('COLORS.info + "15"');
  color: v-bind('COLORS.info');
}

.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.published {
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
}

.status-badge.draft {
  background: v-bind('COLORS.textLight + "20"');
  color: v-bind('COLORS.textLight');
}

.status-badge.closed {
  background: v-bind('COLORS.error + "15"');
  color: v-bind('COLORS.error');
}

.status-badge.flagged {
  background: v-bind('COLORS.warning + "15"');
  color: v-bind('COLORS.warning');
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
