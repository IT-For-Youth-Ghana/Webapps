<!-- 
🚀 IT Youth Talent Incubator - Student Application History Component

PURPOSE: A comprehensive dashboard for students to track their job application history,
status updates, and manage ongoing applications with filtering and search capabilities.

WHAT IT DOES:
- Displays all student job applications in an organized card grid layout
- Shows detailed application status tracking with color-coded status badges
- Provides filtering by application status (pending, interview, accepted, rejected)
- Includes search functionality to find applications by job title or company
- Displays application dates, deadlines, and interview schedules when applicable
- Enables application management actions like withdrawal for pending applications
- Shows empty state guidance when no applications exist

FOR CO-PROGRAMMERS:
- Sample application data in `applications` ref (lines 9-51) - replace with API calls
- Status filtering via `selectedStatus` and `searchQuery` refs (lines 53-54)
- Status options defined in `statusOptions` array (lines 56-62)
- Status styling logic in `getStatusClass()` and `getStatusText()` functions (lines 66-84)
- Application management functions: `withdrawApplication()`, `viewDetails()` (lines 86-94)
- Responsive card grid layout with hover effects

APPLICATION DATA STRUCTURE:
- Basic info: id, jobTitle, company, appliedDate, status, location, type, deadline
- Optional fields: interviewDate (for interview status applications)
- Status values: 'pending', 'interview', 'accepted', 'rejected'
- Type values: 'Full-time', 'Part-time', 'Internship', 'Contract'

STATUS TRACKING SYSTEM:
- Pending: Yellow badge, shows withdraw option
- Interview: Blue badge, displays interview date
- Accepted: Green badge, successful application
- Rejected: Red badge, application not selected
- Color-coded visual feedback for quick status identification

USER INTERACTION FEATURES:
- Filter dropdown to show applications by status
- Search input for finding specific jobs or companies
- View Details button for comprehensive application information
- Withdraw button for pending applications (with confirmation)
- Responsive card hover effects for better user experience

LAYOUT & DESIGN:
- Card-based layout with consistent spacing and typography
- Status badges with appropriate color coding
- Date formatting for easy reading
- Responsive grid that adapts to different screen sizes
- Empty state with call-to-action for new users
- Professional styling consistent with other components

TODO IMPLEMENTATION:
- Replace sample data with real API integration
- Implement actual filtering and search functionality
- Add application details modal/page navigation
- Implement withdrawal confirmation dialog
- Add pagination for large application lists
- Include application statistics and analytics
- Add export functionality for application history
- Implement real-time status updates via websockets
-->
<script setup>
import { ref } from 'vue'

// Sample application data - replace with real API data
const applications = ref([
  {
    id: 1,
    jobTitle: 'Frontend Developer Intern',
    company: 'TechCorp Ghana',
    appliedDate: '2025-01-15',
    status: 'pending',
    location: 'Accra, Ghana',
    type: 'Internship',
    deadline: '2025-02-15'
  },
  {
    id: 2,
    jobTitle: 'Junior Web Developer',
    company: 'Digital Solutions Ltd',
    appliedDate: '2025-01-10',
    status: 'interview',
    location: 'Kumasi, Ghana',
    type: 'Part-time',
    deadline: '2025-01-30',
    interviewDate: '2025-01-25'
  },
  {
    id: 3,
    jobTitle: 'Mobile App Developer',
    company: 'Innovation Hub',
    appliedDate: '2025-01-05',
    status: 'rejected',
    location: 'Tamale, Ghana',
    type: 'Full-time',
    deadline: '2025-01-20'
  },
  {
    id: 4,
    jobTitle: 'Data Analyst Trainee',
    company: 'Analytics Pro',
    appliedDate: '2024-12-20',
    status: 'accepted',
    location: 'Accra, Ghana',
    type: 'Internship',
    deadline: '2025-01-10'
  }
])

const selectedStatus = ref('all')
const searchQuery = ref('')

const statusOptions = [
  { value: 'all', label: 'All Applications' },
  { value: 'pending', label: 'Pending' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' }
]

const filteredApplications = ref(applications.value)

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'status-pending'
    case 'interview': return 'status-interview'
    case 'accepted': return 'status-accepted'
    case 'rejected': return 'status-rejected'
    default: return 'status-pending'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Pending Review'
    case 'interview': return 'Interview Scheduled'
    case 'accepted': return 'Accepted'
    case 'rejected': return 'Not Selected'
    default: return 'Unknown'
  }
}

const withdrawApplication = (applicationId) => {
  // TODO: Implement withdrawal logic with confirmation
  if (confirm('Are you sure you want to withdraw this application?')) {
    console.log('Withdrawing application:', applicationId)
    // TODO: Make API call to withdraw application
    // TODO: Update local applications list
    // TODO: Show success/error feedback to user
  }
}

const viewDetails = (application) => {
  // TODO: Implement details modal or navigate to details page
  console.log('Viewing details for:', application)
  // TODO: Show detailed application information including:
  // - Complete application form data
  // - Timeline of status changes
  // - Communication history with employer
  // - Interview scheduling information
  // - Feedback from employer (if available)
}
</script>

<template>
  <div>
    <h1>My Application History</h1>
    
    <!-- Filters Section -->
    <div class="section-container">
      <h2>Filter Applications</h2>
      <div class="form-row">
        <div class="form-field">
          <label for="statusFilter" class="form-label">Filter by Status:</label>
          <select id="statusFilter" v-model="selectedStatus" class="form-input">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="form-field">
          <label for="searchQuery" class="form-label">Search Jobs:</label>
          <input 
            id="searchQuery" 
            v-model="searchQuery" 
            type="text" 
            class="form-input" 
            placeholder="Search by job title or company..."
          >
        </div>
      </div>
    </div>

    <!-- Applications List -->
    <div class="section-container">
      <h2>Applications ({{ applications.length }})</h2>
      
      <div class="applications-grid">
        <div 
          v-for="application in applications" 
          :key="application.id" 
          class="application-card"
        >
          <!-- Status Badge -->
          <div class="card-header">
            <span :class="['status-badge', getStatusClass(application.status)]">
              {{ getStatusText(application.status) }}
            </span>
            <span class="application-type">{{ application.type }}</span>
          </div>

          <!-- Job Information -->
          <div class="card-body">
            <h3 class="job-title">{{ application.jobTitle }}</h3>
            <p class="company-name">{{ application.company }}</p>
            <p class="job-location">📍 {{ application.location }}</p>
            
            <div class="application-dates">
              <div class="date-item">
                <span class="date-label">Applied:</span>
                <span class="date-value">{{ new Date(application.appliedDate).toLocaleDateString() }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">Deadline:</span>
                <span class="date-value">{{ new Date(application.deadline).toLocaleDateString() }}</span>
              </div>
              <div v-if="application.interviewDate" class="date-item">
                <span class="date-label">Interview:</span>
                <span class="date-value interview-date">{{ new Date(application.interviewDate).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <button @click="viewDetails(application)" class="btn-secondary btn-small">
              View Details
            </button>
            <button 
              v-if="application.status === 'pending'" 
              @click="withdrawApplication(application.id)" 
              class="btn-danger btn-small"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="applications.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No Applications Yet</h3>
        <p>You haven't submitted any job applications yet. Start browsing available positions!</p>
        <button class="btn-primary">
          Browse Jobs &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Section Container - same as ApplicationForm */
.section-container {
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 197, 0.1);
  box-shadow: 0 2px 8px rgba(0, 77, 197, 0.08);
}

/* Form styling - same as ApplicationForm */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.form-field {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #003a9b;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #004dc5;
  box-shadow: 0 0 0 2px rgba(0, 77, 197, 0.2);
}

/* Applications Grid */
.applications-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.application-card {
  background: #ffffff;
  border: 1px solid rgba(0, 77, 197, 0.15);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 77, 197, 0.08);
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-interview {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-accepted {
  background-color: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.application-type {
  background-color: rgba(0, 77, 197, 0.1);
  color: #003a9b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.card-body {
  margin-bottom: 20px;
}

.job-title {
  color: #003a9b;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.company-name {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: 500;
}

.job-location {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.application-dates {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.date-label {
  color: #6b7280;
  font-weight: 500;
}

.date-value {
  color: #374151;
  font-weight: 600;
}

.interview-date {
  color: #1e40af;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 77, 197, 0.1);
}

/* Buttons - same style as ApplicationForm */
.btn-primary {
  background-color: #004dc5;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background-color: #003a9b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 77, 197, 0.3);
}

.btn-secondary {
  background-color: white;
  color: #003a9b;
  border: 2px solid rgba(0, 77, 197, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(0, 77, 197, 0.05);
  border-color: rgba(0, 77, 197, 0.5);
  color: #004dc5;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #374151;
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-state p {
  margin-bottom: 24px;
}

/* Title styling - same as ApplicationForm */
h1 {
  color: white;
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #003a9b;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid #004dc5;
  padding-bottom: 8px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .section-container {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .applications-grid {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    justify-content: stretch;
  }
  
  .card-actions button {
    flex: 1;
  }
}
</style>