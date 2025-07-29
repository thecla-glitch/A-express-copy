import { DashboardLayout } from "@/components/dashboard-layout"
import { KPICards } from "@/components/kpi-cards"
import { TasksStatusChart } from "@/components/tasks-status-chart"
import { TechnicianWorkload } from "@/components/technician-workload"
import { RecentActivity } from "@/components/recent-activity"
import { RealTimeIndicator } from "@/components/real-time-indicator"

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening at A+ express today.</p>
        </div>

        <KPICards />

        <div className="grid gap-6 md:grid-cols-2">
          <TasksStatusChart />
          <TechnicianWorkload />
        </div>

        <RecentActivity />
      </div>
      <RealTimeIndicator />
    </DashboardLayout>
  )
}
