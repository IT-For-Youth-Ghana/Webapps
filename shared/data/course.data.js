// Course Management Data
// Static data for course creation and management

export const courseCategories = [
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Frontend and backend web technologies',
    icon: 'code',
    color: '#3b82f6'
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    description: 'iOS and Android app development',
    icon: 'mobile',
    color: '#10b981'
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Data analysis, machine learning, AI',
    icon: 'chart',
    color: '#8b5cf6'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Information security and protection',
    icon: 'shield',
    color: '#ef4444'
  },
  {
    id: 'ui-ux',
    name: 'UI/UX Design',
    description: 'User interface and experience design',
    icon: 'design',
    color: '#f59e0b'
  },
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    description: 'AWS, Azure, Google Cloud platforms',
    icon: 'cloud',
    color: '#06b6d4'
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Development operations and automation',
    icon: 'tools',
    color: '#84cc16'
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    description: 'Cryptocurrency and blockchain technology',
    icon: 'chain',
    color: '#f97316'
  }
]

export const courseLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'No prior experience required',
    color: '#10b981'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Some experience recommended',
    color: '#f59e0b'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Extensive experience required',
    color: '#ef4444'
  }
]

export const courseLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ak', name: 'Akan', flag: '🇬🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' }
]

export const courseTemplates = [
  {
    id: 'web-basics',
    name: 'Web Development Basics',
    category: 'web-dev',
    modules: 6,
    lessons: 24,
    duration: '8 weeks',
    description: 'Complete beginner course for web development'
  },
  {
    id: 'mobile-intro',
    name: 'Mobile App Introduction',
    category: 'mobile-dev',
    modules: 8,
    lessons: 32,
    duration: '12 weeks',
    description: 'Learn mobile app development fundamentals'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Fundamentals',
    category: 'data-science',
    modules: 10,
    lessons: 40,
    duration: '16 weeks',
    description: 'Introduction to data science and analytics'
  }
]

export const materialTypes = [
  {
    id: 'document',
    name: 'Document',
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    icon: 'document',
    maxSize: '10MB'
  },
  {
    id: 'presentation',
    name: 'Presentation',
    extensions: ['.ppt', '.pptx', '.odp'],
    icon: 'presentation',
    maxSize: '50MB'
  },
  {
    id: 'video',
    name: 'Video',
    extensions: ['.mp4', '.avi', '.mov', '.wmv'],
    icon: 'video',
    maxSize: '500MB'
  },
  {
    id: 'audio',
    name: 'Audio',
    extensions: ['.mp3', '.wav', '.ogg'],
    icon: 'audio',
    maxSize: '100MB'
  },
  {
    id: 'image',
    name: 'Image',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
    icon: 'image',
    maxSize: '10MB'
  },
  {
    id: 'archive',
    name: 'Archive',
    extensions: ['.zip', '.rar', '.7z'],
    icon: 'archive',
    maxSize: '100MB'
  }
]

export const assignmentTypes = [
  {
    id: 'essay',
    name: 'Essay',
    description: 'Written assignment with file upload',
    icon: 'document'
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Multiple choice and short answer questions',
    icon: 'quiz'
  },
  {
    id: 'project',
    name: 'Project',
    description: 'Practical project with deliverables',
    icon: 'project'
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Oral presentation with slides',
    icon: 'presentation'
  },
  {
    id: 'peer-review',
    name: 'Peer Review',
    description: 'Students review each other\'s work',
    icon: 'review'
  }
]

export const gradingRubrics = [
  {
    id: 'standard',
    name: 'Standard Rubric',
    criteria: [
      { name: 'Content Quality', weight: 40 },
      { name: 'Organization', weight: 20 },
      { name: 'Grammar & Style', weight: 20 },
      { name: 'Timeliness', weight: 20 }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Project',
    criteria: [
      { name: 'Functionality', weight: 50 },
      { name: 'Code Quality', weight: 25 },
      { name: 'Documentation', weight: 15 },
      { name: 'Innovation', weight: 10 }
    ]
  },
  {
    id: 'presentation',
    name: 'Presentation Rubric',
    criteria: [
      { name: 'Content', weight: 35 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Time Management', weight: 15 }
    ]
  }
]