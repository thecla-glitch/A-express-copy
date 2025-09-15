"use client"

import { useState, useEffect } from "react"
import { TasksDisplay } from "./tasks-display"
import { apiClient } from "@/lib/api-client"
import { User } from "@/lib/use-user-management"

interface AllTasksListProps {
  tasks: any[];
  onRowClick: (task: any) => void;
}

export function AllTasksList({ tasks, onRowClick }: AllTasksListProps) {
  const [technicians, setTechnicians] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true)
        const techResponse = await apiClient.get("/users/role/Technician/")
        if (techResponse.data) {
          setTechnicians(techResponse.data)
        }
      } catch (error) {
        console.error("Error fetching technicians:", error)
        setError("Failed to fetch technicians")
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      <TasksDisplay tasks={tasks} technicians={technicians} onRowClick={onRowClick} showActions={false} />
    </div>
  )
}

export default AllTasksList;
