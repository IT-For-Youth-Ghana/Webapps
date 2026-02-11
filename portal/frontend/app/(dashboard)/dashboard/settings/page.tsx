/**
 * Settings Page
 * /settings — change password, theme toggle, notification preferences
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/auth-context'
import { useChangePassword } from '@/hooks/use-password'
import { useTheme } from 'next-themes'
import { useToast } from '@/components/ui/use-toast'
import {
  Key,
  Bell,
  Palette,
  Shield,
  Loader2,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { changePassword, isLoading: changingPw } = useChangePassword()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Password form
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification preferences (localStorage)
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    smsAlerts: false,
    courseUpdates: true,
    paymentAlerts: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem('notificationPrefs')
    if (saved) {
      try {
        setNotifPrefs(JSON.parse(saved))
      } catch { }
    }
  }, [])

  const updateNotifPref = (key: keyof typeof notifPrefs, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value }
    setNotifPrefs(updated)
    localStorage.setItem('notificationPrefs', JSON.stringify(updated))
    toast({ title: 'Preferences saved' })
  }

  if (!user) return null

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
    })
    if (success) {
      toast({ title: 'Password changed', description: 'Your password has been updated.' })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      toast({ title: 'Error', description: 'Failed to change password', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="w-4 h-4" /> Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4" /> Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" /> System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Control how you receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={notifPrefs.emailNotifications}
              onCheckedChange={(v) => updateNotifPref('emailNotifications', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">SMS Alerts</p>
              <p className="text-xs text-muted-foreground">Receive important alerts via SMS</p>
            </div>
            <Switch
              checked={notifPrefs.smsAlerts}
              onCheckedChange={(v) => updateNotifPref('smsAlerts', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Course Updates</p>
              <p className="text-xs text-muted-foreground">Notifications about course progress</p>
            </div>
            <Switch
              checked={notifPrefs.courseUpdates}
              onCheckedChange={(v) => updateNotifPref('courseUpdates', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Payment Alerts</p>
              <p className="text-xs text-muted-foreground">Notifications about payment status</p>
            </div>
            <Switch
              checked={notifPrefs.paymentAlerts}
              onCheckedChange={(v) => updateNotifPref('paymentAlerts', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" disabled={changingPw}>
              {changingPw && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground font-medium">{user.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="text-foreground font-medium capitalize">{user.role}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member Since</span>
            <span className="text-foreground font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
