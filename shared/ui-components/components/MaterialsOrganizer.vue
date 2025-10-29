<template>
  <div class="materials-organizer">
    <div class="organizer-header">
      <h3 class="organizer-title">Folders</h3>
      <button class="create-folder-btn" @click="showCreateFolder = true">+</button>
    </div>
    
    <div class="folder-list">
      <button
        v-for="folder in folders"
        :key="folder.id"
        :class="['folder-item', { active: modelValue === folder.id }]"
        @click="$emit('update:modelValue', folder.id)"
      >
        <div class="folder-icon">📁</div>
        <div class="folder-info">
          <div class="folder-name">{{ folder.name }}</div>
          <div class="folder-count">{{ folder.materials }} items</div>
        </div>
      </button>
    </div>

    <div v-if="showCreateFolder" class="create-folder-modal">
      <div class="modal-content">
        <h4>Create New Folder</h4>
        <input
          v-model="newFolderName"
          type="text"
          placeholder="Folder name"
          class="folder-input"
          @keyup.enter="createFolder"
        />
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancelCreate">Cancel</button>
          <button class="btn btn-primary" @click="createFolder">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MaterialsOrganizer',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    folders: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue', 'create-folder'],
  setup(props, { emit }) {
    const showCreateFolder = ref(false)
    const newFolderName = ref('')

    const createFolder = () => {
      if (newFolderName.value.trim()) {
        emit('create-folder', {
          name: newFolderName.value.trim(),
          parent: 'root'
        })
        cancelCreate()
      }
    }

    const cancelCreate = () => {
      showCreateFolder.value = false
      newFolderName.value = ''
    }

    return {
      showCreateFolder,
      newFolderName,
      createFolder,
      cancelCreate
    }
  }
}
</script>

<style scoped>
.materials-organizer {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  position: relative;
}

.organizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.organizer-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.create-folder-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: var(--brand-primary);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.folder-item:hover {
  background: var(--bg-tertiary);
}

.folder-item.active {
  background: var(--brand-primary);
  color: white;
}

.folder-icon {
  font-size: 1.25rem;
}

.folder-info {
  flex: 1;
}

.folder-name {
  font-weight: 500;
  color: inherit;
  margin-bottom: 0.25rem;
}

.folder-count {
  font-size: 0.75rem;
  color: inherit;
  opacity: 0.7;
}

.create-folder-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.modal-content {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  min-width: 250px;
}

.modal-content h4 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.folder-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}
</style>