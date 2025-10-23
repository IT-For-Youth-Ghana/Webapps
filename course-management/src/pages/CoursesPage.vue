<template>
  <div class="min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8" style="color: var(--brand-primary)">
        Verfügbare Kurse
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="course in courses" :key="course.id" class="glass p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-2">{{ course.title }}</h3>
          <p class="text-gray-300 mb-4">{{ course.description }}</p>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">{{ course.duration }}</span>
            <button class="btn-primary">Anmelden</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursesPage',
  data() {
    return {
      courses: [
        {
          id: 1,
          title: 'Web Development Basics',
          description: 'Grundlagen der Webentwicklung mit HTML, CSS und JavaScript',
          duration: '8 Wochen'
        },
        {
          id: 2,
          title: 'Vue.js Fundamentals',
          description: 'Moderne Frontend-Entwicklung mit Vue.js',
          duration: '6 Wochen'
        },
        {
          id: 3,
          title: 'Backend Development',
          description: 'Server-side Entwicklung mit Node.js',
          duration: '10 Wochen'
        }
      ]
    }
  }
}
</script>