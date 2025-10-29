<template>
  <div class="quiz-system">
    <!-- Quiz Header -->
    <div class="quiz-header">
      <div class="quiz-info">
        <h2 class="quiz-title">{{ quiz.title }}</h2>
        <div class="quiz-meta">
          <span class="quiz-duration">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ formatTime(quiz.duration) }}
          </span>
          <span class="quiz-questions">{{ quiz.questions.length }} questions</span>
          <span class="quiz-points">{{ totalPoints }} points</span>
        </div>
      </div>
      
      <div class="quiz-controls">
        <div v-if="quizState === 'taking'" class="timer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span :class="{ 'time-warning': timeRemaining < 300 }">
            {{ formatTime(timeRemaining) }}
          </span>
        </div>
        
        <button 
          v-if="quizState === 'preview'"
          @click="startQuiz" 
          class="btn btn-primary"
        >
          Start Quiz
        </button>
        
        <button 
          v-if="quizState === 'taking'"
          @click="submitQuiz" 
          class="btn btn-success"
          :disabled="!allQuestionsAnswered"
        >
          Submit Quiz
        </button>
      </div>
    </div>

    <!-- Quiz Progress -->
    <div v-if="quizState === 'taking'" class="quiz-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}
      </div>
    </div>

    <!-- Quiz Content -->
    <div class="quiz-content">
      <!-- Preview State -->
      <div v-if="quizState === 'preview'" class="quiz-preview">
        <div class="preview-card">
          <h3>Quiz Instructions</h3>
          <div class="instructions">
            <ul>
              <li>This quiz contains {{ quiz.questions.length }} questions</li>
              <li>You have {{ formatTime(quiz.duration) }} to complete the quiz</li>
              <li>Total possible points: {{ totalPoints }}</li>
              <li>You must answer all questions before submitting</li>
              <li>Once submitted, you cannot change your answers</li>
            </ul>
          </div>
          
          <div class="quiz-topics">
            <h4>Topics Covered:</h4>
            <div class="topic-tags">
              <span v-for="topic in quiz.topics" :key="topic" class="topic-tag">
                {{ topic }}
              </span>
            </div>
          </div>
        </div>

        <div class="questions-overview">
          <h3>Questions Overview</h3>
          <div class="question-cards">
            <div 
              v-for="(question, index) in quiz.questions" 
              :key="index"
              class="question-overview-card"
            >
              <div class="question-type">
                {{ getQuestionTypeLabel(question.type) }}
              </div>
              <div class="question-points">{{ question.points }} pts</div>
              <div class="question-preview">
                {{ question.question.substring(0, 100) }}...
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Taking State -->
      <div v-if="quizState === 'taking'" class="quiz-taking">
        <div class="question-container">
          <div class="question-header">
            <h3 class="question-text">
              {{ currentQuestion.question }}
            </h3>
            <div class="question-meta">
              <span class="question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
              <span class="question-points">{{ currentQuestion.points }} points</span>
            </div>
          </div>

          <!-- Multiple Choice -->
          <div v-if="currentQuestion.type === 'multiple-choice'" class="question-options">
            <label 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              class="option-label"
            >
              <input
                type="radio"
                :name="'question-' + currentQuestionIndex"
                :value="index"
                v-model="answers[currentQuestionIndex]"
                class="option-input"
              />
              <div class="option-content">
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option }}</span>
              </div>
            </label>
          </div>

          <!-- True/False -->
          <div v-if="currentQuestion.type === 'true-false'" class="question-options">
            <label class="option-label">
              <input
                type="radio"
                :name="'question-' + currentQuestionIndex"
                value="true"
                v-model="answers[currentQuestionIndex]"
                class="option-input"
              />
              <div class="option-content">
                <span class="option-text">True</span>
              </div>
            </label>
            <label class="option-label">
              <input
                type="radio"
                :name="'question-' + currentQuestionIndex"
                value="false"
                v-model="answers[currentQuestionIndex]"
                class="option-input"
              />
              <div class="option-content">
                <span class="option-text">False</span>
              </div>
            </label>
          </div>

          <!-- Short Answer -->
          <div v-if="currentQuestion.type === 'short-answer'" class="short-answer-container">
            <textarea
              v-model="answers[currentQuestionIndex]"
              placeholder="Type your answer here..."
              class="short-answer-input"
              rows="4"
            ></textarea>
          </div>

          <!-- Essay -->
          <div v-if="currentQuestion.type === 'essay'" class="essay-container">
            <textarea
              v-model="answers[currentQuestionIndex]"
              placeholder="Write your essay here..."
              class="essay-input"
              rows="8"
            ></textarea>
            <div class="word-count">
              {{ wordCount }} words
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="quiz-navigation">
          <button 
            @click="previousQuestion" 
            class="btn btn-secondary"
            :disabled="currentQuestionIndex === 0"
          >
            Previous
          </button>
          
          <div class="question-indicators">
            <button 
              v-for="(question, index) in quiz.questions" 
              :key="index"
              @click="goToQuestion(index)"
              :class="['question-indicator', {
                'current': index === currentQuestionIndex,
                'answered': answers[index] !== undefined && answers[index] !== '',
                'unanswered': answers[index] === undefined || answers[index] === ''
              }]"
            >
              {{ index + 1 }}
            </button>
          </div>
          
          <button 
            @click="nextQuestion" 
            class="btn btn-secondary"
            :disabled="currentQuestionIndex === quiz.questions.length - 1"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Results State -->
      <div v-if="quizState === 'results'" class="quiz-results">
        <div class="results-summary">
          <div class="score-display">
            <div class="score-circle">
              <svg class="progress-ring" width="120" height="120">
                <circle
                  class="progress-ring-bg"
                  stroke-width="8"
                  fill="transparent"
                  r="52"
                  cx="60"
                  cy="60"
                />
                <circle
                  class="progress-ring-fill"
                  stroke-width="8"
                  fill="transparent"
                  r="52"
                  cx="60"
                  cy="60"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="scoreOffset"
                />
              </svg>
              <div class="score-text">
                <div class="score-percentage">{{ Math.round(scorePercentage) }}%</div>
                <div class="score-label">Score</div>
              </div>
            </div>
            
            <div class="score-details">
              <h3>{{ getScoreMessage() }}</h3>
              <p>You got {{ scorePoints }} out of {{ totalPoints }} points</p>
              <p>Completed in {{ formatTime(quiz.duration - timeRemaining) }}</p>
            </div>
          </div>
        </div>

        <div class="answers-review">
          <h3>Review Your Answers</h3>
          <div class="answer-cards">
            <div 
              v-for="(question, index) in quiz.questions" 
              :key="index"
              class="answer-card"
              :class="{ 
                'correct': isCorrectAnswer(index), 
                'incorrect': !isCorrectAnswer(index) && answers[index] !== undefined 
              }"
            >
              <div class="answer-header">
                <h4>Question {{ index + 1 }}</h4>
                <div class="answer-status">
                  <svg v-if="isCorrectAnswer(index)" width="20" height="20" viewBox="0 0 24 24" fill="#10b981">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span>{{ isCorrectAnswer(index) ? 'Correct' : 'Incorrect' }}</span>
                </div>
              </div>
              
              <div class="answer-content">
                <p class="question-text">{{ question.question }}</p>
                
                <div v-if="question.type === 'multiple-choice'" class="answer-comparison">
                  <div class="user-answer">
                    <strong>Your answer:</strong> {{ getAnswerText(question, answers[index]) }}
                  </div>
                  <div class="correct-answer">
                    <strong>Correct answer:</strong> {{ getAnswerText(question, question.correctAnswer) }}
                  </div>
                </div>
                
                <div v-if="question.explanation" class="answer-explanation">
                  <strong>Explanation:</strong> {{ question.explanation }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="retakeQuiz" class="btn btn-primary">
            Retake Quiz
          </button>
          <button @click="closeResults" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['quiz-completed', 'quiz-submitted'])

// Reactive state
const quizState = ref('preview') // preview, taking, results
const currentQuestionIndex = ref(0)
const answers = ref([])
const timeRemaining = ref(props.quiz.duration * 60) // Convert minutes to seconds
const timer = ref(null)
const scorePoints = ref(0)

// Computed properties
const currentQuestion = computed(() => {
  return props.quiz.questions[currentQuestionIndex.value]
})

const totalPoints = computed(() => {
  return props.quiz.questions.reduce((sum, question) => sum + question.points, 0)
})

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / props.quiz.questions.length) * 100
})

const allQuestionsAnswered = computed(() => {
  return props.quiz.questions.every((_, index) => 
    answers.value[index] !== undefined && answers.value[index] !== ''
  )
})

const wordCount = computed(() => {
  if (answers.value[currentQuestionIndex.value]) {
    return answers.value[currentQuestionIndex.value].trim().split(/\s+/).length
  }
  return 0
})

const scorePercentage = computed(() => {
  return (scorePoints.value / totalPoints.value) * 100
})

const circumference = computed(() => {
  return 2 * Math.PI * 52
})

const scoreOffset = computed(() => {
  const progress = scorePercentage.value / 100
  return circumference.value - (progress * circumference.value)
})

// Methods
const startQuiz = () => {
  quizState.value = 'taking'
  answers.value = new Array(props.quiz.questions.length).fill(undefined)
  timeRemaining.value = props.quiz.duration * 60
  startTimer()
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      submitQuiz()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const submitQuiz = () => {
  stopTimer()
  calculateScore()
  quizState.value = 'results'
  
  emit('quiz-submitted', {
    quizId: props.quiz.id,
    answers: answers.value,
    score: scorePoints.value,
    timeTaken: props.quiz.duration * 60 - timeRemaining.value
  })
}

const calculateScore = () => {
  scorePoints.value = 0
  
  props.quiz.questions.forEach((question, index) => {
    if (isCorrectAnswer(index)) {
      scorePoints.value += question.points
    }
  })
}

const isCorrectAnswer = (questionIndex) => {
  const question = props.quiz.questions[questionIndex]
  const userAnswer = answers.value[questionIndex]
  
  if (userAnswer === undefined || userAnswer === '') return false
  
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    return userAnswer === question.correctAnswer
  }
  
  // For essay and short answer, you'd need manual grading or AI evaluation
  return false
}

const getAnswerText = (question, answerIndex) => {
  if (question.type === 'true-false') {
    return answerIndex === 'true' ? 'True' : 'False'
  }
  
  if (question.type === 'multiple-choice' && question.options) {
    return question.options[answerIndex] || 'Not answered'
  }
  
  return answerIndex || 'Not answered'
}

const getScoreMessage = () => {
  const percentage = scorePercentage.value
  
  if (percentage >= 90) return 'Excellent! 🎉'
  if (percentage >= 80) return 'Great job! 👏'
  if (percentage >= 70) return 'Good work! 👍'
  if (percentage >= 60) return 'Not bad, but room for improvement'
  return 'Keep practicing and try again'
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.quiz.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const retakeQuiz = () => {
  quizState.value = 'preview'
  currentQuestionIndex.value = 0
  answers.value = []
  timeRemaining.value = props.quiz.duration * 60
  scorePoints.value = 0
}

const closeResults = () => {
  emit('quiz-completed', {
    score: scorePoints.value,
    percentage: scorePercentage.value
  })
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
    'essay': 'Essay'
  }
  return labels[type] || type
}

// Lifecycle
onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.quiz-system {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quiz-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.quiz-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quiz-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quiz-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  font-weight: 500;
}

.time-warning {
  color: #dc2626;
}

.quiz-progress {
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border-light);
  border-radius: 2px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

.quiz-content {
  padding: 1.5rem;
}

.quiz-preview {
  max-width: 800px;
  margin: 0 auto;
}

.preview-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.preview-card h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.instructions ul {
  margin: 0;
  padding-left: 1.5rem;
}

.instructions li {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.quiz-topics {
  margin-top: 1.5rem;
}

.quiz-topics h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-tag {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.813rem;
}

.questions-overview h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.question-cards {
  display: grid;
  gap: 1rem;
}

.question-overview-card {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.question-type {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.question-points {
  font-size: 0.813rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.question-preview {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.quiz-taking {
  max-width: 800px;
  margin: 0 auto;
}

.question-container {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.question-header {
  margin-bottom: 1.5rem;
}

.question-text {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.5;
}

.question-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-label:hover {
  border-color: var(--primary);
}

.option-input:checked + .option-content {
  color: var(--primary);
}

.option-input:checked + .option-content .option-letter {
  background: var(--primary);
  color: white;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.option-text {
  flex: 1;
  color: var(--text-primary);
}

.short-answer-container,
.essay-container {
  width: 100%;
}

.short-answer-input,
.essay-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
}

.essay-input {
  min-height: 200px;
}

.short-answer-input:focus,
.essay-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.word-count {
  margin-top: 0.5rem;
  font-size: 0.813rem;
  color: var(--text-secondary);
  text-align: right;
}

.quiz-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.question-indicators {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.question-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.question-indicator:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.question-indicator.current {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.question-indicator.answered {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.question-indicator.unanswered {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.quiz-results {
  max-width: 800px;
  margin: 0 auto;
}

.results-summary {
  text-align: center;
  margin-bottom: 2rem;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.score-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: var(--border-light);
}

.progress-ring-fill {
  stroke: var(--primary);
  transition: stroke-dashoffset 0.5s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-percentage {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.score-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.score-details h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.score-details p {
  margin: 0.25rem 0;
  color: var(--text-secondary);
}

.answers-review h3 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.answer-cards {
  display: grid;
  gap: 1rem;
}

.answer-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.answer-card.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.answer-card.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.answer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.answer-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.answer-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.answer-card.correct .answer-status {
  color: #10b981;
}

.answer-card.incorrect .answer-status {
  color: #ef4444;
}

.answer-content .question-text {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.answer-comparison {
  margin-bottom: 1rem;
}

.user-answer,
.correct-answer {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.answer-explanation {
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
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

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .quiz-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .quiz-controls {
    width: 100%;
    justify-content: center;
  }
  
  .quiz-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .score-display {
    flex-direction: column;
    gap: 1rem;
  }
  
  .results-actions {
    flex-direction: column;
  }
}
</style>