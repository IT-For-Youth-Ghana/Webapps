/**
 * Dashboard Layout
 * Shared layout for all dashboard pages with sidebar and topbar
 */

'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const studentMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'browse', label: 'Browse Courses', icon: '🔍', path: '/dashboard/browse' },
  { id: 'courses', label: 'My Courses', icon: '📚', path: '/dashboard/courses' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/dashboard/notifications' },
  { id: 'payments', label: 'Payments', icon: '💳', path: '/dashboard/payments' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/profile' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/dashboard/settings' },
]

const teacherMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'courses', label: 'My Courses', icon: '📚', path: '/dashboard/courses' },
  { id: 'students', label: 'My Students', icon: '👥', path: '/dashboard/teacher/students' },
  { id: 'assignments', label: 'Assignments', icon: '📝', path: '/dashboard/teacher/assignments' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/dashboard/notifications' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/profile' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/dashboard/settings' },
]

const adminMenuItems = [
  { id: 'admin-overview', label: 'Overview', icon: '📊', path: '/dashboard/admin' },
  { id: 'admin-users', label: 'User Management', icon: '👥', path: '/dashboard/admin/users' },
  { id: 'admin-courses', label: 'Course Management', icon: '📚', path: '/dashboard/admin/courses' },
  { id: 'admin-enrollments', label: 'Enrollments', icon: '🎓', path: '/dashboard/admin/enrollments' },
  { id: 'admin-payments', label: 'Payments', icon: '💰', path: '/dashboard/admin/payments' },
  { id: 'admin-queues', label: 'Queue Monitor', icon: '⚡', path: '/dashboard/admin/queues' },
  { id: 'profile', label: 'My Profile', icon: '👤', path: '/dashboard/profile' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/dashboard/settings' },
]


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const userName = `${user.firstName} ${user.lastName}`

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Select menu based on role
  const getMenuItems = () => {
    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return adminMenuItems
      case 'teacher':
        return teacherMenuItems
      default:
        return studentMenuItems
    }
  }

  const menuItems = getMenuItems()

  const handlePageChange = (pageId: string) => {
    // Check if the pageId corresponds to a menu item with a path
    const menuItem = menuItems.find(item => item.id === pageId)
    if (menuItem && menuItem.path) {
      router.push(menuItem.path)
    } else {
      // Fallback for legacy ID-based routing (mostly for student dashboard)
      switch (pageId) {
        case 'dashboard':
          router.push('/dashboard')
          break
        case 'checkout':
          router.push('/dashboard/checkout')
          break
        default:
          router.push('/dashboard')
      }
    }
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activePage="dashboard"
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          userName={userName}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  )
}
