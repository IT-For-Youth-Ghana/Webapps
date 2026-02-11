/**
 * Admin Dashboard
 * /admin — overview with real stats, charts, and quick actions
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAdminUserStats } from '@/hooks/use-admin-users'
import { useAdminCourseStats } from '@/hooks/use-admin-courses'
import { useAdminEnrollmentStats } from '@/hooks/use-admin-enrollments'
import { useAdminRevenueStats } from '@/hooks/use-admin-payments'
import StatsCard from '@/components/shared/stats-card'
import {
    Users,
    BookOpen,
    GraduationCap,
    DollarSign,
    ArrowRight,
    TrendingUp,
    UserCheck,
    UserX,
    Plus,
    CreditCard,
    Activity,
    Loader2,
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboardPage() {
    const router = useRouter()
    const { stats: userStats, isLoading: loadingUsers } = useAdminUserStats()
    const { stats: courseStats, isLoading: loadingCourses } = useAdminCourseStats()
    const { stats: enrollStats, isLoading: loadingEnrolls } = useAdminEnrollmentStats()
    const { stats: revenueStats, isLoading: loadingRevenue } = useAdminRevenueStats()

    const isLoading = loadingUsers || loadingCourses || loadingEnrolls || loadingRevenue

    // Prepare chart data from stats
    const roleData = userStats?.usersByRole
        ? Object.entries(userStats.usersByRole).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
        }))
        : []

    const categoryData = courseStats?.coursesByCategory
        ? Object.entries(courseStats.coursesByCategory).map(([name, value]) => ({
            name,
            courses: value,
        }))
        : []

    const enrollmentBarData = enrollStats
        ? [
            { name: 'Active', value: enrollStats.activeEnrollments || 0 },
            { name: 'Completed', value: enrollStats.completedEnrollments || 0 },
            { name: 'Dropped', value: enrollStats.droppedEnrollments || 0 },
        ]
        : []

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your platform's performance</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/admin/courses')} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" /> New Course
                    </Button>
                    <Button onClick={() => router.push('/admin/users')} variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-1" /> Manage Users
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading dashboard data...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total Users"
                            value={userStats?.totalUsers || 0}
                            icon={Users}
                            description={`${userStats?.activeUsers || 0} active`}
                        />
                        <StatsCard
                            title="Total Courses"
                            value={courseStats?.totalCourses || 0}
                            icon={BookOpen}
                            description={`${courseStats?.activeCourses || 0} active`}
                        />
                        <StatsCard
                            title="Enrollments"
                            value={enrollStats?.totalEnrollments || 0}
                            icon={GraduationCap}
                            description={`${enrollStats?.activeEnrollments || 0} active`}
                        />
                        <StatsCard
                            title="Revenue"
                            value={`GHS ${(revenueStats?.totalRevenue || 0).toLocaleString()}`}
                            icon={DollarSign}
                            description={`${revenueStats?.successfulPayments || 0} successful payments`}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Users by Role Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-primary" />
                                    Users by Role
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {roleData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={roleData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {roleData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Enrollment Status Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Enrollment Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {enrollmentBarData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={enrollmentBarData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Courses by Category */}
                    {categoryData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    Courses by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={categoryData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis type="number" tick={{ fontSize: 12 }} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                                        <Tooltip />
                                        <Bar dataKey="courses" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="font-medium">Users</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/courses')}>
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <BookOpen className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="font-medium">Courses</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/payments')}>
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <CreditCard className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="font-medium">Payments</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/admin/queues')}>
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <Activity className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="font-medium">Queues</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Summary */}
                    {revenueStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                                        <p className="text-2xl font-bold text-green-600">{revenueStats.successfulPayments}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Successful</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                        <p className="text-2xl font-bold text-amber-600">{revenueStats.pendingPayments}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Pending</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                                        <p className="text-2xl font-bold text-red-600">{revenueStats.failedPayments}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Failed</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                                        <p className="text-2xl font-bold text-primary">GHS {revenueStats.totalRevenue}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
