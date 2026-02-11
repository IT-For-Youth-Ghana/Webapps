/**
 * Admin Users Page
 * /admin/users — full user management with search, filter, suspend/activate
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    useAdminUsers,
    useAdminUserStats,
    useSuspendUser,
    useActivateUser,
} from '@/hooks/use-admin-users'
import StatsCard from '@/components/shared/stats-card'
import StatusBadge from '@/components/shared/status-badge'
import EmptyState from '@/components/shared/empty-state'
import ConfirmDialog from '@/components/shared/confirm-dialog'
import { useToast } from '@/components/ui/use-toast'
import {
    Users,
    UserCheck,
    UserX,
    Search,
    Eye,
    Ban,
    CheckCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Calendar,
    Shield,
} from 'lucide-react'
import type { User } from '@/lib/types'

export default function AdminUsersPage() {
    const { toast } = useToast()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const { users, pagination, isLoading, refetch } = useAdminUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
    })
    const { stats, isLoading: loadingStats } = useAdminUserStats()
    const { suspendUser, isLoading: suspending } = useSuspendUser()
    const { activateUser, isLoading: activating } = useActivateUser()

    // UI state
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [suspendDialog, setSuspendDialog] = useState<User | null>(null)
    const [suspendReason, setSuspendReason] = useState('')
    const [activateDialog, setActivateDialog] = useState<User | null>(null)

    const handleSuspend = async () => {
        if (!suspendDialog) return
        const success = await suspendUser(suspendDialog.id, suspendReason || undefined)
        if (success) {
            toast({ title: 'User suspended', description: `${suspendDialog.firstName} has been suspended.` })
            refetch()
        } else {
            toast({ title: 'Error', description: 'Failed to suspend user', variant: 'destructive' })
        }
        setSuspendDialog(null)
        setSuspendReason('')
    }

    const handleActivate = async () => {
        if (!activateDialog) return
        const success = await activateUser(activateDialog.id)
        if (success) {
            toast({ title: 'User activated', description: `${activateDialog.firstName} has been reactivated.` })
            refetch()
        } else {
            toast({ title: 'Error', description: 'Failed to activate user', variant: 'destructive' })
        }
        setActivateDialog(null)
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-1">View and manage all platform users</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                />
                <StatsCard
                    title="Active Users"
                    value={stats?.activeUsers || 0}
                    icon={UserCheck}
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Suspended"
                    value={stats?.suspendedUsers || 0}
                    icon={UserX}
                    iconColor="text-red-500"
                />
                <StatsCard
                    title="Roles"
                    value={stats?.usersByRole ? Object.keys(stats.usersByRole).length : 0}
                    icon={Shield}
                />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                                className="pl-9"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1) }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                {isLoading ? (
                    <CardContent className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading users...
                    </CardContent>
                ) : users.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No users found"
                        description="Try adjusting your search or filter criteria."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                {u.firstName} {u.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="capitalize text-xs">{u.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={u.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {u.status === 'active' ? (
                                                        <Button variant="ghost" size="sm" onClick={() => setSuspendDialog(u)}>
                                                            <Ban className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    ) : u.status === 'suspended' ? (
                                                        <Button variant="ghost" size="sm" onClick={() => setActivateDialog(u)}>
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        </Button>
                                                    ) : null}
                                                </div>
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
                                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                                </p>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasPrevPage}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasNextPage}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* User Detail Sheet */}
            <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>User Details</SheetTitle>
                    </SheetHeader>
                    {selectedUser && (
                        <div className="mt-6 space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-lg font-bold">{selectedUser.firstName} {selectedUser.lastName}</p>
                                    <StatusBadge status={selectedUser.status} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="text-sm">{selectedUser.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Role</p>
                                        <Badge variant="secondary" className="capitalize text-xs">{selectedUser.role}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Joined</p>
                                        <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                {selectedUser.status === 'active' ? (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => { setSelectedUser(null); setSuspendDialog(selectedUser) }}
                                    >
                                        <Ban className="w-4 h-4 mr-2" /> Suspend User
                                    </Button>
                                ) : selectedUser.status === 'suspended' ? (
                                    <Button
                                        className="w-full"
                                        onClick={() => { setSelectedUser(null); setActivateDialog(selectedUser) }}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Activate User
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Suspend Dialog */}
            <Dialog open={!!suspendDialog} onOpenChange={() => { setSuspendDialog(null); setSuspendReason('') }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suspend User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to suspend {suspendDialog?.firstName} {suspendDialog?.lastName}?
                            This will prevent them from accessing the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for suspension..."
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSuspendDialog(null); setSuspendReason('') }}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleSuspend} disabled={suspending}>
                            {suspending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Suspend
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activate Dialog */}
            <ConfirmDialog
                open={!!activateDialog}
                onOpenChange={() => setActivateDialog(null)}
                title="Activate User"
                description={`Reactivate ${activateDialog?.firstName} ${activateDialog?.lastName}? They will regain access to the platform.`}
                confirmLabel="Activate"
                isLoading={activating}
                onConfirm={handleActivate}
            />
        </div>
    )
}
