<template>
  <div id="app">
    <div style="background: #0D1117; color: white; min-height: 100vh; padding: 20px;">
      <h1 style="color: #8fb2d6; margin-bottom: 20px;">IT Youth Talent Incubator - Debug</h1>
      
      <div style="background: #161B22; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2>App Status: ✅ Läuft erfolgreich!</h2>
        <p>Vue.js ist korrekt geladen und funktioniert.</p>
        <p>Current Time: {{ currentTime }}</p>
        <p>Counter: {{ counter }}</p>
        <button @click="counter++" style="background: #1b65b2; color: white; padding: 10px 20px; border: none; border-radius: 6px; margin: 5px;">
          Increment
        </button>
      </div>

      <div style="background: #161B22; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h3>Navigation Test</h3>
        <p>Current Role: {{ userRole }}</p>
        <p>Current View: {{ currentView }}</p>
        
        <div style="margin: 10px 0;">
          <button @click="userRole = 'student'" style="background: #195aa5; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin: 5px;">
            Student Mode
          </button>
          <button @click="userRole = 'admin'" style="background: #195aa5; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin: 5px;">
            Admin Mode
          </button>
        </div>
        
        <div style="margin: 10px 0;">
          <button @click="currentView = 'dashboard'" style="background: #8fb2d6; color: black; padding: 8px 16px; border: none; border-radius: 6px; margin: 5px;">
            Dashboard
          </button>
          <button @click="currentView = 'jobs'" style="background: #8fb2d6; color: black; padding: 8px 16px; border: none; border-radius: 6px; margin: 5px;">
            Jobs
          </button>
        </div>
      </div>

      <div style="background: #161B22; padding: 20px; border-radius: 12px;">
        <h3>CSS Test</h3>
        <div class="test-gradient" style="background: linear-gradient(135deg, #1b65b2, #8fb2d6); padding: 20px; border-radius: 8px; color: white; text-align: center; margin: 10px 0;">
          Gradient Background Test - Sieht das richtig aus?
        </div>
        
        <div class="test-card" style="background: #21262d; border: 1px solid #30363d; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <h4 style="color: #ffffff; margin: 0 0 10px 0;">Test Card</h4>
          <p style="color: #8fb2d6; margin: 0;">Das ist eine Test-Karte mit den neuen Farben.</p>
        </div>
      </div>

      <div style="position: fixed; top: 20px; right: 20px; background: #1b65b2; color: white; padding: 10px; border-radius: 6px; font-size: 12px;">
        Status: Online ✅
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTime = ref('')
const counter = ref(0)
const userRole = ref('student')
const currentView = ref('dashboard')

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  console.log('✅ AppSimple.vue loaded successfully!')
  console.log('🎉 Vue.js is working correctly!')
})
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>