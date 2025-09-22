'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Badge } from "@/components/ui/core/badge"
import { getTasks } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Laptop } from "lucide-react"

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

export function InWorkshopTasksList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks({ workshop_status: "In Workshop" })
        setTasks(response.data)
      } catch (error) {
        console.error("Error fetching in workshop tasks:", error)
      }
    }
    fetchTasks()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>In Workshop Tasks</CardTitle>
        <CardDescription>Tasks that are currently in the workshop.</CardDescription>
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
                      <p className="text-sm text-gray-500">Task ID: <span className="font-medium text-red-600">{task.title}</span></p>
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
                  <Button variant="outline" asChild className="w-full md:w-auto">
                    <a href={`/dashboard/tasks/${encodeURIComponent(task.title)}`}>View Details</a>
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
