/**
 * Job Management composable
 * Handles all job-related operations including CRUD and data fetching
 */
import { ref, computed } from 'vue'
import { useApi } from './useApi.js'

export function useJobManagement() {
  const loading = ref(true)
  const jobs = ref([])
  const showJobModal = ref(false)
  const editingJob = ref(null)
  
  const api = useApi()

  /**
   * Computed stats from jobs data
   */
  const stats = computed(() => {
    const total = jobs.value.length
    const active = jobs.value.filter(job => job.status === 'active').length
    const draft = jobs.value.filter(job => job.status === 'draft').length
    const closed = jobs.value.filter(job => job.status === 'closed').length
    const totalApplications = jobs.value.reduce((sum, job) => sum + (job.applicationCount || 0), 0)
    
    return {
      total,
      active,
      draft,
      closed,
      totalApplications
    }
  })

  /**
   * Fetch jobs from API
   */
  const fetchJobs = async () => {
    loading.value = true
    
    try {
      // Simulate API call - replace with real API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      jobs.value = getMockJobs()
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new job
   */
  const handleCreateJob = () => {
    editingJob.value = null
    showJobModal.value = true
  }

  /**
   * Edit existing job
   */
  const handleEditJob = (job) => {
    editingJob.value = job
    showJobModal.value = true
  }

  /**
   * Delete job
   */
  const handleDeleteJob = async (jobId) => {
    try {
      const index = jobs.value.findIndex(job => job.id === jobId)
      if (index !== -1) {
        jobs.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  /**
   * Toggle job status between active and closed
   */
  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active'
      const index = jobs.value.findIndex(j => j.id === job.id)
      if (index !== -1) {
        jobs.value[index].status = newStatus
      }
    } catch (error) {
      console.error('Error toggling job status:', error)
    }
  }

  /**
   * Submit job form (create or update)
   */
  const handleJobSubmit = (jobData) => {
    if (editingJob.value) {
      // Update existing job
      const index = jobs.value.findIndex(job => job.id === editingJob.value.id)
      if (index !== -1) {
        jobs.value[index] = { ...jobs.value[index], ...jobData }
      }
    } else {
      // Create new job
      const newJob = {
        id: Date.now(),
        ...jobData,
        applicationCount: 0,
        viewCount: 0,
        postedDate: new Date().toISOString()
      }
      jobs.value.unshift(newJob)
    }
    
    closeJobModal()
  }

  /**
   * Close job modal
   */
  const closeJobModal = () => {
    showJobModal.value = false
    editingJob.value = null
  }

  /**
   * Mock jobs data for development
   */
  const getMockJobs = () => [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp Ghana',
      location: 'Accra',
      type: 'Full-time',
      status: 'active',
      salary: 'GHS 8,000 - 12,000',
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      applicationCount: 23,
      viewCount: 156
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'StartupGH',
      location: 'Kumasi',
      type: 'Full-time',
      status: 'active',
      salary: 'GHS 6,000 - 10,000',
      postedDate: '2024-01-12',
      deadline: '2024-02-12',
      applicationCount: 18,
      viewCount: 89
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignHub Africa',
      location: 'Accra',
      type: 'Part-time',
      status: 'draft',
      salary: 'GHS 4,000 - 6,000',
      postedDate: '2024-01-10',
      deadline: '2024-02-10',
      applicationCount: 0,
      viewCount: 0
    },
    {
      id: 4,
      title: 'Data Analyst',
      company: 'DataCorp',
      location: 'Tamale',
      type: 'Internship',
      status: 'closed',
      salary: 'GHS 1,500 - 2,500',
      postedDate: '2024-01-08',
      deadline: '2024-02-08',
      applicationCount: 45,
      viewCount: 234
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Cape Coast',
      type: 'Full-time',
      status: 'expired',
      salary: 'GHS 10,000 - 15,000',
      postedDate: '2024-01-05',
      deadline: '2024-01-25',
      applicationCount: 12,
      viewCount: 78
    }
  ]

  return {
    // State
    loading,
    jobs,
    showJobModal,
    editingJob,
    
    // Computed
    stats,
    
    // Methods
    fetchJobs,
    handleCreateJob,
    handleEditJob,
    handleDeleteJob,
    handleToggleStatus,
    handleJobSubmit,
    closeJobModal
  }
}