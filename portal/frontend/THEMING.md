# Theming System

This project uses a comprehensive theming system built on top of `next-themes` and Tailwind CSS custom properties.

## Available Themes

### Light Theme
- Clean, bright interface
- High contrast for readability
- Default theme for most users

### Dark Theme
- Easy on the eyes in low-light conditions
- Reduces eye strain
- Modern dark interface

### ITFY Theme
- Custom branded theme for IT For Youth
- Blue-based color scheme
- Represents the organization's identity

### System Theme
- Automatically follows your system's theme preference
- Adapts to light/dark mode changes
- Respects user accessibility settings

## Usage

### Basic Theme Switching

```tsx
import { useTheme } from '@/hooks/use-theme'

function MyComponent() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {themes.map(({ name, value }) => (
          <option key={value} value={value}>{name}</option>
        ))}
      </select>
    </div>
  )
}
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  )
}
```

### Theme Showcase

```tsx
import { ThemeShowcase } from '@/components/ui/theme-showcase'

function Settings() {
  return (
    <div>
      <h2>Choose Theme</h2>
      <ThemeShowcase />
    </div>
  )
}
```

## Customization

### Adding New Themes

1. Add theme variables to `styles/globals.css`:

```css
.new-theme {
  --background: ...;
  --foreground: ...;
  /* Add all theme variables */
}
```

2. Update the theme provider in `components/theme-provider.tsx`:

```tsx
<NextThemesProvider
  themes={['light', 'dark', 'itfy', 'new-theme', 'system']}
  {...props}
>
```

3. Update the `useTheme` hook in `hooks/use-theme.ts`:

```tsx
export type Theme = 'light' | 'dark' | 'itfy' | 'new-theme' | 'system'
```

### Theme Variables

The following CSS custom properties are available for theming:

- `--background`: Main background color
- `--foreground`: Main text color
- `--card`: Card background
- `--card-foreground`: Card text
- `--popover`: Popover background
- `--popover-foreground`: Popover text
- `--primary`: Primary brand color
- `--primary-foreground`: Primary text on brand color
- `--secondary`: Secondary color
- `--secondary-foreground`: Secondary text
- `--muted`: Muted background
- `--muted-foreground`: Muted text
- `--accent`: Accent color
- `--accent-foreground`: Accent text
- `--destructive`: Error/destructive color
- `--destructive-foreground`: Error text
- `--border`: Border color
- `--input`: Input background
- `--ring`: Focus ring color
- `--sidebar-*`: Sidebar specific colors

## Components

### ThemeProvider
Wraps the entire application and provides theme context.

### ThemeToggle
Dropdown component for switching between themes.

### ThemeShowcase
Visual preview of all available themes.

### useTheme Hook
Custom hook providing theme state and utilities.

## Best Practices

1. Always use semantic color classes (e.g., `text-foreground`, `bg-background`)
2. Test themes in both light and dark variants
3. Ensure sufficient contrast ratios for accessibility
4. Use the `suppressHydrationWarning` on html element when using system theme
5. Persist theme preferences automatically (handled by next-themes)

## Accessibility

- All themes maintain WCAG contrast requirements
- System theme respects user's accessibility preferences
- Theme switching is keyboard accessible
- Screen reader announcements for theme changes</content>
</xai:function_call">The following files were successfully edited:
/home/johnny/Projects/Webapps/portal/frontend/THEMING.md