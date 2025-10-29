<template>
  <div class="content-section">
    <div class="section-header">
      <h2 class="section-title">Course Filters</h2>
      <button class="btn-secondary btn-sm">
        <FunnelIcon class="w-4 h-4" />
        Filter
      </button>
    </div>
    
    <div class="filters-section">
      <div class="search-bar">
        <MagnifyingGlassIcon class="w-5 h-5 search-icon" />
        <input 
          type="text" 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search courses..."
          class="search-input"
        />
      </div>
      
      <div class="filters">
        <select :value="statusFilter" @change="$emit('update:statusFilter', $event.target.value)" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        
        <select :value="categoryFilter" @change="$emit('update:categoryFilter', $event.target.value)" class="filter-select">
          <option value="">All Categories</option>
          <option value="web-development">Web Development</option>
          <option value="mobile-development">Mobile Development</option>
          <option value="data-science">Data Science</option>
          <option value="design">UI/UX Design</option>
          <option value="database">Database</option>
        </select>
        
        <select :value="sortBy" @change="$emit('update:sortBy', $event.target.value)" class="filter-select">
          <option value="created">Recently Created</option>
          <option value="updated">Recently Updated</option>
          <option value="students">Most Students</option>
          <option value="rating">Highest Rated</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'CoursesFilters',
  components: {
    MagnifyingGlassIcon,
    FunnelIcon
  },
  props: {
    searchQuery: String,
    statusFilter: String,
    categoryFilter: String,
    sortBy: String
  },
  emits: ['update:searchQuery', 'update:statusFilter', 'update:categoryFilter', 'update:sortBy']
}
</script>

<style scoped>
.content-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.filters-section {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--brand-primary);
}
</style>