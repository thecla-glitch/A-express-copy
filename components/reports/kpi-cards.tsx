import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { ClipboardList, DollarSign, Package, Clock } from "lucide-react"
import { useWebSocket } from "@/lib/websocket-context"

export function KPICards() {
  const { data, isConnected } = useWebSocket()

  const kpiData = [
    {
      title: "Total Active Tasks",
      value: data?.kpiData.totalActiveTasks.toString() || "47",
      icon: ClipboardList,
      trend: "+12% from last month",
      isHighlight: true,
    },
    {
      title: "Revenue This Month",
      value: `$${data?.kpiData.revenueThisMonth.toLocaleString() || "12,450"}`,
      icon: DollarSign,
      trend: "+8% from last month",
      isHighlight: true,
    },
    {
      title: "Tasks Ready for Pickup",
      value: data?.kpiData.tasksReadyForPickup.toString() || "8",
      icon: Package,
      trend: "3 overdue",
      isHighlight: false,
    },
    {
      title: "Average Repair Time",
      value: data?.kpiData.averageRepairTime || "3.2 days",
      icon: Clock,
      trend: "-0.5 days from last month",
      isHighlight: false,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card
          key={kpi.title}
          className={`border-gray-200 transition-all duration-300 ${!isConnected ? "opacity-60" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
            <div className="flex items-center gap-2">
              <kpi.icon className="h-4 w-4 text-gray-500" />
              {isConnected && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold transition-colors duration-300 ${kpi.isHighlight ? "text-red-600" : "text-gray-900"}`}
            >
              {kpi.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">{kpi.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
