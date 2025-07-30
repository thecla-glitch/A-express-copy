"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FrontDeskDashboard } from "@/components/front-desk-dashboard"

export default function FrontDeskPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <FrontDeskDashboard />
    </DashboardLayout>
  )
}
