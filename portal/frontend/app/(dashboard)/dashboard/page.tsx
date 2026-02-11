/**
 * Dashboard Home Page - Ultra Modern Design
 * /dashboard
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress, CircularProgress } from '@/components/ui/progress'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import AntigravityBackground from '@/components/ui/antigravity-background'
import GlassmorphicBackground from '@/components/ui/glassmorphic-background'
import { useAuth } from '@/hooks/auth-context'
import { useMyEnrollments, useNotifications, usePayments } from '@/hooks'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  CheckCircle2, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  Bell,
  ExternalLink,
  User,
  Calendar,
  Target,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { enrollments, isLoading: enrollmentsLoading } = useMyEnrollments({ status: 'enrolled' })
  const { notifications } = useNotifications({ limit: 5, unreadOnly: false })
  const { payments } = usePayments()

  if (!user) {
    return null
  }

  const enrolledCourses = enrollments.filter(e => e.enrollmentStatus === 'enrolled')
  const completedCourses = enrollments.filter(e => e.enrollmentStatus === 'completed')
  const pendingPayments = payments.filter(p => p.status === 'pending')
  const unreadNotifications = notifications.filter(n => !n.isRead)

  // Calculate overall progress (mock data - replace with real calculation)
  const overallProgress = enrolledCourses.length > 0 
    ? Math.round((completedCourses.length / (completedCourses.length + enrolledCourses.length)) * 100)
    : 0

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layered Backgrounds */}
      <AntigravityBackground 
        opacity="medium"
        ringCount={5}
        particleColor="rgba(1, 82, 190, 1)"
        rotationSpeed={0.0005}
        mouseInteraction={true}
        blurAmount={3}
      />
      <GlassmorphicBackground />

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8 space-y-8 animate-fade-in">
        
        {/* Hero Section - Welcome */}
        <div className="relative">
          <Card className="glass-card-premium border-white/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
            <CardContent className="p-8 md:p-10 relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-6">
                  <Avatar
                    src={user.profilePicture}
                    fallback={`${user.firstName} ${user.lastName}`}
                    size="xl"
                    status="online"
                    className="animate-scale-in"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {greeting}, {user.firstName}! 👋
                      </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      Continue your learning journey. You're doing amazing!
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="success" className="animate-pulse">
                        <Zap className="w-3 h-3 mr-1" />
                        Active Student
                      </Badge>
                      {unreadNotifications.length > 0 && (
                        <Badge variant="info" pulse>
                          {unreadNotifications.length} New Notification{unreadNotifications.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Progress Circle */}
                <div className="flex-shrink-0 animate-scale-in animation-delay-200">
                  <CircularProgress
                    value={overallProgress}
                    max={100}
                    size={140}
                    strokeWidth={10}
                    label="Complete"
                    color="hsl(213, 99%, 37%)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LMS Access Notification for users without enrollments */}
        {enrolledCourses.length === 0 && !enrollmentsLoading && (
          <Card className="glass-card border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 animate-fade-in-up animation-delay-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">Ready to Start Learning?</h3>
                  <p className="text-sm text-muted-foreground">
                    To access our Learning Management System (LMS) and begin your courses, you'll need to enroll in at least one course first.
                    Browse our available courses and get started on your learning journey!
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => router.push('/dashboard/browse')}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      Browse Courses
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/courses')}
                    >
                      My Courses
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Enrolled Courses */}
          <Card className="glass-card hover-lift group cursor-pointer border-white/20 animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  {enrollmentsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <AnimatedCounter value={enrolledCourses.length} />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Active learning paths</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="glass-card hover-lift group cursor-pointer border-white/20 animate-fade-in-up animation-delay-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl md:text-4xl font-bold text-green-600">
                  {enrollmentsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <AnimatedCounter value={completedCourses.length} />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Achievements unlocked</p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card className="glass-card hover-lift group cursor-pointer border-white/20 animate-fade-in-up animation-delay-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                {pendingPayments.length > 0 && (
                  <Badge variant="warning" className="animate-pulse">Due</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter value={pendingPayments.length} />
                </p>
                <p className="text-xs text-muted-foreground">Action required</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Progress */}
          <Card className="glass-card hover-lift group cursor-pointer border-white/20 animate-fade-in-up animation-delay-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter value={overallProgress} suffix="%" />
                </p>
                <Progress value={overallProgress} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Quick Actions & Course Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Access your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {enrolledCourses.length > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => window.open(process.env.NEXT_PUBLIC_MOODLE_URL || '#', '_blank')}
                      className="w-full h-auto py-6 glass-button group hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Learning Portal</p>
                          <p className="text-xs text-muted-foreground">Access LMS</p>
                        </div>
                        <ExternalLink className="w-4 h-4 opacity-50" />
                      </div>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/browse')}
                      className="w-full h-auto py-6 glass-button group hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Enroll in Courses</p>
                          <p className="text-xs text-muted-foreground">Access LMS</p>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-50" />
                      </div>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => router.push('/../payments')}
                    className="w-full h-auto py-6 glass-button group hover:border-orange-500/50 hover:bg-orange-500/5"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <CreditCard className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Pay Fees</p>
                        <p className="text-xs text-muted-foreground">Make payment</p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push('/profile')}
                    className="w-full h-auto py-6 glass-button group hover:border-purple-500/50 hover:bg-purple-500/5"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold">My Profile</p>
                        <p className="text-xs text-muted-foreground">View details</p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Courses Preview */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Active Courses
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/courses')}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active courses yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/courses')}>
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrolledCourses.slice(0, 3).map((enrollment, index) => (
                      <div
                        key={enrollment.id}
                        className="p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {enrollment.course?.title || `Course ${index + 1}`}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            In Progress
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.random() * 100} // Replace with real progress
                          className="mb-2"
                          showLabel
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last accessed: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notifications & Activity */}
          <div className="space-y-6">
            
            {/* Notifications */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-600">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                    {unreadNotifications.length > 0 && (
                      <Badge variant="destructive" className="ml-2 animate-pulse">
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group ${
                          !notification.isRead
                            ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                            : 'bg-background/30 border-border/50 hover:bg-background/50'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bell className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm text-foreground line-clamp-1">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events/Deadlines */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock upcoming events - replace with real data */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">15</div>
                        <div className="text-xs text-muted-foreground">Feb</div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Assignment Due</p>
                        <p className="text-xs text-muted-foreground">Web Development 101</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">20</div>
                        <div className="text-xs text-muted-foreground">Feb</div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Exam Schedule</p>
                        <p className="text-xs text-muted-foreground">Database Systems</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}