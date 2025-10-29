<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card glass-card">
        <!-- Logo and Title -->
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">📚</span>
            <span class="logo-text">Course Management</span>
          </div>
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to access your courses and learning materials</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Error Message -->
          <div v-if="error" class="error-message glass-card">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <div class="input-group">
              <span class="input-icon">📧</span>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="Enter your email"
                :class="{ 'error': errors.email }"
                required
              />
            </div>
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-group">
              <span class="input-icon">🔐</span>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                :class="{ 'error': errors.password }"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="formData.rememberMe" type="checkbox" />
              <span class="checkbox-text">Remember me</span>
            </label>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-large login-btn"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">
              Sign In
              <span class="btn-icon">🚀</span>
            </span>
            <span v-else class="loading-text">
              <span class="spinner">⏳</span>
              Signing in...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-text">OR</span>
        </div>

        <!-- Social Login Options -->
        <div class="social-login">
          <button class="social-btn google-btn" @click="handleGoogleLogin">
            <span class="social-icon">🔍</span>
            Continue with Google
          </button>
          <button class="social-btn github-btn" @click="handleGithubLogin">
            <span class="social-icon">🐙</span>
            Continue with GitHub
          </button>
        </div>

        <!-- Register Link -->
        <div class="register-link">
          <p>
            Don't have an account?
            <a href="#" @click.prevent="goToRegister" class="link">
              Sign up here
            </a>
          </p>
        </div>

        <!-- Demo Accounts -->
        <div class="demo-accounts">
          <h3 class="demo-title">🎯 Demo Accounts</h3>
          <div class="demo-buttons">
            <button class="demo-btn" @click="loginAsDemo('student')">
              <span class="demo-role">👨‍🎓 Student</span>
              <span class="demo-email">student@demo.com</span>
            </button>
            <button class="demo-btn" @click="loginAsDemo('teacher')">
              <span class="demo-role">👨‍🏫 Teacher</span>
              <span class="demo-email">teacher@demo.com</span>
            </button>
            <button class="demo-btn" @click="loginAsDemo('admin')">
              <span class="demo-role">👨‍💼 Admin</span>
              <span class="demo-email">admin@demo.com</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Platform Preview -->
      <div class="platform-preview">
        <div class="preview-card glass-card">
          <h3 class="preview-title">Platform Features</h3>
          <ul class="preview-features">
            <li>📚 Interactive Course Content</li>
            <li>👨‍🏫 Expert Instructor Guidance</li>
            <li>📊 Progress Tracking</li>
            <li>🏆 Certificates & Badges</li>
            <li>💼 Job Integration</li>
            <li>📱 Mobile Learning</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    // Form state
    const formData = reactive({
      email: '',
      password: '',
      rememberMe: false
    })
    
    const showPassword = ref(false)
    const isLoading = ref(false)
    const error = ref('')
    const errors = ref({})
    
    // Demo users
    const demoUsers = {
      student: {
        email: 'student@demo.com',
        password: 'demo123',
        role: 'student',
        modules: ['incubator', 'courses']
      },
      teacher: {
        email: 'teacher@demo.com',
        password: 'demo123',
        role: 'teacher',
        modules: ['courses', 'teaching', 'incubator']
      },
      admin: {
        email: 'admin@demo.com',
        password: 'demo123',
        role: 'admin',
        modules: ['incubator', 'courses', 'admin', 'teaching']
      }
    }
    
    // Methods
    const validateForm = () => {
      errors.value = {}
      
      if (!formData.email.trim()) {
        errors.value.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.value.email = 'Please enter a valid email address'
      }
      
      if (!formData.password.trim()) {
        errors.value.password = 'Password is required'
      } else if (formData.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const handleLogin = async () => {
      if (!validateForm() || isLoading.value) return
      
      isLoading.value = true
      error.value = ''
      
      try {
        const result = await userStore.login(formData.email, formData.password)
        
        if (result.success) {
          // Redirect based on user role and redirect query
          const redirectPath = route.query.redirect || getDefaultRoute(userStore.userRole)
          router.push(redirectPath)
        } else {
          error.value = result.error || 'Login failed. Please try again.'
        }
      } catch (err) {
        console.error('Login error:', err)
        error.value = 'An unexpected error occurred. Please try again.'
      } finally {
        isLoading.value = false
      }
    }
    
    const loginAsDemo = async (role) => {
      const demoUser = demoUsers[role]
      if (!demoUser) return
      
      isLoading.value = true
      error.value = ''
      
      try {
        // Simulate demo login
        formData.email = demoUser.email
        formData.password = demoUser.password
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create mock user
        const mockUser = {
          id: Date.now(),
          name: role === 'student' ? 'Ama Mensah' : role === 'teacher' ? 'Dr. Kwame Asante' : 'Admin User',
          email: demoUser.email,
          role: role,
          modules: demoUser.modules,
          avatar: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
            emailNotifications: true
          }
        }
        
        // Save mock user to local storage
        localStorage.setItem('user', JSON.stringify(mockUser))
        localStorage.setItem('accessToken', 'mock-access-token')
        localStorage.setItem('refreshToken', 'mock-refresh-token')
        
        // Update user store
        userStore.currentUser = mockUser
        
        // Redirect based on role
        const redirectPath = route.query.redirect || getDefaultRoute(role)
        router.push(redirectPath)
        
      } catch (err) {
        console.error('Demo login error:', err)
        error.value = 'Demo login failed. Please try again.'
      } finally {
        isLoading.value = false
      }
    }
    
    const getDefaultRoute = (role) => {
      const routes = {
        student: '/student/dashboard',
        teacher: '/teacher/dashboard',
        admin: '/teacher/dashboard', // Admin can also access teacher dashboard
        company: '/talent/company/dashboard'
      }
      return routes[role] || '/student/dashboard'
    }
    
    const handleForgotPassword = () => {
      console.log('Forgot password clicked')
      // Implement password reset flow
    }
    
    const handleGoogleLogin = () => {
      console.log('Google login clicked')
      // Implement Google OAuth
    }
    
    const handleGithubLogin = () => {
      console.log('GitHub login clicked')
      // Implement GitHub OAuth
    }
    
    const goToRegister = () => {
      router.push('/register')
    }
    
    return {
      formData,
      showPassword,
      isLoading,
      error,
      errors,
      validateForm,
      handleLogin,
      loginAsDemo,
      handleForgotPassword,
      handleGoogleLogin,
      handleGithubLogin,
      goToRegister
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  width: 100%;
}

.login-card {
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  justify-self: center;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-primary);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #ef4444;
}

.error-icon {
  font-size: 1.2rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.1rem;
  color: var(--text-tertiary);
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.checkbox-text {
  user-select: none;
}

.forgot-password {
  color: var(--brand-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--brand-accent);
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 1rem;
  font-size: 1.1rem;
  margin-bottom: 0;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-primary);
}

.divider-text {
  padding: 0 1rem;
  color: var(--text-tertiary);
  font-size: 0.9rem;
  font-weight: 500;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: var(--bg-elevated);
  transform: translateY(-1px);
}

.google-btn:hover {
  border-color: #ea4335;
  color: #ea4335;
}

.github-btn:hover {
  border-color: #333;
  color: #fff;
  background: #333;
}

.register-link {
  text-align: center;
  margin-bottom: 2rem;
}

.register-link p {
  color: var(--text-secondary);
  margin: 0;
}

.link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--brand-accent);
}

.demo-accounts {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.demo-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 1rem;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-btn:hover {
  background: var(--bg-tertiary);
  transform: translateX(4px);
}

.demo-role {
  font-weight: 600;
  color: var(--text-primary);
}

.demo-email {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.platform-preview {
  display: flex;
  align-items: center;
}

.preview-card {
  padding: 2rem;
  text-align: center;
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.preview-features {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.preview-features li {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .login-card {
    padding: 2rem;
  }
  
  .login-title {
    font-size: 1.8rem;
  }
  
  .platform-preview {
    display: none;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .logo {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style>