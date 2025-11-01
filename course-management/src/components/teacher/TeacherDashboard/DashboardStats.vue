<template>
  <div class="welcome-section">
    <div class="welcome-card card">
      <div class="welcome-content">
        <div class="welcome-icon">
          <AcademicCapIcon class="w-16 h-16" />
        </div>
        <h2 class="welcome-title">Welcome to Teacher Portal</h2>
        <p class="welcome-subtitle">Manage your courses, assignments, and track student progress</p>
        <div class="welcome-actions">
          <router-link to="/teacher/create-course" class="btn-primary">
            <PlusIcon class="w-5 h-5" />
            Create New Course
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AcademicCapIcon, ChartBarIcon, PlusIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'DashboardStats',
  components: {
    AcademicCapIcon,
    ChartBarIcon,
    PlusIcon
  }
}
</script>

<style scoped>
.welcome-section {
  margin-bottom: 2rem;
}

.welcome-card {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, var(--interactive-primary), var(--brand-accent));
  color: white;
  border: none;
}

.welcome-content {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-icon {
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: white;
}

.welcome-subtitle {
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 2rem 1rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
}
</style>