<template>
  <div class="unauthorized-page">
    <div class="unauthorized-container">
      <div class="unauthorized-card glass-card">
        <!-- Icon and Title -->
        <div class="unauthorized-header">
          <div class="icon-wrapper">
            <span class="lock-icon">🔒</span>
          </div>
          <h1 class="unauthorized-title">Access Denied</h1>
          <p class="unauthorized-subtitle">
            You don't have permission to access this resource
          </p>
        </div>

        <!-- Error Details -->
        <div class="error-details">
          <div class="detail-item">
            <span class="detail-icon">📋</span>
            <div class="detail-content">
              <h3>Requested Resource</h3>
              <p>{{ requestedRoute || 'Unknown' }}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">👤</span>
            <div class="detail-content">
              <h3>Your Role</h3>
              <p>{{ userRole || 'Guest' }}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">🛡️</span>
            <div class="detail-content">
              <h3>Required Permissions</h3>
              <p>{{ requiredPermissions || 'Unknown' }}</p>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div class="suggestions">
          <h3 class="suggestions-title">What you can do:</h3>
          <div class="suggestion-list">
            <div v-if="!isAuthenticated" class="suggestion-item">
              <span class="suggestion-icon">🔐</span>
              <div class="suggestion-content">
                <h4>Login to your account</h4>
                <p>Sign in to access course materials and features</p>
                <button class="btn btn-primary" @click="goToLogin">
                  Sign In
                  <span class="btn-icon">🚀</span>
                </button>
              </div>
            </div>
            
            <div v-if="isStudent" class="suggestion-item">
              <span class="suggestion-icon">📚</span>
              <div class="suggestion-content">
                <h4>Browse Available Courses</h4>
                <p>Explore courses you can enroll in</p>
                <button class="btn btn-primary" @click="goToCourses">
                  View Courses
                  <span class="btn-icon">📖</span>
                </button>
              </div>
            </div>
            
            <div v-if="isTeacher" class="suggestion-item">
              <span class="suggestion-icon">👨‍🏫</span>
              <div class="suggestion-content">
                <h4>Manage Your Courses</h4>
                <p>View and edit your teaching courses</p>
                <button class="btn btn-primary" @click="goToTeacherDashboard">
                  Teacher Dashboard
                  <span class="btn-icon">📊</span>
                </button>
              </div>
            </div>
            
            <div v-if="isStudent" class="suggestion-item">
              <span class="suggestion-icon">📊</span>
              <div class="suggestion-content">
                <h4>Check Your Progress</h4>
                <p>View your learning progress and achievements</p>
                <button class="btn btn-secondary" @click="goToStudentDashboard">
                  Student Dashboard
                  <span class="btn-icon">📈</span>
                </button>
              </div>
            </div>
            
            <div class="suggestion-item">
              <span class="suggestion-icon">🏠</span>
              <div class="suggestion-content">
                <h4>Go to Homepage</h4>
                <p>Return to the main page</p>
                <button class="btn btn-secondary" @click="goToHome">
                  Home
                  <span class="btn-icon">🏠</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Support -->
        <div class="contact-support">
          <p class="support-text">
            Need help? 
            <a href="mailto:support@itforyouthghana.org" class="support-link">
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <!-- Visual Elements -->
      <div class="visual-elements">
        <div class="floating-icon icon-1">📚</div>
        <div class="floating-icon icon-2">🎓</div>
        <div class="floating-icon icon-3">🔐</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'UnauthorizedPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    const requestedRoute = ref('')
    const requiredPermissions = ref('')
    
    // Computed properties
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const isStudent = computed(() => userStore.isStudent)
    const isTeacher = computed(() => userStore.isTeacher)
    const isAdmin = computed(() => userStore.isAdmin)
    const userRole = computed(() => {
      if (!userStore.currentUser) return 'Guest'
      return userStore.userRole.charAt(0).toUpperCase() + userStore.userRole.slice(1)
    })
    
    // Methods
    const goToLogin = () => {
      router.push('/login')
    }
    
    const goToHome = () => {
      router.push('/')
    }
    
    const goToCourses = () => {
      if (userStore.hasCoursesAccess) {
        router.push('/student/dashboard')
      } else {
        router.push('/')
      }
    }
    
    const goToStudentDashboard = () => {
      router.push('/student/dashboard')
    }
    
    const goToTeacherDashboard = () => {
      router.push('/teacher/dashboard')
    }
    
    onMounted(() => {
      // Extract information from route
      if (route.query.from) {
        requestedRoute.value = route.query.from
      }
      
      if (route.query.required) {
        requiredPermissions.value = route.query.required
      }
      
      // If user is not authenticated, redirect to login after a delay
      if (!isAuthenticated.value) {
        setTimeout(() => {
          router.push('/login')
        }, 5000)
      }
    })
    
    return {
      requestedRoute,
      requiredPermissions,
      isAuthenticated,
      isStudent,
      isTeacher,
      isAdmin,
      userRole,
      goToLogin,
      goToHome,
      goToCourses,
      goToStudentDashboard,
      goToTeacherDashboard
    }
  }
}
</script>

<style scoped>
.unauthorized-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.unauthorized-container {
  position: relative;
  z-index: 2;
}

.unauthorized-card {
  max-width: 600px;
  width: 100%;
  padding: 3rem;
  text-align: center;
  position: relative;
}

.unauthorized-header {
  margin-bottom: 2.5rem;
}

.icon-wrapper {
  width: 6rem;
  height: 6rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.lock-icon {
  font-size: 3rem;
  color: white;
}

.unauthorized-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.unauthorized-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.error-details {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
}

.detail-item:not(:last-child) {
  border-bottom: 1px solid var(--glass-border);
}

.detail-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.detail-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  font-family: 'Courier New', monospace;
  background: var(--bg-elevated);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  word-break: break-all;
}

.suggestions {
  margin-bottom: 2rem;
}

.suggestions-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  text-align: left;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.suggestion-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--brand-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.suggestion-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.suggestion-content .btn {
  margin-top: 0;
}

.contact-support {
  padding-top: 2rem;
  border-top: 1px solid var(--glass-border);
}

.support-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.support-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.support-link:hover {
  color: var(--brand-accent);
}

/* Visual Elements */
.visual-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.icon-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.icon-2 {
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.icon-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .unauthorized-page {
    padding: 1rem;
  }
  
  .unauthorized-card {
    padding: 2rem;
  }
  
  .unauthorized-title {
    font-size: 2rem;
  }
  
  .suggestion-item {
    flex-direction: column;
    text-align: center;
  }
  
  .suggestion-icon {
    margin: 0 auto;
  }
  
  .detail-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .detail-icon {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .unauthorized-card {
    padding: 1.5rem;
  }
  
  .unauthorized-title {
    font-size: 1.8rem;
  }
  
  .unauthorized-subtitle {
    font-size: 1rem;
  }
  
  .icon-wrapper {
    width: 5rem;
    height: 5rem;
  }
  
  .lock-icon {
    font-size: 2.5rem;
  }
}
</style>