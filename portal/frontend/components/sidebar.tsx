'use client'

import { usePathname } from 'next/navigation'
import { X, Home, BookOpen, Bell, CreditCard, User, Settings, LayoutDashboard } from 'lucide-react' // Import icons from lucide-react
import { useAuth } from '@/hooks/auth-context'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode // Changed to ReactNode for actual icons
  path?: string // Optional path override
}

interface SidebarProps {
  activePage?: string // Optional
  onPageChange: (page: string) => void
  onClose?: () => void // For explicit close
  isOpen: boolean
  menuItems: MenuItem[]
}

export default function Sidebar({ activePage, onPageChange, onClose, isOpen, menuItems }: SidebarProps) {
  const pathname = usePathname()

  // Example icons mapping (customize as needed)
  const iconMap: { [key: string]: React.ReactNode } = {
    browse: <Home size={20} />,
    courses: <BookOpen size={20} />,
    notifications: <Bell size={20} />,
    payments: <CreditCard size={20} />,
    profile: <User size={20} />,
    settings: <Settings size={20} />,
    dashboard: <LayoutDashboard size={20} />,
  }

  // Determine the active page based on the pathname
  const getActivePage = () => {
    // Check path overrides first
    const activeItem = menuItems.find(item => item.path && pathname.startsWith(item.path))
    if (activeItem) return activeItem.id

    // Fallback to ID-based matching with startsWith
    if (pathname.startsWith('/browse')) return 'browse'
    if (pathname.startsWith('/courses')) return 'courses'
    if (pathname.startsWith('/notifications')) return 'notifications'
    if (pathname.startsWith('/payments')) return 'payments'
    if (pathname.startsWith('/profile')) return 'profile'
    if (pathname.startsWith('/settings')) return 'settings'
    if (pathname.startsWith('/dashboard')) return 'dashboard'
    return activePage ?? 'dashboard' // Default to 'dashboard'
  }

  const currentActivePage = getActivePage()

  const { user } = useAuth() // Get user info for personalization (e.g., display name, location)

  // Helper function to format user location
  const getUserLocation = () => {
    if (!user) return 'Unknown Location'

    const parts = []
    if (user.city) parts.push(user.city)
    if (user.country) parts.push(user.country)

    return parts.length > 0 ? parts.join(', ') : 'Location not set'
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      onPageChange(currentActivePage)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-indigo-900 to-blue-700 text-white border-r border-indigo-500/20 shadow-xl backdrop-blur-md bg-opacity-90">
        {/* Logo */}
        <div className="p-6 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold shadow-md">
              ITFY
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">IT For Youth</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                currentActivePage === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-inner'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              aria-current={currentActivePage === item.id ? 'page' : undefined}
            >
              <span aria-hidden="true">{iconMap[item.id] || item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p> {/* Personalized with user display name */}
              <p className="text-xs text-white/60">{getUserLocation()}</p> {/* Location-based personalization */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-500/20 text-xs text-white/60">
          <p>© 2024 IT For Youth Ghana</p>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={handleClose}
          ></div>

          {/* Sidebar */}
          <div className={`absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-indigo-900 to-blue-700 text-white shadow-2xl backdrop-blur-md bg-opacity-90 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Header with Close Button */}
            <div className="p-6 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                  ITFY
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">IT For Youth</span>
              </div>
              <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    currentActivePage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-inner'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={currentActivePage === item.id ? 'page' : undefined}
                >
                  <span aria-hidden="true">{iconMap[item.id] || item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-white/60">{getUserLocation()}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-indigo-500/20 text-xs text-white/60">
              <p>© 2024 IT For Youth Ghana</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}