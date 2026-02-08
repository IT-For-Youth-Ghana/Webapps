/**
 * Dashboard Layout
 * Shared layout for all dashboard pages with sidebar and topbar
 */

'use client'

import { ReactNode, useState } from 'react'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const userName = `${user.firstName} ${user.lastName}`

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handlePageChange = (page: string) => {
    // Route to the appropriate page
    switch (page) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'browse':
        router.push('/dashboard/browse')
        break
      case 'courses':
        router.push('/dashboard/courses')
        break
      case 'notifications':
        router.push('/dashboard/notifications')
        break
      case 'payments':
        router.push('/dashboard/payments')
        break
      case 'profile':
        router.push('/dashboard/profile')
        break
      case 'settings':
        router.push('/dashboard/settings')
        break
      case 'checkout':
        router.push('/dashboard/checkout')
        break
      default:
        router.push('/dashboard')
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
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
