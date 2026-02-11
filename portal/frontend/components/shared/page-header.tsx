/**
 * Page Header Component
 * Consistent page header with title, description, and action buttons
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
    title: string
    description?: string
    showBack?: boolean
    actions?: React.ReactNode
    className?: string
}

export default function PageHeader({
    title,
    description,
    showBack = false,
    actions,
    className = '',
}: PageHeaderProps) {
    const router = useRouter()

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${className}`}>
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
                </div>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                </div>
            )}
        </div>
    )
}
