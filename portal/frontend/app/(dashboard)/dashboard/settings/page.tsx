/**
 * Settings Page
 * /settings
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/auth-context'

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
      <Card className="p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="border-t border-border"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">
                Receive important alerts via SMS
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
        <Button className="mt-6 bg-primary hover:bg-primary/90 text-white">
          Save Settings
        </Button>
      </Card>
    </div>
  )
}
