/**
 * API Type Definitions (JSDoc)
 * Type definitions for backend API responses
 * 
 * These types match the incubator-backend API schemas
 * @see /incubator-backend/openapi.yaml
 */

// ===========================================
// Common Types
// ===========================================

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {*} [data] - Response data (varies by endpoint)
 * @property {string} [error] - Error message if success is false
 * @property {string} [code] - Error code if applicable
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {number} totalItems - Total number of items
 * @property {number} itemsPerPage - Items per page
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 * @property {Array} data.items - The paginated items
 * @property {PaginationMeta} data.pagination - Pagination metadata
 */

/**
 * @typedef {Object} SocialLink
 * @property {string} name - Platform name (e.g., "LinkedIn", "GitHub")
 * @property {string} url - Profile URL
 */

// ===========================================
// User Types
// ===========================================

/**
 * User roles
 * @typedef {'student' | 'company' | 'admin'} UserRole
 */

/**
 * User account status
 * @typedef {'approved' | 'pending' | 'rejected' | 'deleted'} UserStatus
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} email - User email
 * @property {UserRole} role - User role
 * @property {string|null} photo_url - Profile photo URL
 * @property {boolean} is_active - Whether account is active
 * @property {UserStatus} status - Account approval status
 * @property {boolean} email_verified - Whether email is verified
 * @property {string|null} email_verified_at - Email verification date
 * @property {string|null} last_login - Last login timestamp
 * @property {string|null} locked_until - Account locked until (if locked)
 * @property {number} login_attempts - Failed login attempts
 * @property {string} createdAt - Created timestamp
 * @property {string} updatedAt - Updated timestamp
 */

// ===========================================
// Student Types
// ===========================================

/**
 * Student status
 * @typedef {'active' | 'job_seeking' | 'inactive'} StudentStatus
 */

/**
 * @typedef {Object} Education
 * @property {string} school - School/University name
 * @property {string} qualification - Degree/Qualification
 * @property {string} field_of_study - Field of study
 * @property {string} start_date - Start date (ISO format)
 * @property {string|null} end_date - End date (ISO format or null if current)
 * @property {boolean} is_current - Currently studying here
 */

/**
 * @typedef {Object} WorkExperience
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} location - Job location
 * @property {string} start_date - Start date (ISO format)
 * @property {string|null} end_date - End date (ISO format or null if current)
 * @property {boolean} is_current - Currently working here
 * @property {string} description - Job description
 */

/**
 * @typedef {Object} Student
 * @property {string} _id - Student profile ID
 * @property {User|string} user - User object or user ID
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 * @property {string} bio - Bio/About
 * @property {SocialLink[]} social_links - Social media links
 * @property {string|null} cv_url - CV/Resume URL
 * @property {string[]} skills - List of skills
 * @property {Education[]} education - Education history
 * @property {WorkExperience[]} work_experience - Work experience
 * @property {StudentStatus} status - Current status
 * @property {string} createdAt - Created timestamp
 * @property {string} updatedAt - Updated timestamp
 */

/**
 * @typedef {Object} StudentProfileUpdate
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {string} [bio]
 * @property {SocialLink[]} [social_links]
 * @property {string[]} [skills]
 */

// ===========================================
// Company Types
// ===========================================

/**
 * @typedef {Object} Company
 * @property {string} _id - Company profile ID
 * @property {User|string} user - User object or user ID
 * @property {string} name - Company name
 * @property {string} description - Company description
 * @property {string} industry - Industry sector
 * @property {string} website - Company website
 * @property {string|null} logo_url - Company logo URL
 * @property {SocialLink[]} social_links - Social media links
 * @property {string} createdAt - Created timestamp
 * @property {string} updatedAt - Updated timestamp
 */

/**
 * @typedef {Object} CompanyProfileUpdate
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [industry]
 * @property {string} [website]
 * @property {SocialLink[]} [social_links]
 */

// ===========================================
// Job Types
// ===========================================

/**
 * Job type
 * @typedef {'full-time' | 'part-time' | 'internship' | 'contract' | 'remote' | 'hybrid'} JobType
 */

/**
 * Experience level
 * @typedef {'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'} ExperienceLevel
 */

/**
 * Job status
 * @typedef {'draft' | 'published' | 'paused' | 'closed' | 'deleted'} JobStatus
 */

/**
 * Currency
 * @typedef {'GHS' | 'USD' | 'EUR' | 'GBP'} Currency
 */

/**
 * @typedef {Object} SalaryRange
 * @property {number} min - Minimum salary
 * @property {number} max - Maximum salary
 * @property {Currency} currency - Currency code
 * @property {string} [display] - Formatted display string
 */

/**
 * @typedef {Object} Job
 * @property {string} _id - Job ID
 * @property {Company|string} company - Company object or company ID
 * @property {string} title - Job title
 * @property {string} description - Job description
 * @property {string} location - Job location
 * @property {SalaryRange} salary_range - Salary information
 * @property {JobType} job_type - Type of employment
 * @property {ExperienceLevel} experience_level - Required experience level
 * @property {string[]} skills - Required skills
 * @property {string[]} [responsibilities] - Job responsibilities
 * @property {string[]} [requirements] - Job requirements
 * @property {JobStatus} status - Job posting status
 * @property {string} slug - URL-friendly slug
 * @property {number} views - View count
 * @property {number} applications_count - Number of applications
 * @property {boolean} is_featured - Whether job is featured
 * @property {string|null} featured_until - Featured until date
 * @property {string|null} published_at - Publication date
 * @property {string|null} closed_at - Closing date
 * @property {string} createdAt - Created timestamp
 * @property {string} updatedAt - Updated timestamp
 */

/**
 * @typedef {Object} CreateJobRequest
 * @property {string} title - Job title
 * @property {string} description - Job description (min 50 chars)
 * @property {string} [location] - Job location
 * @property {SalaryRange} [salary_range] - Salary information
 * @property {JobType} job_type - Type of employment
 * @property {ExperienceLevel} [experience_level] - Required experience level
 * @property {string[]} [skills] - Required skills (max 20)
 * @property {string[]} [responsibilities] - Job responsibilities
 * @property {string[]} [requirements] - Job requirements
 */

/**
 * @typedef {Object} UpdateJobRequest
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [location]
 * @property {SalaryRange} [salary_range]
 * @property {JobType} [job_type]
 * @property {ExperienceLevel} [experience_level]
 * @property {string[]} [skills]
 */

// ===========================================
// Application Types
// ===========================================

/**
 * Application status
 * @typedef {'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected'} ApplicationStatus
 */

/**
 * @typedef {Object} Application
 * @property {string} _id - Application ID
 * @property {Student|string} student - Student object or student ID
 * @property {Job|string} job - Job object or job ID
 * @property {string} [cover_letter] - Cover letter (max 2000 chars)
 * @property {string} [resume_url] - Resume URL
 * @property {ApplicationStatus} status - Application status
 * @property {string} applied_date - Application date
 * @property {string} [reviewed_at] - Review date
 * @property {string} [notes] - Reviewer notes
 * @property {string} createdAt - Created timestamp
 * @property {string} updatedAt - Updated timestamp
 */

/**
 * @typedef {Object} CreateApplicationRequest
 * @property {string} job_id - Job ID to apply for
 * @property {string} [cover_letter] - Cover letter
 * @property {string} [resume_url] - Resume URL (use uploaded CV if not provided)
 */

/**
 * @typedef {Object} UpdateApplicationStatusRequest
 * @property {ApplicationStatus} status - New status
 * @property {string} [notes] - Notes for the applicant
 */

// ===========================================
// Auth Types
// ===========================================

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email - User email
 * @property {string} password - Password (8+ chars, uppercase, lowercase, number, special)
 * @property {string} confirmPassword - Password confirmation
 * @property {UserRole} role - User role
 * @property {StudentProfileRequest|CompanyProfileRequest} profile - Profile data
 */

/**
 * @typedef {Object} StudentProfileRequest
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 * @property {string} [bio] - Bio
 * @property {string[]} [skills] - Skills
 * @property {SocialLink[]} [social_links] - Social links
 */

/**
 * @typedef {Object} CompanyProfileRequest
 * @property {string} name - Company name
 * @property {string} description - Company description
 * @property {string} industry - Industry
 * @property {string} [website] - Website URL
 * @property {SocialLink[]} [social_links] - Social links
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string} accessToken - JWT access token
 * @property {string} refreshToken - JWT refresh token
 * @property {string} expiresIn - Token expiry (e.g., "15m")
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 * @property {User} data.user - Logged in user
 * @property {AuthTokens} data.tokens - Auth tokens
 */

/**
 * @typedef {Object} ChangePasswordRequest
 * @property {string} currentPassword - Current password
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - Confirm new password
 */

// ===========================================
// Filter/Search Types
// ===========================================

/**
 * @typedef {Object} JobFilters
 * @property {string} [q] - Search query
 * @property {JobType} [job_type] - Filter by job type
 * @property {ExperienceLevel} [experience_level] - Filter by experience
 * @property {string} [location] - Filter by location
 * @property {string[]} [skills] - Filter by skills
 * @property {number} [salary_min] - Minimum salary
 * @property {number} [salary_max] - Maximum salary
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 */

/**
 * @typedef {Object} StudentFilters
 * @property {string} [q] - Search query
 * @property {string[]} [skills] - Filter by skills
 * @property {StudentStatus} [status] - Filter by status
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 */

/**
 * @typedef {Object} ApplicationFilters
 * @property {ApplicationStatus} [status] - Filter by status
 * @property {string} [job_id] - Filter by job
 * @property {string} [student_id] - Filter by student
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 */

// ===========================================
// Analytics Types
// ===========================================

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalStudents - Total registered students
 * @property {number} totalCompanies - Total registered companies
 * @property {number} totalJobs - Total job postings
 * @property {number} totalApplications - Total applications
 * @property {number} activeJobs - Currently active jobs
 * @property {number} pendingApprovals - Pending user approvals
 */

/**
 * @typedef {Object} CompanyJobStats
 * @property {number} totalJobs - Total jobs posted
 * @property {number} activeJobs - Currently active jobs
 * @property {number} totalApplications - Total applications received
 * @property {number} pendingApplications - Pending applications
 * @property {number} totalViews - Total job views
 */

// ===========================================
// Export for IDE support
// ===========================================

export const Types = {}
