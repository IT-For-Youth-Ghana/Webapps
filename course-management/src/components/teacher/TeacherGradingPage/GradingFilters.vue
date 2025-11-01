<template>
  <div class="grading-overview">
    <!-- Simple Header -->
    <div class="header">
      <h1 class="title">Grading Overview</h1>
      <div class="actions">
        <button class="btn" @click="$emit('export-grades')">Export</button>
        <button class="btn primary" @click="$emit('bulk-grade')">Bulk Actions</button>
      </div>
    </div>

    <!-- Numbers Overview -->
    <div class="numbers-grid">
      <div class="number-card">
        <div class="number">{{ stats.overdue }}</div>
        <div class="label">Overdue</div>
      </div>
      <div class="number-card">
        <div class="number">{{ stats.dueSoon }}</div>
        <div class="label">Due Soon</div>
      </div>
      <div class="number-card">
        <div class="number">{{ stats.pending }}</div>
        <div class="label">Pending</div>
      </div>
      <div class="number-card">
        <div class="number">{{ stats.graded }}</div>
        <div class="label">Completed</div>
      </div>
      <div class="number-card">
        <div class="number">{{ totalEstimatedTime }}h</div>
        <div class="label">Est. Time</div>
      </div>
    </div>

    <!-- Courses Table -->
    <div class="courses-section">
      <h2 class="section-title">Courses</h2>
      <table class="courses-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Students</th>
            <th>Overdue</th>
            <th>Pending</th>
            <th>Completed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="course in courseStats" 
            :key="course.id"
            @click="$emit('select-course', course.id)"
            class="course-row"
            :class="{ active: selectedCourse == course.id }"
          >
            <td>
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-code">{{ course.code }}</div>
              </div>
            </td>
            <td>{{ course.studentCount }}</td>
            <td><strong>{{ course.overdue }}</strong></td>
            <td>{{ course.pending }}</td>
            <td>{{ course.totalSubmissions - course.pending - course.overdue }}</td>
            <td>
              <button class="btn small" v-if="course.overdue > 0">Grade Now</button>
              <span v-else class="status">✓ Up to date</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Simple Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input 
          type="text" 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search students or assignments..."
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <select :value="statusFilter" @change="$emit('update:statusFilter', $event.target.value)" class="filter-select">
          <option value="">All Status</option>
          <option value="overdue">Overdue</option>
          <option value="due-soon">Due Soon</option>
          <option value="pending">Pending</option>
          <option value="graded">Graded</option>
        </select>
      </div>
      
      <div class="filter-group">
        <select :value="sortBy" @change="$emit('update:sortBy', $event.target.value)" class="filter-select">
          <option value="priority">By Priority</option>
          <option value="course">By Course</option>
          <option value="student">By Student</option>
          <option value="time">By Time Needed</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradingFilters',
  props: {
    searchQuery: String,
    statusFilter: String,
    assignmentFilter: String,
    courseFilter: String,
    sortBy: String,
    selectedCourse: [String, Number],
    stats: {
      type: Object,
      default: () => ({
        pending: 0,
        graded: 0,
        overdue: 0,
        dueSoon: 0
      })
    },
    courseStats: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    totalEstimatedTime() {
      const totalPending = this.stats.pending + this.stats.overdue + this.stats.dueSoon
      return Math.round((totalPending * 5) / 60 * 10) / 10
    }
  },
  emits: [
    'update:searchQuery', 
    'update:statusFilter', 
    'update:assignmentFilter', 
    'update:courseFilter', 
    'update:sortBy',
    'export-grades',
    'bulk-grade',
    'select-course'
  ]
}
</script>

<style scoped>
.grading-overview {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e5e5e5;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn.primary {
  background: #111;
  color: white;
  border-color: #111;
}

.btn.primary:hover {
  background: #374151;
}

.btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-bottom: 1px solid #e5e5e5;
}

.number-card {
  padding: 2rem;
  text-align: center;
  border-right: 1px solid #e5e5e5;
}

.number-card:last-child {
  border-right: none;
}

.number {
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.courses-section {
  padding: 2rem;
  border-bottom: 1px solid #e5e5e5;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
}

.courses-table th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #e5e5e5;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.course-row {
  cursor: pointer;
  transition: background 0.2s;
}

.course-row:hover {
  background: #f9fafb;
}

.course-row.active {
  background: #f3f4f6;
}

.courses-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e5e5;
  color: #374151;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.course-name {
  font-weight: 500;
  color: #111;
}

.course-code {
  font-size: 0.875rem;
  color: #6b7280;
}

.status {
  color: #6b7280;
  font-size: 0.875rem;
}

.filters-section {
  display: flex;
  gap: 1rem;
  padding: 2rem;
}

.filter-group {
  flex: 1;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #6b7280;
}

@media (max-width: 768px) {
  .numbers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .number-card:nth-child(2n) {
    border-right: none;
  }
  
  .number-card:nth-child(-n+2) {
    border-bottom: 1px solid #e5e5e5;
  }
  
  .courses-table {
    font-size: 0.875rem;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>