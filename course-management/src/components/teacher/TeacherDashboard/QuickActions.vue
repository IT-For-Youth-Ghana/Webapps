<template>
  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">Quick Actions</h2>
    </div>
    
    <div class="quick-actions-grid">
      <router-link to="/teacher/create-course" class="quick-action-card">
        <AcademicCapIcon class="w-6 h-6" />
        <span>New Course</span>
      </router-link>
      
      <router-link to="/teacher/assignments/new" class="quick-action-card">
        <DocumentPlusIcon class="w-6 h-6" />
        <span>Assignment</span>
      </router-link>
      
      <router-link to="/teacher/materials/upload" class="quick-action-card">
        <CloudArrowUpIcon class="w-6 h-6" />
        <span>Upload Material</span>
      </router-link>
      
      <router-link to="/teacher/announcements/new" class="quick-action-card">
        <SpeakerWaveIcon class="w-6 h-6" />
        <span>Announcement</span>
      </router-link>
    </div>
  </section>
</template>

<script>
import { AcademicCapIcon, DocumentPlusIcon, CloudArrowUpIcon, SpeakerWaveIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'QuickActions',
  components: {
    AcademicCapIcon,
    DocumentPlusIcon,
    CloudArrowUpIcon,
    SpeakerWaveIcon
  }
}
</script>

<style scoped>
.content-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;
}

.quick-action-card:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  transform: translateY(-2px);
}
</style>