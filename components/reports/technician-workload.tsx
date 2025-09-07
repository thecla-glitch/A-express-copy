"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useWebSocket } from "@/lib/websocket-context"

export function TechnicianWorkload() {
  const { data, isConnected } = useWebSocket()

  const chartData = data?.technicianWorkload || [
    { name: "John Smith", tasks: 8 },
    { name: "Sarah Johnson", tasks: 12 },
    { name: "Mike Chen", tasks: 6 },
    { name: "Lisa Brown", tasks: 9 },
    { name: "David Wilson", tasks: 7 },
  ]

  return (
    <Card className={`border-gray-200 transition-all duration-300 ${!isConnected ? "opacity-60" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Technician Workload</CardTitle>
            <CardDescription className="text-gray-600">Current task assignments per technician</CardDescription>
          </div>
          {isConnected && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            tasks: {
              label: "Tasks",
              color: "#dc2626",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="tasks" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
