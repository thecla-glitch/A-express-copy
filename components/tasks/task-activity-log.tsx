"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Badge } from "@/components/ui/core/badge"
import { ScrollArea } from "@/components/ui/layout/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

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

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "created":
        return "+"
      case "updated":
        return "📝"
      case "status_changed":
        return "🔄"
      default:
        return "🔔"
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
                    <AvatarImage src={activity.user_avatar} alt="Avatar" />
                    <AvatarFallback>{activity.user_name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user_name} <span className="text-xs text-muted-foreground">({activity.user_role})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), "PPP p")}
                    </p>
                  </div>
                  <div className="ml-auto text-sm">
                    <Badge>{getActivityIcon(activity.activity_type)} {activity.activity_type}</Badge>
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
