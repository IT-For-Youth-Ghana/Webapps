'use client'

import { useState } from 'react'
import LoginPage from '@/components/pages/login'
import Dashboard from '@/components/pages/dashboard'

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const handleLogin = (email: string) => {
    setUserEmail(email)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserEmail('')
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard userEmail={userEmail} onLogout={handleLogout} />
}
