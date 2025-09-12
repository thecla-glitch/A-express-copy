"use client"

import { useWebSocket } from "@/lib/websocket-context"
import { Badge } from "@/components/ui/core/badge"
import { Button } from "@/components/ui/core/button"
import { WifiOff, RotateCcw } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected, isConnecting, error, reconnect } = useWebSocket()

  if (isConnecting) {
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
        Connecting...
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="flex items-center gap-2">
          <WifiOff className="h-3 w-3" />
          Disconnected
        </Badge>
        <Button size="sm" variant="outline" onClick={reconnect}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Badge variant="default" className="flex items-center gap-2 bg-green-600">
      <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
      Live
    </Badge>
  )
}
