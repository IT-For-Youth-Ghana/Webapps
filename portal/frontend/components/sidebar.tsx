'use client'

import { usePathname } from 'next/navigation'

interface MenuItem {
  id: string
  label: string
  icon: string
  path?: string // Optional path override
}

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
  isOpen: boolean
  menuItems: MenuItem[]
}

export default function Sidebar({ activePage, onPageChange, isOpen, menuItems }: SidebarProps) {
  const pathname = usePathname()

  // Determine the active page based on the pathname
  const getActivePage = () => {
    // Check path overrides first
    const activeItem = menuItems.find(item => item.path && pathname.startsWith(item.path))
    if (activeItem) return activeItem.id

    // Fallback to ID-based matching
    if (pathname.includes('/browse')) return 'browse'
    if (pathname.includes('/courses')) return 'courses'
    if (pathname.includes('/notifications')) return 'notifications'
    if (pathname.includes('/payments')) return 'payments'
    if (pathname.includes('/profile')) return 'profile'
    if (pathname.includes('/settings')) return 'settings'
    if (pathname.includes('/dashboard')) return 'dashboard'
    return activePage
  }

  const currentActivePage = getActivePage()
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-primary text-white border-r border-primary/20">
        {/* Logo */}
        <div className="p-6 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg font-bold">
              ITFY
            </div>
            <span className="font-bold text-lg">IT For Youth</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentActivePage === item.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary/20 text-xs text-white/60">
          <p>© 2024 IT For Youth Ghana</p>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onPageChange(activePage)}
          ></div>

          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-primary text-white shadow-lg flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg font-bold">
                  ITFY
                </div>
                <span className="font-bold text-lg">IT For Youth</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentActivePage === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
