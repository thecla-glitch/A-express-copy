"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Star,
  AlertTriangle,
  Clock,
  Users,
  Package,
  CreditCard,
} from "lucide-react"

// Mock data for KPI metrics
const kpiData = {
  monthlyRevenueGrowth: {
    value: "+18.5%",
    amount: "$24,750",
    trend: "up",
    previousMonth: "$20,890",
  },
  totalTasksCompleted: {
    value: "156",
    trend: "up",
    change: "+12%",
    thisMonth: 156,
    lastMonth: 139,
  },
  customerSatisfaction: {
    value: "4.7/5",
    trend: "up",
    change: "+0.3",
    totalReviews: 89,
  },
  averageTurnaroundTime: {
    value: "2.8 days",
    trend: "down",
    change: "-0.4 days",
    target: "3.0 days",
  },
}

// Mock data for financial snapshot
const financialData = {
  recentPayments: [
    { id: "P-1001", customer: "John Smith", amount: "$299.99", date: "2024-01-15", method: "Card" },
    { id: "P-1002", customer: "Sarah Johnson", amount: "$189.50", date: "2024-01-15", method: "Cash" },
    { id: "P-1003", customer: "Mike Chen", amount: "$149.99", date: "2024-01-14", method: "Card" },
    { id: "P-1004", customer: "Lisa Brown", amount: "$225.00", date: "2024-01-14", method: "Digital" },
  ],
  outstandingBalances: [
    { customer: "David Wilson", amount: "$450.00", daysOverdue: 5, taskId: "T-1025" },
    { customer: "Emma Davis", amount: "$320.00", daysOverdue: 12, taskId: "T-1018" },
    { customer: "Tom Anderson", amount: "$180.00", daysOverdue: 3, taskId: "T-1022" },
  ],
  totalOutstanding: "$950.00",
  dailyRevenue: [
    { date: "Mon", amount: 1200 },
    { date: "Tue", amount: 1800 },
    { date: "Wed", amount: 1500 },
    { date: "Thu", amount: 2200 },
    { date: "Fri", amount: 2800 },
    { date: "Sat", amount: 3200 },
    { date: "Sun", amount: 1100 },
  ],
}

// Mock data for technician performance
const technicianPerformance = [
  { name: "John Smith", completed: 28, efficiency: 95, avgTime: "2.1 hours" },
  { name: "Sarah Johnson", completed: 32, efficiency: 98, avgTime: "1.8 hours" },
  { name: "Mike Chen", completed: 24, efficiency: 88, avgTime: "2.5 hours" },
  { name: "Lisa Brown", completed: 26, efficiency: 92, avgTime: "2.2 hours" },
  { name: "David Wilson", completed: 22, efficiency: 85, avgTime: "2.8 hours" },
]

// Mock data for bottlenecks
const bottlenecks = [
  {
    category: "Awaiting Parts",
    count: 8,
    avgDays: 9.2,
    tasks: [
      { id: "T-1015", customer: "Robert Chen", days: 12, part: "MacBook Screen" },
      { id: "T-1019", customer: "Amanda Rodriguez", days: 10, part: "Dell Battery" },
      { id: "T-1023", customer: "Michael Brown", days: 8, part: "Cooling Fan" },
    ],
  },
  {
    category: "Quality Control",
    count: 3,
    avgDays: 4.5,
    tasks: [
      { id: "T-1028", customer: "Jennifer Lee", days: 6, part: "Final Testing" },
      { id: "T-1030", customer: "Carlos Martinez", days: 4, part: "Performance Check" },
      { id: "T-1032", customer: "Nina Patel", days: 3, part: "Quality Review" },
    ],
  },
]

export function ManagerDashboard() {
  return (
    <div className="flex-1 space-y-8 p-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Executive overview and actionable insights for shop operations</p>
      </div>

      {/* Overall Shop Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-200 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {kpiData.monthlyRevenueGrowth.value}
              </Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Revenue Growth</h3>
              <p className="text-3xl font-bold text-green-700 mb-2">{kpiData.monthlyRevenueGrowth.amount}</p>
              <p className="text-sm text-gray-600">Previous month: {kpiData.monthlyRevenueGrowth.previousMonth}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {kpiData.totalTasksCompleted.change}
              </Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Tasks Completed</h3>
              <p className="text-3xl font-bold text-blue-700 mb-2">{kpiData.totalTasksCompleted.value}</p>
              <p className="text-sm text-gray-600">This month vs {kpiData.totalTasksCompleted.lastMonth} last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-200 rounded-lg">
                <Star className="h-6 w-6 text-purple-700" />
              </div>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                {kpiData.customerSatisfaction.change}
              </Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Customer Satisfaction</h3>
              <p className="text-3xl font-bold text-purple-700 mb-2">{kpiData.customerSatisfaction.value}</p>
              <p className="text-sm text-gray-600">Based on {kpiData.customerSatisfaction.totalReviews} reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-200 rounded-lg">
                <Clock className="h-6 w-6 text-orange-700" />
              </div>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                {kpiData.averageTurnaroundTime.change}
              </Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Avg Turnaround Time</h3>
              <p className="text-3xl font-bold text-orange-700 mb-2">{kpiData.averageTurnaroundTime.value}</p>
              <p className="text-sm text-gray-600">Target: {kpiData.averageTurnaroundTime.target}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Snapshot and Daily Revenue */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Daily Revenue Trend
            </CardTitle>
            <CardDescription>Revenue performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Revenue",
                  color: "#dc2626",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialData.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="#dc2626" strokeWidth={3} dot={{ fill: "#dc2626" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
              <div className="space-y-2">
                {financialData.recentPayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{payment.customer}</p>
                      <p className="text-gray-500">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{payment.amount}</p>
                      <p className="text-gray-500">{payment.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Outstanding Balances</h4>
              <div className="space-y-2">
                {financialData.outstandingBalances.map((balance, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{balance.customer}</p>
                      <p className="text-red-600">{balance.daysOverdue} days overdue</p>
                    </div>
                    <p className="font-medium text-red-600">{balance.amount}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-gray-900">Total Outstanding:</span>
                  <span className="text-red-600">{financialData.totalOutstanding}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance Overview */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Technician Performance Overview
          </CardTitle>
          <CardDescription>Tasks completed by each technician this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <ChartContainer
                config={{
                  completed: {
                    label: "Tasks Completed",
                    color: "#dc2626",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={technicianPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicianPerformance.map((tech) => (
                    <TableRow key={tech.name}>
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${tech.efficiency}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{tech.efficiency}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{tech.avgTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Identification */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Bottleneck Identification
          </CardTitle>
          <CardDescription>Tasks stuck in specific statuses requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {bottlenecks.map((bottleneck) => (
              <div key={bottleneck.category} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    {bottleneck.category}
                  </h4>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{bottleneck.count} Tasks</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">Average delay: {bottleneck.avgDays} days</p>
                <div className="space-y-2">
                  {bottleneck.tasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-red-600">{task.id}</p>
                        <p className="text-gray-600">{task.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{task.days} days</p>
                        <p className="text-gray-500">{task.part}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                  Review {bottleneck.category}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
