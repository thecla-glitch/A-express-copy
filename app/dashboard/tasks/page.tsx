"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AllTasksList } from "@/components/all-tasks-list"

export default function TasksPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <AllTasksList />
    </DashboardLayout>
  )
}
