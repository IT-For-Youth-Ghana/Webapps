<template>
  <div class="teacher-schedule fade-in">
    <div class="content-wrapper">

      <!-- Page Actions -->
      <div class="quick-actions-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Schedule & Meetings</h2>
            <p class="section-subtitle">Manage your calendar, office hours, and online meetings</p>
          </div>
          <div class="actions">
            <button class="quick-action-btn" @click="syncCalendar">
              <!-- Sync Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Sync Calendar
            </button>
            <button class="quick-action-btn primary" @click="showCreateEvent = true">
              <!-- Plus Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              New Event
            </button>
          </div>
        </div>
      </div>

     
      <!-- Simple Calendar Navigation -->
      <div class="calendar-navigation quick-actions-section">
        <div class="nav-header">
          <button class="nav-btn" @click="previousPeriod">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
              <polyline points="15 6 9 12 3 6"/>
            </svg>
          </button>
          <h3 class="period-title">{{ formatCurrentPeriod() }}</h3>
          <button class="nav-btn" @click="nextPeriod">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 15 18"/>
              <polyline points="9 6 15 12 9 3"/>
            </svg>
          </button>
        </div>
        <div class="period-range">{{ formatPeriodRange() }}</div>
      </div>

      <!-- Simple Week View -->
      <div class="calendar-container quick-actions-section">
        <div class="week-view">
          <div class="week-days">
            <div v-for="day in weekDays" :key="day.date" class="day-column">
              <div class="day-header">
                <div class="day-name">{{ day.name }}</div>
                <div class="day-date">{{ day.date }}</div>
              </div>
              <div class="day-events">
                <div 
                  v-for="event in getDayEvents(day.date)" 
                  :key="event.id" 
                  class="event-item"
                  :class="event.type"
                  @click="handleEventClick(event)"
                >
                  <div class="event-time">{{ event.time }}</div>
                  <div class="event-title">{{ event.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Event Modal -->
      <div v-if="showCreateEvent" class="modal-overlay" @click="closeEventModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Create New Event</h3>
            <button class="quick-action-btn" @click="closeEventModal">
              <!-- Close Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Event Title *</label>
              <input
                v-model="newEvent.title"
                type="text"
                class="input-field"
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input
                v-model="newEvent.date"
                type="date"
                class="input-field"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Time *</label>
              <input
                v-model="newEvent.time"
                type="time"
                class="input-field"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Type</label>
              <select v-model="newEvent.type" class="input-field">
                <option value="class">Class</option>
                <option value="office-hours">Office Hours</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="newEvent.description"
                class="input-field"
                rows="3"
                placeholder="Add event description..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="quick-action-btn" @click="closeEventModal">Cancel</button>
            <button class="quick-action-btn primary" @click="saveEvent">Create Event</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TeacherSchedulePage',
  setup() {
    const showCreateEvent = ref(false)
    const selectedEvent = ref(null)
    const currentView = ref('week')
    const selectedDate = ref(new Date())
    const currentMonth = ref(new Date().getMonth())
    
    const newEvent = ref({
      title: '',
      date: '',
      time: '',
      type: 'class',
      description: ''
    })
    
    const scheduleStats = ref({
      upcomingEvents: 5,
      todayEvents: 2,
      officeHours: 4,
      totalStudents: 12
    })
    
    // Sample week data
    const weekDays = ref([
      { name: 'Monday', date: 'Oct 28' },
      { name: 'Tuesday', date: 'Oct 29' },
      { name: 'Wednesday', date: 'Oct 30' },
      { name: 'Thursday', date: 'Oct 31' },
      { name: 'Friday', date: 'Nov 1' },
      { name: 'Saturday', date: 'Nov 2' },
      { name: 'Sunday', date: 'Nov 3' }
    ])
    
    const currentEvents = ref([
      {
        id: 1,
        title: 'Web Development Class',
        date: 'Oct 28',
        time: '09:00',
        type: 'class',
        description: 'Introduction to HTML and CSS'
      },
      {
        id: 2,
        title: 'Office Hours',
        date: 'Oct 28',
        time: '14:00',
        type: 'office-hours',
        description: 'Available for student questions'
      },
      {
        id: 3,
        title: 'Vue.js Workshop',
        date: 'Oct 30',
        time: '10:00',
        type: 'class',
        description: 'Advanced Vue components'
      }
    ])
    
    const formatCurrentPeriod = () => {
      return `${weekDays.value[0].date} - ${weekDays.value[weekDays.value.length - 1].date}, 2024`
    }
    
    const formatPeriodRange = () => {
      return 'Week 44'
    }
    
    const getDayEvents = (date) => {
      return currentEvents.value.filter(event => event.date === date)
    }
    
    const handleEventClick = (event) => {
      selectedEvent.value = event
      console.log('Event clicked:', event)
    }
    
    const closeEventModal = () => {
      showCreateEvent.value = false
      selectedEvent.value = null
      newEvent.value = {
        title: '',
        date: '',
        time: '',
        type: 'class',
        description: ''
      }
    }
    
    const saveEvent = () => {
      if (!newEvent.value.title || !newEvent.value.date || !newEvent.value.time) {
        alert('Please fill in required fields')
        return
      }
      
      console.log('Saving event:', newEvent.value)
      
      // Add to events list
      const newEventItem = {
        id: Date.now(),
        ...newEvent.value
      }
      currentEvents.value.push(newEventItem)
      
      alert('Event created successfully!')
      closeEventModal()
    }
    
    const syncCalendar = () => {
      console.log('Syncing calendar...')
      alert('Calendar synced successfully!')
    }
    
    const previousPeriod = () => {
      console.log('Previous period')
    }
    
    const nextPeriod = () => {
      console.log('Next period')
    }
    
    const handleViewChange = (view) => {
      currentView.value = view
    }
    
    return {
      showCreateEvent,
      selectedEvent,
      currentView,
      selectedDate,
      currentMonth,
      newEvent,
      scheduleStats,
      weekDays,
      currentEvents,
      formatCurrentPeriod,
      formatPeriodRange,
      getDayEvents,
      handleEventClick,
      closeEventModal,
      saveEvent,
      syncCalendar,
      previousPeriod,
      nextPeriod,
      handleViewChange
    }
  }
}
</script>

<style scoped>
.teacher-schedule {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.schedule-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
}

.stat-icon.upcoming {
  background: var(--primary);
}

.stat-icon.today {
  background: var(--status-success-text);
}

.stat-icon.hours {
  background: var(--status-warning-text);
}

.stat-icon.meetings {
  background: var(--brand-secondary);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.calendar-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.period-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.period-range {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.calendar-container {
  padding: 1.5rem 0 0 0;
}

.week-view {
  min-height: 600px;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
}

.day-column {
  display: flex;
  flex-direction: column;
}

.day-header {
  padding: 1rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  text-align: center;
}

.day-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.day-date {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.day-events {
  flex: 1;
  padding: 0.5rem;
  min-height: 400px;
}

.event-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-item.class {
  background: rgba(27, 101, 178, 0.1);
  border-left: 3px solid var(--primary);
}

.event-item.office-hours {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid var(--status-warning-text);
}

.event-item.meeting {
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid var(--status-success-text);
}

.event-item:hover {
  transform: translateX(2px);
  opacity: 0.8;
}

.event-time {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.event-title {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.close-btn:hover {
  background: var(--bg-tertiary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quick-action-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.quick-action-btn.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.quick-action-btn.admin:hover {
  background: #8b5cf6;
  color: white;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .actions .quick-action-btn {
    flex: 1;
  }
  
  .schedule-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .calendar-navigation {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .week-days {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 0;
  }
}
</style>