'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react' // Modern tsParticles React component
import { loadSlim } from '@tsparticles/slim' // Modern slim loader

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
    eyeColor = '#ffffff', // Slightly off-white for realism
    irisColor = '#0152be',
    sensitivity = 0.15,
}: InteractiveEyesProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLookingAway, setIsLookingAway] = useState(false)
    const [irisPosition, setIrisPosition] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [showParticles, setShowParticles] = useState(false) // Control particle visibility on blink
    const [particlesInit, setParticlesInit] = useState(false) // Track engine initialization

    const sizes = {
        sm: { eye: 40, iris: 16, pupil: 8 },
        md: { eye: 60, iris: 24, pupil: 12 },
        lg: { eye: 80, iris: 32, pupil: 16 },
    }

    const currentSize = sizes[size]

    // Track mouse movement (unchanged)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isLookingAway || !containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            const dx = e.clientX - centerX
            const dy = e.clientY - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)

            const maxOffset = currentSize.eye / 4
            const normalizedX = (dx / Math.max(distance, 1)) * Math.min(distance * sensitivity, maxOffset)
            const normalizedY = (dy / Math.max(distance, 1)) * Math.min(distance * sensitivity, maxOffset)

            setIrisPosition({ x: normalizedX, y: normalizedY })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [isLookingAway, currentSize.eye, sensitivity])

    // Watch for sensitive fields (unchanged)
    useEffect(() => {
        // ... (same as before)
    }, [currentSize.eye])

    // Random blinking with particle trigger
    const scheduleBlink = useCallback(() => {
        const randomDelay = 2000 + Math.random() * 4000
        blinkTimeoutRef.current = setTimeout(() => {
            setIsBlinking(true)
            setShowParticles(true) // Trigger particles on blink
            setTimeout(() => {
                setIsBlinking(false)
                setShowParticles(false) // Hide after short burst
                scheduleBlink()
            }, 150)
        }, randomDelay)
    }, [])

    useEffect(() => {
        scheduleBlink()
        return () => {
            if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current)
        }
    }, [scheduleBlink])

    // Initialize tsParticles engine
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine)
        }).then(() => {
            setParticlesInit(true)
        })
    }, [])

    // Particle options: Subtle sparkles (customize as needed)
    const particlesOptions: any = {
        fullScreen: { enable: false },
        particles: {
            number: { value: 20, density: { enable: true, area: 300 } },
            color: { value: ['#0152be', '#ffffff', '#00bfff'] }, // Match iris/theme
            shape: { type: 'circle' },
            opacity: { value: 0.8, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
            size: { value: 3, random: true, anim: { enable: true, speed: 4, size_min: 0.3 } },
            move: { enable: true, speed: 2, direction: 'none', random: true, out_mode: 'out' },
            life: { duration: { sync: false, value: 0.5 }, count: 1 }, // Short burst
        },
        interactivity: { detect_on: 'parent', events: { onHover: { enable: false } } },
        detectRetina: true,
    }

    const Eye = ({ side }: { side: 'left' | 'right' }) => {
        // ... (same as your enhanced Eye component)
    }

    return (
        <div ref={containerRef} className={`flex items-center gap-4 ${className} relative`} aria-hidden="true">
            {/* Particles Layer (shows on blink) */}
            {particlesInit && showParticles && (
                <Particles
                    id="tsparticles"
                    options={particlesOptions}
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: -1 }} // Behind eyes
                />
            )}

            <Eye side="left" />
            <Eye side="right" />

            {/* Enhanced eyebrows and glow (unchanged) */}
            {/* ... */}
        </div>
    )
}