// API Service Configuration
// This file re-exports from the main api.js in utils for backward compatibility
// All API definitions are centralized in /src/utils/api.js

export {
  default,
  authAPI,
  studentAPI,
  companyAPI,
  jobsAPI,
  applicationsAPI,
  adminAPI,
  apiUtils
} from '../utils/api.js'
