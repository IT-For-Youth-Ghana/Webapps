<template>
  <div class="month-view card">
    <div class="month-header">
      <div class="weekday-labels">
        <div v-for="day in weekdays" :key="day" class="weekday-label">
          {{ day }}
        </div>
      </div>
    </div>
    
    <div class="month-grid">
      <div 
        v-for="date in monthDates"
        :key="date.fullDate"
        class="month-date"
        :class="{ 
          'other-month': !date.isCurrentMonth,
          'today': date.isToday,
          'has-events': date.events.length > 0
        }"
        @click="$emit('date-click', date.fullDate)"
      >
        <div class="date-number">{{ date.number }}</div>
        <div class="date-events">
          <div 
            v-for="event in date.events.slice(0, 3)"
            :key="event.id"
            class="event-dot"
            :class="`event-${event.type}`"
            @click.stop="$emit('event-click', event)"
          ></div>
          <div v-if="date.events.length > 3" class="events-more">
            +{{ date.events.length - 3 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonthView',
  props: {
    currentMonth: {
      type: Number,
      required: true
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['date-click', 'event-click'],
  computed: {
    weekdays() {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    monthDates() {
      const now = new Date()
      const year = now.getFullYear()
      const month = this.currentMonth
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      
      const dates = []
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const fullDate = date.toISOString().split('T')[0]
        const dayEvents = this.events.filter(event => event.date === fullDate)
        
        dates.push({
          number: date.getDate(),
          fullDate,
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === now.toDateString(),
          events: dayEvents
        })
      }
      
      return dates
    }
  }
}
</script>

<style scoped>
.month-view {
  padding: 1.5rem;
}

.month-header {
  margin-bottom: 1rem;
}

.weekday-labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-primary);
}

.weekday-label {
  background: var(--bg-tertiary);
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-primary);
}

.month-date {
  background: var(--bg-secondary);
  aspect-ratio: 1;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.month-date:hover {
  background: var(--bg-tertiary);
}

.month-date.other-month {
  background: var(--bg-primary);
  opacity: 0.5;
}

.month-date.today {
  background: rgba(27, 101, 178, 0.1);
  border: 2px solid var(--brand-primary);
}

.month-date.has-events {
  background: rgba(16, 185, 129, 0.05);
}

.date-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  align-self: flex-start;
}

.date-events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: flex-end;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  cursor: pointer;
}

.event-meeting {
  background: #3b82f6;
}

.event-office-hours {
  background: #10b981;
}

.event-class {
  background: #8b5cf6;
}

.events-more {
  font-size: 0.625rem;
  color: var(--text-secondary);
  margin-left: 2px;
}

@media (max-width: 768px) {
  .month-view {
    padding: 1rem;
  }
  
  .weekday-label {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .month-date {
    padding: 0.25rem;
  }
  
  .date-number {
    font-size: 0.75rem;
  }
}
</style>