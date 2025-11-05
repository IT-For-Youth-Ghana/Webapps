<template>
  <div class="teacher-dashboard fade-in">
    <div class="content-wrapper">
      <!-- Welcome Header -->
      <DashboardHeader 
        :user="user" 
      />

      <!-- Quick Actions -->
      <QuickActions 
        @create-course="createNewCourse"
      />

      <!-- Dashboard Content Grid -->
      <div class="dashboard-grid">
        <!-- Upcoming Appointments -->
        <UpcomingAppointments :appointments="todayAppointments" />
        
        <!-- Personal Reminders -->
        <PersonalReminders />
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardHeader from '@/components/teacher/TeacherDashboard/DashboardHeader.vue'
import QuickActions from '@/components/teacher/TeacherDashboard/QuickActions.vue'
import UpcomingAppointments from '@/components/teacher/TeacherDashboard/UpcomingAppointments.vue'
import PersonalReminders from '@/components/teacher/TeacherDashboard/PersonalReminders.vue'

export default {
  name: 'TeacherDashboard',
  components: {
    DashboardHeader,
    QuickActions,
    UpcomingAppointments,
    PersonalReminders
  },
  setup() {
    const router = useRouter()
    
    const user = ref({
      name: 'Dr. Sarah Smith',
      role: 'Teacher',
      isAdmin: false,
      isTeacher: true,
      isStudent: false
    })

    // Mock appointments data for today
    const todayAppointments = ref([
      {
        id: 1,
        title: 'Sprechstunde - Web Development',
        description: 'Offene Sprechstunde für Fragen zu aktuellen Projekten',
        time: '10:00',
        duration: '60 min',
        type: 'consultation',
        location: 'Büro A-201',
        status: 'upcoming'
      },
      {
        id: 2,
        title: 'Vorlesung - Vue.js Advanced',
        description: 'Kapitel 5: State Management mit Vuex',
        time: '14:30',
        duration: '90 min',
        type: 'lecture',
        location: 'Hörsaal B-104',
        status: 'upcoming'
      },
      {
        id: 3,
        title: 'Meeting - Curriculum Review',
        description: 'Besprechung neuer Kursinhalte für nächstes Semester',
        time: '16:00',
        duration: '45 min',
        type: 'meeting',
        location: 'Konferenzraum C-301',
        status: 'upcoming'
      }
    ])




    // Methods

    const createNewCourse = () => {
      router.push('/teacher/create-course')
    }

    const manageCourse = (courseId) => {
      router.push(`/teacher/courses/${courseId}`)
    }


    onMounted(() => {
      // Component mounted
    })

    return {
      user,
      todayAppointments,
      createNewCourse,
      manageCourse
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>