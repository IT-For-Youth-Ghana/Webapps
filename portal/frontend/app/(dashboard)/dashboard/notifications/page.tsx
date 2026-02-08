/**
 * Notifications Page
 * /dashboard/notifications
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-user'

export default function NotificationsPage() {
  const router = useRouter()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const { notifications, isLoading, markAsRead, markAllAsRead, refetch } = useNotifications({
    limit: 50,
    unreadOnly: showUnreadOnly,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const resolveNotificationLink = (link?: string | null) => {
    if (!link) return null
    if (link.startsWith('/dashboard')) return link
    if (link.startsWith('/')) return `/dashboard${link}`
    return `/dashboard/${link}`
  }

  const handleClick = async (id: string, link?: string | null) => {
    await markAsRead(id)
    const resolved = resolveNotificationLink(link)
    if (resolved) {
      router.push(resolved)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay up to date with your account and course activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => markAllAsRead()}>
                Mark all read
              </Button>
            )}
            <Button onClick={() => refetch()}>Refresh</Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? 'secondary' : 'outline'}
            onClick={() => setShowUnreadOnly((prev) => !prev)}
          >
            {showUnreadOnly ? 'Showing unread only' : 'Show unread only'}
          </Button>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading && (
            <div className="p-6 text-sm text-muted-foreground">Loading notifications...</div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleClick(notification.id, notification.link)}
                  className={`w-full text-left px-6 py-4 hover:bg-muted transition-colors ${
                    notification.isRead ? 'bg-white' : 'bg-secondary/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="mt-1 w-2 h-2 bg-secondary rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
