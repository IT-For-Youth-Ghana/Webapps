<!-- 
🚀 IT Youth Talent Incubator - Student Registration Component

PURPOSE: A comprehensive student registration form that collects all necessary information
for enrollment in the IT Youth Talent Incubator program with thorough validation.

WHAT IT DOES:
- Collects complete student profile information across multiple categories
- Validates all form fields with real-time feedback and error handling
- Enforces strong password requirements for account security
- Collects educational background and technical skills information
- Requires agreement to terms and conditions before account creation
- Provides success feedback and automatic navigation after registration
- Implements comprehensive form validation with detailed error messages

FOR CO-PROGRAMMERS:
- Form data organized in logical sections: Personal, Education, Security (lines 8-33)
- Comprehensive validation with individual field error tracking (lines 24-33)
- Strong password requirements: 8+ chars, uppercase, lowercase, number (lines 98-107)
- Form submission logic in handleRegister() function (lines 145-182)
- Form reset functionality after successful registration (lines 184-195)
- Phone number validation with international format support (lines 40-43)

FORM SECTIONS:
1. Personal Information: First name, last name, email, phone number
2. Education: University/institution, field of study, technical skills
3. Account Security: Password creation with confirmation
4. Terms & Conditions: Legal agreement requirement

VALIDATION RULES:
- Name fields: Minimum 2 characters each
- Email: Valid email format with regex validation
- Phone: International format support with 10+ digits
- Password: 8+ characters with mixed case and numbers
- University & Study Field: Required text fields
- Skills: Required technical skills description
- Terms: Must agree to proceed with registration

USER EXPERIENCE FEATURES:
- Organized sections with visual separators and icons
- Real-time validation feedback with field-level errors
- Loading states during registration process
- Success message with automatic form reset
- Clear navigation to login page after registration
- Responsive design optimized for mobile devices
- Accessible form structure with proper labeling

DATA COLLECTION:
- Personal details for profile creation
- Educational background for program matching
- Technical skills for job recommendation algorithms
- Contact information for communication
- Secure password for account protection

SECURITY FEATURES:
- Password strength requirements enforced
- Email validation to prevent fake registrations
- Terms agreement requirement for legal compliance
- Client-side validation (server-side validation also needed)
- Form data sanitization and validation

TODO ITEMS:
- Replace mock registration with real API integration
- Add email verification process after registration
- Implement proper routing after successful registration
- Add support for profile picture upload
- Integrate with university verification system
- Add skill suggestions or autocomplete functionality
-->
<script setup>
import { ref } from 'vue'

// Form data
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const university = ref('')
const studyField = ref('')
const skills = ref('')
const agreeToTerms = ref(false)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form validation errors
const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const universityError = ref('')
const studyFieldError = ref('')
const skillsError = ref('')
const termsError = ref('')

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  firstNameError.value = ''
  lastNameError.value = ''
  emailError.value = ''
  phoneError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  universityError.value = ''
  studyFieldError.value = ''
  skillsError.value = ''
  termsError.value = ''
  errorMessage.value = ''
  
  // First name validation
  if (!firstName.value.trim()) {
    firstNameError.value = 'First name is required'
    isValid = false
  } else if (firstName.value.trim().length < 2) {
    firstNameError.value = 'First name must be at least 2 characters'
    isValid = false
  }
  
  // Last name validation
  if (!lastName.value.trim()) {
    lastNameError.value = 'Last name is required'
    isValid = false
  } else if (lastName.value.trim().length < 2) {
    lastNameError.value = 'Last name must be at least 2 characters'
    isValid = false
  }
  
  // Email validation
  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }
  
  // Phone validation
  if (!phone.value) {
    phoneError.value = 'Phone number is required'
    isValid = false
  } else if (!validatePhone(phone.value)) {
    phoneError.value = 'Please enter a valid phone number'
    isValid = false
  }
  
  // Password validation
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
    passwordError.value = 'Password must contain uppercase, lowercase, and number'
    isValid = false
  }
  
  // Confirm password validation
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }
  
  // University validation
  if (!university.value.trim()) {
    universityError.value = 'University/Institution is required'
    isValid = false
  }
  
  // Study field validation
  if (!studyField.value.trim()) {
    studyFieldError.value = 'Field of study is required'
    isValid = false
  }
  
  // Skills validation
  if (!skills.value.trim()) {
    skillsError.value = 'Please list at least some skills'
    isValid = false
  }
  
  // Terms validation
  if (!agreeToTerms.value) {
    termsError.value = 'You must agree to the terms and conditions'
    isValid = false
  }
  
  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // TODO: Replace with actual registration API call
    // Example: const response = await authAPI.register(userData)
    const userData = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      university: university.value,
      studyField: studyField.value,
      skills: skills.value,
      // Note: password should be hashed on the server side
      password: password.value
    }
    console.log('Registration attempt:', userData)
    
    // Simulate API registration process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock success response for demo
    successMessage.value = 'Account created successfully! Please check your email for verification.'
    
    // Auto-redirect after successful registration
    setTimeout(() => {
      resetForm()
      // TODO: Navigate to login page or email verification page
      // TODO: Send welcome email with verification link
      console.log('Navigate to login page with success message')
    }, 2000)
    
  } catch (error) {
    errorMessage.value = error.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  phone.value = ''
  password.value = ''
  confirmPassword.value = ''
  university.value = ''
  studyField.value = ''
  skills.value = ''
  agreeToTerms.value = false
}

const goToLogin = () => {
  // TODO: Navigate to login page
  console.log('Navigate to login page')
}
</script>

<template>
  <div>
    <h1>Join IT for Youth Ghana</h1>
    <p class="subtitle">Create your account to start your IT career journey</p>
    
    <!-- Registration Form -->
    <div class="section-container">
      <h2>Create Account</h2>
      
      <!-- Success Message -->
      <div v-if="successMessage" class="success-banner">
        <span class="success-icon">✅</span>
        {{ successMessage }}
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-banner">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <!-- Personal Information -->
        <div class="form-section">
          <h3>Personal Information</h3>
          
          <!-- Name Fields -->
          <div class="form-row">
            <div class="form-field">
              <label for="firstName" class="form-label">First Name:</label>
              <input 
                id="firstName"
                v-model="firstName"
                type="text"
                class="form-input"
                :class="{ 'error': firstNameError }"
                placeholder="Enter your first name"
                required
              >
              <span v-if="firstNameError" class="field-error">{{ firstNameError }}</span>
            </div>
            
            <div class="form-field">
              <label for="lastName" class="form-label">Last Name:</label>
              <input 
                id="lastName"
                v-model="lastName"
                type="text"
                class="form-input"
                :class="{ 'error': lastNameError }"
                placeholder="Enter your last name"
                required
              >
              <span v-if="lastNameError" class="field-error">{{ lastNameError }}</span>
            </div>
          </div>

          <!-- Contact Fields -->
          <div class="form-row">
            <div class="form-field">
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
            
            <div class="form-field">
              <label for="phone" class="form-label">Phone Number:</label>
              <input 
                id="phone"
                v-model="phone"
                type="tel"
                class="form-input"
                :class="{ 'error': phoneError }"
                placeholder="e.g. +233 24 123 4567"
                required
              >
              <span v-if="phoneError" class="field-error">{{ phoneError }}</span>
            </div>
          </div>
        </div>

        <!-- Education Information -->
        <div class="form-section">
          <h3>Education</h3>
          
          <div class="form-row">
            <div class="form-field">
              <label for="university" class="form-label">University/Institution:</label>
              <input 
                id="university"
                v-model="university"
                type="text"
                class="form-input"
                :class="{ 'error': universityError }"
                placeholder="e.g. University of Ghana"
                required
              >
              <span v-if="universityError" class="field-error">{{ universityError }}</span>
            </div>
            
            <div class="form-field">
              <label for="studyField" class="form-label">Field of Study:</label>
              <input 
                id="studyField"
                v-model="studyField"
                type="text"
                class="form-input"
                :class="{ 'error': studyFieldError }"
                placeholder="e.g. Computer Science"
                required
              >
              <span v-if="studyFieldError" class="field-error">{{ studyFieldError }}</span>
            </div>
          </div>

          <!-- Skills Field -->
          <div class="form-row">
            <div class="form-field full-width">
              <label for="skills" class="form-label">Technical Skills:</label>
              <textarea 
                id="skills"
                v-model="skills"
                class="form-textarea"
                :class="{ 'error': skillsError }"
                rows="3"
                placeholder="List your technical skills (e.g. JavaScript, Python, HTML/CSS, React, etc.)"
                required
              ></textarea>
              <span v-if="skillsError" class="field-error">{{ skillsError }}</span>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="form-section">
          <h3>Account Security</h3>
          
          <div class="form-row">
            <div class="form-field">
              <label for="password" class="form-label">Password:</label>
              <input 
                id="password"
                v-model="password"
                type="password"
                class="form-input"
                :class="{ 'error': passwordError }"
                placeholder="Create a strong password"
                required
              >
              <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
            </div>
            
            <div class="form-field">
              <label for="confirmPassword" class="form-label">Confirm Password:</label>
              <input 
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="form-input"
                :class="{ 'error': confirmPasswordError }"
                placeholder="Confirm your password"
                required
              >
              <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="form-row">
          <div class="form-field full-width">
            <label class="checkbox-label">
              <input type="checkbox" v-model="agreeToTerms" class="checkbox">
              <span class="checkbox-text">
                I agree to the 
                <button type="button" class="link-button">Terms and Conditions</button>
                and 
                <button type="button" class="link-button">Privacy Policy</button>
              </span>
            </label>
            <span v-if="termsError" class="field-error">{{ termsError }}</span>
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
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>
      </form>

      <!-- Login Link -->
      <div class="form-footer">
        <p class="login-text">
          Already have an account? 
          <button @click="goToLogin" class="link-button strong">
            Sign In
          </button>
        </p>
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
  max-width: 700px;
  margin: 0 auto 32px auto;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 20px;
}

.form-section h3 {
  color: #003a9b;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.form-section h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background-color: #004dc5;
  margin-right: 8px;
  border-radius: 2px;
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

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #004dc5;
  box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
}

.form-input.error, .form-textarea.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-error {
  display: block;
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

/* Success Banner */
.success-banner {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #166534;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-icon {
  font-size: 16px;
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

/* Checkbox styling */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.checkbox {
  margin-right: 8px;
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: #004dc5;
  flex-shrink: 0;
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
  padding: 0;
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

.login-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
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
  
  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
  }
}
</style>