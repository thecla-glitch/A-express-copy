"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TechnicianDashboard } from "@/components/technician-dashboard"

export default function TechnicianPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <TechnicianDashboard />
    </DashboardLayout>
  )
}
