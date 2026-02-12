'use client'

import * as React from 'react'
import { Moon, Sun, Monitor, Palette } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme, themes: availableThemes } = useTheme()

  const themeIcons = {
    light: Sun,
    dark: Moon,
    itfy: Palette,
    system: Monitor,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 itfy:-rotate-90 itfy:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all itfy:rotate-0 itfy:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableThemes.filter(t => t.value !== 'system').map(({ name, value }) => {
          const Icon = themeIcons[value]
          return (
            <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{name}</span>
              {theme === value && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        {availableThemes.filter(t => t.value === 'system').map(({ name, value }) => {
          const Icon = themeIcons[value]
          return (
            <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{name}</span>
              {theme === value && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}