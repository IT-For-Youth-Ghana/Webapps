import { useTheme as useNextTheme } from 'next-themes'

export type Theme = 'light' | 'dark' | 'itfy' | 'system'

export function useTheme() {
  const { theme, setTheme, ...rest } = useNextTheme()

  const themes = [
    { name: 'Light', value: 'light' as Theme, description: 'Clean and bright' },
    { name: 'Dark', value: 'dark' as Theme, description: 'Easy on the eyes' },
    { name: 'ITFY', value: 'itfy' as Theme, description: 'IT For Youth branded' },
    { name: 'System', value: 'system' as Theme, description: 'Follow system preference' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].value)
  }

  return {
    ...rest,
    theme: theme as Theme,
    setTheme,
    themes,
    currentTheme,
    cycleTheme,
  }
}