<!-- 
🚀 IT Youth Talent Incubator - Login Authentication Component

PURPOSE: A secure and user-friendly login interface that handles authentication for both
students and administrators with comprehensive validation and error handling.

WHAT IT DOES:
- Provides secure login functionality for students and administrators
- Validates email format and password strength requirements
- Handles authentication with loading states and error feedback
- Supports "Remember Me" functionality for persistent sessions
- Includes demo credentials for testing and development
- Provides navigation links to registration and password recovery
- Displays clear error messages for failed authentication attempts

FOR CO-PROGRAMMERS:
- Form data stored in reactive refs: email, password, rememberMe (lines 9-13)
- Validation functions: validateEmail(), validateForm() (lines 19-51)
- Authentication logic in handleLogin() function (lines 53-82)
- Mock credentials for demo: admin@itforyouth.gh/admin123, student@test.com/student123
- Navigation functions: goToRegister(), goToForgotPassword() (lines 84-92)
- Real-time validation with error display for each form field

VALIDATION FEATURES:
- Email format validation using regex pattern
- Password minimum length requirement (6+ characters)
- Real-time error feedback with field-level error states
- Form submission prevention when validation fails
- Loading state management during authentication process

SECURITY CONSIDERATIONS:
- Password field uses secure input type
- Client-side validation (server-side validation needed)
- Error handling prevents information disclosure
- Remember Me option for session persistence
- Demo credentials clearly marked for development only

USER EXPERIENCE:
- Clean, professional form design with consistent styling
- Loading spinner during authentication process
- Clear error messages for failed login attempts
- Responsive design optimized for mobile devices
- Accessible form labels and keyboard navigation
- Demo credentials visible for easy testing

TODO ITEMS:
- Replace mock authentication with real API calls
- Implement proper routing for login success/failure
- Add password recovery functionality
- Implement session management and token handling
- Add support for social login providers (Google, GitHub, etc.)
-->
<script setup>
import { ref } from 'vue'

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Form validation
const emailError = ref('')
const passwordError = ref('')

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  emailError.value = ''
  passwordError.value = ''
  errorMessage.value = ''
  
  // Email validation
  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }
  
  // Password validation
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // TODO: Replace with actual authentication API call
    // Example: const response = await authAPI.login(email.value, password.value, rememberMe.value)
    console.log('Login attempt:', { email: email.value, password: password.value, rememberMe: rememberMe.value })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock authentication logic for demo purposes
    if (email.value === 'admin@itforyouth.gh' && password.value === 'admin123') {
      console.log('Login successful - Admin user')
      // TODO: Store authentication token and user data
      // TODO: Navigate to admin dashboard component (Dashboard.vue)
    } else if (email.value.includes('student') && password.value === 'student123') {
      console.log('Login successful - Student user')
      // TODO: Store authentication token and user data
      // TODO: Navigate to student profile or job browsing page
    } else {
      throw new Error('Invalid email or password')
    }
    
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goToRegister = () => {
  // TODO: Navigate to register page
  console.log('Navigate to register page')
}

const goToForgotPassword = () => {
  // TODO: Navigate to forgot password page
  console.log('Navigate to forgot password page')
}
</script>

<template>
  <div>
    <h1>Welcome Back</h1>
    <p class="subtitle">Sign in to your IT Youth Talent Incubator account</p>
    
    <!-- Login Form -->
    <div class="section-container">
      <h2>Login</h2>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-banner">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <!-- Email Field -->
        <div class="form-row">
          <div class="form-field full-width">
            <label for="email" class="form-label">Email Address:</label>
            <input 
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :class="{ 'error': emailError }"
              placeholder="Enter your email address"
              required
            >
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-row">
          <div class="form-field full-width">
            <label for="password" class="form-label">Password:</label>
            <input 
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              :class="{ 'error': passwordError }"
              placeholder="Enter your password"
              required
            >
            <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-row">
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" class="checkbox">
              <span class="checkbox-text">Remember me</span>
            </label>
            
            <button type="button" @click="goToForgotPassword" class="link-button">
              Forgot Password?
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-row">
          <button 
            type="submit" 
            class="btn-primary full-width"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </div>
      </form>

      <!-- Register Link -->
      <div class="form-footer">
        <p class="register-text">
          Don't have an account? 
          <button @click="goToRegister" class="link-button strong">
            Create Account
          </button>
        </p>
      </div>

      <!-- Demo Credentials -->
      <div class="demo-credentials">
        <h3>Demo Credentials:</h3>
        <p><strong>Admin:</strong> admin@itforyouth.gh / admin123</p>
        <p><strong>Student:</strong> student@test.com / student123</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container - same as ApplicationForm */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
  max-width: 500px;
  margin: 0 auto 32px auto;
}

/* Form styling - same as ApplicationForm */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.form-field {
  flex: 1;
}

.full-width {
  flex: 1 1 100%;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #003a9b;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #004dc5;
  box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.field-error {
  display: block;
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

/* Error Banner */
.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
}

/* Form Options (Remember me + Forgot password) */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #004dc5;
}

.checkbox-text {
  user-select: none;
}

.link-button {
  background: none;
  border: none;
  color: #004dc5;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: #003a9b;
}

.link-button.strong {
  font-weight: 600;
}

/* Buttons - same style as ApplicationForm */
.btn-primary {
  background-color: #004dc5;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #003a9b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.3);
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: 18px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Form Footer */
.form-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
  margin-top: 20px;
}

.register-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* Demo Credentials */
.demo-credentials {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  margin-top: 20px;
}

.demo-credentials h3 {
  color: #374151;
  font-size: 14px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.demo-credentials p {
  color: #6b7280;
  font-size: 13px;
  margin: 4px 0;
  font-family: monospace;
}

/* Title styling - same as ApplicationForm */
h1 {
  color: white;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
}

h2 {
  color: #003a9b;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid #004dc5;
  padding-bottom: 8px;
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .section-container {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>