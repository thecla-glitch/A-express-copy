"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Badge } from "@/components/ui/core/badge"

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

export const OutstandingPaymentsPreview = ({ report, searchTerm }: { report: OutstandingPaymentsReport, searchTerm: string }) => {
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
