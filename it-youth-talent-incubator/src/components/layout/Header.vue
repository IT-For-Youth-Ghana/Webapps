<!-- 
🚀 IT Youth Talent Incubator - Application Header Component

PURPOSE: The main navigation header that provides consistent branding, navigation, and user
management functionality across all application pages with responsive design.

WHAT IT DOES:
- Displays organizational branding with logo and application title
- Provides main navigation menu adapted to user role (student/admin)
- Shows user authentication status with profile information
- Includes user dropdown menu with profile, settings, and logout options
- Displays notification indicators for important updates
- Implements responsive hamburger menu for mobile devices
- Provides search functionality for jobs and content (optional)

FOR CO-PROGRAMMERS:
- Currently a placeholder component requiring full implementation
- Should integrate with authentication store/composable for user state
- Navigation items should be role-based (student vs admin vs guest)
- Mobile menu toggle requires state management
- Logo should be configurable and link to appropriate dashboard
- Notifications should connect to real-time updates system

COMPONENT ARCHITECTURE:
1. Branding Section:
   - IT Youth Talent Incubator logo
   - Application title/tagline
   - Link to main dashboard
   
2. Main Navigation:
   - Role-based navigation items
   - Active route highlighting
   - Dropdown menus for complex sections
   
3. User Section:
   - Authentication status display
   - Profile picture and name
   - Notifications badge
   - User dropdown menu
   
4. Mobile Features:
   - Hamburger menu toggle
   - Collapsible navigation
   - Touch-friendly interactions

ROLE-BASED NAVIGATION:
- Guest: Login, Register, About
- Student: Jobs, Applications, Profile, Help
- Admin: Dashboard, Jobs, Applications, Students, Settings

USER DROPDOWN MENU:
- View Profile / Edit Profile
- Account Settings / Preferences
- Help & Support / Documentation
- Logout functionality

MOBILE CONSIDERATIONS:
- Hamburger menu for space efficiency
- Touch-friendly button sizes
- Swipe gestures for menu control
- Optimized typography for small screens

TODO IMPLEMENTATION PRIORITY:
1. Basic branding and logo integration
2. User authentication state display
3. Role-based navigation menu
4. User profile dropdown with logout
5. Mobile responsive hamburger menu
6. Notification system integration
7. Search functionality (optional)
8. Breadcrumb navigation (optional)
-->
<script setup>

</script>


<template>
  <!-- TODO: Implement complete header with the following structure:
  
  <header class="header">
    <div class="header-container">
      <!-Logo & Branding -->
      <div class="logo-section">
        <!--img src="logo.png" alt="IT Youth Talent Incubator" class="logo"/> -->
        <h1 class="app-title">IT Youth Talent Incubator</h1>
      </div>
      
      <!-- Main Navigation (Desktop) -->
      <nav class="main-nav">
        <!-- Role-based navigation items -->
        <router-link to="/jobs" class="nav-link">Jobs</router-link>
        <router-link to="/applications" class="nav-link">My Applications</router-link>
        <router-link to="/profile" class="nav-link">Profile</router-link>
      </nav>
      
      <!-- User Section -->
      <div class="user-section">
        <!-- Notifications -->
        <button class="notification-btn">
          <span class="notification-icon">🔔</span>
          <span class="notification-badge">3</span>
        </button>
        
        <!-- User Dropdown -->
        <div class="user-dropdown">
          <button class="user-trigger">
           <!-- <img src="user-avatar.jpg" alt="User" class="user-avatar" />-->
            <span class="user-name">John Doe</span>
          </button>
          <div class="dropdown-menu">
            <a href="/profile" class="dropdown-item">View Profile</a>
            <a href="/settings" class="dropdown-item">Settings</a>
            <button class="dropdown-item" @click="logout">Logout</button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle">
        <span class="hamburger"></span>
      </button>

    
    <!-- Mobile Navigation -->
    <nav class="mobile-nav">
      <!-- Collapsible mobile menu -->
    </nav>
 
</template>


