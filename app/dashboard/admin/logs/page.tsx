"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SystemLogsPage } from "@/components/system-logs-page"

export default function AdminLogsPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || user?.role !== "Administrator") {
    return null
  }

  return (
    <DashboardLayout>
      <SystemLogsPage />
    </DashboardLayout>
  )
}
