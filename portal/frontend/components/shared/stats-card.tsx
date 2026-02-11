/**
 * Stats Card Component
 * Animated stat card with icon, value, and trend indicator
 */

'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
    iconColor?: string
    className?: string
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    iconColor = 'text-primary',
    className = '',
}: StatsCardProps) {
    return (
        <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all" />
            <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold text-foreground tracking-tight">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                        {trend && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-500'
                                }`}>
                                <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                                <span className="text-muted-foreground">vs last period</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl bg-primary/10 ${iconColor}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
