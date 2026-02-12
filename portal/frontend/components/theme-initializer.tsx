'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/auth-context'

export function ThemeInitializer() {
  const { user } = useAuth()
  const { setTheme, theme: currentTheme } = useTheme()

  useEffect(() => {
    if (user?.settings?.theme && user.settings.theme !== currentTheme) {
      setTheme(user.settings.theme)
    }
  }, [user?.settings?.theme, currentTheme, setTheme])

  return null
}