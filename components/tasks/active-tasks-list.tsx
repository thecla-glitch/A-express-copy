'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Badge } from "@/components/ui/core/badge"
import { getTasks } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Laptop, AlertTriangle } from "lucide-react"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Assigned - Not Accepted":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Not Accepted</Badge>
    case "Diagnostic":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Diagnostic</Badge>
    case "In Progress":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
    case "Awaiting Parts":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Parts</Badge>
    case "Ready for Pickup":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready for Pickup</Badge>
    case "Completed":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "High":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
    case "Medium":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
    case "Low":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
    default:
      return <Badge variant="secondary">{urgency}</Badge>
  }
}

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
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{task.customer_name}</h3>
                      <p className="text-sm text-gray-500">Task ID: <span className="font-medium text-red-600">{task.id}</span></p>
                    </div>
                    {getUrgencyBadge(task.urgency)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      <span>{task.laptop_model}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex flex-col justify-between items-end">
                  <div className="text-right">
                    {getStatusBadge(task.status)}
                  </div>
                  <Button variant="outline" asChild className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                    <a href={`/dashboard/tasks/${task.id}`}>View Details</a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
