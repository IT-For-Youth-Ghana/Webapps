'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Linear Progress Bar
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorClassName?: string
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div className="relative w-full">
        <div
          ref={ref}
          className={cn(
            'relative h-3 w-full overflow-hidden rounded-full bg-secondary/20',
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'h-full w-full flex-1 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out',
              indicatorClassName
            )}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
        {showLabel && (
          <span className="absolute right-0 top-0 -translate-y-5 text-xs font-medium text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'

// Circular Progress
interface CircularProgressProps {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
  color?: string
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value = 0,
      max = 100,
      size = 120,
      strokeWidth = 8,
      className,
      showLabel = true,
      label,
      color = 'hsl(213, 99%, 37%)', // ITFY primary blue
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div ref={ref} className={cn('relative inline-flex items-center justify-center', className)}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-secondary/20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(1, 82, 190, 0.4))',
            }}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{Math.round(percentage)}%</span>
            {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = 'CircularProgress'

export { Progress, CircularProgress }