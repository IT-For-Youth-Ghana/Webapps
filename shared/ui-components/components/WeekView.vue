<template>
  <div class="week-view card">
    <div class="week-header">
      <div class="time-column"></div>
      <div v-for="day in weekDays" :key="day.date" class="day-header">
        <div class="day-name">{{ day.name }}</div>
        <div class="day-date" :class="{ today: day.isToday }">{{ day.date }}</div>
      </div>
    </div>
    
    <div class="week-content">
      <div class="time-slots">
        <div v-for="hour in timeSlots" :key="hour" class="time-slot">
          {{ hour }}
        </div>
      </div>
      
      <div class="days-grid">
        <div v-for="day in weekDays" :key="day.date" class="day-column">
          <div 
            v-for="event in getDayEvents(day.fullDate)"
            :key="event.id"
            class="event-item"
            :class="[`event-${event.type}`, { 'event-current': event.isCurrent }]"
            :style="getEventStyle(event)"
            @click="$emit('event-click', event)"
          >
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div class="event-title">{{ event.title }}</div>
            <div class="event-participants" v-if="event.participants">
              {{ event.participants }} participants
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeekView',
  props: {
    weekDays: {
      type: Array,
      required: true
    },
    timeSlots: {
      type: Array,
      default: () => [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
      ]
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['event-click'],
  methods: {
    getDayEvents(date) {
      return this.events.filter(event => 
        event.date === date || 
        (event.startDate <= date && event.endDate >= date)
      )
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
        height: `${duration}px`
      }
    }
  }
}
</script>

<style scoped>
.week-view {
  padding: 0;
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  border-bottom: 1px solid var(--border-primary);
}

.time-column {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-primary);
}

.day-header {
  padding: 1rem;
  text-align: center;
  border-right: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.day-header:last-child {
  border-right: none;
}

.day-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.day-date {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.day-date.today {
  background: var(--brand-primary);
  color: white;
}

.week-content {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  max-height: 600px;
  overflow-y: auto;
}

.time-slots {
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-primary);
}

.time-slot {
  height: 60px;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-primary);
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

.days-grid {
  display: contents;
}

.day-column {
  position: relative;
  border-right: 1px solid var(--border-primary);
  min-height: 660px;
}

.day-column:last-child {
  border-right: none;
}

.day-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 59px,
    var(--border-primary) 59px,
    var(--border-primary) 60px
  );
  pointer-events: none;
}

.event-item {
  position: absolute;
  left: 4px;
  right: 4px;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  z-index: 1;
}

.event-item:hover {
  transform: scale(1.02);
  z-index: 2;
}

.event-meeting {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
  color: #3b82f6;
}

.event-office-hours {
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
  color: #10b981;
}

.event-class {
  background: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
  color: #8b5cf6;
}

.event-current {
  box-shadow: 0 0 0 2px var(--brand-primary);
}

.event-time {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-participants {
  font-size: 0.625rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .week-header {
    grid-template-columns: 60px repeat(7, 1fr);
  }
  
  .week-content {
    grid-template-columns: 60px repeat(7, 1fr);
  }
  
  .time-column {
    padding: 0.5rem;
  }
  
  .day-header {
    padding: 0.5rem;
  }
  
  .event-item {
    font-size: 0.625rem;
    padding: 0.25rem;
  }
}
</style>