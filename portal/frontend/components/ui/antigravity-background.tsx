'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface RingParticle {
  angle: number
  radius: number
  size: number
  opacity: number
  speed: number
  ringIndex: number
  orbitOffset: number
}

interface AntigravityBackgroundProps {
  className?: string
  opacity?: 'subtle' | 'low' | 'medium'
  ringCount?: number
  particleColor?: string
  rotationSpeed?: number
  mouseInteraction?: boolean
  blurAmount?: number
}

export default function AntigravityBackground({
  className = '',
  opacity = 'subtle',
  ringCount = 4,
  particleColor = 'rgba(1, 82, 190, 0.8)',
  rotationSpeed = 0.0003,
  mouseInteraction = true,
  blurAmount = 2,
}: AntigravityBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<RingParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  // Opacity multipliers based on prop
  const opacityMultiplier = {
    subtle: 0.5,
    low: 0.7,
    medium: 1.0,
  }[opacity]

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: RingParticle[] = []
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.4

    for (let ring = 0; ring < ringCount; ring++) {
      const ringRadius = (maxRadius / ringCount) * (ring + 1)
      const particlesInRing = 40 + ring * 15 // Much more particles
      
      for (let i = 0; i < particlesInRing; i++) {
        const angle = (Math.PI * 2 * i) / particlesInRing
        const randomOffset = (Math.random() - 0.5) * 0.3
        
        particles.push({
          angle: angle,
          radius: ringRadius,
          size: 2 + Math.random() * 3, // Larger particles
          opacity: (0.4 + Math.random() * 0.6) * opacityMultiplier,
          speed: rotationSpeed * (0.5 + Math.random() * 0.5) * (ring % 2 === 0 ? 1 : -1),
          ringIndex: ring,
          orbitOffset: randomOffset,
        })
      }
    }

    particlesRef.current = particles
  }, [ringCount, rotationSpeed, opacityMultiplier])

  // Mouse tracking
  useEffect(() => {
    if (!mouseInteraction) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseInteraction])

  // Canvas setup and resize
  useEffect(() => {
    setIsClient(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      initParticles(window.innerWidth, window.innerHeight)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initParticles])

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = window.innerWidth
    const height = window.innerHeight
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.4

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw gradient background overlay
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2)
    gradient.addColorStop(0, 'rgba(1, 82, 190, 0.08)')
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.04)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add ambient glow in center
    const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.3)
    centerGlow.addColorStop(0, 'rgba(1, 82, 190, 0.15)')
    centerGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)')
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = centerGlow
    ctx.fillRect(0, 0, width, height)

    // Mouse influence
    const mouseInfluence = mouseInteraction ? 50 : 0
    const { x: mouseX, y: mouseY } = mouseRef.current

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      // Update angle for rotation
      particle.angle += particle.speed

      // Calculate base position
      let x = centerX + Math.cos(particle.angle) * particle.radius
      let y = centerY + Math.sin(particle.angle) * particle.radius

      // Add orbital offset for variation
      x += Math.sin(particle.angle * 3 + particle.orbitOffset) * 10
      y += Math.cos(particle.angle * 3 + particle.orbitOffset) * 10

      // Mouse interaction - subtle drift
      if (mouseInteraction && mouseX && mouseY) {
        const dx = mouseX - x
        const dy = mouseY - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 300) {
          const force = (300 - distance) / 300
          x += (dx / distance) * force * mouseInfluence * 0.1
          y += (dy / distance) * force * mouseInfluence * 0.1
        }
      }

      // Draw particle
      ctx.save()
      
      // Add pulsing effect based on time
      const pulseEffect = 1 + Math.sin(Date.now() * 0.001 + particle.angle * 10) * 0.3
      const currentOpacity = particle.opacity * pulseEffect
      
      ctx.globalAlpha = currentOpacity
      ctx.filter = `blur(${blurAmount}px)`
      
      // Draw glow - larger and more visible
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 6)
      glowGradient.addColorStop(0, particleColor)
      glowGradient.addColorStop(0.5, particleColor.replace(/[\d.]+\)$/g, '0.3)'))
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glowGradient
      ctx.fillRect(x - particle.size * 6, y - particle.size * 6, particle.size * 12, particle.size * 12)

      // Draw particle core
      ctx.filter = 'none'
      ctx.fillStyle = particleColor
      ctx.beginPath()
      ctx.arc(x, y, particle.size * pulseEffect, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })

    // Draw connecting lines between nearby particles (optional, very subtle)
    ctx.save()
    ctx.globalAlpha = 0.15 * opacityMultiplier
    ctx.strokeStyle = particleColor
    ctx.lineWidth = 1

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p1 = particlesRef.current[i]
      const x1 = centerX + Math.cos(p1.angle) * p1.radius
      const y1 = centerY + Math.sin(p1.angle) * p1.radius

      // Only connect particles in the same ring
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p2 = particlesRef.current[j]
        
        if (p1.ringIndex === p2.ringIndex) {
          const x2 = centerX + Math.cos(p2.angle) * p2.radius
          const y2 = centerY + Math.sin(p2.angle) * p2.radius
          const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          
          if (distance < 150) {
            const alpha = 1 - (distance / 150)
            ctx.globalAlpha = alpha * 0.2 * opacityMultiplier
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        }
      }
    }
    ctx.restore()

    animationRef.current = requestAnimationFrame(animate)
  }, [mouseInteraction, particleColor, blurAmount, opacityMultiplier])

  // Start animation
  useEffect(() => {
    if (isClient && particlesRef.current.length > 0) {
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
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Static gradient overlays for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, rgba(1, 82, 190, 0.12) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        }}
      />
    </div>
  )
}