/**
 * Student Jobs composable
 * Handles job browsing, filtering, and application for students
 */
import { ref, computed } from 'vue'
import { useApi } from './useApi.js'

export function useStudentJobs() {
  const loading = ref(true)
  const jobs = ref([])
  const showApplicationModal = ref(false)
  const selectedJob = ref(null)
  
  const api = useApi()

  /**
   * Fetch available jobs for students
   */
  const fetchJobs = async () => {
    loading.value = true
    
    try {
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      jobs.value = getMockStudentJobs()
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Apply for a job
   */
  const handleApplyJob = (job) => {
    selectedJob.value = job
    showApplicationModal.value = true
  }

  /**
   * View job details
   */
  const handleViewJob = (job) => {
    selectedJob.value = job
    // Could open a detailed job view modal
    console.log('Viewing job:', job.title)
  }

  /**
   * Bookmark/save job for later
   */
  const handleBookmarkJob = async (job) => {
    try {
      // Simulate API call to bookmark job
      console.log('Bookmarking job:', job.title)
      // Update local state or refetch data
    } catch (error) {
      console.error('Error bookmarking job:', error)
    }
  }

  /**
   * Submit job application
   */
  const handleApplicationSubmit = async (applicationData) => {
    try {
      // Simulate API call to submit application
      console.log('Submitting application:', applicationData)
      
      // Close modal
      closeApplicationModal()
      
      // Show success message or update job status
    } catch (error) {
      console.error('Error submitting application:', error)
    }
  }

  /**
   * Close application modal
   */
  const closeApplicationModal = () => {
    showApplicationModal.value = false
    selectedJob.value = null
  }

  /**
   * Custom filtering logic for student jobs
   */
  const filterJobs = (filters) => {
    let filtered = [...jobs.value]

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.requirements.some(req => req.toLowerCase().includes(query))
      )
    }

    // Location filter
    if (filters.location && filters.location !== 'All Locations') {
      filtered = filtered.filter(job => job.location.includes(filters.location))
    }

    // Job type filter
    if (filters.type && filters.type !== 'All Types') {
      filtered = filtered.filter(job => job.type === filters.type)
    }

    // Salary range filter
    if (filters.salaryRange && filters.salaryRange !== 'All Salaries') {
      filtered = filtered.filter(job => {
        const salary = extractSalaryNumber(job.salary)
        return matchesSalaryRange(salary, filters.salaryRange)
      })
    }

    // Sort results
    return sortJobs(filtered, filters.sortBy)
  }

  /**
   * Extract numeric value from salary string
   */
  const extractSalaryNumber = (salary) => {
    if (!salary) return 0
    const matches = salary.match(/[\d,]+/)
    return matches ? parseInt(matches[0].replace(/,/g, '')) : 0
  }

  /**
   * Check if salary matches range
   */
  const matchesSalaryRange = (salary, range) => {
    switch (range) {
      case '0-2k': return salary <= 2000
      case '2k-5k': return salary > 2000 && salary <= 5000
      case '5k-8k': return salary > 5000 && salary <= 8000
      case '8k+': return salary > 8000
      default: return true
    }
  }

  /**
   * Sort jobs by specified criteria
   */
  const sortJobs = (jobList, sortBy) => {
    const sorted = [...jobList]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate))
      case 'salary-high':
        return sorted.sort((a, b) => extractSalaryNumber(b.salary) - extractSalaryNumber(a.salary))
      case 'salary-low':
        return sorted.sort((a, b) => extractSalaryNumber(a.salary) - extractSalaryNumber(b.salary))
      case 'deadline':
        return sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      default:
        return sorted
    }
  }

  /**
   * Mock jobs data for development
   */
  const getMockStudentJobs = () => [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp Ghana',
      location: 'Accra',
      type: 'Full-time',
      salary: 'GHS 8,000 - 12,000',
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      description: 'We are looking for a talented Frontend Developer to join our growing team and help build amazing user experiences.',
      requirements: ['React', 'JavaScript', 'CSS', 'Git', 'HTML'],
      responsibilities: ['Develop user-facing features', 'Write clean, maintainable code', 'Collaborate with design team'],
      benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget'],
      remote: false,
      urgent: false
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'StartupGH',
      location: 'Kumasi',
      type: 'Full-time',
      salary: 'GHS 6,000 - 10,000',
      postedDate: '2024-01-12',
      deadline: '2024-02-12',
      description: 'Join our growing team as a Backend Developer and help us scale our platform.',
      requirements: ['Node.js', 'Python', 'MongoDB', 'REST APIs'],
      responsibilities: ['Design and implement APIs', 'Optimize database performance', 'Ensure security'],
      benefits: ['Stock Options', 'Learning Budget', 'Flexible Work'],
      remote: true,
      urgent: false
    },
    {
      id: 3,
      title: 'UI/UX Designer Intern',
      company: 'DesignHub Africa',
      location: 'Accra',
      type: 'Internship',
      salary: 'GHS 1,500 - 2,500',
      postedDate: '2024-01-10',
      deadline: '2024-02-01',
      description: 'Great opportunity for a creative UI/UX Designer to gain hands-on experience.',
      requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
      responsibilities: ['Create wireframes and prototypes', 'Conduct user research', 'Design user interfaces'],
      benefits: ['Mentorship', 'Portfolio Building', 'Certificate'],
      remote: false,
      urgent: true
    },
    {
      id: 4,
      title: 'Data Analyst',
      company: 'DataCorp',
      location: 'Remote',
      type: 'Part-time',
      salary: 'GHS 4,000 - 6,000',
      postedDate: '2024-01-08',
      deadline: '2024-02-08',
      description: 'Analyze data and provide insights to help drive business decisions.',
      requirements: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
      responsibilities: ['Analyze business data', 'Create reports and dashboards', 'Present findings'],
      benefits: ['Flexible Schedule', 'Remote Work', 'Learning Opportunities'],
      remote: true,
      urgent: false
    },
    {
      id: 5,
      title: 'Mobile App Developer',
      company: 'MobileTech GH',
      location: 'Cape Coast',
      type: 'Contract',
      salary: 'GHS 10,000 - 15,000',
      postedDate: '2024-01-05',
      deadline: '2024-01-30',
      description: 'Develop cross-platform mobile applications for our clients.',
      requirements: ['React Native', 'Flutter', 'JavaScript', 'Mobile UI/UX'],
      responsibilities: ['Build mobile applications', 'Optimize performance', 'Test on multiple devices'],
      benefits: ['High Compensation', 'Project-based Work', 'Portfolio Growth'],
      remote: false,
      urgent: true
    }
  ]

  return {
    // State
    loading,
    jobs,
    showApplicationModal,
    selectedJob,
    
    // Methods
    fetchJobs,
    handleApplyJob,
    handleViewJob,
    handleBookmarkJob,
    handleApplicationSubmit,
    closeApplicationModal,
    filterJobs
  }
}