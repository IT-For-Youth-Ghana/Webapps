<template>
  <div class="filters-container">
    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input
          v-model="localSearchQuery"
          @input="updateSearch"
          type="text"
          placeholder="Search jobs by title, company, or location..."
          class="search-input"
        />
        <button
          v-if="localSearchQuery"
          @click="clearSearch"
          class="clear-button"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="filters-row">
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select 
          v-model="localStatusFilter" 
          @change="updateStatusFilter"
          class="filter-select"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Type</label>
        <select 
          v-model="localTypeFilter" 
          @change="updateTypeFilter"
          class="filter-select"
        >
          <option
            v-for="option in typeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Sort by</label>
        <select 
          v-model="localSortBy" 
          @change="updateSortBy"
          class="filter-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A-Z</option>
          <option value="applications">Most Applications</option>
        </select>
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
        
        <button 
          @click="$emit('create-job')"
          class="create-job-btn"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
          </svg>
          Create Job
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { COLORS } from '../../../constants/colors.js'
import { JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS } from '../../../constants/app.js'

const props = defineProps({
  searchQuery: String,
  statusFilter: String,
  typeFilter: String,
  sortBy: String
})

const emit = defineEmits(['update:searchQuery', 'update:statusFilter', 'update:typeFilter', 'update:sortBy', 'clear-filters', 'create-job'])

const localSearchQuery = ref(props.searchQuery)
const localStatusFilter = ref(props.statusFilter)
const localTypeFilter = ref(props.typeFilter)
const localSortBy = ref(props.sortBy)

const statusOptions = JOB_STATUS_OPTIONS
const typeOptions = JOB_TYPE_OPTIONS

const hasActiveFilters = computed(() => {
  return localSearchQuery.value || 
         localStatusFilter.value !== 'all' || 
         localTypeFilter.value !== 'all'
})

watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue
})

watch(() => props.statusFilter, (newValue) => {
  localStatusFilter.value = newValue
})

watch(() => props.typeFilter, (newValue) => {
  localTypeFilter.value = newValue
})

watch(() => props.sortBy, (newValue) => {
  localSortBy.value = newValue
})

const updateSearch = () => {
  emit('update:searchQuery', localSearchQuery.value)
}

const updateStatusFilter = () => {
  emit('update:statusFilter', localStatusFilter.value)
}

const updateTypeFilter = () => {
  emit('update:typeFilter', localTypeFilter.value)
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
  localStatusFilter.value = 'all'
  localTypeFilter.value = 'all'
  emit('clear-filters')
}
</script>

<style scoped>
.filters-container {
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: v-bind('COLORS.TEXT.TERTIARY');
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  background: v-bind('COLORS.BACKGROUND.SECONDARY');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 8px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  box-shadow: 0 0 0 3px v-bind('COLORS.BRAND.PRIMARY + "20"');
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background: transparent;
  border: none;
  color: v-bind('COLORS.TEXT.TERTIARY');
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: v-bind('COLORS.BACKGROUND.HOVER');
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('COLORS.TEXT.SECONDARY');
}

.filter-select {
  padding: 8px 12px;
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
  gap: 0.75rem;
  margin-left: auto;
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

.create-job-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  background: v-bind('COLORS.BRAND.PRIMARY');
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-job-btn:hover {
  background: v-bind('COLORS.BRAND.SECONDARY');
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: stretch;
  }
  
  .filter-actions button {
    flex: 1;
  }
}
</style>