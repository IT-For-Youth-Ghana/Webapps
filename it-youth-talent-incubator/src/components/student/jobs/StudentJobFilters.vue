<template>
  <div class="student-job-filters">
    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input
          v-model="localSearchQuery"
          @input="updateSearch"
          type="text"
          placeholder="Search by job title, company, or skills..."
          class="search-input"
        />
        <button
          v-if="localSearchQuery"
          @click="clearSearch"
          class="clear-search-btn"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Location</label>
          <select 
            v-model="localLocation" 
            @change="updateLocation"
            class="filter-select"
          >
            <option
              v-for="location in locations"
              :key="location"
              :value="location"
            >
              {{ location }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Job Type</label>
          <select 
            v-model="localType" 
            @change="updateType"
            class="filter-select"
          >
            <option
              v-for="type in jobTypes"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Salary Range</label>
          <select 
            v-model="localSalaryRange" 
            @change="updateSalaryRange"
            class="filter-select"
          >
            <option
              v-for="range in salaryRanges"
              :key="range"
              :value="range"
            >
              {{ range }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select 
            v-model="localSortBy" 
            @change="updateSortBy"
            class="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary-high">Highest Salary</option>
            <option value="salary-low">Lowest Salary</option>
            <option value="deadline">Deadline Soon</option>
          </select>
        </div>
      </div>

      <div class="filter-actions">
        <button 
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="clear-filters-btn"
          type="button"
        >
          Clear Filters
        </button>
        
        <div class="results-count">
          {{ jobCount }} {{ jobCount === 1 ? 'job' : 'jobs' }} found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { COLORS } from '../../../constants/colors.js'
import { GHANA_LOCATIONS, JOB_TYPES, SALARY_RANGES } from '../../../constants/app.js'

const props = defineProps({
  searchQuery: String,
  selectedLocation: String,
  selectedType: String,
  selectedSalaryRange: String,
  sortBy: String,
  jobCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:searchQuery', 
  'update:selectedLocation', 
  'update:selectedType', 
  'update:selectedSalaryRange', 
  'update:sortBy', 
  'clear-filters'
])

const localSearchQuery = ref(props.searchQuery)
const localLocation = ref(props.selectedLocation)
const localType = ref(props.selectedType)
const localSalaryRange = ref(props.selectedSalaryRange)
const localSortBy = ref(props.sortBy)

const locations = ['All Locations', ...GHANA_LOCATIONS]
const jobTypes = ['All Types', ...Object.values(JOB_TYPES)]
const salaryRanges = ['All Salaries', ...Object.values(SALARY_RANGES)]

const hasActiveFilters = computed(() => {
  return localSearchQuery.value || 
         (localLocation.value && localLocation.value !== 'All Locations') || 
         (localType.value && localType.value !== 'All Types') ||
         (localSalaryRange.value && localSalaryRange.value !== 'All Salaries')
})

// Watch for prop changes
watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue
})

watch(() => props.selectedLocation, (newValue) => {
  localLocation.value = newValue
})

watch(() => props.selectedType, (newValue) => {
  localType.value = newValue
})

watch(() => props.selectedSalaryRange, (newValue) => {
  localSalaryRange.value = newValue
})

watch(() => props.sortBy, (newValue) => {
  localSortBy.value = newValue
})

// Update methods
const updateSearch = () => {
  emit('update:searchQuery', localSearchQuery.value)
}

const updateLocation = () => {
  emit('update:selectedLocation', localLocation.value)
}

const updateType = () => {
  emit('update:selectedType', localType.value)
}

const updateSalaryRange = () => {
  emit('update:selectedSalaryRange', localSalaryRange.value)
}

const updateSortBy = () => {
  emit('update:sortBy', localSortBy.value)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  updateSearch()
}

const clearAllFilters = () => {
  localSearchQuery.value = ''
  localLocation.value = 'All Locations'
  localType.value = 'All Types'
  localSalaryRange.value = 'All Salaries'
  emit('clear-filters')
}
</script>

<style scoped>
.student-job-filters {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: v-bind('COLORS.TEXT.TERTIARY');
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 16px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  box-shadow: 0 0 0 3px v-bind('COLORS.BRAND.PRIMARY + "20"');
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px;
  background: transparent;
  border: none;
  color: v-bind('COLORS.TEXT.TERTIARY');
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: v-bind('COLORS.BACKGROUND.HOVER');
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.filter-select {
  padding: 10px 12px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  box-shadow: 0 0 0 3px v-bind('COLORS.BRAND.PRIMARY + "20"');
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
}

.clear-filters-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: v-bind('COLORS.BACKGROUND.HOVER');
  border-color: v-bind('COLORS.TEXT.TERTIARY');
}

.results-count {
  font-size: 0.875rem;
  color: v-bind('COLORS.TEXT.SECONDARY');
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .results-count {
    text-align: center;
  }
}
</style>