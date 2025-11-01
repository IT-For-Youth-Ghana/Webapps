<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Assignment Filters</h2>
      <button class="quick-action-btn">
        <!-- Filter Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filter
      </button>
    </div>
    
    <div class="filters-section">
      <div class="search-bar">
        <!-- Search Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
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

export default {
  name: 'AssignmentFilters',
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
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.filters-section {
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

.search-bar svg {
  position: absolute;
  left: 0.75rem;
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}
</style>