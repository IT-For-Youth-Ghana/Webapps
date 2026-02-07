'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  userName: string
  onLogout: () => void
  onMenuToggle: () => void
}

export default function TopBar({ userName, onLogout, onMenuToggle }: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          ITFY Portal
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userName[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {userName}
            </span>
            <span className="text-xs">▼</span>
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-b-lg"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
