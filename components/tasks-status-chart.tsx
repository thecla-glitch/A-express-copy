"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useWebSocket } from "@/lib/websocket-context"

export function TasksStatusChart() {
  const { data, isConnected } = useWebSocket()

  const chartData = data?.taskStatuses || [
    { name: "In Progress", value: 23, color: "#dc2626" },
    { name: "Ready for Pickup", value: 8, color: "#f97316" },
    { name: "Awaiting Parts", value: 12, color: "#eab308" },
    { name: "Completed", value: 4, color: "#22c55e" },
  ]

  return (
    <Card className={`border-gray-200 transition-all duration-300 ${!isConnected ? "opacity-60" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Tasks by Status</CardTitle>
            <CardDescription className="text-gray-600">Current distribution of repair tasks</CardDescription>
          </div>
          {isConnected && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            "In Progress": { label: "In Progress", color: "#dc2626" },
            "Ready for Pickup": { label: "Ready for Pickup", color: "#f97316" },
            "Awaiting Parts": { label: "Awaiting Parts", color: "#eab308" },
            Completed: { label: "Completed", color: "#22c55e" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
