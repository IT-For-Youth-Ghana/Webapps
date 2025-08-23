<!-- 
  Profile Card Component
  Student profile overview card showing key information
-->
<script setup>
import { ref } from 'vue'

// Sample profile data - in real app this would come from store/API
const profile = ref({
  id: 1,
  firstName: 'Kwame',
  lastName: 'Asante',
  email: 'kwame.asante@student.ug.edu.gh',
  phone: '+233 24 567 8900',
  profilePhoto: null, // URL to profile photo
  university: 'University of Ghana',
  degree: 'Bachelor of Science',
  fieldOfStudy: 'Computer Science',
  currentSemester: 6,
  graduationYear: 2025,
  location: 'Accra, Ghana',
  joinedDate: '2024-09-15',
  profileVisibility: 'public',
  bio: 'Passionate computer science student with keen interest in web development and mobile applications. Looking for internship opportunities to gain hands-on experience.',
  skills: ['JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'Git', 'MongoDB', 'Express.js'],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/kwameasante',
    github: 'https://github.com/kwameasante',
    portfolio: 'https://kwameasante.dev'
  },
  stats: {
    totalApplications: 12,
    pendingApplications: 3,
    acceptedApplications: 2,
    profileViews: 89,
    skillEndorsements: 15
  }
})

const profileCompletionPercentage = ref(85)

const editProfile = () => {
  console.log('Edit profile clicked')
  // TODO: Navigate to profile edit form
}

const toggleVisibility = () => {
  profile.value.profileVisibility = profile.value.profileVisibility === 'public' ? 'private' : 'public'
  console.log('Profile visibility changed to:', profile.value.profileVisibility)
}

const openSocialLink = (platform, url) => {
  window.open(url, '_blank')
  console.log(`Opening ${platform}:`, url)
}

const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}
</script>

<template>
  <div>
    <h1>My Profile</h1>
    <p class="subtitle">Manage your professional profile and track your progress</p>
    
    <div class="section-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <!-- Profile Photo -->
        <div class="profile-photo-section">
          <div class="profile-photo">
            <img 
              v-if="profile.profilePhoto" 
              :src="profile.profilePhoto" 
              :alt="`${profile.firstName} ${profile.lastName}`"
              class="photo-img"
            >
            <div v-else class="photo-placeholder">
              {{ getInitials(profile.firstName, profile.lastName) }}
            </div>
          </div>
          <button class="photo-upload-btn" @click="editProfile">
            📷 Update Photo
          </button>
        </div>

        <!-- Basic Info -->
        <div class="profile-info">
          <h2 class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</h2>
          <p class="profile-title">{{ profile.degree }} in {{ profile.fieldOfStudy }}</p>
          <p class="profile-university">🎓 {{ profile.university }}</p>
          <p class="profile-location">📍 {{ profile.location }}</p>
          
          <div class="profile-completion">
            <div class="completion-bar">
              <div 
                class="completion-fill" 
                :style="{ width: profileCompletionPercentage + '%' }"
              ></div>
            </div>
            <span class="completion-text">{{ profileCompletionPercentage }}% Complete</span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="profile-actions">
          <button @click="editProfile" class="btn-primary">
            ✏️ Edit Profile
          </button>
          <button @click="toggleVisibility" class="btn-secondary">
            {{ profile.profileVisibility === 'public' ? '👁️ Public' : '🔒 Private' }}
          </button>
        </div>
      </div>

      <!-- Profile Bio -->
      <div class="profile-section">
        <h3>About Me</h3>
        <p class="profile-bio">{{ profile.bio }}</p>
      </div>

      <!-- Education Info -->
      <div class="profile-section">
        <h3>Education</h3>
        <div class="education-grid">
          <div class="education-item">
            <span class="education-label">University:</span>
            <span class="education-value">{{ profile.university }}</span>
          </div>
          <div class="education-item">
            <span class="education-label">Degree:</span>
            <span class="education-value">{{ profile.degree }}</span>
          </div>
          <div class="education-item">
            <span class="education-label">Field of Study:</span>
            <span class="education-value">{{ profile.fieldOfStudy }}</span>
          </div>
          <div class="education-item">
            <span class="education-label">Current Semester:</span>
            <span class="education-value">Semester {{ profile.currentSemester }}</span>
          </div>
          <div class="education-item">
            <span class="education-label">Expected Graduation:</span>
            <span class="education-value">{{ profile.graduationYear }}</span>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="profile-section">
        <h3>Technical Skills</h3>
        <div class="skills-grid">
          <span 
            v-for="skill in profile.skills" 
            :key="skill" 
            class="skill-tag"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- Statistics -->
      <div class="profile-section">
        <h3>Profile Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ profile.stats.totalApplications }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ profile.stats.pendingApplications }}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ profile.stats.acceptedApplications }}</div>
            <div class="stat-label">Accepted</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ profile.stats.profileViews }}</div>
            <div class="stat-label">Profile Views</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ profile.stats.skillEndorsements }}</div>
            <div class="stat-label">Endorsements</div>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="profile-section">
        <h3>Connect With Me</h3>
        <div class="social-links">
          <button 
            @click="openSocialLink('LinkedIn', profile.socialLinks.linkedin)"
            class="social-btn linkedin"
          >
            🔗 LinkedIn
          </button>
          <button 
            @click="openSocialLink('GitHub', profile.socialLinks.github)"
            class="social-btn github"
          >
            💻 GitHub
          </button>
          <button 
            @click="openSocialLink('Portfolio', profile.socialLinks.portfolio)"
            class="social-btn portfolio"
          >
            🌐 Portfolio
          </button>
        </div>
      </div>

      <!-- Profile Footer -->
      <div class="profile-footer">
        <p class="joined-date">
          Member since {{ new Date(profile.joinedDate).toLocaleDateString() }}
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
  max-width: 800px;
  margin: 0 auto 32px auto;
}

/* Profile Header */
.profile-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(0, 77, 197, 0.1);
}

.profile-photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #004dc5;
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.2);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #004dc5, #003a9b);
  color: white;
  font-size: 32px;
  font-weight: 700;
}

.photo-upload-btn {
  background: none;
  border: none;
  color: #004dc5;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.photo-upload-btn:hover {
  color: #003a9b;
}

.profile-info {
  flex: 1;
}

.profile-name {
  color: #003a9b;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.profile-university, .profile-location {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.profile-completion {
  margin-top: 16px;
}

.completion-bar {
  width: 200px;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.completion-text {
  color: #059669;
  font-size: 12px;
  font-weight: 600;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Profile Sections */
.profile-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 77, 197, 0.1);
}

.profile-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.profile-section h3 {
  color: #003a9b;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.profile-section h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background-color: #004dc5;
  margin-right: 8px;
  border-radius: 2px;
}

.profile-bio {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

/* Education Grid */
.education-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.education-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.education-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.education-value {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

/* Skills Grid */
.skills-grid {
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
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.1);
}

.stat-number {
  color: #004dc5;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-btn {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.social-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-btn.linkedin:hover {
  background-color: #0077b5;
  color: white;
  border-color: #0077b5;
}

.social-btn.github:hover {
  background-color: #333;
  color: white;
  border-color: #333;
}

.social-btn.portfolio:hover {
  background-color: #004dc5;
  color: white;
  border-color: #004dc5;
}

/* Buttons - same style as ApplicationForm */
.btn-primary {
  background-color: #004dc5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-primary:hover {
  background-color: #003a9b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.3);
}

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 2px solid rgba(0, 77, 197, 0.3);
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
  color: #004dc5;
  transform: translateY(-1px);
}

/* Profile Footer */
.profile-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

.joined-date {
  color: #6b7280;
  font-size: 12px;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .section-container {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .profile-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 16px;
  }
  
  .profile-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .completion-bar {
    width: 100%;
  }
  
  .education-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .social-links {
    justify-content: center;
  }
}
</style>