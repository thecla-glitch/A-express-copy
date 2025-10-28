"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Badge } from "@/components/ui/core/badge"
import { Button } from "@/components/ui/core/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { Input } from "@/components/ui/core/input"
import { Label } from "@/components/ui/core/label"
import { Download, Search, Filter, Eye, Calendar, BarChart3, PieChart as PieChartIcon, Users, Clock, DollarSign, Package, ClipboardList, MapPin, CreditCard, TrendingUp } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"

// Import jsPDF and autoTable properly
import jsPDF from "jspdf"

// Import autoTable separately and extend jsPDF
import autoTable from "jspdf-autotable"


const ChartContainer = ({ children, className }: any) => {
    return <div className={className}>{children}</div>
}

declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable?: {
            finalY: number;
        };
    }
}


const ChartTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    return (
        <div className="bg-white border p-2 rounded shadow-sm text-sm">
            {label && <div className="font-semibold mb-1">{label}</div>}
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-700">{p.name ?? p.dataKey}</span>
                    <span className="font-medium text-gray-900">{p.value}</span>
                </div>
            ))}
        </div>
    )
}

const ChartTooltip = (props: any) => {
    return <Tooltip {...props} />
}

// Extended interfaces for all report types
interface OutstandingTask {
    task_id: string
    customer_name: string
    customer_phone: string
    total_cost: number
    paid_amount: number
    outstanding_balance: number
    days_overdue: number
    status: string
    date_in: string
}

interface OutstandingPaymentsReport {
    outstanding_tasks: OutstandingTask[]
    summary: {
        total_outstanding: number
        task_count: number
        average_balance: number
    }
}

interface TechnicianPerformance {
    technician_name: string
    completed_tasks: number
    in_progress_tasks: number
    total_tasks: number
    efficiency: number
    total_revenue: number
    avg_completion_hours: number
    rating: number
}

interface TechnicianPerformanceReport {
    technician_performance: {
        technician_name: string
        completed_tasks: number
        in_progress_tasks: number
        total_tasks: number
        efficiency: number
        total_revenue: number
        avg_completion_hours: number
        rating: number
    }[]
    date_range: string
    total_technicians: number
}

interface RevenueSummaryReport {
    periods: {
        period: string
        revenue: number
        tasks_completed: number
        average_revenue_per_task: number
    }[]
    summary: {
        total_revenue: number
        total_tasks: number
        growth_rate: number
        average_revenue: number
    }
    date_range: string
}

interface TaskStatusReport {
    statuses: {
        name: string
        value: number
        color: string
    }[]
    summary: {
        total_tasks: number
        completed_tasks: number
        in_progress_tasks: number
    }
}

interface TechnicianWorkloadReport {
    workload_data: {
        name: string
        tasks: number
        in_progress: number
        awaiting_parts: number
        pending: number
    }[]
    total_active_technicians: number
    total_assigned_tasks: number
}

interface PaymentMethodsReport {
    payment_methods: {
        method_name: string
        total_amount: number
        payment_count: number
        average_payment: number
        percentage: number
    }[]
    summary: {
        total_revenue: number
        total_payments: number
        date_range: string
    }
}

interface TurnaroundTimeReport {
    periods: {
        period: string
        average_turnaround: number
        tasks_completed: number
        efficiency: number
    }[]
    summary: {
        overall_average: number
        best_period: string
        improvement: number
    }
}

interface InventoryLocationReport {
    locations: {
        location: string
        laptop_count: number
        capacity: number
        utilization: number
    }[]
    summary: {
        total_laptops: number
        total_capacity: number
        overall_utilization: number
    }
}

type ApiResponse = {
    success: boolean
    report: OutstandingPaymentsReport | TechnicianPerformanceReport | RevenueSummaryReport | TaskStatusReport | TechnicianWorkloadReport | PaymentMethodsReport | TurnaroundTimeReport | InventoryLocationReport | any
    type: string
}

// In your report-preview-modal.tsx, update the interface:
interface ReportViewerProps {
    apiResponse?: ApiResponse
    reportData?: any
    reportType?: string
    onGeneratePDF?: () => void
    isGeneratingPDF?: boolean
}

export function ReportViewer({ apiResponse, reportData, reportType, onGeneratePDF }: ReportViewerProps) {
    const [data, setData] = useState<any>(null)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [type, setType] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        if (apiResponse) {
            setData(apiResponse.report)
            setType(apiResponse.type)
        } else if (reportData && reportType) {
            setData(reportData)
            setType(reportType)
        }
    }, [apiResponse, reportData, reportType])

    if (!data) {
        return (
            <Card className="border-gray-200">
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No report data to display</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Render different report types
    const renderOutstandingPayments = (report: OutstandingPaymentsReport) => {
        const filteredTasks = report.outstanding_tasks.filter(task =>
            task.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.customer_phone.includes(searchTerm)
        )

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Outstanding</p><p className="text-2xl font-bold text-red-600">TSh {report.summary.total_outstanding.toLocaleString()}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Tasks</p><p className="text-2xl font-bold text-gray-900">{report.summary.task_count}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Average Balance</p><p className="text-2xl font-bold text-gray-900">TSh {report.summary.average_balance.toLocaleString()}</p></CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Outstanding Payments</CardTitle>
                        <CardDescription>{filteredTasks.length} tasks found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Task ID</TableHead><TableHead>Customer</TableHead><TableHead>Phone</TableHead>
                                <TableHead>Total Cost</TableHead><TableHead>Paid</TableHead><TableHead>Outstanding</TableHead>
                                <TableHead>Days Overdue</TableHead><TableHead>Status</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {filteredTasks.map(task => (
                                    <TableRow key={task.task_id}>
                                        <TableCell className="font-medium">{task.task_id}</TableCell>
                                        <TableCell>{task.customer_name}</TableCell>
                                        <TableCell>{task.customer_phone}</TableCell>
                                        <TableCell>TSh {task.total_cost.toLocaleString()}</TableCell>
                                        <TableCell>TSh {task.paid_amount.toLocaleString()}</TableCell>
                                        <TableCell className="font-semibold text-red-600">TSh {task.outstanding_balance.toLocaleString()}</TableCell>
                                        <TableCell><Badge variant={task.days_overdue > 7 ? "destructive" : "secondary"}>{task.days_overdue} days</Badge></TableCell>
                                        <TableCell><Badge variant={task.status === "Completed" ? "default" : "secondary"}>{task.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderTechnicianPerformance = (report: any) => {
        const technicianPerformance = report.technician_performance || []
        const totalTechnicians = report.total_technicians || 0
        const dateRange = report.date_range || 'last_30_days'

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Technicians</p>
                            <p className="text-2xl font-bold text-gray-900">{totalTechnicians}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Date Range</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">
                                {dateRange.replace(/_/g, ' ')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Table */}
                {technicianPerformance.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Technician Performance</CardTitle>
                            <CardDescription>
                                Performance metrics for {technicianPerformance.length} technician{technicianPerformance.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Technician</TableHead>
                                        <TableHead>Completed Tasks</TableHead>
                                        <TableHead>In Progress</TableHead>
                                        <TableHead>Total Tasks</TableHead>
                                        <TableHead>Efficiency</TableHead>
                                        <TableHead>Total Revenue</TableHead>
                                        <TableHead>Avg Completion</TableHead>
                                        <TableHead>Rating</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {technicianPerformance.map((tech: any) => (
                                        <TableRow key={tech.technician_name} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{tech.technician_name}</TableCell>
                                            <TableCell>{tech.completed_tasks}</TableCell>
                                            <TableCell>{tech.in_progress_tasks}</TableCell>
                                            <TableCell>{tech.total_tasks}</TableCell>
                                            <TableCell>
                                                <Badge variant={tech.efficiency >= 80 ? "default" : tech.efficiency >= 60 ? "secondary" : "destructive"}>
                                                    {tech.efficiency}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-green-600 font-semibold">
                                                TSh {tech.total_revenue?.toLocaleString() || '0'}
                                            </TableCell>
                                            <TableCell>
                                                {tech.avg_completion_hours > 0 ? `${tech.avg_completion_hours}h` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{tech.rating}/5</span>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-2 h-2 rounded-full mx-0.5 ${i < Math.floor(tech.rating) ? 'bg-yellow-400' : 'bg-gray-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-gray-500">
                                <p>No technician performance data available for the selected period.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Performance Charts */}
                {technicianPerformance.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Efficiency Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Efficiency Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={technicianPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="technician_name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis />
                                            <ChartTooltip
                                                content={({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                                <p className="font-medium">{data.technician_name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Efficiency: {data.efficiency}%
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    Completed: {data.completed_tasks} tasks
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar
                                                dataKey="efficiency"
                                                fill="#3b82f6"
                                                radius={[4, 4, 0, 0]}
                                                name="Efficiency %"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Generated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={technicianPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="technician_name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis />
                                            <ChartTooltip
                                                content={({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                                <p className="font-medium">{data.technician_name}</p>
                                                                <p className="text-sm text-green-600 font-semibold">
                                                                    TSh {data.total_revenue?.toLocaleString() || '0'}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    Tasks: {data.total_tasks}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar
                                                dataKey="total_revenue"
                                                fill="#22c55e"
                                                radius={[4, 4, 0, 0]}
                                                name="Revenue (TSh)"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Summary Stats */}
                {technicianPerformance.length > 0 && (
                    <Card className="border-gray-200 bg-gray-50">
                        <CardContent className="p-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Total Completed Tasks</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {technicianPerformance.reduce((sum: number, tech: any) => sum + tech.completed_tasks, 0)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Average Efficiency</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {(
                                            technicianPerformance.reduce((sum: number, tech: any) => sum + tech.efficiency, 0) /
                                            technicianPerformance.length
                                        ).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-xl font-bold text-green-600">
                                        TSh {technicianPerformance
                                            .reduce((sum: number, tech: any) => sum + (tech.total_revenue || 0), 0)
                                            .toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const renderRevenueSummary = (report: any) => {
        // Use the actual data structure from your API response
        const monthlyTotals = report.monthly_totals || {}
        const paymentMethods = report.payment_methods || []
        const paymentsByDate = report.payments_by_date || []
        const dateRange = report.date_range || 'last_7_days'

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">
                                TSh {monthlyTotals.total_revenue?.toLocaleString() || '0'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {monthlyTotals.payment_count || '0'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Average Payment</p>
                            <p className="text-2xl font-bold text-blue-600">
                                TSh {monthlyTotals.average_payment?.toLocaleString() || '0'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Date Range</p>
                            <p className="text-xl font-bold text-gray-900 capitalize">
                                {dateRange.replace(/_/g, ' ')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Revenue Chart */}
                {paymentsByDate.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Revenue Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={paymentsByDate}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <YAxis />
                                        <ChartTooltip
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                            <p className="font-medium">
                                                                {new Date(data.date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-green-600 font-semibold">
                                                                TSh {data.daily_revenue?.toLocaleString() || '0'}
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar
                                            dataKey="daily_revenue"
                                            fill="#22c55e"
                                            radius={[4, 4, 0, 0]}
                                            name="Daily Revenue"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Payment Methods Breakdown */}
                {paymentMethods.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Pie Chart */}
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentMethods}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="total"
                                                label={({ method__name, total }) =>
                                                    `${String(method__name ?? '').replace(/-/g, ' ')}: TSh ${total?.toLocaleString()}`
                                                }
                                            >
                                                {paymentMethods.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            index % 4 === 0 ? '#22c55e' : // green
                                                                index % 4 === 1 ? '#3b82f6' : // blue
                                                                    index % 4 === 2 ? '#f59e0b' : // orange
                                                                        '#ef4444' // red
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip
                                                content={({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload
                                                        const percentage = monthlyTotals.total_revenue
                                                            ? ((data.total / monthlyTotals.total_revenue) * 100).toFixed(1)
                                                            : '0'
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                                <p className="font-medium capitalize">
                                                                    {data.method__name?.replace(/-/g, ' ')}
                                                                </p>
                                                                <p className="text-green-600 font-semibold">
                                                                    TSh {data.total?.toLocaleString()}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {percentage}% of total
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {data.count} payment{data.count !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>

                                {/* Payment Methods Details */}
                                <div className="space-y-4">
                                    {paymentMethods.map((method: any) => {
                                        const percentage = monthlyTotals.total_revenue
                                            ? ((method.total / monthlyTotals.total_revenue) * 100).toFixed(1)
                                            : '0'
                                        return (
                                            <div key={method.method__name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                method.method__name === 'airtel-money' ? '#22c55e' :
                                                                    method.method__name === 'tigo-pesa' ? '#3b82f6' :
                                                                        method.method__name === 'mpesa' ? '#f59e0b' :
                                                                            '#6b7280'
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-medium capitalize">
                                                            {method.method__name?.replace(/-/g, ' ')}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {method.count} payment{method.count !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">
                                                        TSh {method.total?.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{percentage}%</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Daily Revenue Table */}
                {paymentsByDate.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Revenue Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Daily Revenue</TableHead>
                                        <TableHead>Payments</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentsByDate.map((day: any) => (
                                        <TableRow key={day.date}>
                                            <TableCell className="font-medium">
                                                {new Date(day.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-green-600 font-semibold">
                                                TSh {day.daily_revenue?.toLocaleString() || '0'}
                                            </TableCell>
                                            <TableCell>
                                                {day.payment_count || '1'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const renderTaskStatus = (report: any) => {
        // Use the actual data structure from your API response
        const statusDistribution = report.status_distribution || []
        const urgencyDistribution = report.urgency_distribution || []
        const totalTasks = report.total_tasks || 0

        // Calculate summary from the actual data
        const completedTasks = statusDistribution.find((s: any) => s.status === 'Completed')?.count || 0
        const inProgressTasks = statusDistribution.find((s: any) => s.status === 'In Progress')?.count || 0

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Tasks</p>
                            <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-orange-600">{inProgressTasks}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {statusDistribution.map((entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.status === 'Completed' ? '#22c55e' :
                                                            entry.status === 'In Progress' ? '#f97316' :
                                                                entry.status === 'Pending' ? '#eab308' :
                                                                    entry.status === 'Awaiting Parts' ? '#f59e0b' :
                                                                        '#6b7280' // default gray
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                            <p className="font-medium">{data.status}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {data.count} tasks ({data.percentage}%)
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {statusDistribution.map((status: any) => (
                                    <div key={status.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        status.status === 'Completed' ? '#22c55e' :
                                                            status.status === 'In Progress' ? '#f97316' :
                                                                status.status === 'Pending' ? '#eab308' :
                                                                    status.status === 'Awaiting Parts' ? '#f59e0b' :
                                                                        '#6b7280'
                                                }}
                                            />
                                            <span className="font-medium">{status.status}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{status.count}</p>
                                            <p className="text-sm text-gray-500">{status.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Urgency Distribution Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Urgency Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Urgency Level</TableHead>
                                    <TableHead>Task Count</TableHead>
                                    <TableHead>Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {urgencyDistribution.map((urgency: any) => (
                                    <TableRow key={urgency.urgency}>
                                        <TableCell className="font-medium">{urgency.urgency}</TableCell>
                                        <TableCell>{urgency.count}</TableCell>
                                        <TableCell>
                                            {totalTasks > 0 ? ((urgency.count / totalTasks) * 100).toFixed(1) : 0}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Generated At Info */}
                <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600">
                            Report generated on: {new Date(report.generated_at).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderTechnicianWorkload = (report: any) => {
        const workloadData = report.workload_data || []
        const totalActiveTechnicians = report.total_active_technicians || 0
        const totalAssignedTasks = report.total_assigned_tasks || 0

        // Calculate summary statistics
        const techniciansWithTasks = workloadData.filter((tech: any) => tech.tasks > 0).length
        const averageWorkload = totalActiveTechnicians > 0 ? (totalAssignedTasks / totalActiveTechnicians).toFixed(1) : 0
        const maxWorkload = workloadData.length > 0 ? Math.max(...workloadData.map((tech: any) => tech.tasks)) : 0

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Technicians</p>
                            <p className="text-2xl font-bold text-gray-900">{totalActiveTechnicians}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Tasks</p>
                            <p className="text-2xl font-bold text-blue-600">{totalAssignedTasks}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Avg Workload</p>
                            <p className="text-2xl font-bold text-orange-600">{averageWorkload}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Max Workload</p>
                            <p className="text-2xl font-bold text-red-600">{maxWorkload}</p>
                        </CardContent>
                    </Card>
                </div>

                {workloadData.length > 0 ? (
                    <>
                        {/* Workload Distribution Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Workload Distribution</CardTitle>
                                <CardDescription>
                                    Current task assignments per technician
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={workloadData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis />
                                            <ChartTooltip
                                                content={({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                                <p className="font-medium">{data.name}</p>
                                                                <p className="text-sm text-gray-600">Total Tasks: {data.tasks}</p>
                                                                <p className="text-sm text-blue-600">In Progress: {data.in_progress}</p>
                                                                <p className="text-sm text-orange-600">Awaiting Parts: {data.awaiting_parts}</p>
                                                                <p className="text-sm text-gray-500">Pending: {data.pending}</p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar
                                                dataKey="tasks"
                                                fill="#dc2626"
                                                radius={[4, 4, 0, 0]}
                                                name="Total Tasks"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Detailed Workload Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Technician Workload Details</CardTitle>
                                <CardDescription>
                                    Breakdown of tasks by status for each technician
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Technician</TableHead>
                                            <TableHead>Total Tasks</TableHead>
                                            <TableHead>In Progress</TableHead>
                                            <TableHead>Awaiting Parts</TableHead>
                                            <TableHead>Pending</TableHead>
                                            <TableHead>Workload Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {workloadData.map((tech: any) => (
                                            <TableRow key={tech.name} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{tech.name}</TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-gray-900">{tech.tasks}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {tech.in_progress > 0 ? (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                                            {tech.in_progress}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {tech.awaiting_parts > 0 ? (
                                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                                            {tech.awaiting_parts}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {tech.pending > 0 ? (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                            {tech.pending}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            tech.tasks === 0 ? "outline" :
                                                                tech.tasks <= 2 ? "default" :
                                                                    tech.tasks <= 5 ? "secondary" : "destructive"
                                                        }
                                                    >
                                                        {tech.tasks === 0 ? "Available" :
                                                            tech.tasks <= 2 ? "Light" :
                                                                tech.tasks <= 5 ? "Moderate" : "Heavy"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Stacked Bar Chart for Detailed Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Status Breakdown</CardTitle>
                                <CardDescription>
                                    Detailed view of task statuses for each technician
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={workloadData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis />
                                            <ChartTooltip
                                                content={({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                                <p className="font-medium">{payload[0].payload.name}</p>
                                                                {payload.map((entry: any, index: number) => (
                                                                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                                                                        {entry.name}: {entry.value}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="in_progress" stackId="a" fill="#3b82f6" name="In Progress" />
                                            <Bar dataKey="awaiting_parts" stackId="a" fill="#f59e0b" name="Awaiting Parts" />
                                            <Bar dataKey="pending" stackId="a" fill="#6b7280" name="Pending" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Capacity Analysis */}
                        <Card className="border-gray-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-900">Capacity Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold text-green-800 mb-2">Available Capacity</h4>
                                        <p className="text-green-700">
                                            <span className="font-bold">
                                                {workloadData.filter((tech: any) => tech.tasks === 0).length}
                                            </span> out of {totalActiveTechnicians} technicians are currently available
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-800 mb-2">Workload Distribution</h4>
                                        <p className="text-green-700">
                                            {techniciansWithTasks} technician{techniciansWithTasks !== 1 ? 's' : ''} currently handling {totalAssignedTasks} task{totalAssignedTasks !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-gray-500">
                                <p>No technician workload data available.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const renderPaymentMethods = (report: any) => {
        const paymentMethods = report.payment_methods || []
        const summary = report.summary || {}
        const totalRevenue = summary.total_revenue || 0
        const totalPayments = summary.total_payments || 0
        const dateRange = summary.date_range || 'last_30_days'

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">
                                TSh {totalRevenue.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Date Range</p>
                            <p className="text-xl font-bold text-blue-600 capitalize">
                                {dateRange.replace(/_/g, ' ')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {paymentMethods.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Payment Distribution Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentMethods}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="total_amount"
                                                label={({ method_name, percentage }) => `${method_name}: ${percentage}%`}
                                            >
                                                {paymentMethods.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            index % 4 === 0 ? '#22c55e' : // green
                                                                index % 4 === 1 ? '#3b82f6' : // blue
                                                                    index % 4 === 2 ? '#f59e0b' : // orange
                                                                        '#ef4444' // red
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip
                                                content={({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload
                                                        return (
                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                                <p className="font-medium capitalize">{data.method_name?.replace(/-/g, ' ')}</p>
                                                                <p className="text-green-600 font-semibold">
                                                                    TSh {data.total_amount?.toLocaleString()}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {data.percentage}% of total
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {data.payment_count} payment{data.payment_count !== 1 ? 's' : ''}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    Avg: TSh {data.average_payment?.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Payment Methods Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Methods Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {paymentMethods.map((method: any) => (
                                        <div key={method.method_name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            method.method_name === 'airtel-money' ? '#22c55e' :
                                                                method.method_name === 'tigo-pesa' ? '#3b82f6' :
                                                                    method.method_name === 'mpesa' ? '#f59e0b' :
                                                                        '#6b7280'
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-medium capitalize">{method.method_name.replace(/-/g, ' ')}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {method.payment_count} payment{method.payment_count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    TSh {method.total_amount?.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500">{method.percentage}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-gray-500">
                                <p>No payment method data available for the selected period.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detailed Table */}
                {paymentMethods.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods Details</CardTitle>
                            <CardDescription>
                                Comprehensive breakdown of all payment methods
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Payment Count</TableHead>
                                        <TableHead>Average Payment</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead>Market Share</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentMethods.map((method: any) => (
                                        <TableRow key={method.method_name} className="hover:bg-gray-50">
                                            <TableCell className="font-medium capitalize">
                                                {method.method_name.replace(/-/g, ' ')}
                                            </TableCell>
                                            <TableCell className="text-green-600 font-semibold">
                                                TSh {method.total_amount?.toLocaleString()}
                                            </TableCell>
                                            <TableCell>{method.payment_count}</TableCell>
                                            <TableCell>
                                                TSh {method.average_payment?.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {method.percentage}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${method.percentage}%` }}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Insights Section */}
                {paymentMethods.length > 0 && (
                    <Card className="border-gray-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Key Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2">Top Payment Method</h4>
                                    <p className="text-blue-700">
                                        <span className="font-bold capitalize">
                                            {paymentMethods[0]?.method_name.replace(/-/g, ' ')}
                                        </span> leads with {paymentMethods[0]?.percentage}% of total revenue
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2">Revenue Distribution</h4>
                                    <p className="text-blue-700">
                                        {paymentMethods.length} payment methods processed TSh {totalRevenue.toLocaleString()} in total
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const renderTurnaroundTime = (report: TurnaroundTimeReport) => {
        // Add safety checks for the report data
        const summary = report.summary || {}
        const periods = report.periods || []

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Overall Average</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {summary.overall_average ? `${summary.overall_average} days` : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Best Period</p>
                            <p className="text-xl font-bold text-green-600">
                                {summary.best_period || 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Improvement</p>
                            <p className="text-2xl font-bold text-green-600">
                                {summary.improvement ? `${summary.improvement}%` : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {periods.length > 0 ? (
                    <>
                        <Card>
                            <CardHeader><CardTitle>Turnaround Time Trends</CardTitle></CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={periods}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="average_turnaround" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Turnaround Details</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Avg Turnaround</TableHead>
                                            <TableHead>Tasks Completed</TableHead>
                                            <TableHead>Efficiency</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periods.map((period) => (
                                            <TableRow key={period.period}>
                                                <TableCell className="font-medium">{period.period}</TableCell>
                                                <TableCell className="font-semibold">
                                                    {period.average_turnaround ? `${period.average_turnaround} days` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{period.tasks_completed || 0}</TableCell>
                                                <TableCell>
                                                    <Badge variant={period.efficiency >= 90 ? "default" : "secondary"}>
                                                        {period.efficiency ? `${period.efficiency}%` : 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-gray-500">
                                <p>No turnaround time data available for the selected period.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const renderInventoryLocation = (report: InventoryLocationReport) => {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Laptops</p><p className="text-2xl font-bold text-gray-900">{report.summary.total_laptops}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Capacity</p><p className="text-2xl font-bold text-blue-600">{report.summary.total_capacity}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Overall Utilization</p><p className="text-2xl font-bold text-green-600">{report.summary.overall_utilization}%</p></CardContent></Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Inventory by Location</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Location</TableHead><TableHead>Laptop Count</TableHead><TableHead>Capacity</TableHead><TableHead>Utilization</TableHead><TableHead>Status</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {report.locations.map(location => (
                                    <TableRow key={location.location}>
                                        <TableCell className="font-medium">{location.location}</TableCell>
                                        <TableCell>{location.laptop_count}</TableCell>
                                        <TableCell>{location.capacity}</TableCell>
                                        <TableCell>{location.utilization}%</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                location.utilization >= 90 ? "destructive" :
                                                    location.utilization >= 70 ? "secondary" : "default"
                                            }>
                                                {location.utilization >= 90 ? "Full" : location.utilization >= 70 ? "Busy" : "Available"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderGenericReport = (report: any) => {
        return (
            <Card>
                <CardHeader><CardTitle>Report Data</CardTitle></CardHeader>
                <CardContent>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                        {JSON.stringify(report, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        )
    }

    // Main render function
    const renderReport = () => {
        switch (type) {
            case "outstanding_payments":
                return renderOutstandingPayments(data as OutstandingPaymentsReport)
            case "technician_performance":
                return renderTechnicianPerformance(data as TechnicianPerformanceReport)
            case "revenue_summary":
                return renderRevenueSummary(data as RevenueSummaryReport)
            case "task_status":
                return renderTaskStatus(data as TaskStatusReport)
            case "technician_workload":
                return renderTechnicianWorkload(data as TechnicianWorkloadReport)
            case "payment_methods":
                return renderPaymentMethods(data as PaymentMethodsReport)
            case "turnaround_time":
                return renderTurnaroundTime(data as TurnaroundTimeReport)
            case "inventory_location":
                return renderInventoryLocation(data as InventoryLocationReport)
            default:
                return renderGenericReport(data)
        }
    }

    const getReportIcon = () => {
        switch (type) {
            case "outstanding_payments":
                return <CreditCard className="h-5 w-5" />
            case "technician_performance":
                return <TrendingUp className="h-5 w-5" />
            case "revenue_summary":
                return <DollarSign className="h-5 w-5" />
            case "task_status":
                return <ClipboardList className="h-5 w-5" />
            case "technician_workload":
                return <Users className="h-5 w-5" />
            case "payment_methods":
                return <PieChartIcon className="h-5 w-5" />
            case "turnaround_time":
                return <Clock className="h-5 w-5" />
            case "inventory_location":
                return <MapPin className="h-5 w-5" />
            default:
                return <BarChart3 className="h-5 w-5" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Download Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                        {getReportIcon()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">
                            {type.replace(/_/g, ' ')} Report
                        </h2>
                        <p className="text-gray-600">Live data from your backend API</p>
                    </div>
                </div>

                {/* Download PDF Button */}
                {onGeneratePDF && (
                    <Button
                        onClick={onGeneratePDF}
                        disabled={isGeneratingPDF}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isGeneratingPDF ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Generating PDF...
                            </div>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Report Content */}
            {renderReport()}
        </div>
    )
}