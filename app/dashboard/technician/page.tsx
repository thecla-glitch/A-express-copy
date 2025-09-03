"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TechnicianTasksPage } from "@/components/technician-tasks-page"

export default function TechnicianPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <TechnicianTasksPage />
    </DashboardLayout>
  )
}
