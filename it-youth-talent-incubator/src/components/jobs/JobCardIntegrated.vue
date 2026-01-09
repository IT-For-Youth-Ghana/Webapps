<script setup>
/**
 * JobCardIntegrated Component
 * Display job card with API data structure support
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

const emit = defineEmits(['apply', 'view-details'])

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

// Format salary
const formattedSalary = computed(() => {
  if (!props.job?.salary_range) return null
  
  const { min, max, currency = 'GHS', display } = props.job.salary_range
  
  if (display) return display
  
  if (min && max) {
    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`
  } else if (min) {
    return `From ${currency} ${formatNumber(min)}`
  } else if (max) {
    return `Up to ${currency} ${formatNumber(max)}`
  }
  
  return null
})

// Format numbers
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`
  }
  return num.toLocaleString()
}

// Job type label
const jobTypeLabel = computed(() => {
  const types = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'internship': 'Internship',
    'contract': 'Contract',
    'remote': 'Remote',
    'hybrid': 'Hybrid'
  }
  return types[props.job?.job_type] || props.job?.job_type
})

// Experience level label
const experienceLevelLabel = computed(() => {
  const levels = {
    'entry': 'Entry',
    'junior': 'Junior',
    'mid': 'Mid',
    'senior': 'Senior',
    'lead': 'Lead',
    'executive': 'Executive'
  }
  return levels[props.job?.experience_level] || props.job?.experience_level
})

// Time ago
const timeAgo = computed(() => {
  const dateStr = props.job?.published_at || props.job?.createdAt
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
})

// Skills to display (limited)
const displaySkills = computed(() => {
  const skills = props.job?.skills || []
  return skills.slice(0, 4)
})

const hasMoreSkills = computed(() => {
  return (props.job?.skills?.length || 0) > 4
})

// Job type colors
const jobTypeColor = computed(() => {
  const colors = {
    'full-time': '#2ea043',
    'part-time': '#8957e5',
    'internship': '#f85149',
    'contract': '#db6d28',
    'remote': '#4facfe',
    'hybrid': '#58a6ff'
  }
  return colors[props.job?.job_type] || '#8B949E'
})

// Is job closed
const isClosed = computed(() => props.job?.status === 'closed')

const handleViewDetails = () => {
  emit('view-details', props.job)
}

const handleApply = () => {
  if (!isClosed.value) {
    emit('apply', props.job)
  }
}
</script>

<template>
  <article class="job-card" :class="{ 'is-closed': isClosed }">
    <!-- Header -->
    <div class="card-header">
      <div class="company-section">
        <div v-if="companyLogo" class="company-logo">
          <img :src="companyLogo" :alt="companyName" />
        </div>
        <div v-else class="company-logo-placeholder">
          {{ companyName.charAt(0) }}
        </div>
        <div class="job-info">
          <h3 class="job-title" @click="handleViewDetails">{{ job.title }}</h3>
          <p class="company-name">{{ companyName }}</p>
        </div>
      </div>
      
      <div v-if="job.is_featured" class="featured-badge">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        Featured
      </div>
    </div>

    <!-- Meta -->
    <div class="job-meta">
      <span class="meta-item location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        {{ job.location || 'Location TBD' }}
      </span>
      <span v-if="jobTypeLabel" class="meta-item job-type" :style="{ '--type-color': jobTypeColor }">
        {{ jobTypeLabel }}
      </span>
      <span v-if="experienceLevelLabel" class="meta-item experience">
        {{ experienceLevelLabel }}
      </span>
    </div>

    <!-- Description Preview -->
    <p v-if="job.description" class="job-description">
      {{ job.description.substring(0, 150) }}{{ job.description.length > 150 ? '...' : '' }}
    </p>

    <!-- Skills -->
    <div v-if="displaySkills.length" class="skills-section">
      <span v-for="skill in displaySkills" :key="skill" class="skill-tag">
        {{ skill }}
      </span>
      <span v-if="hasMoreSkills" class="skills-more">
        +{{ job.skills.length - 4 }} more
      </span>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="footer-info">
        <span v-if="formattedSalary" class="salary">{{ formattedSalary }}</span>
        <span class="posted-time">{{ timeAgo }}</span>
      </div>
      
      <div class="footer-actions">
        <button @click="handleViewDetails" class="btn-details" title="View Details">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button 
          @click="handleApply" 
          class="btn-apply"
          :disabled="isClosed || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else-if="isClosed">Closed</span>
          <span v-else>Apply</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.job-card {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease;
}

.job-card:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.job-card.is-closed {
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.company-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.company-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, v-bind('COLORS.BRAND.PRIMARY'), v-bind('COLORS.BRAND.ACCENT'));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.job-info {
  min-width: 0;
}

.job-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
  line-height: 1.3;
  cursor: pointer;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-title:hover {
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.company-name {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.featured-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #f5af19, #f12711);
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.featured-badge svg {
  width: 10px;
  height: 10px;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border-radius: 6px;
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.meta-item svg {
  width: 12px;
  height: 12px;
}

.meta-item.job-type {
  color: var(--type-color);
  background: color-mix(in srgb, var(--type-color) 15%, transparent);
}

.job-description {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: v-bind('COLORS.TEXT.MUTED');
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.skills-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.skill-tag {
  padding: 0.25rem 0.5rem;
  background: rgba(79, 172, 254, 0.1);
  border-radius: 4px;
  font-size: 0.6875rem;
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.skills-more {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  margin-top: auto;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.salary {
  font-size: 0.9375rem;
  font-weight: 600;
  color: v-bind('COLORS.STATUS.SUCCESS');
}

.posted-time {
  font-size: 0.75rem;
  color: v-bind('COLORS.TEXT.MUTED');
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-details {
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
}

.btn-details:hover {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.btn-details svg {
  width: 18px;
  height: 18px;
}

.btn-apply {
  padding: 0.5rem 1rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-apply:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.btn-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 480px) {
  .job-card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .featured-badge {
    align-self: flex-start;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .footer-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .footer-actions {
    justify-content: flex-end;
  }
}
</style>
