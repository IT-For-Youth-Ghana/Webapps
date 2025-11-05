<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Heutige Termine</h2>
      <span class="date-badge">{{ currentDate }}</span>
    </div>
    
    <div v-if="appointments.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <p class="empty-message">Keine Termine für heute</p>
    </div>
    
    <div v-else class="appointments-list">
      <div v-for="appointment in appointments" :key="appointment.id" class="appointment-item">
        <div class="appointment-time">
          <span class="time">{{ appointment.time }}</span>
          <span class="duration">{{ appointment.duration }}</span>
        </div>
        <div class="appointment-content">
          <h3 class="appointment-title">{{ appointment.title }}</h3>
          <p class="appointment-description">{{ appointment.description }}</p>
          <div class="appointment-meta">
            <span class="appointment-type" :class="appointment.type">
              {{ getTypeLabel(appointment.type) }}
            </span>
            <span v-if="appointment.location" class="appointment-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ appointment.location }}
            </span>
          </div>
        </div>
        <div class="appointment-status">
          <div class="status-indicator" :class="appointment.status"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpcomingAppointments',
  props: {
    appointments: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    }
  },
  methods: {
    getTypeLabel(type) {
      const labels = {
        meeting: 'Meeting',
        lecture: 'Vorlesung',
        consultation: 'Sprechstunde',
        event: 'Veranstaltung'
      }
      return labels[type] || type
    }
  }
}
</script>

<style scoped>
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.date-badge {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-message {
  margin: 0;
  font-size: 1rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.appointment-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.appointment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.time {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--interactive-primary);
}

.duration {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.appointment-content {
  flex: 1;
}

.appointment-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.appointment-description {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  line-height: 1.4;
}

.appointment-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.appointment-type {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.appointment-type.meeting {
  background: var(--status-info);
  color: var(--status-info-text);
}

.appointment-type.lecture {
  background: var(--status-success);
  color: var(--status-success-text);
}

.appointment-type.consultation {
  background: var(--status-warning);
  color: var(--status-warning-text);
}

.appointment-type.event {
  background: var(--interactive-secondary);
  color: var(--interactive-primary);
}

.appointment-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.appointment-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.upcoming {
  background: var(--status-info-text);
}

.status-indicator.in-progress {
  background: var(--status-success-text);
}

.status-indicator.completed {
  background: var(--text-secondary);
}

@media (max-width: 768px) {
  .appointment-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .appointment-time {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    min-width: auto;
  }
  
  .appointment-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>