"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Badge } from "@/components/ui/core/badge"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

const ChartContainer = ({ children, className }: any) => {
    return <div className={className}>{children}</div>
}

const ChartTooltip = (props: any) => {
    return <Tooltip {...props} />
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

export const PaymentMethodsPreview = ({ report }: { report: any }) => {
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
