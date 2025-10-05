'use client'

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { TechnicianDashboard } from "@/components/dashboard/overviews/technician-dashboard"

export default function TechnicianDashboardPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <TechnicianDashboard />
    </DashboardLayout>
  )
}