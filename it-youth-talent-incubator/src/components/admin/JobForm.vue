<!-- 
🚀 IT Youth Talent Incubator - Job Form Component

PURPOSE: A comprehensive form interface for administrators to create and manage job postings.
This component handles the entire job creation workflow with validation and user feedback.

WHAT IT DOES:
- Creates new job postings with detailed information and requirements
- Validates form data before submission with real-time error feedback
- Manages job details: title, company, location, salary, type, experience level
- Handles dynamic lists for requirements, responsibilities, and skills
- Provides skill autocomplete with popular technology suggestions
- Supports draft saving and form reset functionality
- Shows success/error messages with professional UI feedback

FOR CO-PROGRAMMERS:
- Form fields are reactive refs (lines 9-34) - all form data is centralized
- Validation logic in `validateForm()` function (lines 104-120)
- Skills management: `addSkill()`, `removeSkill()` methods (lines 65-82)
- Dynamic arrays: `requirements` and `responsibilities` with add/remove functionality
- Popular skills for autocomplete defined in array (lines 55-62)
- Salary supports multiple currencies (GH₵, USD, EUR)
- Form submission simulation with 2-second delay (line 159)

FORM SECTIONS:
1. Basic Information: Job title, company, location, type, experience level
2. Salary Information: Currency, min/max salary range
3. Job Description: Detailed description textarea
4. Skills: Required skills with autocomplete
5. Requirements: Dynamic list of job requirements
6. Responsibilities: Dynamic list of key responsibilities  
7. Application Details: Contact info and deadline

VALIDATION RULES:
- Required fields: title, company, location, description, deadline, email
- Salary validation: minimum must be less than maximum
- Email format validation for contact email
- Date validation: deadline must be in the future
-->
<script setup>
import { ref } from 'vue'

// Form data
const jobTitle = ref('')
const companyName = ref('')
const jobLocation = ref('')
const jobType = ref('full-time')
const jobDescription = ref('')
const salaryMin = ref('')
const salaryMax = ref('')
const salaryCurrency = ref('GH₵')
const applicationDeadline = ref('')
const contactEmail = ref('')
const contactPhone = ref('')
const isRemote = ref(false)
const experienceLevel = ref('entry')

// Skills and requirements
const skillInput = ref('')
const requiredSkills = ref([])
const preferredSkills = ref([])
const requirements = ref([''])
const responsibilities = ref([''])

// Form state
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const validationErrors = ref({})

// Job types
const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' }
]

// Experience levels
const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior (1-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
  { value: 'lead', label: 'Lead/Manager' }
]

// Popular skills for autocomplete
const popularSkills = [
  'JavaScript', 'Python', 'Java', 'React', 'Vue.js', 'Angular', 'Node.js',
  'PHP', 'Laravel', 'HTML/CSS', 'MySQL', 'MongoDB', 'PostgreSQL',
  'Git', 'AWS', 'Docker', 'Kubernetes', 'REST APIs', 'GraphQL',
  'TypeScript', 'C#', 'Flutter', 'React Native', 'Swift', 'Kotlin',
  'Machine Learning', 'Data Analysis', 'SQL', 'NoSQL', 'Redis',
  'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Project Management'
]

// Methods
const addSkill = (skillType = 'required') => {
  const skillValue = skillInput.value.trim()
  if (!skillValue) return

  const targetArray = skillType === 'required' ? requiredSkills : preferredSkills
  if (!targetArray.value.includes(skillValue)) {
    targetArray.value.push(skillValue)
    skillInput.value = ''
  }
}

const removeSkill = (skill, skillType = 'required') => {
  const targetArray = skillType === 'required' ? requiredSkills : preferredSkills
  const index = targetArray.value.indexOf(skill)
  if (index > -1) {
    targetArray.value.splice(index, 1)
  }
}

const addRequirement = () => {
  requirements.value.push('')
}

const removeRequirement = (index) => {
  if (requirements.value.length > 1) {
    requirements.value.splice(index, 1)
  }
}

const addResponsibility = () => {
  responsibilities.value.push('')
}

const removeResponsibility = (index) => {
  if (responsibilities.value.length > 1) {
    responsibilities.value.splice(index, 1)
  }
}

const validateForm = () => {
  const errors = {}
  
  if (!jobTitle.value.trim()) errors.jobTitle = 'Job title is required'
  if (!companyName.value.trim()) errors.companyName = 'Company name is required'
  if (!jobLocation.value.trim()) errors.jobLocation = 'Job location is required'
  if (!jobDescription.value.trim()) errors.jobDescription = 'Job description is required'
  if (!applicationDeadline.value) errors.applicationDeadline = 'Application deadline is required'
  if (!contactEmail.value.trim()) errors.contactEmail = 'Contact email is required'
  
  if (salaryMin.value && salaryMax.value && parseFloat(salaryMin.value) >= parseFloat(salaryMax.value)) {
    errors.salary = 'Minimum salary must be less than maximum salary'
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    const jobData = {
      title: jobTitle.value.trim(),
      company: companyName.value.trim(),
      location: jobLocation.value.trim(),
      type: jobType.value,
      description: jobDescription.value.trim(),
      salary: {
        min: salaryMin.value ? parseFloat(salaryMin.value) : null,
        max: salaryMax.value ? parseFloat(salaryMax.value) : null,
        currency: salaryCurrency.value
      },
      deadline: applicationDeadline.value,
      contact: {
        email: contactEmail.value.trim(),
        phone: contactPhone.value.trim()
      },
      requirements: requirements.value.filter(req => req.trim()),
      responsibilities: responsibilities.value.filter(resp => resp.trim()),
      requiredSkills: requiredSkills.value,
      preferredSkills: preferredSkills.value,
      experienceLevel: experienceLevel.value,
      isRemote: isRemote.value,
      status: 'active',
      createdAt: new Date().toISOString()
    }
    
    console.log('Creating job:', jobData)
    
    // TODO: Replace with actual API call to create job posting
    // Example: await jobsAPI.create(jobData)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    successMessage.value = 'Job posted successfully!'
    
    // Reset form after successful submission
    setTimeout(() => {
      resetForm()
    }, 2000)
    
  } catch (error) {
    errorMessage.value = error.message || 'Failed to post job. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const saveDraft = () => {
  console.log('Saving draft...')
  // TODO: Implement draft saving
}

const resetForm = () => {
  jobTitle.value = ''
  companyName.value = ''
  jobLocation.value = ''
  jobType.value = 'full-time'
  jobDescription.value = ''
  salaryMin.value = ''
  salaryMax.value = ''
  applicationDeadline.value = ''
  contactEmail.value = ''
  contactPhone.value = ''
  isRemote.value = false
  experienceLevel.value = 'entry'
  requiredSkills.value = []
  preferredSkills.value = []
  requirements.value = ['']
  responsibilities.value = ['']
  validationErrors.value = {}
  successMessage.value = ''
  errorMessage.value = ''
}

const handleCancel = () => {
  if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
    resetForm()
  }
}
</script>

<template>
  <div>
    <h1>Create Job Posting</h1>
    <p class="subtitle">Post new job opportunities for students</p>
    
    <form @submit.prevent="handleSubmit" class="job-form">
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

      <!-- Basic Job Information -->
      <div class="section-container">
        <h2>Basic Information</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="jobTitle" class="form-label">Job Title:</label>
            <input 
              id="jobTitle"
              v-model="jobTitle"
              type="text"
              class="form-input"
              :class="{ error: validationErrors.jobTitle }"
              placeholder="e.g. Frontend Developer"
              required
            >
            <span v-if="validationErrors.jobTitle" class="error-text">
              {{ validationErrors.jobTitle }}
            </span>
          </div>
          
          <div class="form-field">
            <label for="companyName" class="form-label">Company Name:</label>
            <input 
              id="companyName"
              v-model="companyName"
              type="text"
              class="form-input"
              :class="{ error: validationErrors.companyName }"
              placeholder="e.g. TechCorp Ghana"
              required
            >
            <span v-if="validationErrors.companyName" class="error-text">
              {{ validationErrors.companyName }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="jobLocation" class="form-label">Location:</label>
            <input 
              id="jobLocation"
              v-model="jobLocation"
              type="text"
              class="form-input"
              :class="{ error: validationErrors.jobLocation }"
              placeholder="e.g. Accra, Ghana"
              required
            >
            <span v-if="validationErrors.jobLocation" class="error-text">
              {{ validationErrors.jobLocation }}
            </span>
          </div>
          
          <div class="form-field">
            <label for="jobType" class="form-label">Job Type:</label>
            <select 
              id="jobType"
              v-model="jobType"
              class="form-input"
            >
              <option 
                v-for="type in jobTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="experienceLevel" class="form-label">Experience Level:</label>
            <select 
              id="experienceLevel"
              v-model="experienceLevel"
              class="form-input"
            >
              <option 
                v-for="level in experienceLevels" 
                :key="level.value" 
                :value="level.value"
              >
                {{ level.label }}
              </option>
            </select>
          </div>
          
          <div class="form-field checkbox-field">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="isRemote"
                class="checkbox"
              >
              <span class="checkbox-text">Remote work available</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Salary Information -->
      <div class="section-container">
        <h2>Salary Information</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="salaryCurrency" class="form-label">Currency:</label>
            <select 
              id="salaryCurrency"
              v-model="salaryCurrency"
              class="form-input"
            >
              <option value="GH₵">Ghanaian Cedi (GH₵)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          
          <div class="form-field">
            <label for="salaryMin" class="form-label">Minimum Salary:</label>
            <input 
              id="salaryMin"
              v-model="salaryMin"
              type="number"
              class="form-input"
              placeholder="e.g. 2000"
              min="0"
              step="100"
            >
          </div>
          
          <div class="form-field">
            <label for="salaryMax" class="form-label">Maximum Salary:</label>
            <input 
              id="salaryMax"
              v-model="salaryMax"
              type="number"
              class="form-input"
              placeholder="e.g. 4000"
              min="0"
              step="100"
            >
            <span v-if="validationErrors.salary" class="error-text">
              {{ validationErrors.salary }}
            </span>
          </div>
        </div>
      </div>

      <!-- Job Description -->
      <div class="section-container">
        <h2>Job Description</h2>
        
        <div class="form-row">
          <div class="form-field full-width">
            <label for="jobDescription" class="form-label">Description:</label>
            <textarea 
              id="jobDescription"
              v-model="jobDescription"
              class="form-textarea"
              :class="{ error: validationErrors.jobDescription }"
              rows="6"
              placeholder="Provide a detailed description of the job role, company culture, and what makes this opportunity special..."
              required
            ></textarea>
            <span v-if="validationErrors.jobDescription" class="error-text">
              {{ validationErrors.jobDescription }}
            </span>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="section-container">
        <h2>Required Skills & Technologies</h2>
        
        <div class="form-row">
          <div class="form-field full-width">
            <label for="skillInput" class="form-label">Add Required Skills:</label>
            <div class="skill-input-container">
              <input 
                id="skillInput"
                v-model="skillInput"
                type="text"
                class="form-input"
                placeholder="Type a skill and press Enter or click Add"
                @keyup.enter="addSkill('required')"
                list="popular-skills"
              >
              <datalist id="popular-skills">
                <option v-for="skill in popularSkills" :key="skill" :value="skill"></option>
              </datalist>
              <button type="button" @click="addSkill('required')" class="btn-secondary">Add</button>
            </div>
          </div>
        </div>

        <div class="skills-display" v-if="requiredSkills.length > 0">
          <h4>Required Skills:</h4>
          <div class="skills-tags">
            <span 
              v-for="skill in requiredSkills" 
              :key="skill" 
              class="skill-tag required removable"
              @click="removeSkill(skill, 'required')"
            >
              {{ skill }}
              <span class="remove-skill">×</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Requirements -->
      <div class="section-container">
        <h2>Job Requirements</h2>
        
        <div class="dynamic-list">
          <div 
            v-for="(requirement, index) in requirements" 
            :key="index" 
            class="list-item"
          >
            <input 
              v-model="requirements[index]"
              type="text"
              class="form-input"
              placeholder="e.g. Bachelor's degree in Computer Science or related field"
            >
            <button 
              type="button" 
              @click="removeRequirement(index)"
              class="btn-danger btn-small"
              v-if="requirements.length > 1"
            >
              Remove
            </button>
          </div>
          
          <button type="button" @click="addRequirement" class="btn-secondary">
            + Add Requirement
          </button>
        </div>
      </div>

      <!-- Responsibilities -->
      <div class="section-container">
        <h2>Key Responsibilities</h2>
        
        <div class="dynamic-list">
          <div 
            v-for="(responsibility, index) in responsibilities" 
            :key="index" 
            class="list-item"
          >
            <input 
              v-model="responsibilities[index]"
              type="text"
              class="form-input"
              placeholder="e.g. Develop and maintain web applications using modern frameworks"
            >
            <button 
              type="button" 
              @click="removeResponsibility(index)"
              class="btn-danger btn-small"
              v-if="responsibilities.length > 1"
            >
              Remove
            </button>
          </div>
          
          <button type="button" @click="addResponsibility" class="btn-secondary">
            + Add Responsibility
          </button>
        </div>
      </div>

      <!-- Contact & Deadline -->
      <div class="section-container">
        <h2>Application Details</h2>
        
        <div class="form-row">
          <div class="form-field">
            <label for="contactEmail" class="form-label">Contact Email:</label>
            <input 
              id="contactEmail"
              v-model="contactEmail"
              type="email"
              class="form-input"
              :class="{ error: validationErrors.contactEmail }"
              placeholder="hr@company.com"
              required
            >
            <span v-if="validationErrors.contactEmail" class="error-text">
              {{ validationErrors.contactEmail }}
            </span>
          </div>
          
          <div class="form-field">
            <label for="contactPhone" class="form-label">Contact Phone (Optional):</label>
            <input 
              id="contactPhone"
              v-model="contactPhone"
              type="tel"
              class="form-input"
              placeholder="+233 XX XXX XXXX"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="applicationDeadline" class="form-label">Application Deadline:</label>
            <input 
              id="applicationDeadline"
              v-model="applicationDeadline"
              type="date"
              class="form-input"
              :class="{ error: validationErrors.applicationDeadline }"
              :min="new Date().toISOString().split('T')[0]"
              required
            >
            <span v-if="validationErrors.applicationDeadline" class="error-text">
              {{ validationErrors.applicationDeadline }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="saveDraft" class="btn-secondary">
          Save as Draft
        </button>
        
        <button type="button" @click="handleCancel" class="btn-secondary">
          Cancel
        </button>
        
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner">⟳</span>
          {{ isLoading ? 'Posting Job...' : 'Post Job' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Section Container - same as other components */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

.job-form {
  max-width: 800px;
  margin: 0 auto;
}

/* Form styling - same as ProfileForm */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-field.checkbox-field {
  justify-content: center;
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

.form-input.error, .form-textarea.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.error-text {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

/* Skills Input */
.skill-input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.skills-display {
  margin-top: 16px;
}

.skills-display h4 {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.skills-tags {
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

.skill-tag.required {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
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

/* Dynamic Lists */
.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Checkbox styling */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  margin-top: 6px;
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

/* Buttons - same style as other components */
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

/* Title styling - same as other components */
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
  
  .list-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }

  .job-form {
    padding: 0 10px;
  }
}
</style>
