"use client"

import { useWebSocket } from "@/lib/websocket-context"
import { Badge } from "@/components/ui/core/badge"

export function RealTimeIndicator() {
  const { data, isConnected } = useWebSocket()

  if (!isConnected || !data) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="default" className="bg-green-600 text-white shadow-lg">
        Last updated: {data.lastUpdated.toLocaleTimeString()}
      </Badge>
    </div>
  )
}
