"use client"

import { useAuth } from "@/lib/auth-context"
import { TechnicianTaskDetails } from "@/components/tasks/technician-task-details"
import { TaskDetailsPage } from "@/components/tasks/task-details-page"

interface TaskDetailsProps {
  params: {
    id: string
  }
}

export default function TaskDetails({ params }: TaskDetailsProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view task details.</p>
        </div>
      </div>
    )
  }

  // Show technician-specific view for technicians
  if (user.role === "Technician") {
    return <TechnicianTaskDetails taskId={params.id} />
  }

  // Show general task details for other roles
  return <TaskDetailsPage taskId={params.id} />
}
