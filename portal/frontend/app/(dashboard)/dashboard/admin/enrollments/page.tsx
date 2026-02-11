/**
 * Admin Enrollments Page (NEW)
 * /admin/enrollments — enrollment stats and management
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useAdminEnrollmentStats, useCourseEnrollments } from '@/hooks/use-admin-enrollments'
import { useCourses } from '@/hooks/use-courses'
import StatsCard from '@/components/shared/stats-card'
import StatusBadge from '@/components/shared/status-badge'
import EmptyState from '@/components/shared/empty-state'
import {
    GraduationCap,
    Users,
    CheckCircle,
    XCircle,
    Loader2,
    BookOpen,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

export default function AdminEnrollmentsPage() {
    const { stats, isLoading: loadingStats } = useAdminEnrollmentStats()
    const { courses } = useCourses({})
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
    const [page, setPage] = useState(1)

    const { enrollments, pagination, isLoading: loadingEnrollments } = useCourseEnrollments(
        selectedCourse,
        { page, limit: 10 }
    )

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Enrollment Management</h1>
                <p className="text-muted-foreground mt-1">Monitor and manage student enrollments</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Enrollments"
                    value={stats?.totalEnrollments || 0}
                    icon={GraduationCap}
                />
                <StatsCard
                    title="Active"
                    value={stats?.activeEnrollments || 0}
                    icon={Users}
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Completed"
                    value={stats?.completedEnrollments || 0}
                    icon={CheckCircle}
                    iconColor="text-blue-600"
                />
                <StatsCard
                    title="Dropped"
                    value={stats?.droppedEnrollments || 0}
                    icon={XCircle}
                    iconColor="text-red-500"
                />
            </div>

            {/* Course Selector */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <p className="text-sm font-medium text-foreground">View enrollments for:</p>
                        <Select
                            value={selectedCourse || ''}
                            onValueChange={(v) => { setSelectedCourse(v || null); setPage(1) }}
                        >
                            <SelectTrigger className="w-full sm:w-80">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Enrollment List */}
            {!selectedCourse ? (
                <Card>
                    <EmptyState
                        icon={BookOpen}
                        title="Select a course"
                        description="Choose a course above to view its enrollments."
                    />
                </Card>
            ) : loadingEnrollments ? (
                <Card>
                    <CardContent className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading enrollments...
                    </CardContent>
                </Card>
            ) : enrollments.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={GraduationCap}
                        title="No enrollments"
                        description="No students are enrolled in this course yet."
                    />
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Progress</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Enrolled Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                                            {enrollment.user
                                                ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
                                                : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {enrollment.user?.email || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={enrollment.enrollmentStatus} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{ width: `${enrollment.progressPercentage || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{enrollment.progressPercentage || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(enrollment.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    )
}
