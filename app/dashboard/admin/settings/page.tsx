"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminSettingsPage } from "@/components/admin-settings-page"

export default function AdminSettings() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || user?.role !== "Administrator") {
    return null
  }

  return (
    <DashboardLayout>
      <AdminSettingsPage />
    </DashboardLayout>
  )
}
