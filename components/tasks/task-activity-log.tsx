"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Badge } from "@/components/ui/core/badge"
import { ScrollArea } from "@/components/ui/layout/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { AlertTriangle, ClipboardList, Clock, MessageSquare, Phone, Plus, Settings } from "lucide-react"

interface TaskActivityLogProps {
  taskId: string
}

export function TaskActivityLog({ taskId }: TaskActivityLogProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      const response = await apiClient.get(`/tasks/${taskId}/activities/`)
      if (response.data) {
        setActivities(response.data)
      }
      setLoading(false)
    }

    if (taskId) {
      fetchActivities()
    }
  }, [taskId])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_update":
        return <Settings className="h-4 w-4 text-blue-600" />
      case "note":
        return <MessageSquare className="h-4 w-4 text-gray-600" />
      case "diagnosis":
        return <ClipboardList className="h-4 w-4 text-purple-600" />
      case "customer_contact":
        return <Phone className="h-4 w-4 text-green-600" />
      case "intake":
        return <Plus className="h-4 w-4 text-orange-600" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {loading ? (
              <p>Loading activities...</p>
            ) : activities.length === 0 ? (
              <p>No activities found for this task.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user?.profile_picture_url} alt="Avatar" />
                    <AvatarFallback>{activity.user?.full_name?.substring(0, 2) || 'S'}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user?.full_name || 'System'} <span className="text-xs text-muted-foreground">({activity.user?.role || 'System'})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), "PPP p")}
                    </p>
                  </div>
                  <div className="ml-auto text-sm">
                    <Badge>{getActivityIcon(activity.type)} {activity.type}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
