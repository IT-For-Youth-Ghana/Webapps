<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="glass p-8 rounded-xl text-center max-w-md">
      <h1 class="text-3xl font-bold mb-4" style="color: var(--brand-primary)">
        Course Management Platform
      </h1>
      <p class="text-gray-300 mb-6">
        Willkommen zur Kursmanagement-Platform des IT Youth Incubators
      </p>
      <div class="space-y-4">
        <router-link to="/courses" class="btn-primary block">
          Kurse anzeigen
        </router-link>
        <router-link to="/dashboard" class="btn-primary block">
          Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>