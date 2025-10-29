<template>
  <!-- Empty landing page - auto-redirect to dashboard -->
  <div class="home-page">
    <div class="redirect-message">
      <h1>🚀 Redirecting to Dashboard...</h1>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  // Page redirects automatically via router config - no need for manual redirect
  console.log('HomePage loaded - should redirect automatically')
})
</script>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary);
}

.redirect-message {
  text-align: center;
  color: var(--text-primary);
}

.redirect-message h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
</style>