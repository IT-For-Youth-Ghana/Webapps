/**
 * Login Page Route
 * /login
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import CursorFollowBackground from '@/components/ui/cursor-follow-background'
import InteractiveEyes from '@/components/ui/interactive-eyes'
import { useAuth } from '@/hooks/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login({ email, password })

      toast({
        title: 'Login successful',
        description: 'Welcome back to ITFY Portal!',
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      <CursorFollowBackground intensity="medium" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <Card
        className="relative z-10 w-full max-w-md mx-4 p-8 glass-card animate-scale-in hover-lift"
        style={{ borderRadius: '1.5rem' }}
      >
        <div className="flex justify-center mb-6">
          <InteractiveEyes size="md" irisColor="hsl(213, 99%, 37%)" />
        </div>

        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl mb-4 shadow-lg glow-primary animate-float"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              transform: isHovered ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            <span className="text-2xl font-bold tracking-tight">ITFY</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            Welcome Back
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Sign in to your ITFY account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full h-12 px-4 input-modern bg-white/50 border-gray-200/50 rounded-xl focus:bg-white transition-all duration-300"
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full h-12 px-4 input-modern bg-white/50 border-gray-200/50 rounded-xl focus:bg-white transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-xl transition-all duration-300 btn-modern glow-primary animate-fade-in-up shadow-lg"
            style={{ animationDelay: '0.4s' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div
          className="mt-8 pt-6 border-t border-border/50 text-center space-y-3 animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <p className="text-sm">
            <a
              href="/forgot-password"
              className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="text-primary font-semibold hover:underline hover:text-primary/80 transition-colors"
            >
              Create one
            </a>
          </p>
        </div>

        <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden rounded-tl-3xl pointer-events-none">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
        </div>
        <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden rounded-br-3xl pointer-events-none">
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-xl" />
        </div>
      </Card>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </main>
  )
}