<template>
  <div class="dashboard-header">
    <div class="welcome-section">
      <h1 class="welcome-title">
        Welcome back, {{ userName }}! 👋
      </h1>
      <p class="welcome-subtitle">
        You're currently logged in as <strong>{{ userRole }}</strong>
      </p>
    </div>
    
    <div class="header-stats">
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalCourses }}</div>
        <div class="stat-label">Courses</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalStudents }}</div>
        <div class="stat-label">Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.avgRating }}</div>
        <div class="stat-label">Rating</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    userName: {
      type: String,
      default: 'User'
    },
    userRole: {
      type: String,
      default: 'Student'
    },
    stats: {
      type: Object,
      default: () => ({
        totalCourses: 0,
        totalStudents: 0,
        avgRating: 0
      })
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  margin-bottom: 2rem;
}

.welcome-section {
  flex: 1;
}

.welcome-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111;
}

.welcome-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-card {
  text-align: center;
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .header-stats {
    justify-content: space-around;
  }
}
</style>