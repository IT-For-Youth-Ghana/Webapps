'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useNotifications } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  userName: string
  onLogout: () => void
  onMenuToggle: () => void
}

export default function TopBar({ userName, onLogout, onMenuToggle }: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications({
    limit: 10,
    unreadOnly: false,
  })
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const resolveNotificationLink = (link?: string | null) => {
    if (!link) return null
    if (link.startsWith('/dashboard')) return link
    if (link.startsWith('/')) return `/dashboard${link}`
    return `/dashboard/${link}`
  }

  const handleNotificationClick = async (id: string, link?: string | null) => {
    await markAsRead(id)
    const resolved = resolveNotificationLink(link)
    if (resolved) {
      router.push(resolved)
      setNotificationsOpen(false)
    }
  }

  return (
    <div className="h-16 topbar-glass border-b flex items-center justify-between px-4 md:px-8 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 theme-hover rounded-lg"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          ITFY Portal
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 theme-hover rounded-lg relative"
            aria-label="Notifications"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 dropdown-glass rounded-lg border z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await markAllAsRead()
                    }}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-auto">
                {isLoading && (
                  <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
                )}

                {!isLoading && notifications.length === 0 && (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                )}

                {!isLoading && notifications.length > 0 && (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                        className={`w-full text-left px-4 py-3 theme-hover ${
                          notification.isRead ? 'bg-background' : 'bg-secondary/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                          </div>
                          {!notification.isRead && (
                            <span className="mt-1 w-2 h-2 bg-secondary rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  router.push('/dashboard/notifications')
                  setNotificationsOpen(false)
                }}
                className="w-full text-center text-sm py-2 border-t border-border text-primary hover:text-primary/80"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-2 theme-hover rounded-lg"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
              {userName[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {userName}
            </span>
            <span className="text-xs">▼</span>
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 dropdown-glass rounded-lg border z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-foreground theme-hover rounded-b-lg"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
