<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)

const profile = ref({
  // Personal Information
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@email.com',
  phone: '+233 24 123 4567',
  location: 'Accra, Ghana',
  dateOfBirth: '1998-05-15',
  profileImage: null,

  // Professional Information
  title: 'Frontend Developer',
  bio: 'Passionate frontend developer with 2 years of experience building modern web applications. I love creating beautiful, responsive user interfaces and have a strong background in React, Vue.js, and modern CSS.',
  yearsOfExperience: '2',
  currentStatus: 'actively-looking', // actively-looking, open-to-offers, not-looking

  // Education
  education: [
    {
      id: 1,
      institution: 'University of Ghana',
      degree: 'Bachelor of Science in Computer Science',
      startYear: '2018',
      endYear: '2022',
      gpa: '3.8',
      description: 'Focused on software engineering and web development'
    }
  ],

  // Experience
  experience: [
    {
      id: 1,
      company: 'Tech Startup Ghana',
      position: 'Junior Frontend Developer',
      startDate: '2022-06',
      endDate: '2024-01',
      current: false,
      description: 'Developed responsive web applications using React and TypeScript. Collaborated with design team to implement pixel-perfect UI components.',
      achievements: [
        'Improved application load time by 40%',
        'Led migration from JavaScript to TypeScript',
        'Mentored 2 intern developers'
      ]
    }
  ],

  // Skills
  skills: [
    { name: 'JavaScript', level: 'advanced', category: 'programming' },
    { name: 'React', level: 'advanced', category: 'programming' },
    { name: 'Vue.js', level: 'intermediate', category: 'programming' },
    { name: 'TypeScript', level: 'intermediate', category: 'programming' },
    { name: 'HTML/CSS', level: 'advanced', category: 'programming' },
    { name: 'Node.js', level: 'beginner', category: 'programming' },
    { name: 'Git', level: 'intermediate', category: 'tools' },
    { name: 'Figma', level: 'beginner', category: 'design' }
  ],

  // Preferences
  preferences: {
    jobTypes: ['full-time', 'contract'],
    locations: ['accra', 'remote'],
    salaryMin: '6000',
    salaryMax: '12000',
    industries: ['technology', 'fintech', 'ecommerce']
  },

  // Links
  links: {
    portfolio: 'https://alexjohnson.dev',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson'
  }
})

const editForm = ref({})

const completionPercentage = computed(() => {
  let completed = 0
  let total = 8

  if (profile.value.firstName && profile.value.lastName) completed++
  if (profile.value.bio && profile.value.bio.length > 50) completed++
  if (profile.value.education.length > 0) completed++
  if (profile.value.experience.length > 0) completed++
  if (profile.value.skills.length >= 3) completed++
  if (profile.value.links.portfolio || profile.value.links.linkedin) completed++
  if (profile.value.phone && profile.value.location) completed++
  if (profile.value.preferences.jobTypes.length > 0) completed++

  return Math.round((completed / total) * 100)
})

const skillsByCategory = computed(() => {
  const categories = {}
  profile.value.skills.forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = []
    }
    categories[skill.category].push(skill)
  })
  return categories
})

const startEditing = () => {
  editForm.value = JSON.parse(JSON.stringify(profile.value))
  isEditing.value = true
}

const cancelEditing = () => {
  editForm.value = {}
  isEditing.value = false
}

const saveProfile = async () => {
  isSaving.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    profile.value = JSON.parse(JSON.stringify(editForm.value))
    isEditing.value = false
    editForm.value = {}
    
    console.log('Profile saved:', profile.value)
    // Show success message
  } catch (error) {
    console.error('Error saving profile:', error)
    // Show error message
  } finally {
    isSaving.value = false
  }
}

const addEducation = () => {
  editForm.value.education.push({
    id: Date.now(),
    institution: '',
    degree: '',
    startYear: '',
    endYear: '',
    gpa: '',
    description: ''
  })
}

const removeEducation = (index) => {
  editForm.value.education.splice(index, 1)
}

const addExperience = () => {
  editForm.value.experience.push({
    id: Date.now(),
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: []
  })
}

const removeExperience = (index) => {
  editForm.value.experience.splice(index, 1)
}

const addSkill = () => {
  const newSkill = prompt('Enter skill name:')
  if (newSkill) {
    editForm.value.skills.push({
      name: newSkill,
      level: 'beginner',
      category: 'programming'
    })
  }
}

const removeSkill = (index) => {
  editForm.value.skills.splice(index, 1)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (isEditing.value) {
        editForm.value.profileImage = e.target.result
      }
    }
    reader.readAsDataURL(file)
  }
}

const fetchProfile = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Profile data is already set in ref
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your profile...</p>
    </div>

    <div v-else>
      <!-- Profile Header -->
      <div class="profile-header card">
        <div class="header-content">
          <div class="profile-image-section">
            <div class="profile-image-container">
              <img 
                v-if="(isEditing ? editForm : profile).profileImage"
                :src="(isEditing ? editForm : profile).profileImage"
                alt="Profile"
                class="profile-image"
              >
              <div v-else class="profile-image-placeholder">
                {{ (isEditing ? editForm : profile).firstName?.[0] }}{{ (isEditing ? editForm : profile).lastName?.[0] }}
              </div>
              <div v-if="isEditing" class="image-upload-overlay">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="image-input"
                  id="profile-image-upload"
                >
                <label for="profile-image-upload" class="image-upload-btn">
                  Change Photo
                </label>
              </div>
            </div>
          </div>

          <div class="profile-info">
            <div v-if="!isEditing" class="view-mode">
              <h1 class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</h1>
              <p class="profile-title">{{ profile.title }}</p>
              <p class="profile-location">{{ profile.location }}</p>
              <p class="profile-bio">{{ profile.bio }}</p>
            </div>
            
            <div v-else class="edit-mode">
              <div class="name-row">
                <input
                  v-model="editForm.firstName"
                  type="text"
                  class="form-input"
                  placeholder="First Name"
                >
                <input
                  v-model="editForm.lastName"
                  type="text"
                  class="form-input"
                  placeholder="Last Name"
                >
              </div>
              <input
                v-model="editForm.title"
                type="text"
                class="form-input"
                placeholder="Professional Title"
              >
              <input
                v-model="editForm.location"
                type="text"
                class="form-input"
                placeholder="Location"
              >
              <textarea
                v-model="editForm.bio"
                class="form-textarea"
                rows="3"
                placeholder="Professional bio..."
              ></textarea>
            </div>
          </div>

          <div class="profile-actions">
            <div v-if="!isEditing" class="view-actions">
              <div class="completion-indicator">
                <div class="completion-circle">
                  <div class="completion-text">{{ completionPercentage }}%</div>
                </div>
                <span class="completion-label">Profile Complete</span>
              </div>
              <button @click="startEditing" class="btn-primary">
                Edit Profile
              </button>
            </div>
            
            <div v-else class="edit-actions">
              <button @click="cancelEditing" class="btn-secondary">
                Cancel
              </button>
              <button @click="saveProfile" :disabled="isSaving" class="btn-primary">
                <span v-if="isSaving" class="loading-spinner small"></span>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="profile-content">
        <!-- Contact Information -->
        <div class="section-card card">
          <h3 class="section-title">Contact Information</h3>
          <div v-if="!isEditing" class="contact-grid">
            <div class="contact-item">
              <span class="contact-label">Email</span>
              <span class="contact-value">{{ profile.email }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Phone</span>
              <span class="contact-value">{{ profile.phone }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Date of Birth</span>
              <span class="contact-value">{{ new Date(profile.dateOfBirth).toLocaleDateString() }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Status</span>
              <span :class="['status-badge', `status-${profile.currentStatus}`]">
                {{ profile.currentStatus.replace('-', ' ') }}
              </span>
            </div>
          </div>
          
          <div v-else class="contact-edit-grid">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="editForm.email" type="email" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input v-model="editForm.phone" type="tel" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input v-model="editForm.dateOfBirth" type="date" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Current Status</label>
              <select v-model="editForm.currentStatus" class="form-select">
                <option value="actively-looking">Actively Looking</option>
                <option value="open-to-offers">Open to Offers</option>
                <option value="not-looking">Not Looking</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="section-card card">
          <div class="section-header">
            <h3 class="section-title">Skills</h3>
            <button v-if="isEditing" @click="addSkill" class="btn-secondary small">
              Add Skill
            </button>
          </div>
          
          <div class="skills-container">
            <div v-for="(skills, category) in skillsByCategory" :key="category" class="skill-category">
              <h4 class="category-title">{{ category }}</h4>
              <div class="skills-list">
                <div
                  v-for="(skill, index) in skills"
                  :key="skill.name"
                  class="skill-item"
                >
                  <div v-if="!isEditing" class="skill-content">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span :class="['skill-level', `level-${skill.level}`]">
                      {{ skill.level }}
                    </span>
                  </div>
                  
                  <div v-else class="skill-edit">
                    <input
                      v-model="skill.name"
                      type="text"
                      class="form-input small"
                      placeholder="Skill name"
                    >
                    <select v-model="skill.level" class="form-select small">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <select v-model="skill.category" class="form-select small">
                      <option value="programming">Programming</option>
                      <option value="tools">Tools</option>
                      <option value="design">Design</option>
                      <option value="soft-skills">Soft Skills</option>
                    </select>
                    <button @click="removeSkill(index)" class="remove-btn">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Experience -->
        <div class="section-card card">
          <div class="section-header">
            <h3 class="section-title">Experience</h3>
            <button v-if="isEditing" @click="addExperience" class="btn-secondary small">
              Add Experience
            </button>
          </div>
          
          <div class="timeline">
            <div
              v-for="(exp, index) in (isEditing ? editForm : profile).experience"
              :key="exp.id"
              class="timeline-item"
            >
              <div v-if="!isEditing" class="experience-content">
                <h4 class="experience-title">{{ exp.position }}</h4>
                <p class="experience-company">{{ exp.company }}</p>
                <p class="experience-dates">
                  {{ exp.startDate }} - {{ exp.current ? 'Present' : exp.endDate }}
                </p>
                <p class="experience-description">{{ exp.description }}</p>
                <ul v-if="exp.achievements?.length" class="achievements-list">
                  <li v-for="achievement in exp.achievements" :key="achievement">
                    {{ achievement }}
                  </li>
                </ul>
              </div>
              
              <div v-else class="experience-edit">
                <div class="form-row">
                  <input
                    v-model="exp.position"
                    type="text"
                    class="form-input"
                    placeholder="Position"
                  >
                  <input
                    v-model="exp.company"
                    type="text"
                    class="form-input"
                    placeholder="Company"
                  >
                </div>
                <div class="form-row">
                  <input
                    v-model="exp.startDate"
                    type="month"
                    class="form-input"
                    placeholder="Start Date"
                  >
                  <input
                    v-if="!exp.current"
                    v-model="exp.endDate"
                    type="month"
                    class="form-input"
                    placeholder="End Date"
                  >
                  <label class="checkbox-label">
                    <input v-model="exp.current" type="checkbox">
                    Current Position
                  </label>
                </div>
                <textarea
                  v-model="exp.description"
                  class="form-textarea"
                  rows="3"
                  placeholder="Job description..."
                ></textarea>
                <button @click="removeExperience(index)" class="remove-btn">
                  Remove Experience
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Education -->
        <div class="section-card card">
          <div class="section-header">
            <h3 class="section-title">Education</h3>
            <button v-if="isEditing" @click="addEducation" class="btn-secondary small">
              Add Education
            </button>
          </div>
          
          <div class="education-list">
            <div
              v-for="(edu, index) in (isEditing ? editForm : profile).education"
              :key="edu.id"
              class="education-item"
            >
              <div v-if="!isEditing" class="education-content">
                <h4 class="education-title">{{ edu.degree }}</h4>
                <p class="education-institution">{{ edu.institution }}</p>
                <p class="education-dates">{{ edu.startYear }} - {{ edu.endYear }}</p>
                <p v-if="edu.gpa" class="education-gpa">GPA: {{ edu.gpa }}</p>
                <p v-if="edu.description" class="education-description">{{ edu.description }}</p>
              </div>
              
              <div v-else class="education-edit">
                <div class="form-row">
                  <input
                    v-model="edu.institution"
                    type="text"
                    class="form-input"
                    placeholder="Institution"
                  >
                  <input
                    v-model="edu.degree"
                    type="text"
                    class="form-input"
                    placeholder="Degree"
                  >
                </div>
                <div class="form-row">
                  <input
                    v-model="edu.startYear"
                    type="number"
                    class="form-input"
                    placeholder="Start Year"
                    min="1990"
                    max="2030"
                  >
                  <input
                    v-model="edu.endYear"
                    type="number"
                    class="form-input"
                    placeholder="End Year"
                    min="1990"
                    max="2030"
                  >
                  <input
                    v-model="edu.gpa"
                    type="text"
                    class="form-input"
                    placeholder="GPA (optional)"
                  >
                </div>
                <textarea
                  v-model="edu.description"
                  class="form-textarea"
                  rows="2"
                  placeholder="Description (optional)..."
                ></textarea>
                <button @click="removeEducation(index)" class="remove-btn">
                  Remove Education
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="section-card card">
          <h3 class="section-title">Professional Links</h3>
          <div v-if="!isEditing" class="links-grid">
            <a
              v-if="profile.links.portfolio"
              :href="profile.links.portfolio"
              target="_blank"
              class="link-item"
            >
              <span class="link-label">Portfolio</span>
              <span class="link-url">{{ profile.links.portfolio }}</span>
            </a>
            <a
              v-if="profile.links.linkedin"
              :href="profile.links.linkedin"
              target="_blank"
              class="link-item"
            >
              <span class="link-label">LinkedIn</span>
              <span class="link-url">{{ profile.links.linkedin }}</span>
            </a>
            <a
              v-if="profile.links.github"
              :href="profile.links.github"
              target="_blank"
              class="link-item"
            >
              <span class="link-label">GitHub</span>
              <span class="link-url">{{ profile.links.github }}</span>
            </a>
          </div>
          
          <div v-else class="links-edit">
            <div class="form-group">
              <label class="form-label">Portfolio URL</label>
              <input
                v-model="editForm.links.portfolio"
                type="url"
                class="form-input"
                placeholder="https://yourportfolio.com"
              >
            </div>
            <div class="form-group">
              <label class="form-label">LinkedIn</label>
              <input
                v-model="editForm.links.linkedin"
                type="url"
                class="form-input"
                placeholder="https://linkedin.com/in/yourprofile"
              >
            </div>
            <div class="form-group">
              <label class="form-label">GitHub</label>
              <input
                v-model="editForm.links.github"
                type="url"
                class="form-input"
                placeholder="https://github.com/yourusername"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
}

.loading-text {
  color: #8B949E;
  font-size: 0.875rem;
}

.profile-header {
  margin-bottom: 2rem;
  padding: 2rem;
}

.header-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: start;
}

.profile-image-section {
  position: relative;
}

.profile-image-container {
  position: relative;
  width: 8rem;
  height: 8rem;
}

.profile-image,
.profile-image-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.profile-image-placeholder {
  background: linear-gradient(135deg, #007AFF, #BF5AF2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.image-upload-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 0 50% 50%;
  padding: 0.5rem;
  text-align: center;
}

.image-input {
  display: none;
}

.image-upload-btn {
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #F0F6FC;
  margin: 0 0 0.5rem 0;
}

.profile-title {
  font-size: 1.25rem;
  color: #007AFF;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.profile-location {
  color: #8B949E;
  margin: 0 0 1rem 0;
}

.profile-bio {
  color: #8B949E;
  line-height: 1.6;
  margin: 0;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.completion-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.completion-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: conic-gradient(#007AFF 0% var(--percentage), #30363D var(--percentage) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.completion-circle::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #161B22;
}

.completion-text {
  position: relative;
  z-index: 1;
  color: #F0F6FC;
  font-size: 0.875rem;
  font-weight: 600;
}

.completion-label {
  font-size: 0.75rem;
  color: #8B949E;
  text-align: center;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
}

.btn-secondary.small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  font-size: 0.8125rem;
  color: #8B949E;
  font-weight: 500;
}

.contact-value {
  color: #F0F6FC;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  width: fit-content;
}

.status-actively-looking {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
  border: 1px solid rgba(50, 215, 75, 0.2);
}

.status-open-to-offers {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
  border: 1px solid rgba(255, 159, 10, 0.2);
}

.status-not-looking {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.2);
}

.contact-edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.8125rem;
  color: #F0F6FC;
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  transition: all 250ms ease;
}

.form-input.small,
.form-select.small {
  padding: 0.5rem;
  font-size: 0.8125rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  cursor: pointer;
}

.skills-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skill-category {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0;
  text-transform: capitalize;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 250ms ease;
}

.skill-item:hover {
  border-color: #484F58;
}

.skill-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skill-name {
  color: #F0F6FC;
  font-weight: 500;
  font-size: 0.875rem;
}

.skill-level {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: capitalize;
  font-weight: 600;
  width: fit-content;
}

.level-beginner {
  background: rgba(255, 159, 10, 0.1);
  color: #FF9F0A;
}

.level-intermediate {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.level-advanced {
  background: rgba(50, 215, 75, 0.1);
  color: #32D74B;
}

.level-expert {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.skill-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  border-left: 2px solid #30363D;
  padding-left: 1.5rem;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007AFF;
}

.experience-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.experience-company {
  color: #007AFF;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.experience-dates {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
}

.experience-description {
  color: #8B949E;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

.achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.achievements-list li {
  color: #8B949E;
  font-size: 0.875rem;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1rem;
}

.achievements-list li::before {
  content: '•';
  color: #32D74B;
  position: absolute;
  left: 0;
}

.experience-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
}

.education-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.education-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  border: 1px solid #30363D;
}

.education-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.education-institution {
  color: #007AFF;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.education-dates {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.education-gpa {
  color: #32D74B;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.education-description {
  color: #8B949E;
  line-height: 1.5;
  margin: 0;
}

.education-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.links-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  border: 1px solid #30363D;
  text-decoration: none;
  transition: all 250ms ease;
}

.link-item:hover {
  border-color: #484F58;
  transform: translateY(-1px);
}

.link-label {
  color: #F0F6FC;
  font-weight: 500;
}

.link-url {
  color: #007AFF;
  font-size: 0.875rem;
}

.links-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.remove-btn {
  background: #FF453A;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 250ms ease;
  width: fit-content;
}

.remove-btn:hover {
  background: #D70015;
}

.loading-spinner.small {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 1px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .header-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }

  .profile-image-container {
    width: 6rem;
    height: 6rem;
    margin: 0 auto;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .name-row,
  .form-row {
    grid-template-columns: 1fr;
  }

  .contact-grid,
  .contact-edit-grid {
    grid-template-columns: 1fr;
  }

  .skills-list {
    justify-content: center;
  }

  .skill-edit {
    min-width: auto;
  }
}
</style>