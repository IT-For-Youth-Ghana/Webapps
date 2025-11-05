<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <h2 class="section-title">Persönliche Erinnerungen</h2>
      <button @click="showAddForm = !showAddForm" class="btn-primary add-reminder-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14m-7-7h14"/>
        </svg>
        Todo hinzufügen
      </button>
    </div>
    
    <!-- Add Reminder Form -->
    <div v-if="showAddForm" class="add-reminder-form">
      <div class="form-group">
        <input 
          v-model="newReminder.title" 
          type="text" 
          placeholder="Was steht auf deiner Todo-Liste?"
          class="input-field"
          @keyup.enter="focusDescription"
          ref="titleInput"
        >
      </div>
      <div class="form-group">
        <textarea 
          v-model="newReminder.description" 
          placeholder="Zusätzliche Notizen (optional)..."
          class="input-field form-textarea"
          rows="3"
          ref="descriptionInput"
        ></textarea>
      </div>
      <div class="form-group">
        <select v-model="newReminder.priority" class="input-field">
          <option value="low">Niedrige Priorität</option>
          <option value="medium">Mittlere Priorität</option>
          <option value="high">Hohe Priorität</option>
        </select>
      </div>
      <div class="form-actions">
        <button @click="addReminder" class="btn-primary" :disabled="!newReminder.title.trim()">
          Hinzufügen
        </button>
        <button @click="cancelAdd" class="btn-secondary">
          Abbrechen
        </button>
      </div>
    </div>
    
    <!-- Reminders List -->
    <div v-if="reminders.length === 0 && !showAddForm" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </div>
      <p class="empty-message">Noch keine Todos erstellt</p>
    </div>
    
    <div v-else-if="reminders.length > 0" class="reminders-list">
      <div v-for="reminder in sortedReminders" :key="reminder.id" class="reminder-item" :class="reminder.priority">
        <div class="reminder-header">
          <h3 class="reminder-title">{{ reminder.title }}</h3>
          <div class="reminder-actions">
            <button @click="toggleComplete(reminder)" class="action-btn" :class="{ completed: reminder.completed }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </button>
            <button @click="deleteReminder(reminder.id)" class="action-btn delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        <p v-if="reminder.description" class="reminder-description">{{ reminder.description }}</p>
        <div class="reminder-meta">
          <span class="priority-badge" :class="reminder.priority">
            {{ getPriorityLabel(reminder.priority) }}
          </span>
          <span class="reminder-date">{{ formatDate(reminder.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'

export default {
  name: 'PersonalReminders',
  setup() {
    const showAddForm = ref(false)
    const titleInput = ref(null)
    const descriptionInput = ref(null)
    
    const newReminder = ref({
      title: '',
      description: '',
      priority: 'medium'
    })
    
    const reminders = ref([
      {
        id: 1,
        title: 'Klausuren korrigieren',
        description: 'Web Development Fundamentals - 28 Klausuren',
        priority: 'high',
        completed: false,
        createdAt: new Date('2024-11-01')
      },
      {
        id: 2,
        title: 'Vue.js Slides aktualisieren',
        description: 'Neue Beispiele für State Management hinzufügen',
        priority: 'medium',
        completed: false,
        createdAt: new Date('2024-11-02')
      },
      {
        id: 3,
        title: 'Sprechstunden-Termine bestätigen',
        description: '',
        priority: 'low',
        completed: true,
        createdAt: new Date('2024-10-30')
      }
    ])
    
    const sortedReminders = computed(() => {
      return reminders.value
        .filter(r => !r.completed)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
    })
    
    const addReminder = () => {
      if (!newReminder.value.title.trim()) return
      
      const reminder = {
        id: Date.now(),
        title: newReminder.value.title.trim(),
        description: newReminder.value.description.trim(),
        priority: newReminder.value.priority,
        completed: false,
        createdAt: new Date()
      }
      
      reminders.value.push(reminder)
      
      // Reset form
      newReminder.value = {
        title: '',
        description: '',
        priority: 'medium'
      }
      showAddForm.value = false
    }
    
    const cancelAdd = () => {
      newReminder.value = {
        title: '',
        description: '',
        priority: 'medium'
      }
      showAddForm.value = false
    }
    
    const focusDescription = () => {
      nextTick(() => {
        if (descriptionInput.value) {
          descriptionInput.value.focus()
        }
      })
    }
    
    const toggleComplete = (reminder) => {
      reminder.completed = !reminder.completed
    }
    
    const deleteReminder = (id) => {
      const index = reminders.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reminders.value.splice(index, 1)
      }
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        low: 'Niedrig',
        medium: 'Mittel',
        high: 'Hoch'
      }
      return labels[priority] || priority
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short'
      })
    }
    
    return {
      showAddForm,
      titleInput,
      descriptionInput,
      newReminder,
      reminders,
      sortedReminders,
      addReminder,
      cancelAdd,
      focusDescription,
      toggleComplete,
      deleteReminder,
      getPriorityLabel,
      formatDate
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

.add-reminder-btn {
  gap: 0.5rem;
}

.add-reminder-form {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}


.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reminder-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid var(--border-primary);
}

.reminder-item.high {
  border-left-color: var(--status-error-text);
}

.reminder-item.medium {
  border-left-color: var(--status-warning-text);
}

.reminder-item.low {
  border-left-color: var(--status-success-text);
}

.reminder-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.reminder-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.reminder-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.reminder-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-btn.completed {
  background: var(--status-success-text);
  color: white;
  border-color: var(--status-success-text);
}

.action-btn.delete:hover {
  background: var(--status-error-text);
  color: white;
  border-color: var(--status-error-text);
}

.reminder-description {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  line-height: 1.4;
}

.reminder-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.priority-badge.high {
  background: var(--status-error);
  color: var(--status-error-text);
}

.priority-badge.medium {
  background: var(--status-warning);
  color: var(--status-warning-text);
}

.priority-badge.low {
  background: var(--status-success);
  color: var(--status-success-text);
}

.reminder-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .reminder-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .reminder-actions {
    align-self: flex-end;
  }
  
  .reminder-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>