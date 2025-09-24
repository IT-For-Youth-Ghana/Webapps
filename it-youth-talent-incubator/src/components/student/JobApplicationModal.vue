<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'close'])

const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 3

// Form data
const applicationData = ref({
  coverLetter: '',
  resumeFile: null,
  portfolioUrl: '',
  availableStartDate: '',
  salaryExpectation: '',
  motivation: '',
  additionalInfo: ''
})

const uploadedFiles = ref([])

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return applicationData.value.coverLetter.length >= 100
    case 2:
      return uploadedFiles.value.some(file => file.type === 'resume')
    case 3:
      return applicationData.value.availableStartDate && applicationData.value.motivation.length >= 50
    default:
      return true
  }
})

const handleFileUpload = (event, fileType) => {
  const file = event.target.files[0]
  if (file) {
    const fileObj = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: fileType,
      file: file,
      preview: fileType === 'resume' ? 'document' : 'file'
    }
    
    uploadedFiles.value.push(fileObj)
    
    if (fileType === 'resume') {
      applicationData.value.resumeFile = file
    }
  }
}

const removeFile = (fileId) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== fileId)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitApplication = async () => {
  isSubmitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const submitData = {
      jobId: props.job.id,
      jobTitle: props.job.title,
      company: props.job.company,
      ...applicationData.value,
      files: uploadedFiles.value,
      submittedAt: new Date().toISOString()
    }
    
    emit('submit', submitData)
  } catch (error) {
    console.error('Error submitting application:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="job-info">
          <h2 class="modal-title">Apply for {{ job.title }}</h2>
          <p class="modal-subtitle">{{ job.company }} • {{ job.location }}</p>
        </div>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <div class="progress-bar">
        <div class="progress-steps">
          <div
            v-for="step in totalSteps"
            :key="step"
            :class="[
              'progress-step',
              { 'active': step === currentStep, 'completed': step < currentStep }
            ]"
          >
            <span class="step-number">{{ step }}</span>
            <span class="step-label">
              {{ step === 1 ? 'Cover Letter' : step === 2 ? 'Documents' : 'Final Details' }}
            </span>
          </div>
        </div>
        <div class="progress-line">
          <div 
            class="progress-fill" 
            :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="modal-body">
        <!-- Step 1: Cover Letter -->
        <div v-if="currentStep === 1" class="step-content">
          <h3 class="step-title">Tell us about yourself</h3>
          <p class="step-description">Write a compelling cover letter that highlights your skills and motivation.</p>
          
          <div class="form-group">
            <label for="coverLetter" class="form-label">Cover Letter *</label>
            <textarea
              id="coverLetter"
              v-model="applicationData.coverLetter"
              class="form-textarea"
              rows="8"
              placeholder="Dear Hiring Manager,

I am excited to apply for the {{ job.title }} position at {{ job.company }}. With my background in..."
            ></textarea>
            <div class="char-counter">
              {{ applicationData.coverLetter.length }} / 500 characters
              <span v-if="applicationData.coverLetter.length < 100" class="min-requirement">
                (minimum 100 characters)
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="portfolioUrl" class="form-label">Portfolio/LinkedIn URL (Optional)</label>
            <input
              id="portfolioUrl"
              v-model="applicationData.portfolioUrl"
              type="url"
              class="form-input"
              placeholder="https://yourportfolio.com or https://linkedin.com/in/yourprofile"
            >
          </div>
        </div>

        <!-- Step 2: Documents -->
        <div v-if="currentStep === 2" class="step-content">
          <h3 class="step-title">Upload your documents</h3>
          <p class="step-description">Please upload your resume and any additional documents.</p>
          
          <div class="upload-section">
            <div class="upload-area">
              <div class="upload-content">
                <div class="upload-icon">📄</div>
                <h4>Upload Resume</h4>
                <p>PDF, DOC, or DOCX files up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  @change="handleFileUpload($event, 'resume')"
                  class="file-input"
                  id="resume-upload"
                >
                <label for="resume-upload" class="btn-primary">
                  Choose File
                </label>
              </div>
            </div>

            <div class="upload-area">
              <div class="upload-content">
                <div class="upload-icon">📁</div>
                <h4>Additional Documents</h4>
                <p>Certificates, portfolio samples, etc.</p>
                <input
                  type="file"
                  multiple
                  @change="handleFileUpload($event, 'additional')"
                  class="file-input"
                  id="additional-upload"
                >
                <label for="additional-upload" class="btn-secondary">
                  Choose Files
                </label>
              </div>
            </div>
          </div>

          <div v-if="uploadedFiles.length > 0" class="uploaded-files">
            <h4>Uploaded Files</h4>
            <div class="file-list">
              <div
                v-for="file in uploadedFiles"
                :key="file.id"
                class="file-item"
              >
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span :class="['file-type', `type-${file.type}`]">{{ file.type }}</span>
                </div>
                <button @click="removeFile(file.id)" class="remove-file-btn">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Final Details -->
        <div v-if="currentStep === 3" class="step-content">
          <h3 class="step-title">Final details</h3>
          <p class="step-description">Complete your application with these additional details.</p>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startDate" class="form-label">Available Start Date *</label>
              <input
                id="startDate"
                v-model="applicationData.availableStartDate"
                type="date"
                class="form-input"
                :min="new Date().toISOString().split('T')[0]"
              >
            </div>

            <div class="form-group">
              <label for="salary" class="form-label">Salary Expectation (Optional)</label>
              <input
                id="salary"
                v-model="applicationData.salaryExpectation"
                type="text"
                class="form-input"
                placeholder="e.g., GHS 5,000 - 8,000"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="motivation" class="form-label">Why do you want this job? *</label>
            <textarea
              id="motivation"
              v-model="applicationData.motivation"
              class="form-textarea"
              rows="4"
              placeholder="Explain what motivates you about this role and company..."
            ></textarea>
            <div class="char-counter">
              {{ applicationData.motivation.length }} characters
              <span v-if="applicationData.motivation.length < 50" class="min-requirement">
                (minimum 50 characters)
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="additionalInfo" class="form-label">Additional Information (Optional)</label>
            <textarea
              id="additionalInfo"
              v-model="applicationData.additionalInfo"
              class="form-textarea"
              rows="3"
              placeholder="Any additional information you'd like to share..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="btn-secondary"
          >
            Previous
          </button>
          
          <div class="main-actions">
            <button @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            
            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              :disabled="!canProceedToNext"
              class="btn-primary"
            >
              Next Step
            </button>
            
            <button
              v-else
              @click="submitApplication"
              :disabled="!canProceedToNext || isSubmitting"
              class="btn-primary"
            >
              <span v-if="isSubmitting" class="loading-spinner"></span>
              {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 1rem;
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #30363D;
}

.job-info {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #F0F6FC;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #8B949E;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 150ms ease;
}

.close-btn:hover {
  color: #F0F6FC;
}

.progress-bar {
  padding: 1.5rem;
  border-bottom: 1px solid #30363D;
  position: relative;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #30363D;
  color: #8B949E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 250ms ease;
}

.progress-step.active .step-number {
  background: #007AFF;
  color: white;
}

.progress-step.completed .step-number {
  background: #32D74B;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #8B949E;
  text-align: center;
  font-weight: 500;
}

.progress-step.active .step-label {
  color: #F0F6FC;
}

.progress-line {
  position: absolute;
  top: 2.25rem;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: #30363D;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: #007AFF;
  transition: width 500ms ease;
}

.modal-body {
  padding: 1.5rem;
  min-height: 20rem;
}

.step-content {
  animation: fadeIn 300ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.5rem 0;
}

.step-description {
  color: #8B949E;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #F0F6FC;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: #21262D;
  border: 1px solid #30363D;
  border-radius: 0.5rem;
  color: #F0F6FC;
  font-size: 0.875rem;
  transition: all 250ms ease;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  background: #161B22;
}

.form-textarea {
  min-height: 8rem;
  font-family: inherit;
}

.char-counter {
  font-size: 0.75rem;
  color: #8B949E;
  margin-top: 0.25rem;
  text-align: right;
}

.min-requirement {
  color: #FF9F0A;
}

.upload-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #30363D;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  transition: border-color 250ms ease;
}

.upload-area:hover {
  border-color: #484F58;
}

.upload-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0.5rem 0 0.25rem 0;
}

.upload-content p {
  font-size: 0.75rem;
  color: #8B949E;
  margin: 0 0 1rem 0;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.file-input {
  display: none;
}

.uploaded-files {
  margin-top: 1rem;
}

.uploaded-files h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #F0F6FC;
  margin: 0 0 0.75rem 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #30363D;
  border-radius: 0.5rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #F0F6FC;
}

.file-size {
  font-size: 0.75rem;
  color: #8B949E;
}

.file-type {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
  width: fit-content;
}

.type-resume {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.type-additional {
  background: rgba(191, 90, 242, 0.1);
  color: #BF5AF2;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #FF453A;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background 150ms ease;
}

.remove-file-btn:hover {
  background: rgba(255, 69, 58, 0.1);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #30363D;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .upload-section {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .main-actions {
    justify-content: stretch;
  }

  .main-actions button {
    flex: 1;
  }
}
</style>