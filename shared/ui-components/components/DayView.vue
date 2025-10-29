<template>
  <div class="day-view card">
    <div class="day-header">
      <h3>{{ formatDate(selectedDate) }}</h3>
      <div class="day-events-count">{{ events.length }} events</div>
    </div>
    
    <div class="day-timeline">
      <div class="time-slots">
        <div v-for="hour in timeSlots" :key="hour" class="time-slot">
          {{ hour }}
        </div>
      </div>
      
      <div class="events-track">
        <div 
          v-for="event in events"
          :key="event.id"
          class="event-item"
          :class="`event-${event.type}`"
          :style="getEventStyle(event)"
          @click="$emit('event-click', event)"
        >
          <div class="event-time">{{ formatEventTime(event) }}</div>
          <div class="event-title">{{ event.title }}</div>
          <div class="event-location" v-if="event.location">{{ event.location }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DayView',
  props: {
    selectedDate: {
      type: Date,
      required: true
    },
    timeSlots: {
      type: Array,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['event-click'],
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric' 
      })
    },
    formatEventTime(event) {
      return `${event.startTime} - ${event.endTime}`
    },
    getEventStyle(event) {
      const startHour = parseInt(event.startTime.split(':')[0])
      const endHour = parseInt(event.endTime.split(':')[0])
      const startMinute = parseInt(event.startTime.split(':')[1])
      const endMinute = parseInt(event.endTime.split(':')[1])
      
      const startOffset = (startHour - 8) * 60 + startMinute
      const duration = (endHour - startHour) * 60 + (endMinute - startMinute)
      
      return {
        top: `${startOffset}px`,
        height: `${Math.max(duration, 30)}px`
      }
    }
  }
}
</script>

<style scoped>
.day-view {
  padding: 1.5rem;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.day-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.day-events-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.day-timeline {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1rem;
  position: relative;
}

.time-slots {
  display: flex;
  flex-direction: column;
}

.time-slot {
  height: 60px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.events-track {
  position: relative;
  min-height: 600px;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 59px,
    var(--border-primary) 59px,
    var(--border-primary) 60px
  );
}

.event-item {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.event-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.event-meeting {
  background: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  color: #3b82f6;
}

.event-office-hours {
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
  color: #10b981;
}

.event-class {
  background: rgba(139, 92, 246, 0.1);
  border-left: 4px solid #8b5cf6;
  color: #8b5cf6;
}

.event-time {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.event-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-location {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>