"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Badge } from "@/components/ui/core/badge"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const ChartContainer = ({ children, className }: any) => {
    return <div className={className}>{children}</div>
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

export const TurnaroundTimePreview = ({ report }: { report: TurnaroundTimeReport }) => {
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
