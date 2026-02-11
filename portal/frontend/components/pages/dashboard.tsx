/**
 * Updated Dashboard Page
 * Integrated with real backend data
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'
import { useAuth } from '@/hooks/auth-context'
import { useMyEnrollments, useNotifications, usePayments } from '@/hooks'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Fetch real data
  const { enrollments, isLoading: enrollmentsLoading } = useMyEnrollments({ status: 'enrolled' })
  const { notifications } = useNotifications({ limit: 5, unreadOnly: false })
  const { payments } = usePayments()

  if (!user) {
    return null
  }

  const userName = `${user.firstName} ${user.lastName}`
  const enrolledCourses = enrollments.filter(e => e.enrollmentStatus === 'enrolled')
  const completedCourses = enrollments.filter(e => e.enrollmentStatus === 'completed')
  const pendingPayments = payments.filter(p => p.status === 'pending')

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
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
          {activePage === 'dashboard' && (
            <div className="p-4 md:p-8 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Welcome, {user.firstName}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Here's what's happening with your learning journey
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Enrolled Courses</p>
                      <p className="text-3xl font-bold text-foreground">
                        {enrollmentsLoading ? '...' : enrolledCourses.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📚</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Completed</p>
                      <p className="text-3xl font-bold text-accent">
                        {enrollmentsLoading ? '...' : completedCourses.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending Payments</p>
                      <p className="text-3xl font-bold text-secondary">
                        {pendingPayments.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💳</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open(process.env.NEXT_PUBLIC_MOODLE_URL || '#', '_blank')}
                    className="w-full justify-center border-primary text-primary hover:bg-primary/10 bg-transparent"
                  >
                    📖 Go to LMS
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActivePage('payments')}
                    className="w-full justify-center border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
                  >
                    💳 Pay Fees
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActivePage('profile')}
                    className="w-full justify-center border-accent text-accent hover:bg-accent/10 bg-transparent"
                  >
                    👤 View Profile
                  </Button>
                </div>
              </Card>

              {/* Recent Notifications */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Notifications</h2>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-3 pb-3 border-b border-border last:border-0"
                      >
                        <div className="text-xl">📢</div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activePage === 'courses' && (
            <div className="p-4 md:p-8">
              <h1 className="text-3xl font-bold text-foreground mb-6">My Courses</h1>
              {enrollmentsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : enrolledCourses.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't enrolled in any courses yet
                  </p>
                  <Button onClick={() => router.push('/browse')}>
                    Browse Courses
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((enrollment) => (
                    <Card
                      key={enrollment.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/courses/${enrollment.course?.slug || enrollment.courseId}`)
                      }
                    >
                      <div className="h-40 bg-gradient-to-br from-primary to-primary/60"></div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {enrollment.course?.title || 'Course'}
                        </h3>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{enrollment.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-accent capitalize">
                            {enrollment.enrollmentStatus}
                          </span>
                          <Button size="sm" variant="outline">
                            Continue
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activePage === 'payments' && (
            <div className="p-4 md:p-8">
              <h1 className="text-3xl font-bold text-foreground mb-6">My Payments</h1>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                            No payment history
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 text-sm text-foreground">
                              {payment.course?.title || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground font-semibold">
                              {payment.currency} {Number(payment.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'success'
                                  ? 'bg-accent/20 text-accent'
                                  : payment.status === 'pending'
                                    ? 'bg-secondary/20 text-secondary'
                                    : 'bg-destructive/20 text-destructive'
                                  }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activePage === 'profile' && (
            <div className="p-4 md:p-8 max-w-2xl">
              <h1 className="text-3xl font-bold text-foreground mb-6">My Profile</h1>
              <Card className="p-8">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userName}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Full Name
                    </label>
                    <p className="text-foreground">{userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email
                    </label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone
                    </label>
                    <p className="text-foreground">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Account Status
                    </label>
                    <p className="text-foreground capitalize">{user.status}</p>
                  </div>

                  <div className="pt-6 border-t border-border flex gap-3">
                    <Button variant="outline">Edit Profile</Button>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activePage === 'settings' && (
            <div className="p-4 md:p-8 max-w-2xl">
              <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
              <Card className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div className="border-t border-border"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">SMS Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Receive important alerts via SMS
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary/90 text-white">
                  Save Settings
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
