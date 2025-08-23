<script setup>
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