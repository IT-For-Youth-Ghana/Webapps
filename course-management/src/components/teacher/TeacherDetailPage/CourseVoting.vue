<template>
  <div class="quick-actions-section">
    <div class="section-header" @click="toggleSection">
      <h2 class="section-title">Course Polls & Voting</h2>
      <div class="header-actions">
        <button v-if="isTeacher" class="quick-action-btn" @click.stop="showPollModal = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
          </svg>
          Create Poll
        </button>
        <div class="toggle-icon" :class="{ expanded: isExpanded }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div v-if="isExpanded" class="polls-list">
      <div v-for="poll in polls" :key="poll.id" class="poll-item">
        <div class="poll-header">
          <div class="poll-title-section">
            <h3 class="poll-title">{{ poll.question }}</h3>
            <div class="poll-meta">
              <span class="poll-type">{{ getPollTypeLabel(poll.type) }}</span>
              <span class="poll-status" :class="poll.status">{{ poll.status }}</span>
              <span class="poll-deadline" v-if="poll.deadline">
                Ends: {{ formatDeadline(poll.deadline) }}
              </span>
            </div>
          </div>
          <div class="poll-author">
            <div class="author-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="author-info">
              <div class="author-name">{{ poll.author.name }}</div>
              <div class="author-role">{{ poll.author.role }}</div>
            </div>
          </div>
        </div>

        <div class="poll-description" v-if="poll.description">
          <p>{{ poll.description }}</p>
        </div>

        <!-- Student View - Can Vote -->
        <div v-if="!isTeacher && !hasUserVoted(poll.id) && poll.status === 'active'" class="poll-voting">
          <div class="poll-options">
            <div 
              v-for="option in poll.options" 
              :key="option.id" 
              class="poll-option"
              @click="vote(poll.id, option.id)"
            >
              <div class="option-content">
                <span class="option-text">{{ option.text }}</span>
                <span v-if="option.description" class="option-description">{{ option.description }}</span>
              </div>
              <div class="option-radio">
                <div class="radio-circle"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results View - After voting or for teachers -->
        <div v-else class="poll-results">
          <div class="poll-options">
            <div 
              v-for="option in poll.options" 
              :key="option.id" 
              class="poll-option result-option"
            >
              <div class="option-content">
                <div class="option-text-row">
                  <span class="option-text">{{ option.text }}</span>
                  <span class="option-percentage">{{ getPercentage(option.votes, getTotalVotes(poll)) }}%</span>
                </div>
                <span v-if="option.description" class="option-description">{{ option.description }}</span>
                <div class="option-progress">
                  <div 
                    class="progress-bar" 
                    :style="{ width: getPercentage(option.votes, getTotalVotes(poll)) + '%' }"
                  ></div>
                </div>
                <div class="option-stats">
                  <span class="vote-count">{{ option.votes }} {{ option.votes === 1 ? 'vote' : 'votes' }}</span>
                  <span v-if="hasUserVotedForOption(poll.id, option.id)" class="your-vote-indicator">
                    ✓ Your vote
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="poll-summary">
            <div class="total-votes">
              <strong>{{ getTotalVotes(poll) }}</strong> 
              {{ getTotalVotes(poll) === 1 ? 'vote' : 'votes' }} cast
              <span v-if="poll.totalParticipants">
                from {{ poll.totalParticipants }} participants
              </span>
            </div>
            <div v-if="hasUserVoted(poll.id)" class="vote-status">
              You voted: <strong>{{ getUserVoteOption(poll.id) }}</strong>
            </div>
          </div>
        </div>

        <!-- Teacher Actions -->
        <div v-if="isTeacher && poll.author.id === currentUser.id" class="poll-actions">
          <button 
            v-if="poll.status === 'active'" 
            @click="endPoll(poll.id)" 
            class="quick-action-btn btn-sm"
          >
            End Poll
          </button>
          <button 
            @click="deletePoll(poll.id)" 
            class="quick-action-btn btn-sm danger"
          >
            Delete
          </button>
        </div>
      </div>

      <div v-if="polls.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
        </svg>
        <p>No polls yet. {{ isTeacher ? 'Create the first poll!' : 'Wait for your teacher to create polls.' }}</p>
      </div>
    </div>

    <!-- Create Poll Modal -->
    <div v-if="showPollModal" class="modal-overlay" @click="closePollModal">
      <div class="modal-content" @click.stop>
        <div class="quick-actions-section">
          <div class="section-header">
            <h3 class="section-title">Create New Poll</h3>
            <button @click="closePollModal" class="quick-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Close
            </button>
          </div>

          <form @submit.prevent="submitPoll">
            <div class="form-group">
              <label for="pollQuestion" class="form-label">Poll Question</label>
              <input 
                id="pollQuestion"
                v-model="newPoll.question" 
                type="text" 
                class="quick-action-btn form-input"
                placeholder="What would you like to ask?"
                required
              />
            </div>

            <div class="form-group">
              <label for="pollDescription" class="form-label">Description (Optional)</label>
              <textarea 
                id="pollDescription"
                v-model="newPoll.description" 
                class="quick-action-btn form-textarea"
                placeholder="Provide additional context..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="pollType" class="form-label">Poll Type</label>
              <select 
                id="pollType"
                v-model="newPoll.type" 
                class="quick-action-btn form-select"
                required
              >
                <option value="">Select poll type</option>
                <option value="single_choice">Single Choice</option>
                <option value="course_time">Course Time Preference</option>
                <option value="schedule_change">Schedule Change</option>
                <option value="content_feedback">Content Feedback</option>
                <option value="general">General Poll</option>
              </select>
            </div>

            <div class="form-group">
              <label for="pollDeadline" class="form-label">Deadline (Optional)</label>
              <input 
                id="pollDeadline"
                v-model="newPoll.deadline" 
                type="datetime-local" 
                class="quick-action-btn form-input"
                :min="new Date().toISOString().slice(0, 16)"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Poll Options</label>
              <div v-for="(option, index) in newPoll.options" :key="index" class="option-input-group">
                <input 
                  v-model="option.text" 
                  type="text" 
                  class="quick-action-btn form-input"
                  :placeholder="`Option ${index + 1}`"
                  required
                />
                <input 
                  v-model="option.description" 
                  type="text" 
                  class="quick-action-btn form-input"
                  placeholder="Optional description"
                />
                <button 
                  v-if="newPoll.options.length > 2"
                  type="button" 
                  @click="removeOption(index)"
                  class="quick-action-btn btn-sm danger"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <button 
                type="button" 
                @click="addOption" 
                class="quick-action-btn btn-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Add Option
              </button>
            </div>

            <div class="form-actions">
              <button type="button" @click="closePollModal" class="quick-action-btn">
                Cancel
              </button>
              <button type="submit" :disabled="!isPollValid" class="quick-action-btn primary">
                Create Poll
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
  name: 'CourseVoting',
  props: {
    polls: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: Object,
      default: () => ({ id: 1, name: 'Guest', role: 'student' })
    },
    isTeacher: {
      type: Boolean,
      default: false
    }
  },
  emits: ['create-poll', 'vote', 'end-poll', 'delete-poll'],
  data() {
    return {
      showPollModal: false,
      isExpanded: false,
      newPoll: {
        question: '',
        description: '',
        type: '',
        deadline: '',
        options: [
          { text: '', description: '' },
          { text: '', description: '' }
        ]
      },
      userVotes: {} // Track user votes: { pollId: optionId }
    }
  },
  computed: {
    isPollValid() {
      return this.newPoll.question.trim() && 
             this.newPoll.type &&
             this.newPoll.options.length >= 2 &&
             this.newPoll.options.every(option => option.text.trim())
    }
  },
  methods: {
    submitPoll() {
      if (!this.isPollValid) return

      const poll = {
        id: Date.now(),
        question: this.newPoll.question,
        description: this.newPoll.description,
        type: this.newPoll.type,
        deadline: this.newPoll.deadline,
        status: 'active',
        author: this.currentUser,
        options: this.newPoll.options.map((option, index) => ({
          id: index + 1,
          text: option.text,
          description: option.description,
          votes: 0
        })),
        totalVotes: 0,
        createdAt: new Date().toISOString()
      }

      this.$emit('create-poll', poll)
      this.closePollModal()
    },

    vote(pollId, optionId) {
      this.userVotes[pollId] = optionId
      this.$emit('vote', { pollId, optionId, userId: this.currentUser.id })
    },

    endPoll(pollId) {
      this.$emit('end-poll', pollId)
    },

    deletePoll(pollId) {
      if (confirm('Are you sure you want to delete this poll?')) {
        this.$emit('delete-poll', pollId)
      }
    },

    hasUserVoted(pollId) {
      return this.userVotes.hasOwnProperty(pollId)
    },

    hasUserVotedForOption(pollId, optionId) {
      return this.userVotes[pollId] === optionId
    },

    getUserVoteOption(pollId) {
      const poll = this.polls.find(p => p.id === pollId)
      const optionId = this.userVotes[pollId]
      if (poll && optionId) {
        const option = poll.options.find(o => o.id === optionId)
        return option ? option.text : 'Unknown'
      }
      return 'Unknown'
    },

    getTotalVotes(poll) {
      return poll.options.reduce((total, option) => total + option.votes, 0)
    },

    getPercentage(votes, total) {
      return total === 0 ? 0 : Math.round((votes / total) * 100)
    },

    getPollTypeLabel(type) {
      const labels = {
        single_choice: 'Single Choice',
        course_time: 'Course Time',
        schedule_change: 'Schedule Change',
        content_feedback: 'Content Feedback',
        general: 'General'
      }
      return labels[type] || 'General'
    },

    formatDeadline(deadline) {
      return new Date(deadline).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    addOption() {
      this.newPoll.options.push({ text: '', description: '' })
    },

    removeOption(index) {
      this.newPoll.options.splice(index, 1)
    },

    closePollModal() {
      this.showPollModal = false
      this.newPoll = {
        question: '',
        description: '',
        type: '',
        deadline: '',
        options: [
          { text: '', description: '' },
          { text: '', description: '' }
        ]
      }
    },
    toggleSection() {
      this.isExpanded = !this.isExpanded
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

.quick-action-btn.danger {
  color: #ef4444;
  border-color: #ef4444;
}

.quick-action-btn.danger:hover {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  gap: 0.5rem;
}

.polls-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.poll-item {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.poll-item:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.poll-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.poll-title-section {
  flex: 1;
}

.poll-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.poll-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.poll-type, .poll-status, .poll-deadline {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.poll-type {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.poll-status {
  text-transform: capitalize;
}

.poll-status.active {
  background: rgba(35, 131, 226, 0.1);
  color: #2383e2;
}

.poll-status.ended {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.poll-deadline {
  background: rgba(35, 131, 226, 0.1);
  color: #2383e2;
}

.poll-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.author-avatar {
  width: 36px;
  height: 36px;
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
  font-size: 0.8rem;
}

.author-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.poll-description {
  margin-bottom: 1rem;
}

.poll-description p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.poll-voting, .poll-results {
  margin-bottom: 1rem;
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.poll-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.poll-option:hover {
  border-color: var(--interactive-primary);
  background: var(--interactive-secondary);
}

.result-option {
  cursor: default;
  border-color: var(--border-light);
}

.result-option:hover {
  border-color: var(--border-light);
  background: var(--bg-secondary);
}

.option-content {
  flex: 1;
}

.option-text {
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 0.5rem;
}

.option-text-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.option-percentage {
  font-weight: 600;
  color: var(--interactive-primary);
  font-size: 0.9rem;
}

.option-progress {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: var(--interactive-primary);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.option-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-count {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.your-vote-indicator {
  font-size: 0.8rem;
  color: #22c55e;
  font-weight: 500;
}

.option-radio {
  flex-shrink: 0;
  margin-left: 1rem;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-light);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.poll-option:hover .radio-circle {
  border-color: var(--interactive-primary);
}

.poll-summary {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-top: 1px solid var(--border-light);
}

.total-votes, .vote-status {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.poll-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
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
  max-width: 700px;
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

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 3px rgba(27, 101, 178, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.option-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-input-group .form-input {
  margin-bottom: 0;
  flex: 1;
}

.option-input-group .form-input:first-child {
  flex: 2;
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
  
  .poll-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .poll-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .option-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .option-input-group .form-input {
    width: 100%;
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