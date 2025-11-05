<template>
  <div class="course-detail fade-in">
    <div class="content-wrapper">
      <!-- Navigation -->
      <CourseNavigation :course-id="courseId" />

      <!-- Course Header -->
      <CourseHeader :course="course" :is-teacher="true" @update-background="updateCourseBackground" />

      <!-- Student Management -->
      <StudentManagement :course="course" @view-all-assignments="viewAllAssignments" />

      <!-- Course Content -->
      <CourseContent 
        :lessons="lessons" 
        @add-lesson="addLesson"
        @update-lesson="updateLesson"
      />

      <!-- Course Voting -->
      <CourseVoting 
        :polls="polls"
        :current-user="currentUser"
        :is-teacher="true"
        @create-poll="createPoll"
        @vote="vote"
        @end-poll="endPoll"
        @delete-poll="deletePoll"
      />

      <!-- Course Q&A -->
      <CourseQA 
        :questions="questions"
        :current-user="currentUser"
        :is-teacher="true"
        @add-question="addQuestion"
        @add-answer="addAnswer"
      />

      <!-- Recent Activity -->
      <CourseActivity :activities="recentActivities" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CourseNavigation from '@/components/teacher/TeacherDetailPage/CourseNavigation.vue'
import CourseHeader from '@/components/teacher/TeacherDetailPage/CourseHeader.vue'
import StudentManagement from '@/components/teacher/TeacherDetailPage/StudentManagement.vue'
import CourseContent from '@/components/teacher/TeacherDetailPage/CourseContent.vue'
import CourseVoting from '@/components/teacher/TeacherDetailPage/CourseVoting.vue'
import CourseQA from '@/components/teacher/TeacherDetailPage/CourseQA.vue'
import CourseActivity from '@/components/teacher/TeacherDetailPage/CourseActivity.vue'

export default {
  name: 'CourseDetailPage',
  components: {
    CourseNavigation,
    CourseHeader,
    StudentManagement,
    CourseContent,
    CourseVoting,
    CourseQA,
    CourseActivity
  },
  setup() {
    const route = useRoute()
    const courseId = computed(() => route.params.id)
    
    // Mock course data
    const course = ref({
      id: 1,
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS, and JavaScript from scratch to build modern websites. This comprehensive course covers everything you need to know to start your journey as a web developer.',
      enrolledStudents: 28,
      avgProgress: 75,
      status: 'active',
      totalLessons: 24,
      duration: '12 weeks'
    })

    const lessons = ref([
      {
        id: 1,
        title: 'Introduction to HTML',
        description: 'Learn the basics of HTML structure and semantic elements',
        duration: 45,
        type: 'Video',
        lessonDate: '2024-01-15'
      },
      {
        id: 2,
        title: 'CSS Fundamentals',
        description: 'Understanding selectors, properties, and the box model',
        duration: 60,
        type: 'Video',
        lessonDate: '2024-01-16'
      },
      {
        id: 3,
        title: 'JavaScript Basics',
        description: 'Variables, functions, and control structures',
        duration: 90,
        type: 'Interactive',
        lessonDate: '2024-01-17'
      },
      {
        id: 4,
        title: 'Responsive Design',
        description: 'Building layouts that work on all devices',
        duration: 75,
        type: 'Project',
        lessonDate: '2024-01-18'
      }
    ])

    const currentUser = ref({
      name: 'Dr. Sarah Johnson',
      role: 'Teacher'
    })

    const polls = ref([
      {
        id: 1,
        question: 'Preferred course time for next week?',
        description: 'I need to adjust our schedule due to a conference. Please vote for your preferred time.',
        type: 'course_time',
        status: 'active',
        deadline: '2024-01-20T23:59:00Z',
        author: {
          id: 1,
          name: 'Dr. Sarah Johnson',
          role: 'Teacher'
        },
        options: [
          {
            id: 1,
            text: 'Monday 10:00 AM',
            description: 'Regular time',
            votes: 8
          },
          {
            id: 2,
            text: 'Wednesday 2:00 PM',
            description: 'Alternative time',
            votes: 12
          },
          {
            id: 3,
            text: 'Friday 4:00 PM',
            description: 'New time slot',
            votes: 5
          }
        ],
        totalVotes: 25,
        createdAt: '2024-01-15T14:00:00Z'
      },
      {
        id: 2,
        question: 'Should we add a React module?',
        description: 'Would you be interested in learning React as part of this course?',
        type: 'content_feedback',
        status: 'active',
        deadline: '',
        author: {
          id: 1,
          name: 'Dr. Sarah Johnson',
          role: 'Teacher'
        },
        options: [
          {
            id: 1,
            text: 'Yes, definitely!',
            description: 'React would be very valuable',
            votes: 18
          },
          {
            id: 2,
            text: 'Maybe, if time permits',
            description: 'Could be useful',
            votes: 7
          },
          {
            id: 3,
            text: 'No thanks',
            description: 'Focus on fundamentals',
            votes: 3
          }
        ],
        totalVotes: 28,
        createdAt: '2024-01-14T10:30:00Z'
      }
    ])

    const questions = ref([
      {
        id: 1,
        question: 'How do we center elements in CSS?',
        description: 'I\'m having trouble understanding the different ways to center elements both horizontally and vertically.',
        author: {
          name: 'Alex Chen',
          role: 'Student'
        },
        answers: [
          {
            id: 1,
            content: 'You can use flexbox with display: flex, justify-content: center, align-items: center.',
            author: {
              name: 'Dr. Sarah Johnson', 
              role: 'Teacher'
            },
            createdAt: '2024-01-15T10:30:00Z'
          }
        ],
        createdAt: '2024-01-15T09:15:00Z'
      },
      {
        id: 2,
        question: 'What\'s the difference between let and const?',
        description: '',
        author: {
          name: 'Maria Garcia',
          role: 'Student'
        },
        answers: [],
        createdAt: '2024-01-14T14:20:00Z'
      }
    ])

    const recentActivities = ref([
      {
        id: 1,
        title: 'New Student Enrolled',
        description: 'Sarah Johnson joined the course',
        timestamp: '2 hours ago'
      },
      {
        id: 2,
        title: 'Assignment Submitted',
        description: 'John Doe submitted HTML project',
        timestamp: '4 hours ago'
      },
      {
        id: 3,
        title: 'Lesson Completed',
        description: 'CSS Fundamentals completed by 5 students',
        timestamp: '1 day ago'
      }
    ])

    // Methods
    const addLesson = (lessonData) => {
      console.log('Adding new lesson:', lessonData)
      
      // Add the new lesson to the lessons array
      const newLesson = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        duration: lessonData.duration,
        type: lessonData.type,
        file: lessonData.file,
        url: lessonData.url,
        content: lessonData.content
      }
      
      lessons.value.push(newLesson)
      
      // Show success message
      console.log('Lesson added successfully!')
    }

    const updateLesson = (updatedLesson) => {
      // Find the index of the lesson to update
      const lessonIndex = lessons.value.findIndex(lesson => lesson.id === updatedLesson.id)
      if (lessonIndex !== -1) {
        lessons.value[lessonIndex] = updatedLesson
        console.log('Lesson updated successfully:', updatedLesson)
      }
    }

    const addQuestion = (question) => {
      questions.value.unshift(question)
      console.log('Question added:', question)
    }

    const addAnswer = ({ questionId, answer }) => {
      const question = questions.value.find(q => q.id === questionId)
      if (question) {
        question.answers.push(answer)
        console.log('Answer added:', answer)
      }
    }

    const createPoll = (poll) => {
      polls.value.unshift(poll)
      console.log('Poll created:', poll)
    }

    const vote = ({ pollId, optionId }) => {
      const poll = polls.value.find(p => p.id === pollId)
      if (poll) {
        const option = poll.options.find(o => o.id === optionId)
        if (option) {
          option.votes++
          poll.totalVotes++
        }
      }
    }

    const endPoll = (pollId) => {
      const poll = polls.value.find(p => p.id === pollId)
      if (poll) {
        poll.status = 'ended'
        console.log('Poll ended:', pollId)
      }
    }

    const deletePoll = (pollId) => {
      const index = polls.value.findIndex(p => p.id === pollId)
      if (index !== -1) {
        polls.value.splice(index, 1)
        console.log('Poll deleted:', pollId)
      }
    }

    const updateCourseBackground = ({ backgroundImage }) => {
      course.value.backgroundImage = backgroundImage
      console.log('Course background updated:', backgroundImage ? 'Image set' : 'Image removed')
    }

    const viewAllAssignments = () => {
      console.log('Navigate to all assignments for course:', courseId.value)
      // TODO: Navigate to assignments page or open assignments modal
      alert('Navigating to all assignments page...')
    }

    onMounted(() => {
      // Load course data based on courseId
      console.log('Loading course:', courseId.value)
    })

    return {
      courseId,
      course,
      lessons,
      polls,
      questions,
      currentUser,
      recentActivities,
      addLesson,
      updateLesson,
      addQuestion,
      addAnswer,
      createPoll,
      vote,
      endPoll,
      deletePoll,
      updateCourseBackground,
      viewAllAssignments
    }
  }
}
</script>

<style scoped>
.course-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.content-wrapper {
  padding: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
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