<template>
  <div class="student-jobs-page">
    <div class="page-header">
      <h1 class="page-title">Find Your Dream Job</h1>
      <p class="page-description">Discover exciting opportunities from Ghana's top companies and startups</p>
    </div>
    
    <div class="content">
      <p>✅ StudentJobsPage lädt erfolgreich!</p>
      <p>Search query: {{ searchQuery }}</p>
      <input v-model="searchQuery" placeholder="Search jobs..." class="search-input">
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
.student-jobs-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  color: white;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.25rem;
  color: #8fb2d6;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.content {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 8px;
  color: white;
  margin-top: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #1b65b2;
}
</style>