// Admin Dashboard Data
// Static data for admin dashboard components

export const systemHealthData = {
  status: 'healthy',
  uptime: '99.9%',
  responseTime: 156,
  activeUsers: 2847,
  storageUsed: 67
}

export const adminStatsData = [
  {
    id: 'users',
    label: 'Total Users',
    value: 15420,
    trend: '+12.5%',
    icon: 'users',
    breakdown: ['1240 Teachers', '14180 Students'],
    route: '/admin/users'
  },
  {
    id: 'institutions',
    label: 'Institutions',
    value: 89,
    trend: '+8.3%',
    icon: 'institutions',
    breakdown: ['87 Active'],
    route: '/admin/institutions'
  },
  {
    id: 'courses',
    label: 'Total Courses',
    value: 456,
    trend: '+15.7%',
    icon: 'courses',
    breakdown: ['423 Active'],
    route: '/admin/courses'
  },
  {
    id: 'security',
    label: 'Security Score',
    value: '92%',
    trend: 'Good',
    icon: 'security',
    breakdown: ['78 2FA Enabled'],
    route: '/admin/security'
  }
]

export const quickActionsData = [
  {
    id: 'users',
    type: 'users',
    title: 'User Management',
    description: 'Manage teachers, students, and admin accounts',
    stats: '23 pending registrations',
    route: '/admin/users'
  },
  {
    id: 'institutions',
    type: 'institutions',
    title: 'Institution Setup',
    description: 'Configure schools and university departments',
    stats: '5 new this month',
    route: '/admin/institutions'
  },
  {
    id: 'security',
    type: 'security',
    title: 'Security & Auth',
    description: 'Manage roles, permissions, and 2FA settings',
    stats: '2 security alerts',
    route: '/admin/security'
  },
  {
    id: 'localization',
    type: 'localization',
    title: 'Localization',
    description: 'Multi-language support and regional settings',
    stats: '4 languages',
    route: '/admin/localization'
  },
  {
    id: 'system',
    type: 'system',
    title: 'Offline & Cloud',
    description: 'Configure caching and cloud backend settings',
    stats: '65% users offline-enabled',
    route: '/admin/system'
  },
  {
    id: 'analytics',
    type: 'analytics',
    title: 'System Analytics',
    description: 'Usage statistics and performance metrics',
    stats: '1876 daily active users',
    route: '/admin/analytics'
  }
]

export const recentActivityData = [
  {
    id: 1,
    type: 'user',
    description: 'New institution registered: University of Cape Coast',
    user: 'System',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'info'
  },
  {
    id: 2,
    type: 'security',
    description: 'Failed login attempts detected from IP 192.168.1.100',
    user: 'Security Monitor',
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
    severity: 'warning'
  },
  {
    id: 3,
    type: 'system',
    description: 'Database backup completed successfully',
    user: 'System',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'success'
  },
  {
    id: 4,
    type: 'user',
    description: 'Bulk user import completed: 150 new students',
    user: 'Admin User',
    timestamp: new Date(Date.now() - 78 * 60 * 1000),
    severity: 'info'
  },
  {
    id: 5,
    type: 'system',
    description: 'Storage usage reached 70% threshold',
    user: 'System',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'warning'
  }
]

export const regionalData = [
  {
    country: 'Ghana',
    flag: '🇬🇭',
    primaryLanguage: 'English, Akan',
    userCount: 8450,
    institutionCount: 45,
    growthRate: 18.2
  },
  {
    country: 'Nigeria',
    flag: '🇳🇬',
    primaryLanguage: 'English',
    userCount: 4320,
    institutionCount: 28,
    growthRate: 22.1
  },
  {
    country: 'Kenya',
    flag: '🇰🇪',
    primaryLanguage: 'English, Swahili',
    userCount: 2150,
    institutionCount: 12,
    growthRate: 15.7
  },
  {
    country: 'Senegal',
    flag: '🇸🇳',
    primaryLanguage: 'French',
    userCount: 500,
    institutionCount: 4,
    growthRate: 8.9
  }
]