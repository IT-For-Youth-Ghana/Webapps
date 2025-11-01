<template>
  <section class="role-info-section">
    <div class="role-info-card">
      <h3>Current Role: {{ userRole }}</h3>
      <p v-if="isAdmin">
        As an administrator, you have access to all features across the platform. You can manage users, courses, and view system analytics.
      </p>
      <p v-else-if="isTeacher">
        As a teacher, you can create and manage courses, grade assignments, and track student progress. Use the role switcher to experience other perspectives.
      </p>
      <p v-else-if="isStudent">
        As a student, you can enroll in courses, submit assignments, and track your learning progress. Try switching roles to explore teacher and admin features.
      </p>
      <div class="role-demo-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>This is a demo environment. Feel free to explore all features!</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RoleInfoCard',
  props: {
    userRole: {
      type: String,
      default: 'Student'
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isTeacher: {
      type: Boolean,
      default: false
    },
    isStudent: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.role-info-section {
  margin-bottom: 2rem;
}

.role-info-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  padding: 2rem;
}

.role-info-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111;
}

.role-info-card p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  line-height: 1.6;
}

.role-demo-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  font-size: 0.875rem;
  color: #374151;
}

.role-demo-note svg {
  color: #6b7280;
  flex-shrink: 0;
}
</style>