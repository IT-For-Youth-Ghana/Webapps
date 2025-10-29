<template>
  <header class="teacher-header">
    <div class="header-container">
      <div class="header-brand">
        <router-link to="/teacher/dashboard" class="brand-link">
          <AcademicCapIcon class="w-8 h-8 brand-icon" />
          <span class="brand-text">Teacher Portal</span>
        </router-link>
      </div>
      
      <nav class="header-nav">
        <router-link 
          to="/teacher/dashboard" 
          class="nav-link"
          :class="{ active: isActiveRoute('/teacher/dashboard') }"
        >
          Dashboard
        </router-link>
        
        <router-link 
          to="/teacher/courses" 
          class="nav-link"
          :class="{ active: isActiveRoute('/teacher/courses') }"
        >
          My Courses
        </router-link>
        
        <router-link 
          to="/teacher/assignments" 
          class="nav-link"
          :class="{ active: isActiveRoute('/teacher/assignments') }"
        >
          Assignments
        </router-link>
        
        <router-link 
          to="/teacher/analytics" 
          class="nav-link"
          :class="{ active: isActiveRoute('/teacher/analytics') }"
        >
          Analytics
        </router-link>
        
        <router-link 
          to="/teacher/schedule" 
          class="nav-link"
          :class="{ active: isActiveRoute('/teacher/schedule') }"
        >
          Schedule
        </router-link>
      </nav>
      
      <div class="header-actions">
        <button class="action-btn" @click="$emit('create-new')" v-if="showCreateButton">
          <PlusIcon class="w-5 h-5" />
          {{ createButtonText }}
        </button>
        
        <div class="user-menu">
          <div class="user-avatar">
            <UserCircleIcon class="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { 
  AcademicCapIcon, 
  PlusIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'
import { useRoute } from 'vue-router'

export default {
  name: 'TeacherHeader',
  components: {
    AcademicCapIcon,
    PlusIcon,
    UserCircleIcon
  },
  props: {
    showCreateButton: {
      type: Boolean,
      default: false
    },
    createButtonText: {
      type: String,
      default: 'Create New'
    }
  },
  emits: ['create-new'],
  setup() {
    const route = useRoute()
    
    const isActiveRoute = (path) => {
      return route.path === path || route.path.startsWith(path + '/')
    }
    
    return {
      isActiveRoute
    }
  }
}
</script>

<style scoped>
.teacher-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  transition: color 0.2s ease;
}

.brand-link:hover {
  color: var(--interactive-primary);
}

.brand-icon {
  color: var(--interactive-primary);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.nav-link.active {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  border-color: var(--interactive-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-container {
    padding: 1rem;
  }
  
  .header-nav {
    gap: 0.25rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .brand-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-nav {
    width: 100%;
    justify-content: space-around;
    flex-wrap: wrap;
  }
  
  .nav-link {
    flex-direction: column;
    padding: 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>