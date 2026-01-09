<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">404</div>

      <h1 class="error-title">Page Not Found</h1>
      <p class="error-message">
        The page you're looking for doesn't exist or has been moved.
        Check the URL or navigate back to a safe place.
      </p>

      <div class="error-actions">
        <button @click="goBack" class="btn btn-secondary">
          Go Back
        </button>
        <router-link to="/" class="btn btn-primary">
          Go Home
        </router-link>
      </div>

      <div class="error-search" v-if="searchQuery">
        <p>Were you looking for something specific?</p>
        <p class="search-hint">Try searching from the home page.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { COLORS } from '../../constants/colors.js'

const router = useRouter()
const route = useRoute()

const searchQuery = computed(() => route.query.q || '')

function goBack() {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, v-bind('COLORS.primary') 0%, v-bind('COLORS.primaryDark') 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: v-bind('COLORS.text');
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1rem;
  color: v-bind('COLORS.textLight');
  line-height: 1.6;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: v-bind('COLORS.primary');
  color: white;
}

.btn-primary:hover {
  background: v-bind('COLORS.primaryDark');
  transform: translateY(-2px);
}

.btn-secondary {
  background: v-bind('COLORS.background');
  color: v-bind('COLORS.text');
  border: 1px solid v-bind('COLORS.border');
}

.btn-secondary:hover {
  background: v-bind('COLORS.border');
}

.error-search {
  padding-top: 1.5rem;
  border-top: 1px solid v-bind('COLORS.border');
}

.error-search p {
  margin: 0;
  color: v-bind('COLORS.textLight');
}

.search-hint {
  margin-top: 0.5rem !important;
  font-size: 0.875rem;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 5rem;
  }

  .error-actions {
    flex-direction: column;
  }
}
</style>
