<script setup>
/**
 * JobFilters Component
 * Provides filtering options for job listings
 */
import { computed } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  activeFiltersCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:filters', 'apply', 'clear'])

// Job type options
const jobTypes = [
  { value: '', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
]

// Experience level options
const experienceLevels = [
  { value: '', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }
]

// Sort options
const sortOptions = [
  { value: 'createdAt', label: 'Date Posted' },
  { value: 'salary', label: 'Salary' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'applications_count', label: 'Applications' }
]

// Location presets (Ghana-focused)
const locationPresets = [
  'Accra',
  'Kumasi',
  'Takoradi',
  'Tamale',
  'Cape Coast',
  'Remote'
]

const localFilters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})

const updateFilter = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}

const handleApply = () => {
  emit('apply')
}

const handleClear = () => {
  emit('clear')
}
</script>

<template>
  <div class="job-filters">
    <div class="filters-header">
      <h3 class="filters-title">
        <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filters
        <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
      </h3>
      <button
        v-if="activeFiltersCount > 0"
        @click="handleClear"
        class="clear-btn"
        :disabled="loading"
      >
        Clear All
      </button>
    </div>

    <div class="filters-body">
      <!-- Job Type -->
      <div class="filter-group">
        <label class="filter-label">Job Type</label>
        <select
          :value="filters.job_type"
          @change="updateFilter('job_type', $event.target.value)"
          class="filter-select"
          :disabled="loading"
        >
          <option v-for="opt in jobTypes" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Experience Level -->
      <div class="filter-group">
        <label class="filter-label">Experience Level</label>
        <select
          :value="filters.experience_level"
          @change="updateFilter('experience_level', $event.target.value)"
          class="filter-select"
          :disabled="loading"
        >
          <option v-for="opt in experienceLevels" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Location -->
      <div class="filter-group">
        <label class="filter-label">Location</label>
        <input
          :value="filters.location"
          @input="updateFilter('location', $event.target.value)"
          type="text"
          class="filter-input"
          placeholder="Enter location..."
          :disabled="loading"
          list="location-presets"
        />
        <datalist id="location-presets">
          <option v-for="loc in locationPresets" :key="loc" :value="loc" />
        </datalist>
      </div>

      <!-- Salary Range -->
      <div class="filter-group">
        <label class="filter-label">Salary Range (GHS)</label>
        <div class="salary-inputs">
          <input
            :value="filters.salary_min"
            @input="updateFilter('salary_min', $event.target.value ? Number($event.target.value) : null)"
            type="number"
            class="filter-input salary-input"
            placeholder="Min"
            :disabled="loading"
            min="0"
          />
          <span class="salary-separator">-</span>
          <input
            :value="filters.salary_max"
            @input="updateFilter('salary_max', $event.target.value ? Number($event.target.value) : null)"
            type="number"
            class="filter-input salary-input"
            placeholder="Max"
            :disabled="loading"
            min="0"
          />
        </div>
      </div>

      <!-- Sort By -->
      <div class="filter-group">
        <label class="filter-label">Sort By</label>
        <div class="sort-row">
          <select
            :value="filters.sort_by"
            @change="updateFilter('sort_by', $event.target.value)"
            class="filter-select sort-select"
            :disabled="loading"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <button
            @click="updateFilter('sort_order', filters.sort_order === 'asc' ? 'desc' : 'asc')"
            class="sort-order-btn"
            :title="filters.sort_order === 'asc' ? 'Ascending' : 'Descending'"
            :disabled="loading"
          >
            <svg v-if="filters.sort_order === 'asc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Apply Button -->
    <div class="filters-footer">
      <button
        @click="handleApply"
        class="apply-btn"
        :disabled="loading"
      >
        <span v-if="loading" class="loading-spinner"></span>
        <span v-else>Apply Filters</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.job-filters {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.filter-icon {
  width: 18px;
  height: 18px;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: v-bind('COLORS.BRAND.PRIMARY');
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
}

.clear-btn {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  color: v-bind('COLORS.STATUS.ERROR');
  border-color: v-bind('COLORS.STATUS.ERROR');
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filters-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
}

.filter-select:disabled,
.filter-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.salary-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.salary-input {
  flex: 1;
}

.salary-separator {
  color: v-bind('COLORS.TEXT.MUTED');
}

.sort-row {
  display: flex;
  gap: 0.5rem;
}

.sort-select {
  flex: 1;
}

.sort-order-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  cursor: pointer;
  transition: all 0.2s;
}

.sort-order-btn:hover:not(:disabled) {
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  color: v-bind('COLORS.BRAND.PRIMARY');
}

.sort-order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sort-order-btn svg {
  width: 18px;
  height: 18px;
}

.filters-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.apply-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.apply-btn:hover:not(:disabled) {
  background: v-bind('COLORS.BRAND.SECONDARY');
}

.apply-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .filters-body {
    padding: 1rem;
    gap: 1rem;
  }

  .filters-header {
    padding: 0.875rem 1rem;
  }

  .filters-footer {
    padding: 0.875rem 1rem;
  }
}
</style>
