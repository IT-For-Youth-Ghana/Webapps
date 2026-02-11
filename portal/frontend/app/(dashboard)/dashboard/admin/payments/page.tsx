/**
 * Admin Payments Page (NEW)
 * /admin/payments — revenue stats, charts, and all payments listing
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useAdminRevenueStats, useAdminAllPayments } from '@/hooks/use-admin-payments'
import StatsCard from '@/components/shared/stats-card'
import StatusBadge from '@/components/shared/status-badge'
import EmptyState from '@/components/shared/empty-state'
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

export default function AdminPaymentsPage() {
    const [period, setPeriod] = useState('month')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const { stats, isLoading: loadingStats } = useAdminRevenueStats(period)
    const { payments, pagination, isLoading: loadingPayments } = useAdminAllPayments({
        page,
        limit: 15,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    })

    const paymentSummaryData = stats
        ? [
            { name: 'Successful', value: stats.successfulPayments, fill: '#10b981' },
            { name: 'Pending', value: stats.pendingPayments, fill: '#f59e0b' },
            { name: 'Failed', value: stats.failedPayments, fill: '#ef4444' },
        ]
        : []

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Payment Management</h1>
                    <p className="text-muted-foreground mt-1">Monitor revenue and manage payments</p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Revenue Stats */}
            {loadingStats ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading stats...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total Revenue"
                            value={`GHS ${(stats?.totalRevenue || 0).toLocaleString()}`}
                            icon={DollarSign}
                        />
                        <StatsCard
                            title="Successful"
                            value={stats?.successfulPayments || 0}
                            icon={TrendingUp}
                            iconColor="text-green-600"
                        />
                        <StatsCard
                            title="Pending"
                            value={stats?.pendingPayments || 0}
                            icon={CreditCard}
                            iconColor="text-amber-600"
                        />
                        <StatsCard
                            title="Failed"
                            value={stats?.failedPayments || 0}
                            icon={AlertCircle}
                            iconColor="text-red-500"
                        />
                    </div>

                    {/* Chart */}
                    {paymentSummaryData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={paymentSummaryData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {paymentSummaryData.map((entry, index) => (
                                                <Bar key={index} dataKey="value" fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
                                className="w-auto"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
                                className="w-auto"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* All Payments Table */}
            <Card>
                {loadingPayments ? (
                    <CardContent className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading payments...
                    </CardContent>
                ) : payments.length === 0 ? (
                    <EmptyState
                        icon={CreditCard}
                        title="No payments found"
                        description="Try adjusting your filter criteria."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Course</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Reference</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {payment.user
                                                    ? `${payment.user.firstName} ${payment.user.lastName}`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {payment.course?.title || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {payment.currency} {Number(payment.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={payment.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">
                                                {payment.paystackReference || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
                    </>
                )}
            </Card>
        </div>
    )
}
