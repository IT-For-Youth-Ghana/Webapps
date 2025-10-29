<template>
  <DashboardLayout>
    <div class="dashboard fade-in">
      <DashboardHeader 
        title="Schedule & Meetings"
        subtitle="Manage your calendar, office hours, and online meetings"
      >
        <template #actions>
          <button class="btn btn-secondary" @click="syncCalendar">
            Sync Calendar
          </button>
          <button class="btn btn-primary" @click="showCreateEvent = true">
            New Event
          </button>
        </template>
      </DashboardHeader>

      <ScheduleStats :stats="scheduleStats" />

      <CalendarNavigation 
        :period-title="formatCurrentPeriod()" 
        :period-range="formatPeriodRange()"
        :current-view="currentView"
        :views="viewOptions"
        @previous="previousPeriod"
        @next="nextPeriod"
        @view-change="handleViewChange"
      />

      <div class="calendar-container">
        <WeekView 
          v-if="currentView === 'week'"
          :week-days="weekDays"
          :time-slots="timeSlots" 
          :events="currentEvents"
          @event-click="handleEventClick"
        />
        
        <DayView 
          v-else-if="currentView === 'day'"
          :selected-date="selectedDate"
          :time-slots="timeSlots"
          :events="getDayEvents(selectedDate)"
          @event-click="handleEventClick"
        />
        
        <MonthView 
          v-else
          :current-month="currentMonth"
          :events="currentEvents"
          @date-click="handleDateClick"
          @event-click="handleEventClick"
        />
      </div>

      <EventModal 
        v-if="showCreateEvent || selectedEvent"
        :event="selectedEvent"
        :meeting-types="meetingTypes"
        @save="handleEventSave"
        @close="closeEventModal"
      />
    </div>
  </DashboardLayout>
</template>

<script>
import { ref } from 'vue'
import DashboardLayout from '@shared/ui-components/layouts/DashboardLayout.vue'
import DashboardHeader from '@shared/ui-components/components/DashboardHeader.vue'
import ScheduleStats from '@shared/ui-components/components/ScheduleStats.vue'
import CalendarNavigation from '@shared/ui-components/components/CalendarNavigation.vue'
import WeekView from '@shared/ui-components/components/WeekView.vue'
import DayView from '@shared/ui-components/components/DayView.vue'
import MonthView from '@shared/ui-components/components/MonthView.vue'
import EventModal from '@shared/ui-components/components/EventModal.vue'
import { useCalendar } from '@shared/composables/useCalendar.js'
import {
  viewOptions,
  timeSlots,
  defaultScheduleStats,
  sampleEvents,
  meetingTypes
} from '@shared/data/schedule.data.js'

export default {
  name: 'TeacherSchedulePage',
  components: {
    DashboardLayout,
    DashboardHeader,
    ScheduleStats,
    CalendarNavigation,
    WeekView,
    DayView,
    MonthView,
    EventModal
  },
  setup() {
    const {
      currentView,
      selectedDate,
      selectedEvent,
      showCreateEvent,
      weekDays,
      currentMonth,
      currentEvents,
      formatCurrentPeriod,
      formatPeriodRange,
      navigatePeriod,
      getDayEvents,
      saveEvent
    } = useCalendar(sampleEvents)
    
    const scheduleStats = ref(defaultScheduleStats)
    
    const handleViewChange = (view) => {
      currentView.value = view
    }
    
    const handleEventClick = (event) => {
      selectedEvent.value = event
    }
    
    const handleDateClick = (date) => {
      selectedDate.value = new Date(date)
      currentView.value = 'day'
    }
    
    const handleEventSave = (eventData) => {
      saveEvent(eventData)
      closeEventModal()
    }
    
    const closeEventModal = () => {
      selectedEvent.value = null
      showCreateEvent.value = false
    }
    
    const syncCalendar = () => {
      console.log('Syncing calendar...')
    }
    
    return {
      currentView,
      selectedDate,
      selectedEvent,
      showCreateEvent,
      scheduleStats,
      viewOptions,
      timeSlots,
      meetingTypes,
      weekDays,
      currentMonth,
      currentEvents,
      formatCurrentPeriod,
      formatPeriodRange,
      previousPeriod: () => navigatePeriod('previous'),
      nextPeriod: () => navigatePeriod('next'),
      handleViewChange,
      handleEventClick,
      handleDateClick,
      getDayEvents,
      handleEventSave,
      closeEventModal,
      syncCalendar
    }
  }
}
</script>

<style scoped>
.calendar-container {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .calendar-container {
    margin-bottom: 1rem;
  }
}
</style>