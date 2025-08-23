<!-- 
  🚀 IT Youth Talent Incubator - Main App Component
  
  PURPOSE: This is the root component of the entire application. It serves as the main container
  that renders all other components and manages the overall application layout.
  
  WHAT IT DOES:
  - Contains the main application layout (Header, Main Content, Footer)
  - Manages page navigation through a simple index system for testing/development
  - Renders different components based on the current page index
  - Provides a testing navigation menu to switch between all 12 pages
  - Handles the overall app styling and responsive design
  
  FOR CO-PROGRAMMERS:
  - Change `currentPageIndex.value` (line 48) to switch between different pages (0-11)
  - Pages 0-6: Student and authentication components
  - Pages 7-11: Admin management components
  - The page navigation is for development testing - remove in production
  - All component imports are at the top of the script section
  - Global styles are defined at the bottom of the file
  
  PAGES AVAILABLE:
  0=Application Form, 1=Application History, 2=Browse Jobs, 3=View Profile, 
  4=Edit Profile, 5=Login, 6=Register, 7=Admin Dashboard, 8=Application Management,
  9=Create Job, 10=Manage Jobs, 11=Student Management
-->
<script setup>
import { ref } from 'vue'

// Components
import ApplicationForm from './components/student/ApplicationForm.vue'
import ApplicationHistory from './components/student/ApplicationHistory.vue'
import JobCard from './components/student/JobCard.vue'
import ProfileCard from './components/student/ProfileCard.vue'
import ProfileForm from './components/student/ProfileForm.vue'
import LoginForm from './components/auth/LoginForm.vue'
import RegisterForm from './components/auth/RegisterForm.vue'
import Footer from './components/layout/Footer.vue'
import Header from './components/layout/Header.vue'

// Admin Components
import Dashboard from './components/admin/Dashboard.vue'
import ApplicationsTable from './components/admin/ApplicationsTable.vue'
import JobForm from './components/admin/JobForm.vue'
import JobList from './components/admin/JobList.vue'
import StudentList from './components/admin/StudentList.vue'

// Page Index - Change this value to switch between pages
// Student Pages (0-6)
// 0 = ApplicationForm
// 1 = ApplicationHistory  
// 2 = JobCard (Browse Jobs)
// 3 = ProfileCard (View Profile)
// 4 = ProfileForm (Edit Profile)
// 5 = LoginForm
// 6 = RegisterForm
// Admin Pages (7-11)
// 7 = Dashboard (Admin)
// 8 = ApplicationsTable (Admin)
// 9 = JobForm (Admin)
// 10 = JobList (Admin)
// 11 = StudentList (Admin)
const currentPageIndex = ref(4)

const pages = [
  // Student Pages
  { index: 0, name: 'Application Form', component: 'ApplicationForm', category: 'Student' },
  { index: 1, name: 'Application History', component: 'ApplicationHistory', category: 'Student' },
  { index: 2, name: 'Browse Jobs', component: 'JobCard', category: 'Student' },
  { index: 3, name: 'View Profile', component: 'ProfileCard', category: 'Student' },
  { index: 4, name: 'Edit Profile', component: 'ProfileForm', category: 'Student' },
  { index: 5, name: 'Login', component: 'LoginForm', category: 'Auth' },
  { index: 6, name: 'Register', component: 'RegisterForm', category: 'Auth' },
  // Admin Pages
  { index: 7, name: 'Admin Dashboard', component: 'Dashboard', category: 'Admin' },
  { index: 8, name: 'Application Management', component: 'ApplicationsTable', category: 'Admin' },
  { index: 9, name: 'Create Job', component: 'JobForm', category: 'Admin' },
  { index: 10, name: 'Manage Jobs', component: 'JobList', category: 'Admin' },
  { index: 11, name: 'Student Management', component: 'StudentList', category: 'Admin' }
]

// Function to change page (for testing - you can call this from browser console)
const changePage = (index) => {
  currentPageIndex.value = index
}

// Make function globally available for testing
window.changePage = changePage
console.log('Available pages:', pages)
console.log('Use changePage(index) to switch pages. Current page:', currentPageIndex.value)
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <Header />
    
    <!-- Page Navigation (for testing - remove in production) -->
    <div class="page-navigation">
      <div class="nav-container">
        <!-- Student & Auth Section -->
        <div class="nav-group">
          <span class="nav-group-label">Student & Auth:</span>
          <button 
            v-for="page in pages.filter(p => p.category === 'Student' || p.category === 'Auth')" 
            :key="page.index"
            @click="changePage(page.index)"
            :class="['nav-btn', { active: currentPageIndex === page.index }]"
          >
            {{ page.name }}
          </button>
        </div>

        <!-- Separator -->
        <div class="nav-separator"></div>

        <!-- Admin Section -->
        <div class="nav-group">
          <span class="nav-group-label">Admin:</span>
          <button 
            v-for="page in pages.filter(p => p.category === 'Admin')" 
            :key="page.index"
            @click="changePage(page.index)"
            :class="['nav-btn', { active: currentPageIndex === page.index }]"
          >
            {{ page.name }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <main class="main-content">
      <!-- Student Pages -->
      <!-- Application Form Page -->
      <ApplicationForm v-if="currentPageIndex === 0" />
      
      <!-- Application History Page -->
      <ApplicationHistory v-if="currentPageIndex === 1" />
      
      <!-- Browse Jobs Page -->
      <JobCard v-if="currentPageIndex === 2" />
      
      <!-- View Profile Page -->
      <ProfileCard v-if="currentPageIndex === 3" />
      
      <!-- Edit Profile Page -->
      <ProfileForm v-if="currentPageIndex === 4" />
      
      <!-- Login Page -->
      <LoginForm v-if="currentPageIndex === 5" />
      
      <!-- Register Page -->
      <RegisterForm v-if="currentPageIndex === 6" />
      
      <!-- Admin Pages -->
      <!-- Admin Dashboard -->
      <Dashboard v-if="currentPageIndex === 7" />
      
      <!-- Application Management -->
      <ApplicationsTable v-if="currentPageIndex === 8" />
      
      <!-- Create Job -->
      <JobForm v-if="currentPageIndex === 9" />
      
      <!-- Manage Jobs -->
      <JobList v-if="currentPageIndex === 10" />
      
      <!-- Student Management -->
      <StudentList v-if="currentPageIndex === 11" />
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #004dc5 0%, #003a9b 100%);
  padding: 40px 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Page Navigation for testing */
.page-navigation {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.nav-container {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-group-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 4px;
  white-space: nowrap;
}

.nav-separator {
  width: 2px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

.nav-btn {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.nav-btn.active {
  background-color: white;
  color: #003a9b;
  border-color: white;
  font-weight: 600;
}

/* Main content area */
.main-content {
  margin: 20px 0;
}

/* Globale Resets für saubere Typography */
* {
  box-sizing: border-box;
}

/* Mobile responsiveness for navigation */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-group {
    justify-content: center;
  }
  
  .nav-separator {
    width: 80%;
    height: 1px;
    align-self: center;
  }
  
  .nav-btn {
    flex: 1 1 auto;
    min-width: 100px;
    font-size: 11px;
    padding: 5px 8px;
  }

  .nav-group-label {
    font-size: 11px;
    margin-bottom: 4px;
    text-align: center;
    width: 100%;
  }

  .nav-group {
    flex-direction: column;
    gap: 4px;
  }

  .nav-group .nav-btn {
    margin-left: 0;
  }
}
</style>

<style>
/* Globale Styles für die ganze App */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 77, 197, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 77, 197, 0.5);
}
</style>
