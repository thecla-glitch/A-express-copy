"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TaskDetailsPage } from "@/components/task-details-page"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <TaskDetailsPage taskId={params.id} />
    </DashboardLayout>
  )
}
