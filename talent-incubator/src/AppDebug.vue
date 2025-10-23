<template>
  <div id="app" style="background: white; color: black; padding: 20px;">
    <h1>Debug Mode - App ist geladen!</h1>
    <p>Dies sollte sichtbar sein wenn Vue funktioniert.</p>
    <p>User Role: {{ userRole }}</p>
    <p>Current View: {{ currentView }}</p>
    
    <div style="margin: 20px 0;">
      <button @click="userRole = 'student'" style="background: blue; color: white; padding: 10px; margin: 5px;">Set Student</button>
      <button @click="userRole = 'admin'" style="background: green; color: white; padding: 10px; margin: 5px;">Set Admin</button>
    </div>
    
    <div style="margin: 20px 0;">
      <button @click="currentView = 'dashboard'" style="background: orange; color: white; padding: 10px; margin: 5px;">Dashboard</button>
      <button @click="currentView = 'jobs'" style="background: purple; color: white; padding: 10px; margin: 5px;">Jobs</button>
    </div>
    
    <!-- Simple Navigation Test -->
    <div style="background: #f0f0f0; padding: 20px; margin: 20px 0;">
      <h2>Navigation Test</h2>
      <p>Role: {{ userRole }} | View: {{ currentView }}</p>
    </div>
    
    <!-- Test with simple components -->
    <div v-if="userRole === 'admin' && currentView === 'jobs'" style="background: #e0e0e0; padding: 20px; margin: 20px 0;">
      <h2>Admin Jobs View</h2>
      <p>This should show the admin jobs page.</p>
      <!-- <AdminJobsPage /> -->
    </div>
    
    <div v-if="userRole === 'student' && currentView === 'jobs'" style="background: #d0d0d0; padding: 20px; margin: 20px 0;">
      <h2>Student Jobs View</h2>
      <p>This should show the student jobs page.</p>
      <!-- <StudentJobsPage /> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userRole = ref('student')
const currentView = ref('dashboard')
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
</style>