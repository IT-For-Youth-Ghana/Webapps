'use client'

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
  isOpen: boolean
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ activePage, onPageChange, isOpen }: SidebarProps) {
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
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activePage === item.id
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
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-primary text-white shadow-lg">
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
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activePage === item.id
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
