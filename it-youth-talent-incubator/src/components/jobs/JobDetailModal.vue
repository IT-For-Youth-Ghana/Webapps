<script setup>
/**
 * JobDetailModal Component
 * Modal for displaying detailed job information and apply action
 */
import { computed } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'apply'])

// Format salary display
const formattedSalary = computed(() => {
  if (!props.job?.salary_range) return 'Salary not specified'
  
  const { min, max, currency = 'GHS' } = props.job.salary_range
  
  if (min && max) {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  } else if (min) {
    return `From ${currency} ${min.toLocaleString()}`
  } else if (max) {
    return `Up to ${currency} ${max.toLocaleString()}`
  }
  
  return props.job.salary_range.display || 'Salary not specified'
})

// Format job type for display
const jobTypeLabel = computed(() => {
  const types = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'internship': 'Internship',
    'contract': 'Contract',
    'remote': 'Remote',
    'hybrid': 'Hybrid'
  }
  return types[props.job?.job_type] || props.job?.job_type || 'Not specified'
})

// Format experience level for display
const experienceLevelLabel = computed(() => {
  const levels = {
    'entry': 'Entry Level',
    'junior': 'Junior',
    'mid': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'executive': 'Executive'
  }
  return levels[props.job?.experience_level] || props.job?.experience_level || 'Not specified'
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Calculate time ago
const timeAgo = computed(() => {
  if (!props.job?.createdAt && !props.job?.published_at) return ''
  
  const date = new Date(props.job.published_at || props.job.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
})

// Company info
const companyName = computed(() => {
  if (typeof props.job?.company === 'object') {
    return props.job.company.company_name || props.job.company.name
  }
  return props.job?.company || 'Company'
})

const companyLogo = computed(() => {
  if (typeof props.job?.company === 'object') {
    return props.job.company.logo_url
  }
  return null
})

const handleApply = () => {
  emit('apply', props.job)
}

const handleClose = () => {
  emit('close')
}

// Close on escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleClose" @keydown="handleKeydown" tabindex="-1">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="job-header-info">
            <div v-if="companyLogo" class="company-logo">
              <img :src="companyLogo" :alt="companyName" />
            </div>
            <div v-else class="company-logo-placeholder">
              {{ companyName.charAt(0) }}
            </div>
            <div class="job-title-section">
              <h2 class="job-title">{{ job.title }}</h2>
              <p class="company-name">{{ companyName }}</p>
            </div>
          </div>
          <button @click="handleClose" class="close-btn" title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Meta Info -->
          <div class="job-meta">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ job.location || 'Location not specified' }}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <span>{{ jobTypeLabel }}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span>{{ experienceLevelLabel }}</span>
            </div>
            <div class="meta-item salary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>{{ formattedSalary }}</span>
            </div>
          </div>

          <!-- Posted Date -->
          <div class="posted-info">
            <span class="posted-badge">Posted {{ timeAgo }}</span>
            <span v-if="job.views" class="views-count">{{ job.views }} views</span>
            <span v-if="job.applications_count" class="applications-count">
              {{ job.applications_count }} applications
            </span>
          </div>

          <!-- Description -->
          <div class="section">
            <h3 class="section-title">Job Description</h3>
            <div class="description-content" v-html="job.description?.replace(/\n/g, '<br>')"></div>
          </div>

          <!-- Requirements -->
          <div v-if="job.requirements?.length" class="section">
            <h3 class="section-title">Requirements</h3>
            <ul class="requirements-list">
              <li v-for="(req, index) in job.requirements" :key="index">{{ req }}</li>
            </ul>
          </div>

          <!-- Responsibilities -->
          <div v-if="job.responsibilities?.length" class="section">
            <h3 class="section-title">Responsibilities</h3>
            <ul class="responsibilities-list">
              <li v-for="(resp, index) in job.responsibilities" :key="index">{{ resp }}</li>
            </ul>
          </div>

          <!-- Skills -->
          <div v-if="job.skills?.length" class="section">
            <h3 class="section-title">Required Skills</h3>
            <div class="skills-tags">
              <span v-for="skill in job.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="handleClose" class="btn-secondary">
            Close
          </button>
          <button 
            @click="handleApply" 
            class="btn-primary"
            :disabled="loading || job.status === 'closed'"
          >
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else-if="job.status === 'closed'">Position Closed</span>
            <span v-else>Apply Now</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.job-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.company-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, v-bind('COLORS.BRAND.PRIMARY'), v-bind('COLORS.BRAND.ACCENT'));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.job-title-section {
  min-width: 0;
}

.job-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: v-bind('COLORS.TEXT.PRIMARY');
  line-height: 1.3;
}

.company-name {
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border-radius: 8px;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.meta-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.meta-item.salary {
  color: v-bind('COLORS.STATUS.SUCCESS');
  background: rgba(46, 160, 67, 0.1);
}

.posted-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.posted-badge {
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.views-count,
.applications-count {
  font-size: 0.8125rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.description-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.requirements-list,
.responsibilities-list {
  margin: 0;
  padding: 0 0 0 1.25rem;
  list-style: disc;
}

.requirements-list li,
.responsibilities-list li {
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 20px;
  font-size: 0.8125rem;
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.btn-secondary:hover {
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-overlay {
    padding: 0;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }

  .job-title {
    font-size: 1.125rem;
  }

  .job-meta {
    gap: 0.5rem;
  }

  .meta-item {
    font-size: 0.8125rem;
    padding: 0.375rem 0.625rem;
  }
}
</style>
