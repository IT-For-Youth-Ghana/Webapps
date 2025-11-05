<template>
  <div class="quick-actions-section">
    <div class="section-header" @click="toggleSection">
      <h2 class="section-title">Course Q&A</h2>
      <div class="header-actions">
        <button class="quick-action-btn" @click.stop="showQuestionModal = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Ask Question
        </button>
        <div class="toggle-icon" :class="{ expanded: isExpanded }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div v-if="isExpanded" class="qa-list">
      <div v-for="qa in questions" :key="qa.id" class="qa-item">
        <div class="question-header">
          <div class="question-author">
            <div class="author-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="author-info">
              <div class="author-name">{{ qa.author.name }}</div>
              <div class="author-role">{{ qa.author.role }}</div>
            </div>
          </div>
          <div class="question-time">{{ formatTime(qa.createdAt) }}</div>
        </div>
        
        <div class="question-content">
          <h4 class="question-title">{{ qa.question }}</h4>
          <p v-if="qa.description" class="question-description">{{ qa.description }}</p>
        </div>
        
        <div class="answers-section" v-if="qa.answers.length > 0">
          <div class="answers-header">
            <span class="answers-count">{{ qa.answers.length }} {{ qa.answers.length === 1 ? 'Answer' : 'Answers' }}</span>
          </div>
          
          <div v-for="answer in qa.answers" :key="answer.id" class="answer-item">
            <div class="answer-author">
              <div class="author-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="author-info">
                <div class="author-name">{{ answer.author.name }}</div>
                <div class="author-role">{{ answer.author.role }}</div>
              </div>
            </div>
            <div class="answer-content">
              <p>{{ answer.content }}</p>
              <div class="answer-time">{{ formatTime(answer.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <div class="answer-form">
          <div class="answer-input-group">
            <input 
              v-model="qa.newAnswer" 
              type="text" 
              class="answer-input"
              :placeholder="isTeacher ? 'Answer as teacher...' : 'Answer as student...'"
              @keyup.enter="submitAnswer(qa.id)"
            />
            <button 
              @click="submitAnswer(qa.id)" 
              class="answer-submit-btn"
              :disabled="!qa.newAnswer?.trim()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="questions.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72l2.54-17.72H8.56Z"/>
          <path d="M2 9.1c4.5.1 8.48 2.35 9.56 6.65"/>
        </svg>
        <p>No questions yet. Be the first to ask!</p>
      </div>
    </div>
    
    <!-- Ask Question Modal -->
    <div v-if="showQuestionModal" class="modal-overlay" @click="closeQuestionModal">
      <div class="modal-content" @click.stop>
        <div class="quick-actions-section">
          <div class="section-header">
            <h3 class="section-title">Ask a Question</h3>
            <button @click="closeQuestionModal" class="quick-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>
          
          <form @submit.prevent="submitQuestion">
            <div class="form-group">
              <label for="questionTitle" class="form-label">Question Title</label>
              <input 
                id="questionTitle"
                v-model="newQuestion.title" 
                type="text" 
                class="quick-action-btn form-input"
                placeholder="What would you like to know?"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="questionDescription" class="form-label">Additional Details (Optional)</label>
              <textarea 
                id="questionDescription"
                v-model="newQuestion.description" 
                class="quick-action-btn form-textarea"
                placeholder="Provide more context about your question..."
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeQuestionModal" class="quick-action-btn">
                Cancel
              </button>
              <button type="submit" :disabled="!newQuestion.title.trim()" class="quick-action-btn primary">
                Post Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseQA',
  props: {
    questions: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: Object,
      default: () => ({ name: 'Guest', role: 'student' })
    },
    isTeacher: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-question', 'add-answer'],
  data() {
    return {
      showQuestionModal: false,
      isExpanded: false,
      newQuestion: {
        title: '',
        description: ''
      }
    }
  },
  methods: {
    submitQuestion() {
      if (!this.newQuestion.title.trim()) return
      
      const question = {
        id: Date.now(),
        question: this.newQuestion.title,
        description: this.newQuestion.description,
        author: this.currentUser,
        answers: [],
        createdAt: new Date().toISOString(),
        newAnswer: ''
      }
      
      this.$emit('add-question', question)
      this.closeQuestionModal()
    },
    
    submitAnswer(questionId) {
      const qa = this.questions.find(q => q.id === questionId)
      if (!qa || !qa.newAnswer?.trim()) return
      
      const answer = {
        id: Date.now(),
        content: qa.newAnswer.trim(),
        author: this.currentUser,
        createdAt: new Date().toISOString()
      }
      
      this.$emit('add-answer', { questionId, answer })
      qa.newAnswer = ''
    },
    
    closeQuestionModal() {
      this.showQuestionModal = false
      this.newQuestion = { title: '', description: '' }
    },
    toggleSection() {
      this.isExpanded = !this.isExpanded
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.quick-actions-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  cursor: pointer;
  user-select: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
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
  justify-content: center;
}

.quick-action-btn:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  background: var(--interactive-primary);
  color: white;
  border-color: var(--interactive-primary);
}

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qa-item {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.qa-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.question-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.author-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.question-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.question-content {
  margin-bottom: 1rem;
}

.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.question-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.answers-section {
  margin-bottom: 1rem;
}

.answers-header {
  margin-bottom: 0.75rem;
}

.answers-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.answer-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.answer-author {
  flex-shrink: 0;
}

.answer-author .author-avatar {
  width: 32px;
  height: 32px;
}

.answer-author .author-name {
  font-size: 0.8rem;
}

.answer-author .author-role {
  font-size: 0.7rem;
}

.answer-content {
  flex: 1;
}

.answer-content p {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.answer-time {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.answer-form {
  border-top: 1px solid var(--border-light);
  padding-top: 1rem;
}

.answer-input-group {
  display: flex;
  gap: 0.5rem;
}

.answer-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.answer-input:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

.answer-submit-btn {
  padding: 0.75rem;
  background: var(--interactive-primary);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-submit-btn:hover:not(:disabled) {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.answer-submit-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .answer-input-group {
    flex-direction: column;
  }
  
  .answer-submit-btn {
    align-self: flex-end;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .quick-action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>