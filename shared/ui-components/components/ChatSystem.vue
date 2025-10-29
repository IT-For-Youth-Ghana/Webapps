<template>
  <div class="chat-system">
    <!-- Chat Sidebar -->
    <div class="chat-sidebar">
      <div class="chat-header">
        <h3>Messages</h3>
        <button @click="startNewChat" class="new-chat-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search conversations..."
          class="search-input"
        />
      </div>

      <div class="conversation-list">
        <div 
          v-for="conversation in filteredConversations" 
          :key="conversation.id"
          :class="['conversation-item', { active: activeConversation?.id === conversation.id }]"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-avatar">
            <img v-if="conversation.avatar" :src="conversation.avatar" :alt="conversation.name" />
            <div v-else class="avatar-placeholder">
              {{ conversation.name.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="conversation-content">
            <div class="conversation-header">
              <h4 class="conversation-name">{{ conversation.name }}</h4>
              <span class="conversation-time">{{ formatTime(conversation.lastMessage.timestamp) }}</span>
            </div>
            <p class="conversation-preview">{{ conversation.lastMessage.text }}</p>
          </div>

          <div v-if="conversation.unreadCount" class="unread-badge">
            {{ conversation.unreadCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Main Area -->
    <div class="chat-main">
      <div v-if="!activeConversation" class="chat-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <h3>Select a conversation</h3>
        <p>Choose a conversation from the list to start messaging</p>
      </div>

      <div v-else class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header-main">
          <div class="chat-header-info">
            <div class="conversation-avatar">
              <img v-if="activeConversation.avatar" :src="activeConversation.avatar" :alt="activeConversation.name" />
              <div v-else class="avatar-placeholder">
                {{ activeConversation.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div>
              <h3 class="chat-header-name">{{ activeConversation.name }}</h3>
              <p class="chat-header-status">{{ activeConversation.status || 'Active now' }}</p>
            </div>
          </div>
          
          <div class="chat-header-actions">
            <button @click="toggleChatInfo" class="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M1 12h6m6 0h6"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="messages-area" ref="messagesContainer">
          <div 
            v-for="message in activeConversation.messages" 
            :key="message.id"
            :class="['message', { 'message-sent': message.isSent, 'message-received': !message.isSent }]"
          >
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-meta">
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                <span v-if="message.isSent" :class="['message-status', message.status]">
                  <svg v-if="message.status === 'delivered'" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <svg v-else-if="message.status === 'read'" width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-area">
          <div class="input-actions">
            <button @click="attachFile" class="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
          </div>

          <div class="input-container">
            <textarea
              v-model="messageText"
              @keydown.enter.prevent="sendMessage"
              @input="handleTyping"
              placeholder="Type a message..."
              class="message-input"
              rows="1"
            ></textarea>
            <button 
              @click="sendMessage" 
              :disabled="!messageText.trim()"
              class="send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Info Panel -->
    <div v-if="showChatInfo && activeConversation" class="chat-info-panel">
      <div class="chat-info-header">
        <h4>Conversation Info</h4>
        <button @click="showChatInfo = false" class="close-btn">×</button>
      </div>
      
      <div class="chat-info-content">
        <div class="participant-info">
          <div class="participant-avatar">
            <img v-if="activeConversation.avatar" :src="activeConversation.avatar" :alt="activeConversation.name" />
            <div v-else class="avatar-placeholder">
              {{ activeConversation.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div>
            <h5>{{ activeConversation.name }}</h5>
            <p>{{ activeConversation.status || 'Active now' }}</p>
          </div>
        </div>

        <div class="chat-actions">
          <button @click="searchInChat" class="info-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Search in conversation
          </button>
          
          <button @click="clearChat" class="info-action-btn danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
            Clear conversation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['message-sent', 'conversation-selected'])

// Reactive state
const searchQuery = ref('')
const activeConversation = ref(null)
const messageText = ref('')
const isTyping = ref(false)
const showChatInfo = ref(false)
const messagesContainer = ref(null)

// Mock data - in real app, this would come from props or API
const conversations = ref([
  {
    id: 1,
    name: 'John Smith',
    avatar: '',
    status: 'Active now',
    unreadCount: 2,
    lastMessage: {
      text: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    messages: [
      {
        id: 1,
        text: 'Hi there!',
        isSent: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'read'
      },
      {
        id: 2,
        text: 'Hello! I\'m good, thanks for asking',
        isSent: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        status: 'read'
      },
      {
        id: 3,
        text: 'Hey! How are you doing?',
        isSent: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: 'read'
      }
    ]
  },
  {
    id: 2,
    name: 'Course Management Team',
    avatar: '',
    status: 'Active now',
    unreadCount: 0,
    lastMessage: {
      text: 'The meeting is scheduled for tomorrow',
      timestamp: new Date(Date.now() - 1000 * 60 * 60)
    },
    messages: [
      {
        id: 1,
        text: 'Don\'t forget about the team meeting',
        isSent: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'read'
      },
      {
        id: 2,
        text: 'The meeting is scheduled for tomorrow',
        isSent: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: 'read'
      }
    ]
  }
])

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  
  const query = searchQuery.value.toLowerCase()
  return conversations.value.filter(conv => 
    conv.name.toLowerCase().includes(query) ||
    conv.lastMessage.text.toLowerCase().includes(query)
  )
})

const selectConversation = (conversation) => {
  activeConversation.value = conversation
  conversation.unreadCount = 0
  emit('conversation-selected', conversation)
  scrollToBottom()
}

const startNewChat = () => {
  // Implement new chat creation
  console.log('Starting new chat')
}

const sendMessage = () => {
  if (!messageText.value.trim() || !activeConversation.value) return

  const newMessage = {
    id: Date.now(),
    text: messageText.value.trim(),
    isSent: true,
    timestamp: new Date(),
    status: 'sent'
  }

  activeConversation.value.messages.push(newMessage)
  activeConversation.value.lastMessage = {
    text: newMessage.text,
    timestamp: newMessage.timestamp
  }

  emit('message-sent', {
    conversationId: activeConversation.value.id,
    message: newMessage
  })

  messageText.value = ''
  scrollToBottom()

  // Simulate message status updates
  setTimeout(() => {
    newMessage.status = 'delivered'
  }, 1000)

  setTimeout(() => {
    newMessage.status = 'read'
  }, 2000)
}

const handleTyping = () => {
  // Implement typing indicator
  if (!isTyping.value) {
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 1000)
  }
}

const attachFile = () => {
  // Implement file attachment
  console.log('Attaching file')
}

const toggleChatInfo = () => {
  showChatInfo.value = !showChatInfo.value
}

const searchInChat = () => {
  // Implement search in chat
  console.log('Searching in chat')
}

const clearChat = () => {
  if (confirm('Are you sure you want to clear this conversation?')) {
    activeConversation.value.messages = []
    showChatInfo.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

const formatMessageTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Auto-resize textarea
const autoResize = () => {
  const textarea = document.querySelector('.message-input')
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-system {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  height: 600px;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.chat-sidebar {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.new-chat-btn {
  background: var(--primary);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.new-chat-btn:hover {
  background: var(--primary-dark);
}

.search-bar {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.conversation-item:hover {
  background: var(--bg-primary);
}

.conversation-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.conversation-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.conversation-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.conversation-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.conversation-preview {
  font-size: 0.813rem;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  background: var(--primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.chat-main {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
}

.chat-empty svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.chat-empty h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.chat-empty p {
  margin: 0;
  font-size: 0.875rem;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header-main {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-header-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-header-status {
  margin: 0;
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  max-width: 70%;
}

.message-sent {
  align-self: flex-end;
}

.message-received {
  align-self: flex-start;
}

.message-content {
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  position: relative;
}

.message-sent .message-content {
  background: var(--primary);
  color: white;
}

.message-text {
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-time {
  color: inherit;
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.message-input-area {
  padding: 1rem;
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.input-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: none;
  min-height: 40px;
  max-height: 120px;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-btn {
  background: var(--primary);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.send-btn:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
}

.chat-info-panel {
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-light);
  padding: 1rem;
}

.chat-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.chat-info-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.participant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-info h5 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.participant-info p {
  margin: 0;
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.chat-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-action-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.info-action-btn:hover {
  background: var(--bg-primary);
  border-color: var(--border-hover);
}

.info-action-btn.danger {
  color: #dc2626;
  border-color: #dc2626;
}

.info-action-btn.danger:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .chat-system {
    grid-template-columns: 1fr;
  }
  
  .chat-sidebar,
  .chat-info-panel {
    display: none;
  }
  
  .chat-main {
    height: 500px;
  }
  
  .message {
    max-width: 85%;
  }
}

@media (max-width: 640px) {
  .chat-header-main {
    padding: 0.75rem;
  }
  
  .message-input-area {
    padding: 0.75rem;
  }
  
  .messages-area {
    padding: 0.75rem;
  }
}
</style>