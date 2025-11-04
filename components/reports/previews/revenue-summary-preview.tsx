"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"

const ChartContainer = ({ children, className }: any) => {
    return <div className={className}>{children}</div>
}

const ChartTooltip = (props: any) => {
    return <Tooltip {...props} />
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

export const RevenueSummaryPreview = ({ report }: { report: any }) => {
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
