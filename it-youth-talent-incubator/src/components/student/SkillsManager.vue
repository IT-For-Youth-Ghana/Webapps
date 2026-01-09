<!--
  Skills Manager Component
  Manages adding/removing skills
  Integrates with student store
-->
<script setup>
import { ref, computed } from 'vue'
import { useStudentStore } from '../../stores/student.js'

const props = defineProps({
  /** @type {string[]} */
  skills: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: true
  },
  maxSkills: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['update', 'add', 'remove'])

const studentStore = useStudentStore()

// Local state
const newSkill = ref('')
const isAdding = ref(false)
const searchQuery = ref('')

// Suggested skills based on common tech skills
const suggestedSkills = [
  'JavaScript', 'Python', 'React', 'Vue.js', 'Node.js',
  'TypeScript', 'Java', 'C++', 'HTML/CSS', 'SQL',
  'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'AWS',
  'Figma', 'Adobe XD', 'Agile', 'Scrum', 'REST APIs',
  'GraphQL', 'Machine Learning', 'Data Analysis', 'Excel',
  'Communication', 'Problem Solving', 'Teamwork', 'Leadership'
]

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return suggestedSkills
    .filter(skill => 
      skill.toLowerCase().includes(query) && 
      !props.skills.includes(skill)
    )
    .slice(0, 5)
})

const canAddMore = computed(() => props.skills.length < props.maxSkills)

const handleAddSkill = async () => {
  const skill = newSkill.value.trim()
  if (!skill || props.skills.includes(skill) || !canAddMore.value) return

  isAdding.value = true
  
  try {
    const result = await studentStore.addSkill(skill)
    if (result.success) {
      emit('add', skill)
      newSkill.value = ''
      searchQuery.value = ''
    }
  } finally {
    isAdding.value = false
  }
}

const handleRemoveSkill = async (skill) => {
  if (!props.editable) return
  
  const result = await studentStore.removeSkill(skill)
  if (result.success) {
    emit('remove', skill)
  }
}

const handleSuggestionClick = (skill) => {
  newSkill.value = skill
  searchQuery.value = ''
  handleAddSkill()
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleAddSkill()
  }
}
</script>

<template>
  <div class="skills-manager">
    <!-- Header -->
    <div class="skills-header">
      <h4 class="skills-title">Skills</h4>
      <span class="skills-count">{{ skills.length }}/{{ maxSkills }}</span>
    </div>

    <!-- Current Skills -->
    <div class="skills-list">
      <TransitionGroup name="skill">
        <span
          v-for="skill in skills"
          :key="skill"
          class="skill-tag"
        >
          {{ skill }}
          <button
            v-if="editable"
            @click="handleRemoveSkill(skill)"
            class="skill-remove"
            :disabled="studentStore.isSaving"
            aria-label="Remove skill"
          >
            ×
          </button>
        </span>
      </TransitionGroup>
      
      <span v-if="skills.length === 0" class="no-skills">
        No skills added yet
      </span>
    </div>

    <!-- Add Skill Input -->
    <div v-if="editable && canAddMore" class="add-skill-section">
      <div class="skill-input-wrapper">
        <input
          v-model="newSkill"
          @input="searchQuery = newSkill"
          @keydown="handleKeydown"
          type="text"
          class="skill-input"
          placeholder="Type a skill and press Enter"
          :disabled="isAdding"
        />
        <button
          @click="handleAddSkill"
          class="add-skill-btn"
          :disabled="!newSkill.trim() || isAdding || skills.includes(newSkill.trim())"
        >
          <span v-if="isAdding" class="loading-spinner small"></span>
          <span v-else>Add</span>
        </button>
      </div>

      <!-- Suggestions Dropdown -->
      <div v-if="filteredSuggestions.length > 0" class="suggestions-dropdown">
        <button
          v-for="suggestion in filteredSuggestions"
          :key="suggestion"
          @click="handleSuggestionClick(suggestion)"
          class="suggestion-item"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Quick Add Suggestions -->
    <div v-if="editable && canAddMore" class="quick-add-section">
      <span class="quick-add-label">Quick add:</span>
      <div class="quick-add-skills">
        <button
          v-for="suggestion in suggestedSkills.filter(s => !skills.includes(s)).slice(0, 6)"
          :key="suggestion"
          @click="handleSuggestionClick(suggestion)"
          class="quick-add-btn"
          :disabled="isAdding"
        >
          + {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="studentStore.error" class="error-message">
      {{ studentStore.error }}
    </p>
  </div>
</template>

<style scoped>
.skills-manager {
  background: var(--card-background, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skills-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.skills-count {
  font-size: 0.875rem;
  color: var(--text-muted, #94a3b8);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 2.5rem;
  margin-bottom: 1rem;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-primary-light, #eff6ff);
  color: var(--color-primary, #3b82f6);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.skill-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.25rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.skill-remove:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
}

.skill-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-skills {
  color: var(--text-muted, #94a3b8);
  font-size: 0.875rem;
  font-style: italic;
}

.add-skill-section {
  position: relative;
  margin-bottom: 1rem;
}

.skill-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.skill-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.skill-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-skill-btn {
  padding: 0.625rem 1rem;
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 4rem;
}

.add-skill-btn:hover:not(:disabled) {
  background: var(--color-primary-dark, #2563eb);
}

.add-skill-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 4.5rem;
  background: white;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  z-index: 10;
  margin-top: 0.25rem;
  overflow: hidden;
}

.suggestion-item {
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--text-primary);
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: var(--bg-hover, #f8fafc);
}

.quick-add-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-add-label {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quick-add-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.quick-add-btn {
  padding: 0.25rem 0.625rem;
  border: 1px dashed var(--border-color, #e2e8f0);
  border-radius: 9999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-add-btn:hover:not(:disabled) {
  border-color: var(--color-primary, #3b82f6);
  color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, #eff6ff);
}

.quick-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: var(--color-danger, #ef4444);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Transition animations */
.skill-enter-active,
.skill-leave-active {
  transition: all 0.3s ease;
}

.skill-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.skill-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
