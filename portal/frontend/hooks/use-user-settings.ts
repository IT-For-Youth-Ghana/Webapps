import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth-context'
import { apiClient } from '@/lib/api-client'

export interface UserSettings {
  theme: 'light' | 'dark' | 'itfy' | 'system'
  notifications: {
    emailNotifications: boolean
    smsAlerts: boolean
    courseUpdates: boolean
    paymentAlerts: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showPhone: boolean
  }
}

export function useUserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from backend
  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings as UserSettings)
      setIsLoading(false)
    } else if (user) {
      // If user exists but no settings, create default settings
      const defaultSettings: UserSettings = {
        theme: 'system',
        notifications: {
          emailNotifications: true,
          smsAlerts: false,
          courseUpdates: true,
          paymentAlerts: true,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
        },
      }
      setSettings(defaultSettings)
      setIsLoading(false)
    }
  }, [user])

  // Update settings in backend
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !settings) return

    try {
      setError(null)
      const updatedSettings: UserSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)

      await apiClient.put('/users/profile', {
        settings: updatedSettings,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      // Revert on error
      if (settings) {
        setSettings(settings)
      }
      throw err
    }
  }

  // Update specific setting path
  const updateSetting = async (path: string, value: any) => {
    if (!settings) return

    const keys = path.split('.')
    const updatedSettings = JSON.parse(JSON.stringify(settings)) as UserSettings

    let current: any = updatedSettings
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    await updateSettings(updatedSettings)
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateSetting,
  }
}