<template>
  <div class="teacher-announcements fade-in">
    <TeacherHeader />
    
    <div class="content-wrapper">
      <!-- Page Actions -->
      <div class="quick-actions-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Announcements</h2>
            <p class="section-subtitle">Create and manage course announcements</p>
          </div>
          <div class="actions">
            <button class="quick-action-btn primary" @click="showCreateModal = true">
              <BellIcon class="w-4 h-4" />
              Create Announcement
            </button>
          </div>
        </div>
      </div>

      <div class="announcements-content">
        <div class="announcements-filters">
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search announcements..."
              class="search-input input-field"
            />
          </div>
          <div class="filter-buttons">
            <button 
              v-for="filter in filters" 
              :key="filter.value"
              :class="['filter-btn', { active: activeFilter === filter.value }]"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div class="announcements-list">
          <div v-if="filteredAnnouncements.length === 0" class="empty-state card">
            <BellIcon class="empty-icon" />
            <p>No announcements found</p>
          </div>

          <div 
            v-for="announcement in filteredAnnouncements" 
            :key="announcement.id"
            class="announcement-card card"
          >
            <div class="announcement-header">
              <div class="announcement-title">
                <h3>{{ announcement.title }}</h3>
                <div class="announcement-badges">
                  <span v-if="announcement.priority === 'high'" class="badge badge-danger">
                    High Priority
                  </span>
                  <span :class="['badge', getStatusClass(announcement.status)]">
                    {{ announcement.status }}
                  </span>
                </div>
              </div>
              <div class="announcement-actions">
                <button @click="editAnnouncement(announcement)" class="action-btn">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="deleteAnnouncement(announcement)" class="action-btn danger">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="announcement-content">
              <p>{{ announcement.content }}</p>
            </div>

            <div class="announcement-footer">
              <div class="announcement-meta">
                <span class="date">{{ formatDate(announcement.createdAt) }}</span>
                <span class="author">by {{ announcement.author }}</span>
              </div>
              <div class="announcement-stats">
                <span class="stat">
                  <EyeIcon class="w-3.5 h-3.5" />
                  {{ announcement.views }} views
                </span>
                <span class="stat">
                  <BellIcon class="w-3.5 h-3.5" />
                  {{ announcement.comments.length }} comments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>{{ editingAnnouncement ? 'Edit Announcement' : 'Create Announcement' }}</h3>
            <button @click="showCreateModal = false" class="close-btn">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Title</label>
              <input v-model="formData.title" type="text" class="form-input input-field" placeholder="Enter announcement title" />
            </div>

            <div class="form-group">
              <label>Content</label>
              <textarea v-model="formData.content" class="form-textarea input-field" rows="6" placeholder="Enter announcement content"></textarea>
            </div>

            <div class="form-group">
              <label>Priority</label>
              <select v-model="formData.priority" class="form-select input-field">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="formData.status" class="form-select input-field">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="saveAnnouncement" class="btn btn-primary">
              {{ editingAnnouncement ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>

</template>

<script>
import { ref, computed } from 'vue'
import TeacherHeader from '@/components/teacher/TeacherHeader.vue'
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'TeacherAnnouncementsPage',
  components: {
    TeacherHeader,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    BellIcon,
    XMarkIcon
  },
  setup() {
    const searchQuery = ref('')
    const activeFilter = ref('all')
    const showCreateModal = ref(false)
    const editingAnnouncement = ref(null)
    const formData = ref({
      title: '',
      content: '',
      priority: 'normal',
      status: 'draft'
    })

    const filters = [
      { value: 'all', label: 'All' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'scheduled', label: 'Scheduled' }
    ]

    const announcements = ref([
      {
        id: 1,
        title: 'Welcome to the Course',
        content: 'Welcome everyone! I\'m excited to start this journey with you. This course will cover fundamental concepts and practical applications.',
        priority: 'high',
        status: 'published',
        author: 'Dr. Smith',
        createdAt: new Date('2024-01-15'),
        views: 45,
        comments: []
      },
      {
        id: 2,
        title: 'Assignment 1 Now Available',
        content: 'The first assignment is now available in the assignments section. Please review the requirements and submit by the due date.',
        priority: 'normal',
        status: 'published',
        author: 'Dr. Smith',
        createdAt: new Date('2024-01-20'),
        views: 32,
        comments: []
      },
      {
        id: 3,
        title: 'Office Hours This Week',
        content: 'I\'ll be available for office hours on Tuesday and Thursday from 2-4 PM. Feel free to drop by if you have questions.',
        priority: 'normal',
        status: 'draft',
        author: 'Dr. Smith',
        createdAt: new Date('2024-01-25'),
        views: 0,
        comments: []
      }
    ])

    const filteredAnnouncements = computed(() => {
      let filtered = announcements.value

      // Filter by status
      if (activeFilter.value !== 'all') {
        filtered = filtered.filter(a => a.status === activeFilter.value)
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query)
        )
      }

      return filtered.sort((a, b) => b.createdAt - a.createdAt)
    })

    const getStatusClass = (status) => {
      const classes = {
        'published': 'badge-success',
        'draft': 'badge-secondary',
        'scheduled': 'badge-warning'
      }
      return classes[status] || 'badge-secondary'
    }

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const editAnnouncement = (announcement) => {
      editingAnnouncement.value = announcement
      formData.value = {
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        status: announcement.status
      }
      showCreateModal.value = true
    }

    const deleteAnnouncement = (announcement) => {
      if (confirm('Are you sure you want to delete this announcement?')) {
        const index = announcements.value.findIndex(a => a.id === announcement.id)
        if (index > -1) {
          announcements.value.splice(index, 1)
        }
      }
    }

    const saveAnnouncement = () => {
      if (editingAnnouncement.value) {
        // Update existing announcement
        const index = announcements.value.findIndex(a => a.id === editingAnnouncement.value.id)
        if (index > -1) {
          announcements.value[index] = {
            ...announcements.value[index],
            ...formData.value
          }
        }
      } else {
        // Create new announcement
        const newAnnouncement = {
          id: Date.now(),
          ...formData.value,
          author: 'Dr. Smith',
          createdAt: new Date(),
          views: 0,
          comments: []
        }
        announcements.value.unshift(newAnnouncement)
      }

      // Reset form
      showCreateModal.value = false
      editingAnnouncement.value = null
      formData.value = {
        title: '',
        content: '',
        priority: 'normal',
        status: 'draft'
      }
    }

    return {
      searchQuery,
      activeFilter,
      showCreateModal,
      editingAnnouncement,
      formData,
      filters,
      announcements,
      filteredAnnouncements,
      getStatusClass,
      formatDate,
      editAnnouncement,
      deleteAnnouncement,
      saveAnnouncement
    }
  }
}
</script>

<style scoped>
.announcements-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

.page-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.announcements-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.announcements-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.filter-btn:hover {
  background: var(--bg-primary);
  border-color: var(--border-hover);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.announcements-list {
  display: grid;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);
  text-align: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.announcement-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.announcement-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.announcement-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.announcement-title h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.announcement-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.announcement-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
  color: #dc2626;
}

.announcement-content {
  margin-bottom: 1rem;
}

.announcement-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.announcement-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.announcement-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.813rem;
  color: var(--text-secondary);
}

.announcement-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.813rem;
  color: var(--text-secondary);
}

/* Modal Styles */
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

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-primary);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--border-hover);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .page-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .announcements-filters {
    flex-direction: column;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .filter-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .announcement-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .announcement-actions {
    align-self: flex-end;
  }
  
  .announcement-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}
</style>