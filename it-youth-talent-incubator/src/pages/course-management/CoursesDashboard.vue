<template>
  <div class="min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8" style="color: var(--brand-primary)">
        Kurs Dashboard
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="glass p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-2">Meine Kurse</h3>
          <p class="text-3xl font-bold" style="color: var(--brand-accent)">3</p>
          <p class="text-sm text-gray-400">Aktive Kurse</p>
        </div>
        <div class="glass p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-2">Fortschritt</h3>
          <p class="text-3xl font-bold" style="color: var(--brand-accent)">75%</p>
          <p class="text-sm text-gray-400">Durchschnittlicher Fortschritt</p>
        </div>
        <div class="glass p-6 rounded-xl">
          <h3 class="text-xl font-semibold mb-2">Zertifikate</h3>
          <p class="text-3xl font-bold" style="color: var(--brand-accent)">2</p>
          <p class="text-sm text-gray-400">Abgeschlossene Kurse</p>
        </div>
      </div>
      
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Aktuelle Kurse</h2>
        <div class="space-y-4">
          <div v-for="course in activeCourses" :key="course.id" class="glass p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold">{{ course.title }}</h3>
                <p class="text-gray-400">{{ course.progress }}% abgeschlossen</p>
              </div>
              <button class="btn-primary">Fortsetzen</button>
            </div>
            <div class="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-blue-500 to-blue-300 h-2 rounded-full" 
                :style="{width: course.progress + '%'}"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursesDashboard',
  data() {
    return {
      activeCourses: [
        { id: 1, title: 'Web Development Basics', progress: 80 },
        { id: 2, title: 'Vue.js Fundamentals', progress: 65 },
        { id: 3, title: 'Backend Development', progress: 30 }
      ]
    }
  }
}
</script>