/**
 * Profile Page - Ultra Modern Design
 * /profile
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AntigravityBackground from '@/components/ui/antigravity-background'
import GlassmorphicBackground from '@/components/ui/glassmorphic-background'
import { useAuth } from '@/hooks/auth-context'
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit,
  Key,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const userName = `${user.firstName} ${user.lastName}`

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layered Backgrounds */}
      <AntigravityBackground 
        opacity="low"
        ringCount={4}
        particleColor="rgba(1, 82, 190, 0.8)"
        rotationSpeed={0.0003}
        mouseInteraction={true}
        blurAmount={2}
      />
      <GlassmorphicBackground />

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
        
        {/* Hero Header */}
        <div className="relative">
          <Card className="glass-card-premium border-white/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
            <CardContent className="p-8 md:p-10 relative">
              <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="success" className="animate-pulse">
                  Active Account
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3 animate-fade-in-up animation-delay-100">
                My Profile
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl animate-fade-in-up animation-delay-200">
                Manage your personal information and account settings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        <Card className="glass-card border-white/20 overflow-hidden animate-fade-in-up animation-delay-300">
          <CardContent className="p-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500/20 border border-green-500 rounded-full p-1">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-foreground mb-1">{userName}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <p className="text-foreground">{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Email
                  </label>
                  <p className="text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Phone
                  </label>
                  <p className="text-foreground">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Account Status
                  </label>
                  <Badge variant="secondary" className="capitalize">
                    {user.status}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="glass-button flex-1 group"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="glass-button flex-1 group"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}