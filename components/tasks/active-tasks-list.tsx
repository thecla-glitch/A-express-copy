'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Badge } from "@/components/ui/core/badge"
import { getTasks } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export function ActiveTasksList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return
      try {
        const response = await getTasks({ assigned_to: user.id })
        setTasks(response.data)
      } catch (error) {
        console.error("Error fetching active tasks:", error)
      }
    }
    fetchTasks()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Tasks</CardTitle>
        <CardDescription>Tasks that are currently assigned to you.</CardDescription>
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
                  <div className="text-sm text-gray-500">Status: <Badge>{task.status}</Badge></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">Issue Description:</h4>
                <p className="text-sm text-gray-700">{task.description}</p>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <a href={`/dashboard/tasks/${task.id}`}>View Details</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}