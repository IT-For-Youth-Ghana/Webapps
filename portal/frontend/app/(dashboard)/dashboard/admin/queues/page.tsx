/**
 * Admin Queue Monitor Page (NEW)
 * /admin/queues — queue health, stats, job browser, and management actions
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    useQueueHealth,
    useQueueStats,
    useQueueJobs,
    useQueueActions,
} from '@/hooks/use-admin-queues'
import StatsCard from '@/components/shared/stats-card'
import ConfirmDialog from '@/components/shared/confirm-dialog'
import EmptyState from '@/components/shared/empty-state'
import { useToast } from '@/components/ui/use-toast'
import {
    Activity,
    Server,
    Play,
    Pause,
    RefreshCw,
    Trash2,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react'

export default function AdminQueuesPage() {
    const { toast } = useToast()
    const { health, isLoading: loadingHealth, refetch: refetchHealth } = useQueueHealth()
    const { stats, isLoading: loadingStats, refetch: refetchStats } = useQueueStats()
    const {
        retryJob,
        removeJob,
        pauseQueue,
        resumeQueue,
        cleanQueue,
        retryAllFailed,
        isLoading: actionLoading,
    } = useQueueActions()

    const [selectedQueue, setSelectedQueue] = useState<string | null>(null)
    const [jobStatus, setJobStatus] = useState('waiting')
    const [cleanConfirm, setCleanConfirm] = useState<string | null>(null)
    const [retryAllConfirm, setRetryAllConfirm] = useState<string | null>(null)

    const { jobs, isLoading: loadingJobs, refetch: refetchJobs } = useQueueJobs(
        selectedQueue,
        jobStatus,
        0,
        20
    )

    const handlePauseResume = async (queueName: string, isPaused: boolean) => {
        const success = isPaused
            ? await resumeQueue(queueName)
            : await pauseQueue(queueName)
        if (success) {
            toast({ title: isPaused ? 'Queue resumed' : 'Queue paused' })
            refetchStats()
        } else {
            toast({ title: 'Error', description: 'Action failed', variant: 'destructive' })
        }
    }

    const handleRetryJob = async (queueName: string, jobId: string) => {
        const success = await retryJob(queueName, jobId)
        if (success) {
            toast({ title: 'Job retried' })
            refetchJobs()
        } else {
            toast({ title: 'Error', description: 'Failed to retry job', variant: 'destructive' })
        }
    }

    const handleRemoveJob = async (queueName: string, jobId: string) => {
        const success = await removeJob(queueName, jobId)
        if (success) {
            toast({ title: 'Job removed' })
            refetchJobs()
        } else {
            toast({ title: 'Error', description: 'Failed to remove job', variant: 'destructive' })
        }
    }

    const handleClean = async () => {
        if (!cleanConfirm) return
        const success = await cleanQueue(cleanConfirm, 3600000, 'completed')
        if (success) {
            toast({ title: 'Queue cleaned', description: 'Old completed jobs have been removed.' })
            refetchStats()
        }
        setCleanConfirm(null)
    }

    const handleRetryAllFailed = async () => {
        if (!retryAllConfirm) return
        const success = await retryAllFailed(retryAllConfirm)
        if (success) {
            toast({ title: 'All failed jobs retried' })
            refetchStats()
            refetchJobs()
        }
        setRetryAllConfirm(null)
    }

    const refreshAll = () => {
        refetchHealth()
        refetchStats()
        if (selectedQueue) refetchJobs()
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Queue Monitor</h1>
                    <p className="text-muted-foreground mt-1">Monitor background job queues and manage tasks</p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshAll}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                </Button>
            </div>

            {/* Health Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        System Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingHealth ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" /> Checking health...
                        </div>
                    ) : health ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                {health.status === 'healthy' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                <span className="font-medium capitalize">{health.status}</span>
                            </div>
                            {health.queues && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {Object.entries(health.queues).map(([name, info]) => (
                                        <div key={name} className="p-3 rounded-lg border border-border">
                                            <p className="text-xs text-muted-foreground mb-1">{name}</p>
                                            <div className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${info.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-sm">{info.connected ? 'Connected' : 'Disconnected'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Unable to fetch health status</p>
                    )}
                </CardContent>
            </Card>

            {/* Queue Stats */}
            {loadingStats ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading queue stats...
                </div>
            ) : stats.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Activity}
                        title="No queues found"
                        description="No background job queues are configured."
                    />
                </Card>
            ) : (
                <div className="space-y-4">
                    {stats.map((queue) => (
                        <Card key={queue.name} className={`${selectedQueue === queue.name ? 'ring-2 ring-primary' : ''}`}>
                            <CardContent className="p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${queue.paused ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                                            {queue.paused ? (
                                                <Pause className="w-5 h-5 text-amber-600" />
                                            ) : (
                                                <Play className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{queue.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {queue.paused ? 'Paused' : 'Running'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                                            <Clock className="w-3 h-3 mr-1" /> {queue.waiting} waiting
                                        </Badge>
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                                            <Activity className="w-3 h-3 mr-1" /> {queue.active} active
                                        </Badge>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                                            <CheckCircle className="w-3 h-3 mr-1" /> {queue.completed} done
                                        </Badge>
                                        <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                                            <XCircle className="w-3 h-3 mr-1" /> {queue.failed} failed
                                        </Badge>
                                    </div>

                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedQueue(selectedQueue === queue.name ? null : queue.name)}
                                        >
                                            Jobs
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePauseResume(queue.name, queue.paused)}
                                            disabled={actionLoading}
                                        >
                                            {queue.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        </Button>
                                        {queue.failed > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRetryAllConfirm(queue.name)}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCleanConfirm(queue.name)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Job Browser */}
            {selectedQueue && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Jobs in {selectedQueue}
                            </CardTitle>
                            <Tabs value={jobStatus} onValueChange={setJobStatus}>
                                <TabsList className="h-8">
                                    <TabsTrigger value="waiting" className="text-xs px-2 h-6">Waiting</TabsTrigger>
                                    <TabsTrigger value="active" className="text-xs px-2 h-6">Active</TabsTrigger>
                                    <TabsTrigger value="completed" className="text-xs px-2 h-6">Completed</TabsTrigger>
                                    <TabsTrigger value="failed" className="text-xs px-2 h-6">Failed</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingJobs ? (
                            <div className="flex items-center justify-center py-6 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading jobs...
                            </div>
                        ) : jobs.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No {jobStatus} jobs</p>
                        ) : (
                            <div className="space-y-2">
                                {jobs.map((job) => (
                                    <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{job.name}</span>
                                                <span className="text-xs font-mono text-muted-foreground">#{job.id}</span>
                                            </div>
                                            {job.failedReason && (
                                                <p className="text-xs text-red-500 truncate mt-1">{job.failedReason}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Attempts: {job.attempts} · {new Date(job.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            {job.status === 'failed' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRetryJob(selectedQueue, job.id)}
                                                    disabled={actionLoading}
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveJob(selectedQueue, job.id)}
                                                disabled={actionLoading}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Clean Confirmation */}
            <ConfirmDialog
                open={!!cleanConfirm}
                onOpenChange={() => setCleanConfirm(null)}
                title="Clean Queue"
                description={`Remove old completed jobs from "${cleanConfirm}"? This cannot be undone.`}
                confirmLabel="Clean"
                variant="destructive"
                isLoading={actionLoading}
                onConfirm={handleClean}
            />

            {/* Retry All Failed Confirmation */}
            <ConfirmDialog
                open={!!retryAllConfirm}
                onOpenChange={() => setRetryAllConfirm(null)}
                title="Retry All Failed Jobs"
                description={`Retry all failed jobs in "${retryAllConfirm}"?`}
                confirmLabel="Retry All"
                isLoading={actionLoading}
                onConfirm={handleRetryAllFailed}
            />
        </div>
    )
}
