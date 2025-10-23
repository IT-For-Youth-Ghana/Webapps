<template>
  <div class="admin-jobs-page">
    <div class="page-header">
      <h1 class="page-title">Job Management</h1>
      <p class="page-description">Manage all job postings, review applications, and track hiring progress</p>
    </div>
    
    <div class="content">
      <p>✅ AdminJobsPage lädt erfolgreich!</p>
      <p>Loading state: {{ loading }}</p>
      <button @click="loading = !loading" class="test-btn">Toggle Loading</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
</script>

<style scoped>
.admin-jobs-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  color: white;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1b65b2, #8fb2d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  margin: 0;
  font-size: 1.125rem;
  color: #8fb2d6;
  line-height: 1.6;
}

.content {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 2rem;
}

.test-btn {
  background: #1b65b2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.test-btn:hover {
  background: #195aa5;
}
</style>