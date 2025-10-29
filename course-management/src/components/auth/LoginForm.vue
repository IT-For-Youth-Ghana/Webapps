<template>
  <div class="login-container">
    <div class="login-card card">
      <div class="login-header">
        <h1 class="login-title">Welcome to Ghana LMS</h1>
        <p class="login-subtitle">Sign in to access your learning dashboard</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input-field"
            :class="{ 'error': errors.email }"
            placeholder="Enter your email address"
            required
            autocomplete="email"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input-field"
              :class="{ 'error': errors.password }"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              aria-label="Toggle password visibility"
            >
              <span v-if="showPassword">Hide</span>
              <span v-else>Show</span>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Remember me</span>
          </label>

          <router-link to="/auth/forgot-password" class="forgot-link">
            Forgot password?
          </router-link>
        </div>

        <div v-if="errors.general" class="error-banner">
          {{ errors.general }}
        </div>

        <button
          type="submit"
          class="btn-primary login-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="login-footer">
        <p class="signup-prompt">
          Don't have an account?
          <router-link to="/auth/register" class="signup-link">
            Create Account
          </router-link>
        </p>
      </div>

      <div class="role-demo">
        <p class="demo-title">Demo Accounts:</p>
        <div class="demo-buttons">
          <button
            v-for="role in demoRoles"
            :key="role.type"
            @click="fillDemoCredentials(role)"
            class="btn-secondary demo-btn"
          >
            {{ role.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const isLoading = ref(false)
    const showPassword = ref(false)
    
    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    })
    
    const errors = reactive({
      email: '',
      password: '',
      general: ''
    })
    
    const demoRoles = [
      {
        type: 'student',
        label: 'Student Demo',
        email: 'student@demo.com',
        password: 'demo123'
      },
      {
        type: 'teacher',
        label: 'Teacher Demo',
        email: 'teacher@demo.com',
        password: 'demo123'
      },
      {
        type: 'admin',
        label: 'Admin Demo',
        email: 'admin@demo.com',
        password: 'demo123'
      }
    ]
    
    const validateForm = () => {
      errors.email = ''
      errors.password = ''
      errors.general = ''
      
      let isValid = true
      
      if (!form.email) {
        errors.email = 'Email is required'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'Please enter a valid email address'
        isValid = false
      }
      
      if (!form.password) {
        errors.password = 'Password is required'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
      }
      
      return isValid
    }
    
    const handleLogin = async () => {
      if (!validateForm()) return
      
      isLoading.value = true
      
      try {
        const loginData = {
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe
        }
        
        const result = await userStore.login(loginData)
        
        if (result.success) {
          // Redirect based on user role
          const redirectPath = getRedirectPath(result.user.role)
          router.push(redirectPath)
        } else {
          errors.general = result.message || 'Login failed. Please try again.'
        }
      } catch (error) {
        console.error('Login error:', error)
        errors.general = 'An unexpected error occurred. Please try again.'
      } finally {
        isLoading.value = false
      }
    }
    
    const getRedirectPath = (role) => {
      const rolePaths = {
        'student': '/student/dashboard',
        'teacher': '/teacher/dashboard',
        'admin': '/admin/dashboard'
      }
      return rolePaths[role] || '/dashboard'
    }
    
    const fillDemoCredentials = (role) => {
      form.email = role.email
      form.password = role.password
      form.rememberMe = false
    }
    
    return {
      form,
      errors,
      isLoading,
      showPassword,
      demoRoles,
      handleLogin,
      fillDemoCredentials
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-primary);
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
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
  font-size: 0.875rem;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.checkbox-input {
  opacity: 0;
  position: absolute;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.forgot-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--brand-secondary);
}

.error-message {
  color: var(--status-error-text);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.error-banner {
  background: var(--status-error);
  color: var(--status-error-text);
  border: 1px solid var(--status-error-border);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.input-field.error {
  border-color: var(--status-error-text);
}

.login-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.login-footer {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-prompt {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.signup-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
}

.signup-link:hover {
  color: var(--brand-secondary);
}

.role-demo {
  border-top: 1px solid var(--border-primary);
  padding-top: 1.5rem;
  text-align: center;
}

.demo-title {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.demo-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-btn {
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .demo-buttons {
    flex-direction: column;
  }

  .demo-btn {
    width: 100%;
  }
}
</style>