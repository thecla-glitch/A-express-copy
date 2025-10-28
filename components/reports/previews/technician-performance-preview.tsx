"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Badge } from "@/components/ui/core/badge"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const ChartContainer = ({ children, className }: any) => {
    return <div className={className}>{children}</div>
}

const ChartTooltip = (props: any) => {
    return <Tooltip {...props} />
}

interface TechnicianPerformanceReport {
    technician_performance: {
        technician_name: string
        completed_tasks: number
        in_progress_tasks: number
        total_revenue: number
        avg_completion_hours: number
    }[]
    date_range: string
    total_technicians: number
}

export const TechnicianPerformancePreview = ({ report }: { report: TechnicianPerformanceReport }) => {
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
                                    <TableHead>Total Revenue</TableHead>
                                    <TableHead>Avg Completion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {technicianPerformance.map((tech: any) => (
                                    <TableRow key={tech.technician_name} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{tech.technician_name}</TableCell>
                                        <TableCell>{tech.completed_tasks}</TableCell>
                                        <TableCell>{tech.in_progress_tasks}</TableCell>


                                        <TableCell className="text-green-600 font-semibold">
                                            TSh {tech.total_revenue?.toLocaleString() || '0'}
                                        </TableCell>
                                        <TableCell>
                                            {tech.avg_completion_hours > 0 ? `${tech.avg_completion_hours}h` : 'N/A'}
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
                <div className="mt-6">
                    {/* Efficiency Chart */}
                    

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
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Task Summary for Technicians</CardTitle>
                            <CardDescription>
                                Completed vs. In Progress tasks for each technician.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={technicianPerformance} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="technician_name" type="category" width={100} />
                                        <ChartTooltip
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                                            <p className="font-medium">{data.technician_name}</p>
                                                            <p className="text-sm text-blue-600">Completed: {data.completed_tasks}</p>
                                                            <p className="text-sm text-orange-600">In Progress: {data.in_progress_tasks}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="completed_tasks" fill="#3b82f6" name="Completed Tasks" stackId="a" />
                                        <Bar dataKey="in_progress_tasks" fill="#f97316" name="In Progress Tasks" stackId="a" />
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