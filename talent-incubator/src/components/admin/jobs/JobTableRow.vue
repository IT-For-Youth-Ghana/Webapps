<template>
  <tr class="job-row">
    <td class="job-title-cell">
      <div class="job-title-content">
        <h4 class="job-title">{{ job.title }}</h4>
        <p v-if="job.department" class="job-department">{{ job.department }}</p>
      </div>
    </td>
    
    <td class="company-cell">
      <div class="company-info">
        <img 
          v-if="job.companyLogo" 
          :src="job.companyLogo" 
          :alt="job.company"
          class="company-logo"
        />
        <span class="company-name">{{ job.company }}</span>
      </div>
    </td>
    
    <td class="type-cell">
      <span class="job-type-badge" :class="getTypeBadgeClass(job.type)">
        {{ job.type }}
      </span>
    </td>
    
    <td class="location-cell">
      <div class="location-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>{{ job.location }}</span>
      </div>
    </td>
    
    <td class="applications-cell">
      <div class="applications-info">
        <span class="applications-count">{{ job.applicationCount || 0 }}</span>
        <span class="applications-label">applications</span>
      </div>
    </td>
    
    <td class="status-cell">
      <span class="status-badge" :class="getStatusBadgeClass(job.status)">
        {{ formatStatus(job.status) }}
      </span>
    </td>
    
    <td class="date-cell">
      <span class="posted-date">{{ formatDate(job.postedDate) }}</span>
    </td>
    
    <td class="actions-cell">
      <div class="actions-menu">
        <button
          @click="$emit('toggle-status', job)"
          class="action-btn toggle-btn"
          :title="job.status === 'active' ? 'Deactivate job' : 'Activate job'"
        >
          <svg v-if="job.status === 'active'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M10 9V5a3 3 0 0 1 6 0v4M2 13a11 11 0 0 0 20 0" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h6M17 12h6M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <button
          @click="$emit('edit', job)"
          class="action-btn edit-btn"
          title="Edit job"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <button
          @click="confirmDelete"
          class="action-btn delete-btn"
          title="Delete job"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { COLORS } from '../../../constants/colors.js'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-status'])

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    active: 'status-active',
    draft: 'status-draft',
    closed: 'status-closed',
    expired: 'status-expired'
  }
  return statusClasses[status] || 'status-draft'
}

const getTypeBadgeClass = (type) => {
  const typeClasses = {
    'Full-time': 'type-fulltime',
    'Part-time': 'type-parttime',
    'Internship': 'type-internship',
    'Contract': 'type-contract',
    'Remote': 'type-remote'
  }
  return typeClasses[type] || 'type-default'
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const confirmDelete = () => {
  if (confirm(`Are you sure you want to delete the job "${props.job.title}"?`)) {
    emit('delete', props.job.id)
  }
}
</script>

<style scoped>
.job-row {
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  transition: background-color 0.2s ease;
}

.job-row:hover {
  background-color: v-bind('COLORS.BACKGROUND.HOVER');
}

.job-row td {
  padding: 1rem;
  vertical-align: middle;
}

.job-row td:first-child {
  padding-left: 1.5rem;
}

.job-row td:last-child {
  padding-right: 1.5rem;
}

.job-title-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.job-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
  line-height: 1.4;
}

.job-department {
  margin: 0;
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.TERTIARY');
}

.company-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.company-logo {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
}

.company-name {
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.job-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.type-fulltime {
  background: v-bind('COLORS.STATUS.SUCCESS + "20"');
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.type-parttime {
  background: v-bind('COLORS.STATUS.WARNING + "20"');
  color: v-bind('COLORS.STATUS.WARNING');
}

.type-internship {
  background: v-bind('COLORS.BRAND.ACCENT + "20"');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.type-contract {
  background: v-bind('COLORS.STATUS.INFO + "20"');
  color: v-bind('COLORS.STATUS.INFO');
}

.type-remote {
  background: v-bind('COLORS.BRAND.PRIMARY + "20"');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.type-default {
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.applications-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.applications-count {
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.applications-label {
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.TERTIARY');
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: v-bind('COLORS.STATUS.SUCCESS + "20"');
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.status-draft {
  background: v-bind('COLORS.STATUS.WARNING + "20"');
  color: v-bind('COLORS.STATUS.WARNING');
}

.status-closed {
  background: v-bind('COLORS.STATUS.ERROR + "20"');
  color: v-bind('COLORS.STATUS.ERROR');
}

.status-expired {
  background: v-bind('COLORS.TEXT.TERTIARY + "20"');
  color: v-bind('COLORS.TEXT.TERTIARY');
}

.posted-date {
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.actions-menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border-color: v-bind('COLORS.BACKGROUND.BORDER');
}

.toggle-btn {
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.edit-btn {
  color: v-bind('COLORS.STATUS.INFO');
}

.delete-btn {
  color: v-bind('COLORS.STATUS.ERROR');
}

.action-btn:hover.delete-btn {
  background: v-bind('COLORS.STATUS.ERROR + "10"');
  border-color: v-bind('COLORS.STATUS.ERROR + "30"');
}
</style>