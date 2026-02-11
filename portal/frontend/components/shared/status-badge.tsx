/**
 * Status Badge Component
 * Color-coded status badge with consistent styling
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

type StatusType =
    | 'success' | 'active' | 'completed' | 'enrolled'
    | 'pending' | 'draft' | 'waiting' | 'delayed'
    | 'failed' | 'cancelled' | 'dropped' | 'suspended' | 'inactive'
    | 'default'

const statusStyles: Record<string, string> = {
    // Success (green)
    success: 'bg-green-500/15 text-green-700 border-green-500/20',
    active: 'bg-green-500/15 text-green-700 border-green-500/20',
    completed: 'bg-green-500/15 text-green-700 border-green-500/20',
    enrolled: 'bg-green-500/15 text-green-700 border-green-500/20',

    // Pending (amber)
    pending: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
    draft: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
    waiting: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
    delayed: 'bg-amber-500/15 text-amber-700 border-amber-500/20',

    // Error (red)
    failed: 'bg-red-500/15 text-red-700 border-red-500/20',
    cancelled: 'bg-red-500/15 text-red-700 border-red-500/20',
    dropped: 'bg-red-500/15 text-red-700 border-red-500/20',
    suspended: 'bg-red-500/15 text-red-700 border-red-500/20',
    inactive: 'bg-red-500/15 text-red-700 border-red-500/20',

    // Default (gray)
    default: 'bg-muted text-muted-foreground border-border',
}

interface StatusBadgeProps {
    status: string
    className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase().replace(/[^a-z]/g, '')
    const style = statusStyles[normalizedStatus] || statusStyles.default

    return (
        <Badge
            variant="outline"
            className={`${style} font-medium capitalize text-xs ${className}`}
        >
            {status}
        </Badge>
    )
}
