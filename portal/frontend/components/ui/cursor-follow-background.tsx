'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface Orb {
    id: number
    x: number
    y: number
    targetX: number
    targetY: number
    size: number
    color: string
    delay: number
    opacity: number
}

interface Particle {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    life: number
}

interface CursorFollowBackgroundProps {
    className?: string
    orbColors?: string[]
    particleColor?: string
    intensity?: 'low' | 'medium' | 'high'
}

export default function CursorFollowBackground({
    className = '',
    orbColors = [
        'rgba(1, 82, 190, 0.4)',    // ITFY Primary Blue
        'rgba(59, 130, 246, 0.3)',   // Lighter blue
        'rgba(99, 102, 241, 0.3)',   // Indigo
        'rgba(139, 92, 246, 0.25)',  // Purple accent
    ],
    particleColor = 'rgba(1, 82, 190, 0.6)',
    intensity = 'medium',
}: CursorFollowBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number>()
    const mouseRef = useRef({ x: 0, y: 0 })

    const [orbs, setOrbs] = useState<Orb[]>([])
    const [particles, setParticles] = useState<Particle[]>([])
    const [isClient, setIsClient] = useState(false)

    // Configuration based on intensity
    const config = {
        low: { orbCount: 3, particleCount: 15, orbSpeed: 0.02, particleSpeed: 0.5 },
        medium: { orbCount: 4, particleCount: 25, orbSpeed: 0.03, particleSpeed: 0.8 },
        high: { orbCount: 5, particleCount: 40, orbSpeed: 0.04, particleSpeed: 1.2 },
    }[intensity]

    // Initialize orbs
    useEffect(() => {
        setIsClient(true)
        const initialOrbs: Orb[] = orbColors.slice(0, config.orbCount).map((color, i) => ({
            id: i,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            targetX: 0,
            targetY: 0,
            size: 200 + Math.random() * 200,
            color,
            delay: i * 0.15,
            opacity: 0.6 + Math.random() * 0.4,
        }))
        setOrbs(initialOrbs)

        // Initialize particles
        const initialParticles: Particle[] = Array.from({ length: config.particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            vx: (Math.random() - 0.5) * config.particleSpeed,
            vy: (Math.random() - 0.5) * config.particleSpeed,
            size: 2 + Math.random() * 4,
            opacity: 0.3 + Math.random() * 0.5,
            life: Math.random() * 100,
        }))
        setParticles(initialParticles)
    }, [config.orbCount, config.particleCount, config.particleSpeed, orbColors])

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Animation loop
    const animate = useCallback(() => {
        const { x: mouseX, y: mouseY } = mouseRef.current

        // Update orbs with spring physics
        setOrbs(prevOrbs =>
            prevOrbs.map((orb, index) => {
                const delay = 1 - orb.delay
                const dx = mouseX - orb.x
                const dy = mouseY - orb.y

                // Different orbs follow at different speeds/distances
                const offsetX = Math.sin(Date.now() * 0.001 + index) * 100
                const offsetY = Math.cos(Date.now() * 0.001 + index) * 100

                return {
                    ...orb,
                    x: orb.x + (dx + offsetX) * config.orbSpeed * delay,
                    y: orb.y + (dy + offsetY) * config.orbSpeed * delay,
                }
            })
        )

        // Update particles with cursor attraction
        setParticles(prevParticles =>
            prevParticles.map(particle => {
                const dx = mouseX - particle.x
                const dy = mouseY - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Attract towards cursor when close
                const attraction = distance < 200 ? 0.02 : 0
                const newVx = particle.vx + dx * attraction * 0.01
                const newVy = particle.vy + dy * attraction * 0.01

                // Apply velocity with damping
                let newX = particle.x + newVx
                let newY = particle.y + newVy

                // Wrap around screen
                if (typeof window !== 'undefined') {
                    if (newX < 0) newX = window.innerWidth
                    if (newX > window.innerWidth) newX = 0
                    if (newY < 0) newY = window.innerHeight
                    if (newY > window.innerHeight) newY = 0
                }

                return {
                    ...particle,
                    x: newX,
                    y: newY,
                    vx: newVx * 0.99,
                    vy: newVy * 0.99,
                    life: (particle.life + 1) % 100,
                    opacity: 0.3 + Math.sin(particle.life * 0.1) * 0.3,
                }
            })
        )

        animationRef.current = requestAnimationFrame(animate)
    }, [config.orbSpeed])

    useEffect(() => {
        if (isClient) {
            animationRef.current = requestAnimationFrame(animate)
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [animate, isClient])

    if (!isClient) {
        return <div className={`absolute inset-0 overflow-hidden ${className}`} />
    }

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
        >
            {/* Gradient orbs */}
            {orbs.map(orb => (
                <div
                    key={orb.id}
                    className="absolute rounded-full mix-blend-multiply filter blur-3xl transition-opacity duration-1000"
                    style={{
                        left: orb.x - orb.size / 2,
                        top: orb.y - orb.size / 2,
                        width: orb.size,
                        height: orb.size,
                        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                        opacity: orb.opacity,
                        transform: 'translate3d(0, 0, 0)', // GPU acceleration
                    }}
                />
            ))}

            {/* Floating particles */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particleColor,
                        opacity: particle.opacity,
                        transform: 'translate3d(0, 0, 0)',
                        boxShadow: `0 0 ${particle.size * 2}px ${particleColor}`,
                    }}
                />
            ))}

            {/* Static gradient overlay for depth */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.02) 100%)',
                }}
            />
        </div>
    )
}
