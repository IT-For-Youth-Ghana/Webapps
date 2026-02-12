/**
 * Profile Page - Ultra Modern Design
 * /profile — full CRUD with edit form and change password modals
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AntigravityBackground from '@/components/ui/antigravity-background'
import GlassmorphicBackground from '@/components/ui/glassmorphic-background'
import { useAuth } from '@/hooks/auth-context'
import { useProfile } from '@/hooks/use-user'
import { useChangePassword } from '@/hooks/use-password'
import { useToast } from '@/components/ui/use-toast'
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit,
  Key,
  Sparkles,
  Calendar,
  CheckCircle,
  Loader2,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { updateProfile } = useProfile()
  const { changePassword, isLoading: changingPw } = useChangePassword()
  const { toast } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
  })

  // Password form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!user) {
    return null
  }

  const userName = `${user.firstName} ${user.lastName}`

  const openEditModal = () => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await updateProfile(editForm)
      if (refreshUser) await refreshUser()
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' })
      setEditOpen(false)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update profile', variant: 'destructive' })
    } finally {
      setEditLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (pwForm.newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    const success = await changePassword({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
      newPasswordConfirm: pwForm.confirmPassword,
    })
    if (success) {
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' })
      setPwOpen(false)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      toast({ title: 'Error', description: 'Failed to change password. Check your current password.', variant: 'destructive' })
    }
  }

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
                <Badge variant="secondary" className="bg-green-500/15 text-green-700 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Active Account
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
                <Badge variant="secondary" className="capitalize mt-2">{user.role}</Badge>
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
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Date of Birth
                  </label>
                  <p className="text-foreground">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
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
                  onClick={openEditModal}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="glass-button flex-1 group"
                  onClick={() => setPwOpen(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+233241234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPwOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={changingPw}>
                {changingPw && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}