<!-- 
  Layout Component
  Main application layout wrapper with header, main content, and footer
  
  TODO for co-programmers:
  - Implement conditional header display based on authentication
  - Add sidebar navigation for admin/dashboard pages
  - Include loading states during page transitions
  - Add error boundary handling
  - Implement responsive layout adjustments
  - Add page transition animations
  - Include scroll-to-top functionality
-->\n<script setup>
import Footer from './Footer.vue';
import Header from './Header.vue';
</script>

<template>
  <div class="layout">
    <!-- Optional: Header für alle Seiten -->
    <!-- <Header /> -->
    
    <!-- Main Content Area -->
    <main class="main-content">
      <slot />  <!-- Hier wird der Seiteninhalt eingefügt -->
    </main>
    
    <!-- Footer auf jeder Seite -->
    <Footer />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1; /* Nimmt verfügbaren Platz ein */
  padding: 20px;
}
</style>