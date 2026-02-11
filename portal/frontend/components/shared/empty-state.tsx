/**
 * Empty State Component
 * Empty data placeholder with icon, title, description, and optional CTA
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { LucideIcon, Inbox } from 'lucide-react'

interface EmptyStateProps {
    icon?: LucideIcon
    title?: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    className?: string
}

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'No data found',
    description = 'There is nothing to display yet.',
    actionLabel,
    onAction,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="outline">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
