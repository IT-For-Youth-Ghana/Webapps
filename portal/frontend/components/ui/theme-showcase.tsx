'use client'

import { useTheme } from '@/hooks/use-theme'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ThemeShowcaseProps {
  onThemeChange?: (theme: string) => void
}

export function ThemeShowcase({ onThemeChange }: ThemeShowcaseProps = {}) {
  const { themes, theme, setTheme } = useTheme()

  const handleThemeChange = (value: string) => {
    if (onThemeChange) {
      onThemeChange(value)
    } else {
      setTheme(value as any)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {themes.map(({ name, value, description }) => (
        <Card
          key={value}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            theme === value ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleThemeChange(value)}
        >
          <div className="space-y-3">
            {/* Theme Preview */}
            <div className={`h-20 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${value}`}>
              <div className="text-center">
                <div className="w-6 h-6 bg-primary rounded-full mx-auto mb-1"></div>
                <div className="w-4 h-1 bg-secondary rounded mx-auto"></div>
              </div>
            </div>

            {/* Theme Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{name}</h3>
                {theme === value && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            {/* Action Button */}
            <Button
              variant={theme === value ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                handleThemeChange(value)
              }}
            >
              {theme === value ? 'Active' : 'Select'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}