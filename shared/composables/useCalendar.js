// Calendar composable for date and event management
import { ref, computed } from 'vue'

export function useCalendar(initialEvents = []) {
  const currentDate = ref(new Date())
  const currentView = ref('week')
  const selectedDate = ref(new Date())
  const selectedEvent = ref(null)
  const showCreateEvent = ref(false)
  const events = ref(initialEvents)
  
  const weekDays = computed(() => {
    const start = new Date(currentDate.value)
    start.setDate(start.getDate() - start.getDay())
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
        isToday: date.toDateString() === new Date().toDateString()
      }
    })
  })
  
  const currentMonth = computed(() => currentDate.value.getMonth())
  
  const currentEvents = computed(() => {
    return events.value.filter(event => {
      const eventDate = new Date(event.date)
      if (currentView.value === 'week') {
        const weekStart = new Date(currentDate.value)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return eventDate >= weekStart && eventDate <= weekEnd
      }
      return true
    })
  })
  
  const formatCurrentPeriod = () => {
    if (currentView.value === 'month') {
      return currentDate.value.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    }
    return currentDate.value.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    })
  }
  
  const formatPeriodRange = () => {
    if (currentView.value === 'week') {
      const weekStart = weekDays.value[0]
      const weekEnd = weekDays.value[6]
      return `${weekStart.date} - ${weekEnd.date}`
    }
    return ''
  }
  
  const navigatePeriod = (direction) => {
    const newDate = new Date(currentDate.value)
    const multiplier = direction === 'next' ? 1 : -1
    
    if (currentView.value === 'month') {
      newDate.setMonth(newDate.getMonth() + multiplier)
    } else if (currentView.value === 'week') {
      newDate.setDate(newDate.getDate() + (7 * multiplier))
    } else {
      newDate.setDate(newDate.getDate() + multiplier)
    }
    
    currentDate.value = newDate
  }
  
  const getDayEvents = (date) => {
    return events.value.filter(event => event.date === date)
  }
  
  const saveEvent = (eventData) => {
    if (eventData.id) {
      const index = events.value.findIndex(e => e.id === eventData.id)
      if (index !== -1) {
        events.value[index] = eventData
      }
    } else {
      events.value.push({
        ...eventData,
        id: Date.now()
      })
    }
  }
  
  return {
    // State
    currentDate,
    currentView,
    selectedDate,
    selectedEvent,
    showCreateEvent,
    events,
    // Computed
    weekDays,
    currentMonth,
    currentEvents,
    // Methods
    formatCurrentPeriod,
    formatPeriodRange,
    navigatePeriod,
    getDayEvents,
    saveEvent
  }
}