<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <img src="/logo/logo.svg" alt="IT Youth Talent Incubator" class="logo-image" />
          <span class="logo-text">IT Youth Talent</span>
        </router-link>
        <h1 class="page-title">Company Registration</h1>
        <p class="page-subtitle">Create your company account to start hiring</p>
      </div>

      <form @submit.prevent="handleSubmit" class="register-form">
        <!-- Company Information -->
        <div class="form-section">
          <h3 class="section-title">Company Information</h3>

          <div class="form-group">
            <label for="companyName">Company Name *</label>
            <input
              id="companyName"
              v-model="form.name"
              type="text"
              required
              placeholder="Enter your company name"
              :class="{ error: errors.name }"
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="industry">Industry *</label>
            <select id="industry" v-model="form.industry" required :class="{ error: errors.industry }">
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance & Banking</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
              <option value="media">Media & Entertainment</option>
              <option value="other">Other</option>
            </select>
            <span v-if="errors.industry" class="error-text">{{ errors.industry }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="companySize">Company Size *</label>
              <select id="companySize" v-model="form.size" required>
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div class="form-group">
              <label for="website">Company Website</label>
              <input
                id="website"
                v-model="form.website"
                type="url"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Company Description *</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              required
              placeholder="Tell us about your company..."
              :class="{ error: errors.description }"
            ></textarea>
            <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
          </div>

          <div class="form-group">
            <label for="location">Location *</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              required
              placeholder="City, Country"
              :class="{ error: errors.location }"
            />
            <span v-if="errors.location" class="error-text">{{ errors.location }}</span>
          </div>
        </div>

        <!-- Contact Person -->
        <div class="form-section">
          <h3 class="section-title">Contact Person</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="contactFirstName">First Name *</label>
              <input
                id="contactFirstName"
                v-model="form.contact_first_name"
                type="text"
                required
                placeholder="John"
                :class="{ error: errors.contact_first_name }"
              />
              <span v-if="errors.contact_first_name" class="error-text">{{ errors.contact_first_name }}</span>
            </div>

            <div class="form-group">
              <label for="contactLastName">Last Name *</label>
              <input
                id="contactLastName"
                v-model="form.contact_last_name"
                type="text"
                required
                placeholder="Doe"
                :class="{ error: errors.contact_last_name }"
              />
              <span v-if="errors.contact_last_name" class="error-text">{{ errors.contact_last_name }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="contactEmail">Email Address *</label>
            <input
              id="contactEmail"
              v-model="form.email"
              type="email"
              required
              placeholder="contact@company.com"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="contactPhone">Phone Number</label>
            <input
              id="contactPhone"
              v-model="form.phone"
              type="tel"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <!-- Account Security -->
        <div class="form-section">
          <h3 class="section-title">Account Security</h3>

          <div class="form-group">
            <label for="password">Password *</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="Create a strong password"
              :class="{ error: errors.password }"
            />
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            <p class="field-hint">At least 8 characters with uppercase, lowercase, and numbers</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              v-model="form.confirm_password"
              type="password"
              required
              placeholder="Confirm your password"
              :class="{ error: errors.confirm_password }"
            />
            <span v-if="errors.confirm_password" class="error-text">{{ errors.confirm_password }}</span>
          </div>
        </div>

        <!-- Terms -->
        <div class="form-section">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.agree_terms" required />
            <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
          </label>
          <span v-if="errors.agree_terms" class="error-text">{{ errors.agree_terms }}</span>
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading">Creating Account...</span>
            <span v-else>Create Company Account</span>
          </button>
        </div>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link to="/login">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  name: '',
  industry: '',
  size: '',
  website: '',
  description: '',
  location: '',
  contact_first_name: '',
  contact_last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  agree_terms: false
})

const errors = reactive({
  name: '',
  industry: '',
  description: '',
  location: '',
  contact_first_name: '',
  contact_last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  agree_terms: ''
})

function validateForm() {
  let isValid = true
  Object.keys(errors).forEach(key => errors[key] = '')

  if (!form.name || form.name.length < 2) {
    errors.name = 'Company name is required (min 2 characters)'
    isValid = false
  }

  if (!form.industry) {
    errors.industry = 'Please select an industry'
    isValid = false
  }

  if (!form.description || form.description.length < 50) {
    errors.description = 'Description must be at least 50 characters'
    isValid = false
  }

  if (!form.location) {
    errors.location = 'Location is required'
    isValid = false
  }

  if (!form.contact_first_name || form.contact_first_name.length < 2) {
    errors.contact_first_name = 'First name is required'
    isValid = false
  }

  if (!form.contact_last_name || form.contact_last_name.length < 2) {
    errors.contact_last_name = 'Last name is required'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email || !emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!form.password || !passwordRegex.test(form.password)) {
    errors.password = 'Password must be 8+ chars with uppercase, lowercase, and number'
    isValid = false
  }

  if (form.password !== form.confirm_password) {
    errors.confirm_password = 'Passwords do not match'
    isValid = false
  }

  if (!form.agree_terms) {
    errors.agree_terms = 'You must agree to the terms'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const result = await authStore.register({
      role: 'company',
      email: form.email,
      password: form.password,
      company_name: form.name,
      industry: form.industry,
      company_size: form.size,
      website: form.website,
      description: form.description,
      location: form.location,
      first_name: form.contact_first_name,
      last_name: form.contact_last_name,
      phone: form.phone
    })

    if (result.success) {
      successMessage.value = result.message || 'Registration successful! Please check your email.'
      setTimeout(() => {
        router.push({ name: 'Login', query: { registered: 'company' } })
      }, 2000)
    } else {
      errorMessage.value = result.message || 'Registration failed. Please try again.'
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, v-bind('COLORS.background') 0%, #e8eef5 100%);
}

.auth-container {
  width: 100%;
  max-width: 600px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.logo-image {
  width: 48px;
  height: 48px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind('COLORS.primary');
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: v-bind('COLORS.textLight');
  margin: 0;
}

.register-form {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-of-type {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('COLORS.text');
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid v-bind('COLORS.background');
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('COLORS.text');
  margin-bottom: 0.375rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid v-bind('COLORS.border');
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: v-bind('COLORS.primary');
  box-shadow: 0 0 0 3px v-bind('COLORS.primary + "20"');
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: v-bind('COLORS.error');
}

.error-text {
  display: block;
  font-size: 0.75rem;
  color: v-bind('COLORS.error');
  margin-top: 0.25rem;
}

.field-hint {
  font-size: 0.75rem;
  color: v-bind('COLORS.textLight');
  margin: 0.25rem 0 0 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 0.25rem;
}

.checkbox-label span {
  font-size: 0.875rem;
  color: v-bind('COLORS.textLight');
}

.checkbox-label a {
  color: v-bind('COLORS.primary');
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: v-bind('COLORS.primary');
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: v-bind('COLORS.primaryDark');
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: v-bind('COLORS.success + "15"');
  color: v-bind('COLORS.success');
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: v-bind('COLORS.error + "15"');
  color: v-bind('COLORS.error');
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.auth-footer p {
  color: v-bind('COLORS.textLight');
  font-size: 0.875rem;
}

.auth-footer a {
  color: v-bind('COLORS.primary');
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
