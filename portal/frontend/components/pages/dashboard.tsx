'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'

interface DashboardProps {
  userEmail: string
  onLogout: () => void
}

export default function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const userName = userEmail.split('@')[0] || 'User'

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
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {activePage === 'dashboard' && (
            <div className="p-4 md:p-8 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Welcome, {userName}
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
                      <p className="text-3xl font-bold text-foreground">2</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📚</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Account Status</p>
                      <p className="text-3xl font-bold text-accent">Active</p>
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
                      <p className="text-3xl font-bold text-secondary">1</p>
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
                    className="w-full justify-center border-primary text-primary hover:bg-primary/10 bg-transparent"
                  >
                    📖 Go to LMS
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
                  >
                    💳 Pay Fees
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-accent text-accent hover:bg-accent/10 bg-transparent"
                  >
                    👤 View Profile
                  </Button>
                </div>
              </Card>

              {/* Announcements */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Announcements</h2>
                <div className="space-y-3">
                  <div className="flex gap-3 pb-3 border-b border-border">
                    <div className="text-xl">📢</div>
                    <div>
                      <p className="font-semibold text-foreground">
                        New course: Advanced Web Development
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available starting next week
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pb-3 border-b border-border">
                    <div className="text-xl">📅</div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Workshop: Building with React
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Friday at 3:00 PM GMT
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-xl">🎉</div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Graduation ceremony
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mark your calendar for August 30
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activePage === 'courses' && (
            <div className="p-4 md:p-8">
              <h1 className="text-3xl font-bold text-foreground mb-6">My Courses</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Web Development', duration: '8 weeks', status: 'Active' },
                  { title: 'Python Basics', duration: '6 weeks', status: 'Active' },
                ].map((course, i) => (
                  <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-primary to-primary/60"></div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Duration: {course.duration}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-accent">
                          {course.status}
                        </span>
                        <Button size="sm" variant="outline">
                          Open LMS
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { course: 'Web Development', amount: '500 GHS', status: 'Paid' },
                        { course: 'Python Basics', amount: '400 GHS', status: 'Pending' },
                      ].map((payment, i) => (
                        <tr key={i} className="hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm text-foreground">
                            {payment.course}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground font-semibold">
                            {payment.amount}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                payment.status === 'Paid'
                                  ? 'bg-accent/20 text-accent'
                                  : 'bg-secondary/20 text-secondary'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Button className="mt-6 bg-primary hover:bg-primary/90 text-white">
                Make Payment
              </Button>
            </div>
          )}

          {activePage === 'profile' && (
            <div className="p-4 md:p-8 max-w-2xl">
              <h1 className="text-3xl font-bold text-foreground mb-6">My Profile</h1>
              <Card className="p-8">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl">
                    👤
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{userName}</p>
                    <p className="text-muted-foreground">{userEmail}</p>
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
                    <p className="text-foreground">{userEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone
                    </label>
                    <p className="text-foreground">024 XXX XXXX</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Region
                    </label>
                    <p className="text-foreground">Greater Accra</p>
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
