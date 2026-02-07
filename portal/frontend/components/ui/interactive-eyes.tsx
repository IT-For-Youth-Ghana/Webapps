'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface InteractiveEyesProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    eyeColor?: string
    irisColor?: string
    sensitivity?: number
}

export default function InteractiveEyes({
    className = '',
    size = 'md',
    eyeColor = 'white',
    irisColor = '#0152be',
    sensitivity = 0.15,
}: InteractiveEyesProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLookingAway, setIsLookingAway] = useState(false)
    const [irisPosition, setIrisPosition] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const blinkTimeoutRef = useRef<NodeJS.Timeout>()

    const sizes = {
        sm: { eye: 40, iris: 16, pupil: 8 },
        md: { eye: 60, iris: 24, pupil: 12 },
        lg: { eye: 80, iris: 32, pupil: 16 },
    }

    const currentSize = sizes[size]

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isLookingAway || !containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            const dx = e.clientX - centerX
            const dy = e.clientY - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Normalize and limit the iris movement
            const maxOffset = currentSize.eye / 4
            const normalizedX = (dx / Math.max(distance, 1)) * Math.min(distance * sensitivity, maxOffset)
            const normalizedY = (dy / Math.max(distance, 1)) * Math.min(distance * sensitivity, maxOffset)

            setIrisPosition({ x: normalizedX, y: normalizedY })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [isLookingAway, currentSize.eye, sensitivity])

    // Watch for password/sensitive field focus
    useEffect(() => {
        const handleFocusIn = (e: FocusEvent) => {
            const target = e.target as HTMLInputElement
            if (
                target?.type === 'password' ||
                target?.getAttribute('data-sensitive') === 'true' ||
                target?.name?.toLowerCase().includes('password') ||
                target?.name?.toLowerCase().includes('pin') ||
                target?.name?.toLowerCase().includes('secret')
            ) {
                setIsLookingAway(true)
                // Look away direction (up and to the side)
                setIrisPosition({ x: currentSize.eye / 3, y: -currentSize.eye / 3 })
            }
        }

        const handleFocusOut = (e: FocusEvent) => {
            const target = e.target as HTMLInputElement
            if (
                target?.type === 'password' ||
                target?.getAttribute('data-sensitive') === 'true' ||
                target?.name?.toLowerCase().includes('password')
            ) {
                setIsLookingAway(false)
            }
        }

        document.addEventListener('focusin', handleFocusIn)
        document.addEventListener('focusout', handleFocusOut)

        return () => {
            document.removeEventListener('focusin', handleFocusIn)
            document.removeEventListener('focusout', handleFocusOut)
        }
    }, [currentSize.eye])

    // Random blinking
    const scheduleBlink = useCallback(() => {
        const randomDelay = 2000 + Math.random() * 4000 // 2-6 seconds
        blinkTimeoutRef.current = setTimeout(() => {
            setIsBlinking(true)
            setTimeout(() => {
                setIsBlinking(false)
                scheduleBlink()
            }, 150) // Blink duration
        }, randomDelay)
    }, [])

    useEffect(() => {
        scheduleBlink()
        return () => {
            if (blinkTimeoutRef.current) {
                clearTimeout(blinkTimeoutRef.current)
            }
        }
    }, [scheduleBlink])

    const Eye = ({ side }: { side: 'left' | 'right' }) => {
        // Slight offset for natural look
        const sideOffset = side === 'left' ? -2 : 2

        return (
            <div
                className="relative rounded-full shadow-lg transition-all duration-100 overflow-hidden"
                style={{
                    width: currentSize.eye,
                    height: isBlinking ? 4 : currentSize.eye,
                    backgroundColor: eyeColor,
                    border: '2px solid rgba(0,0,0,0.1)',
                    transition: isBlinking ? 'height 0.08s ease-in' : 'height 0.12s ease-out',
                }}
            >
                {/* Iris */}
                <div
                    className="absolute rounded-full transition-transform duration-75 ease-out"
                    style={{
                        width: currentSize.iris,
                        height: currentSize.iris,
                        backgroundColor: irisColor,
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${irisPosition.x + sideOffset}px), calc(-50% + ${irisPosition.y}px))`,
                        boxShadow: `inset 0 0 ${currentSize.iris / 4}px rgba(0,0,0,0.3)`,
                    }}
                >
                    {/* Pupil */}
                    <div
                        className="absolute rounded-full bg-black"
                        style={{
                            width: currentSize.pupil,
                            height: currentSize.pupil,
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                    {/* Light reflection */}
                    <div
                        className="absolute rounded-full bg-white opacity-80"
                        style={{
                            width: currentSize.pupil / 2,
                            height: currentSize.pupil / 2,
                            left: '30%',
                            top: '25%',
                        }}
                    />
                </div>

                {/* Eye shine */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                    }}
                />
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`flex items-center gap-4 ${className}`}
            aria-hidden="true"
        >
            <Eye side="left" />
            <Eye side="right" />

            {/* Subtle eyebrow-like accent above eyes */}
            <div
                className="absolute -top-4 left-0 right-0 flex justify-center gap-8"
                style={{ opacity: 0.3 }}
            >
                <div
                    className="rounded-full bg-current"
                    style={{
                        width: currentSize.eye * 0.8,
                        height: 3,
                        transform: isLookingAway ? 'rotate(-10deg)' : 'rotate(-5deg)',
                        transition: 'transform 0.3s ease',
                    }}
                />
                <div
                    className="rounded-full bg-current"
                    style={{
                        width: currentSize.eye * 0.8,
                        height: 3,
                        transform: isLookingAway ? 'rotate(10deg)' : 'rotate(5deg)',
                        transition: 'transform 0.3s ease',
                    }}
                />
            </div>
        </div>
    )
}
