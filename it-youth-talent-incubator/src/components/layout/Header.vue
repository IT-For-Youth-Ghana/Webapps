<script setup>
import Navigation from './Navigation.vue'

const props = defineProps({
  userRole: {
    type: String,
    default: 'guest'
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  currentRoute: {
    type: String,
    default: '/'
  }
})

const emit = defineEmits(['navigate', 'logout'])

const handleNavigation = (path) => {
  emit('navigate', path)
}

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <header class="header">
    <Navigation 
      :user-role="userRole"
      :is-authenticated="isAuthenticated"
      :current-route="currentRoute"
      @navigate="handleNavigation"
      @logout="handleLogout"
    />
  </header>
</template>

<style scoped>
.header {
  position: relative;
  z-index: 1000;
}
</style>
