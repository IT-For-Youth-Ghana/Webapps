/**
 * Admin Courses Page
 * /admin/courses — course CRUD with create/edit modals and Moodle sync
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useCourses } from '@/hooks/use-courses'
import {
    useAdminCourseStats,
    useCreateCourse,
    useUpdateCourse,
    useDeleteCourse,
    useSyncMoodle,
} from '@/hooks/use-admin-courses'
import StatsCard from '@/components/shared/stats-card'
import StatusBadge from '@/components/shared/status-badge'
import EmptyState from '@/components/shared/empty-state'
import ConfirmDialog from '@/components/shared/confirm-dialog'
import { useToast } from '@/components/ui/use-toast'
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Search,
    Loader2,
    DollarSign,
    GraduationCap,
    Clock,
} from 'lucide-react'
import type { Course } from '@/lib/types'

const defaultForm = {
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 0,
    price: 0,
    currency: 'GHS',
}

export default function AdminCoursesPage() {
    const { toast } = useToast()
    const [search, setSearch] = useState('')
    const { courses, isLoading: loadingCourses, refetch } = useCourses({ search: search || undefined })
    const { stats, isLoading: loadingStats } = useAdminCourseStats()
    const { createCourse, isLoading: creating } = useCreateCourse()
    const { updateCourse, isLoading: updating } = useUpdateCourse()
    const { deleteCourse, isLoading: deleting } = useDeleteCourse()
    const { syncMoodle, isLoading: syncing } = useSyncMoodle()

    // Modal state
    const [formOpen, setFormOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
    const [form, setForm] = useState(defaultForm)

    const openCreate = () => {
        setEditingCourse(null)
        setForm(defaultForm)
        setFormOpen(true)
    }

    const openEdit = (course: Course) => {
        setEditingCourse(course)
        setForm({
            title: course.title,
            description: course.description || '',
            category: course.category || '',
            level: (course.level as any) || 'beginner',
            duration: course.duration || 0,
            price: course.price || 0,
            currency: course.currency || 'GHS',
        })
        setFormOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingCourse) {
            const result = await updateCourse(editingCourse.id, form)
            if (result) {
                toast({ title: 'Course updated', description: `"${form.title}" has been updated.` })
                setFormOpen(false)
                refetch()
            } else {
                toast({ title: 'Error', description: 'Failed to update course', variant: 'destructive' })
            }
        } else {
            const result = await createCourse(form)
            if (result) {
                toast({ title: 'Course created', description: `"${form.title}" has been created.` })
                setFormOpen(false)
                refetch()
            } else {
                toast({ title: 'Error', description: 'Failed to create course', variant: 'destructive' })
            }
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        const success = await deleteCourse(deleteTarget.id)
        if (success) {
            toast({ title: 'Course deleted', description: `"${deleteTarget.title}" has been removed.` })
            refetch()
        } else {
            toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' })
        }
        setDeleteTarget(null)
    }

    const handleSync = async () => {
        const result = await syncMoodle()
        if (result) {
            toast({
                title: 'Moodle Sync Complete',
                description: `Synced: ${result.synced}, Updated: ${result.updated}, Failed: ${result.failed}`,
            })
            refetch()
        } else {
            toast({ title: 'Sync failed', description: 'Could not sync from Moodle', variant: 'destructive' })
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Course Management</h1>
                    <p className="text-muted-foreground mt-1">Create, edit, and manage courses</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                        <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                        Sync Moodle
                    </Button>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-1" /> New Course
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                    title="Total Courses"
                    value={stats?.totalCourses || 0}
                    icon={BookOpen}
                />
                <StatsCard
                    title="Active Courses"
                    value={stats?.activeCourses || 0}
                    icon={GraduationCap}
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Total Enrollments"
                    value={stats?.totalEnrollments || 0}
                    icon={DollarSign}
                />
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Course List */}
            <Card>
                {loadingCourses ? (
                    <CardContent className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading courses...
                    </CardContent>
                ) : courses.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="No courses found"
                        description="Create your first course to get started."
                        actionLabel="Create Course"
                        onAction={openCreate}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-foreground">{course.title}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{course.category || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={course.level || 'beginner'} />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold">
                                                {course.currency || 'GHS'} {Number(course.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {course.duration || 0}h
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(course)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create/Edit Course Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                        <DialogDescription>
                            {editingCourse ? 'Update the course details below.' : 'Fill in the details to create a new course.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={form.category}
                                    onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="level">Level</Label>
                                <Select
                                    value={form.level}
                                    onValueChange={(v) => setForm(p => ({ ...p, level: v as any }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={form.price}
                                    onChange={(e) => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    value={form.currency}
                                    onChange={(e) => setForm(p => ({ ...p, currency: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (hours)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min={0}
                                    value={form.duration}
                                    onChange={(e) => setForm(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={creating || updating}>
                                {(creating || updating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingCourse ? 'Update Course' : 'Create Course'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
                title="Delete Course"
                description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleting}
                onConfirm={handleDelete}
            />
        </div>
    )
}
