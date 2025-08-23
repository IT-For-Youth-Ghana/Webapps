<!-- 
  Profile Form Component
  Student profile editing form with comprehensive information
-->
<script setup>
import { ref } from 'vue'

// Form data
const firstName = ref('Kwame')
const lastName = ref('Asante')
const email = ref('kwame.asante@student.ug.edu.gh')
const phone = ref('+233 24 567 8900')
const location = ref('Accra, Ghana')
const bio = ref('Passionate computer science student with keen interest in web development and mobile applications. Looking for internship opportunities to gain hands-on experience.')

// Education
const university = ref('University of Ghana')
const degree = ref('Bachelor of Science')
const fieldOfStudy = ref('Computer Science')
const currentSemester = ref(6)
const graduationYear = ref(2025)
const gpa = ref('3.4')

// Skills
const skillInput = ref('')
const skills = ref(['JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'Git', 'MongoDB', 'Express.js'])

// Social Links
const linkedinUrl = ref('https://linkedin.com/in/kwameasante')
const githubUrl = ref('https://github.com/kwameasante')
const portfolioUrl = ref('https://kwameasante.dev')

// Experience
const experiences = ref([
  {
    id: 1,
    title: 'Web Development Intern',
    company: 'TechStart Ghana',
    location: 'Accra, Ghana',
    startDate: '2024-06',
    endDate: '2024-08',
    current: false,
    description: 'Developed responsive web applications using React and Node.js. Collaborated with design team to implement user-friendly interfaces.'
  }
])

// Privacy Settings
const profileVisibility = ref('public')
const showEmail = ref(false)
const showPhone = ref(false)

// Form state
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const addSkill = () => {
  if (skillInput.value.trim() && !skills.value.includes(skillInput.value.trim())) {
    skills.value.push(skillInput.value.trim())
    skillInput.value = ''
  }
}

const removeSkill = (skill) => {
  const index = skills.value.indexOf(skill)
  if (index > -1) {
    skills.value.splice(index, 1)
  }
}

const addExperience = () => {
  experiences.value.push({
    id: Date.now(),
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })
}

const removeExperience = (id) => {
  experiences.value = experiences.value.filter(exp => exp.id !== id)
}

const handleSave = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    // TODO: Implement actual save API call
    console.log('Saving profile:', {
      personal: { firstName: firstName.value, lastName: lastName.value, email: email.value },
      education: { university: university.value, degree: degree.value },
      skills: skills.value,
      experiences: experiences.value
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    successMessage.value = 'Profile updated successfully!'
    
  } catch (error) {
    errorMessage.value = error.message || 'Failed to save profile. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  console.log('Cancel profile editing')
  // TODO: Reset form or navigate back
}
</script>

<template>
  <div>
    <h1>Edit Profile</h1>
    <p class="subtitle">Update your professional profile information</p>
    
    <form @submit.prevent="handleSave" class="profile-form">
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

      <!-- Personal Information -->
      <div class="section-container">
        <h2>Personal Information</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="firstName" class="form-label">First Name:</label>
            <input 
              id="firstName"
              v-model="firstName"
              type="text"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-field">
            <label for="lastName" class="form-label">Last Name:</label>
            <input 
              id="lastName"
              v-model="lastName"
              type="text"
              class="form-input"
              required
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="email" class="form-label">Email Address:</label>
            <input 
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-field">
            <label for="phone" class="form-label">Phone Number:</label>
            <input 
              id="phone"
              v-model="phone"
              type="tel"
              class="form-input"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field full-width">
            <label for="location" class="form-label">Location:</label>
            <input 
              id="location"
              v-model="location"
              type="text"
              class="form-input"
              placeholder="City, Country"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field full-width">
            <label for="bio" class="form-label">Bio/About Me:</label>
            <textarea 
              id="bio"
              v-model="bio"
              class="form-textarea"
              rows="4"
              placeholder="Tell us about yourself, your interests, and career goals..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Education -->
      <div class="section-container">
        <h2>Education</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="university" class="form-label">University/Institution:</label>
            <input 
              id="university"
              v-model="university"
              type="text"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-field">
            <label for="degree" class="form-label">Degree:</label>
            <input 
              id="degree"
              v-model="degree"
              type="text"
              class="form-input"
              required
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="fieldOfStudy" class="form-label">Field of Study:</label>
            <input 
              id="fieldOfStudy"
              v-model="fieldOfStudy"
              type="text"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-field">
            <label for="graduationYear" class="form-label">Graduation Year:</label>
            <input 
              id="graduationYear"
              v-model="graduationYear"
              type="number"
              class="form-input"
              min="2024"
              max="2030"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="currentSemester" class="form-label">Current Semester:</label>
            <input 
              id="currentSemester"
              v-model="currentSemester"
              type="number"
              class="form-input"
              min="1"
              max="12"
            >
          </div>
          
          <div class="form-field">
            <label for="gpa" class="form-label">GPA (optional):</label>
            <input 
              id="gpa"
              v-model="gpa"
              type="text"
              class="form-input"
              placeholder="e.g. 3.4"
            >
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="section-container">
        <h2>Technical Skills</h2>
        
        <div class="form-row">
          <div class="form-field full-width">
            <label for="skillInput" class="form-label">Add Skills:</label>
            <div class="skill-input-container">
              <input 
                id="skillInput"
                v-model="skillInput"
                type="text"
                class="form-input"
                placeholder="Type a skill and press Enter"
                @keyup.enter="addSkill"
              >
              <button type="button" @click="addSkill" class="btn-secondary">Add</button>
            </div>
          </div>
        </div>

        <div class="skills-display">
          <span 
            v-for="skill in skills" 
            :key="skill" 
            class="skill-tag removable"
            @click="removeSkill(skill)"
          >
            {{ skill }}
            <span class="remove-skill">×</span>
          </span>
        </div>
      </div>

      <!-- Experience -->
      <div class="section-container">
        <h2>Work Experience</h2>
        
        <div v-for="(experience, index) in experiences" :key="experience.id" class="experience-item">
          <div class="experience-header">
            <h3>Experience {{ index + 1 }}</h3>
            <button 
              type="button" 
              @click="removeExperience(experience.id)" 
              class="btn-danger btn-small"
              v-if="experiences.length > 1"
            >
              Remove
            </button>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Job Title:</label>
              <input 
                v-model="experience.title"
                type="text"
                class="form-input"
                placeholder="e.g. Frontend Developer Intern"
              >
            </div>
            
            <div class="form-field">
              <label class="form-label">Company:</label>
              <input 
                v-model="experience.company"
                type="text"
                class="form-input"
                placeholder="Company name"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Location:</label>
              <input 
                v-model="experience.location"
                type="text"
                class="form-input"
                placeholder="City, Country"
              >
            </div>
            
            <div class="form-field">
              <label class="form-label">Start Date:</label>
              <input 
                v-model="experience.startDate"
                type="month"
                class="form-input"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="experience.current"
                  class="checkbox"
                >
                <span class="checkbox-text">I currently work here</span>
              </label>
            </div>
            
            <div class="form-field" v-if="!experience.current">
              <label class="form-label">End Date:</label>
              <input 
                v-model="experience.endDate"
                type="month"
                class="form-input"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-field full-width">
              <label class="form-label">Description:</label>
              <textarea 
                v-model="experience.description"
                class="form-textarea"
                rows="3"
                placeholder="Describe your responsibilities and achievements..."
              ></textarea>
            </div>
          </div>
        </div>

        <button type="button" @click="addExperience" class="btn-secondary">
          + Add Experience
        </button>
      </div>

      <!-- Social Links -->
      <div class="section-container">
        <h2>Social Links</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="linkedinUrl" class="form-label">LinkedIn Profile:</label>
            <input 
              id="linkedinUrl"
              v-model="linkedinUrl"
              type="url"
              class="form-input"
              placeholder="https://linkedin.com/in/yourprofile"
            >
          </div>
          
          <div class="form-field">
            <label for="githubUrl" class="form-label">GitHub Profile:</label>
            <input 
              id="githubUrl"
              v-model="githubUrl"
              type="url"
              class="form-input"
              placeholder="https://github.com/yourusername"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field full-width">
            <label for="portfolioUrl" class="form-label">Portfolio Website:</label>
            <input 
              id="portfolioUrl"
              v-model="portfolioUrl"
              type="url"
              class="form-input"
              placeholder="https://yourportfolio.com"
            >
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="section-container">
        <h2>Privacy Settings</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="profileVisibility" class="form-label">Profile Visibility:</label>
            <select id="profileVisibility" v-model="profileVisibility" class="form-input">
              <option value="public">Public - Visible to everyone</option>
              <option value="private">Private - Only visible to you</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showEmail" class="checkbox">
              <span class="checkbox-text">Show email address publicly</span>
            </label>
          </div>
          
          <div class="form-field">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showPhone" class="checkbox">
              <span class="checkbox-text">Show phone number publicly</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn-secondary">
          Cancel
        </button>
        
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner">⟳</span>
          {{ isLoading ? 'Saving...' : 'Save Profile' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Section Container - same as ApplicationForm */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

.profile-form {
  max-width: 800px;
  margin: 0 auto;
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
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #004dc5;
  box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Skills Input */
.skill-input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.skills-display {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background-color: rgba(0, 77, 197, 0.1);
  color: #003a9b;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(0, 77, 197, 0.2);
  display: flex;
  align-items: center;
  gap: 6px;
}

.skill-tag.removable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.skill-tag.removable:hover {
  background-color: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.2);
}

.remove-skill {
  font-weight: 700;
  font-size: 14px;
}

/* Experience Items */
.experience-item {
  border: 1px solid rgba(0, 77, 197, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background-color: #f8fafc;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.experience-header h3 {
  color: #003a9b;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* Checkbox styling */
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

/* Success/Error Banners */
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

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 2px solid rgba(0, 77, 197, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
  color: #004dc5;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

.btn-small {
  font-size: 12px;
  padding: 4px 8px;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: 18px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid rgba(0, 77, 197, 0.1);
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
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .section-container {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .skill-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .experience-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>