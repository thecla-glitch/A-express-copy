"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
export default function TasksPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div>All tasks list removed</div>
    </DashboardLayout>
  )
}
