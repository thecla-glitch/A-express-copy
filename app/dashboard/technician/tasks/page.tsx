'use client'

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { TechnicianTasksPage } from "@/components/tasks/technician-tasks-page"

export default function TechnicianTasksRoutePage() {
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
