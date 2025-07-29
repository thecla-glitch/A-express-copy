"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsOverview } from "@/components/settings-overview"

export default function SettingsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <SettingsOverview />
    </DashboardLayout>
  )
}
