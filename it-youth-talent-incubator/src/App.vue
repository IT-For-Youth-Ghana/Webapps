<script setup>
import ApplicationForm from './components/student/ApplicationForm.vue';
import Footer from './components/layout/Footer.vue';
</script>

<template>
  <div class="app-container">
    <!-- Haupt-Inhalt -->
    <main class="main-content">
      <ApplicationForm />
    </main>
    
    <!-- Footer unten -->
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

/* Globale Resets für saubere Typography */
* {
  box-sizing: border-box;
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
