'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Badge } from "@/components/ui/core/badge"
import { getTasks, updateTask } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export function UnassignedTasksList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks({ assigned_to: null })
        setTasks(response.data)
      } catch (error) {
        console.error("Error fetching unassigned tasks:", error)
      }
    }
    fetchTasks()
  }, [])

  const handleAssignToMe = async (taskId: string) => {
    try {
      await updateTask(taskId, { assigned_to: user?.id, status: "In Progress" })
      const response = await getTasks({ assigned_to: null })
      setTasks(response.data)
    } catch (error) {
      console.error(`Error assigning task ${taskId} to self:`, error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unassigned Tasks</CardTitle>
        <CardDescription>Tasks that are not yet assigned to any technician.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium text-blue-600">{task.id}</span>
                    <span className="font-medium text-gray-900 ml-2">{task.customer_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Created at: {new Date(task.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">Issue Description:</h4>
                <p className="text-sm text-gray-700">{task.description}</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleAssignToMe(task.id)}>Assign to Me</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}