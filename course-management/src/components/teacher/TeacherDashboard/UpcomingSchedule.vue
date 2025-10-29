<template>
  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">Upcoming Schedule</h2>
      <router-link to="/teacher/schedule" class="view-all-link">
        Calendar
      </router-link>
    </div>
    
    <div class="schedule-list">
      <div v-for="event in events" :key="event.id" class="schedule-item">
        <div class="event-time">
          <div class="event-date">{{ formatEventDate(event.date) }}</div>
          <div class="event-hour">{{ formatEventTime(event.date) }}</div>
        </div>
        <div class="event-content">
          <h4 class="event-title">{{ event.title }}</h4>
          <p class="event-type">{{ event.type }}</p>
          <p class="event-course">{{ event.course }}</p>
        </div>
        <div class="event-action">
          <button class="btn-secondary btn-sm" v-if="event.meetingLink">
            <VideoCameraIcon class="w-4 h-4" />
            Join
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { VideoCameraIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'UpcomingSchedule',
  components: {
    VideoCameraIcon
  },
  data() {
    return {
      events: [
        {
          id: 1,
          title: 'Office Hours',
          type: 'Meeting',
          course: 'Web Development',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          meetingLink: true
        },
        {
          id: 2,
          title: 'Vue.js Workshop',
          type: 'Workshop',
          course: 'Advanced Vue.js',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          meetingLink: true
        }
      ]
    }
  },
  methods: {
    formatEventDate(date) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    },
    formatEventTime(date) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
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

.view-all-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: var(--brand-accent);
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
}

.event-time {
  text-align: center;
  min-width: 3rem;
}

.event-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--brand-primary);
}

.event-hour {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.event-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.event-course {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--interactive-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.75rem;
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--interactive-tertiary-hover);
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  gap: 0.25rem;
}
</style>