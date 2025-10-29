<template>
  <div class="content-section">
    <div class="section-header">
      <h2 class="section-title">Filters</h2>
    </div>
    
    <div class="filters-section">
      <div class="search-bar">
        <MagnifyingGlassIcon class="w-5 h-5 search-icon" />
        <input 
          type="text" 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search assignments..."
          class="search-input"
        />
      </div>
      
      <div class="filters">
        <select :value="courseFilter" @change="$emit('update:courseFilter', $event.target.value)" class="filter-select">
          <option value="">All Courses</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
        </select>
        
        <select :value="typeFilter" @change="$emit('update:typeFilter', $event.target.value)" class="filter-select">
          <option value="">All Types</option>
          <option value="quiz">Quiz</option>
          <option value="project">Project</option>
          <option value="essay">Essay</option>
          <option value="exercise">Exercise</option>
        </select>
        
        <select :value="sortBy" @change="$emit('update:sortBy', $event.target.value)" class="filter-select">
          <option value="dueDate">Due Date</option>
          <option value="created">Created Date</option>
          <option value="submissions">Most Submissions</option>
          <option value="title">Title</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'AssignmentFilters',
  components: {
    MagnifyingGlassIcon
  },
  props: {
    searchQuery: String,
    courseFilter: String,
    typeFilter: String,
    sortBy: String
  },
  emits: ['update:searchQuery', 'update:courseFilter', 'update:typeFilter', 'update:sortBy'],
  data() {
    return {
      courses: [
        { id: 1, title: 'Web Development Fundamentals' },
        { id: 2, title: 'Advanced Vue.js' },
        { id: 3, title: 'Database Design' }
      ]
    }
  }
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
  background: var(--bg-tertiary);
  border-radius: 0.75rem;
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
  border: 1px solid var(--border-secondary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 2px var(--interactive-primary-hover);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-secondary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 2px var(--interactive-primary-hover);
}
</style>