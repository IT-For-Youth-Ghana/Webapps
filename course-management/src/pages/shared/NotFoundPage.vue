<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-card glass-card">
        <!-- Error Number -->
        <div class="error-number">
          <span class="digit">4</span>
          <span class="digit">0</span>
          <span class="digit">4</span>
        </div>

        <!-- Error Message -->
        <div class="error-content">
          <h1 class="error-title">Page Not Found</h1>
          <p class="error-subtitle">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <!-- Visual Element -->
        <div class="error-visual">
          <div class="broken-link">
            <span class="link-icon">🔗</span>
            <span class="broken-line">—</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="error-actions">
          <button class="btn btn-primary btn-large" @click="goToHome">
            Go Home
            <span class="btn-icon">🏠</span>
          </button>
          <button class="btn btn-secondary btn-large" @click="goBack">
            Go Back
            <span class="btn-icon">←</span>
          </button>
        </div>

        <!-- Suggestions -->
        <div class="suggestions">
          <h3 class="suggestions-title">Maybe you're looking for:</h3>
          <div class="suggestion-list">
            <router-link 
              v-if="hasCoursesAccess"
              to="/student/dashboard" 
              class="suggestion-link"
            >
              <span class="suggestion-icon">📚</span>
              <span>Student Dashboard</span>
            </router-link>
            
            <router-link 
              v-if="hasTeachingAccess"
              to="/teacher/dashboard" 
              class="suggestion-link"
            >
              <span class="suggestion-icon">👨‍🏫</span>
              <span>Teacher Dashboard</span>
            </router-link>
            
            <router-link 
              to="/courses/list" 
              class="suggestion-link"
            >
              <span class="suggestion-icon">📖</span>
              <span>Browse Courses</span>
            </router-link>
            
            <router-link 
              v-if="!isAuthenticated"
              to="/login" 
              class="suggestion-link"
            >
              <span class="suggestion-icon">🔐</span>
              <span>Login</span>
            </router-link>
          </div>
        </div>

        <!-- Search -->
        <div class="search-section">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search for courses, topics, or resources..."
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              Search
            </button>
          </div>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <p class="help-text">
            Still can't find what you're looking for?
            <a href="mailto:support@itforyouthghana.org" class="help-link">
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <!-- Background Elements -->
      <div class="background-elements">
        <div class="floating-code code-1">
          <span>&lt;/&gt;</span>
        </div>
        <div class="floating-code code-2">
          <span>{ }</span>
        </div>
        <div class="floating-code code-3">
          <span>[ ]</span>
        </div>
        <div class="floating-code code-4">
          <span>( )</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'NotFoundPage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const searchQuery = ref('')
    
    // Computed properties
    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const hasCoursesAccess = computed(() => userStore.hasCoursesAccess)
    const hasTeachingAccess = computed(() => userStore.hasTeachingAccess)
    
    // Methods
    const goToHome = () => {
      router.push('/')
    }
    
    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }
    
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        // Implement search functionality
        console.log('Searching for:', searchQuery.value)
        // Navigate to search results page
        router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
      }
    }
    
    return {
      searchQuery,
      isAuthenticated,
      hasCoursesAccess,
      hasTeachingAccess,
      goToHome,
      goBack,
      handleSearch
    }
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.not-found-container {
  position: relative;
  z-index: 2;
  text-align: center;
}

.not-found-card {
  max-width: 600px;
  width: 100%;
  padding: 3rem;
  position: relative;
}

.error-number {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.digit {
  font-size: 6rem;
  font-weight: 800;
  color: var(--brand-primary);
  text-shadow: 0 0 20px rgba(37, 99, 235, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.digit:nth-child(1) {
  animation-delay: 0s;
}

.digit:nth-child(2) {
  animation-delay: 0.5s;
}

.digit:nth-child(3) {
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.error-content {
  margin-bottom: 2rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.error-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.error-visual {
  margin-bottom: 2.5rem;
  position: relative;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.broken-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.link-icon {
  font-size: 3rem;
  color: var(--brand-primary);
  animation: shake 3s ease-in-out infinite;
}

.broken-line {
  font-size: 2rem;
  color: var(--text-tertiary);
  transform: rotate(-15deg);
  position: relative;
}

.broken-line::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--text-tertiary);
  transform: translate(-50%, -50%) rotate(-45deg);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.suggestions {
  margin-bottom: 3rem;
}

.suggestions-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
  justify-content: center;
}

.suggestion-link:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.suggestion-icon {
  font-size: 1.2rem;
}

.search-section {
  margin-bottom: 3rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 0.5rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-icon {
  font-size: 1.2rem;
  color: var(--text-tertiary);
  margin-left: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
}

.search-btn:hover {
  background: var(--brand-secondary);
}

.help-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--glass-border);
}

.help-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.help-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: var(--brand-accent);
}

/* Background Elements */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-code {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  color: var(--text-tertiary);
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
}

.code-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.code-2 {
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.code-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.code-4 {
  top: 60%;
  right: 25%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .not-found-page {
    padding: 1rem;
  }
  
  .not-found-card {
    padding: 2rem;
  }
  
  .digit {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-subtitle {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-large {
    width: 100%;
    max-width: 300px;
  }
  
  .search-box {
    margin: 0 1rem;
  }
}

@media (max-width: 480px) {
  .not-found-card {
    padding: 1.5rem;
  }
  
  .digit {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: 1.8rem;
  }
  
  .error-actions {
    gap: 0.75rem;
  }
  
  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}
</style>