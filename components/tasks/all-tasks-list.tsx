"use client"

import { useState, useEffect } from "react"
import { TasksDisplay } from "./tasks-display"
import { getTasks, apiClient } from "@/lib/api-client"
import { User } from "@/lib/use-user-management"

export function AllTasksList() {
  const [tasks, setTasks] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const tasksResponse = await getTasks()
        if (tasksResponse.data) {
          setTasks(tasksResponse.data)
        } else if (tasksResponse.error) {
          setError(tasksResponse.error)
        }

        const techResponse = await apiClient.get("/users/role/Technician/")
        if (techResponse.data) {
          setTechnicians(techResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRowClick = (task: any) => {
    window.location.href = `/dashboard/tasks/${task.id}`
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Tasks</h1>
      <p className="text-gray-600 mt-2">Comprehensive view of all repair tasks in the system</p>
      <TasksDisplay tasks={tasks} technicians={technicians} onRowClick={handleRowClick} showActions={false} />
    </div>
  )
}