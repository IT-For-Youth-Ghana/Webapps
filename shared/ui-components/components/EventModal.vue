<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ event ? 'Edit Event' : 'Create Event' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="event-form">
        <div class="form-group">
          <label>Title</label>
          <input 
            v-model="formData.title" 
            type="text" 
            class="input-field"
            required 
          />
        </div>
        
        <div class="form-group">
          <label>Type</label>
          <select v-model="formData.type" class="input-field">
            <option v-for="type in meetingTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input 
              v-model="formData.date" 
              type="date" 
              class="input-field"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Start Time</label>
            <input 
              v-model="formData.startTime" 
              type="time" 
              class="input-field"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>End Time</label>
            <input 
              v-model="formData.endTime" 
              type="time" 
              class="input-field"
              required 
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Location</label>
          <input 
            v-model="formData.location" 
            type="text" 
            class="input-field"
            placeholder="Room, Online link, etc."
          />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ event ? 'Update' : 'Create' }} Event
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'EventModal',
  props: {
    event: {
      type: Object,
      default: null
    },
    meetingTypes: {
      type: Array,
      required: true
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const formData = ref({
      title: '',
      type: 'meeting',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      participants: null
    })
    
    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        formData.value = { ...newEvent }
      } else {
        formData.value = {
          title: '',
          type: 'meeting',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          location: '',
          participants: null
        }
      }
    }, { immediate: true })
    
    const handleSubmit = () => {
      emit('save', { ...formData.value })
    }
    
    return {
      formData,
      handleSubmit
    }
  }
}
</script>

<style scoped>
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
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.event-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>