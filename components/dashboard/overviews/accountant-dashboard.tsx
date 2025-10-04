"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react"

// Mock data for tasks that are not fully paid
const unpaidTasks = [
  {
    id: "T-1002",
    customerName: "Jane Doe",
    laptopModel: 'HP Spectre x360',
    completedDate: "2024-01-16",
    totalAmount: "TSh 450.00",
    paidAmount: "TSh 200.00",
    balance: "TSh 250.00",
    status: "Completed",
  },
  {
    id: "T-1003",
    customerName: "Peter Jones",
    laptopModel: "Lenovo Yoga",
    completedDate: "2024-01-15",
    totalAmount: "TSh 320.00",
    paidAmount: "TSh 100.00",
    balance: "TSh 220.00",
    status: "Completed",
  },
]

import { RevenueOverview } from "./revenue-overview";

export default function AccountantDashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Accountant Dashboard</h2>
        <p className="text-muted-foreground">Financial overview and task management.</p>
      </div>

      {/* Daily Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RevenueOverview />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSh 5,780.50</div>
            <p className="text-xs text-muted-foreground">From 23 clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Pending Payment</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Awaiting full payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks with Outstanding Payments</CardTitle>
          <CardDescription>Tasks that have been completed but not fully paid.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Laptop Model</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.customerName}</TableCell>
                  <TableCell>{task.laptopModel}</TableCell>
                  <TableCell>{task.completedDate}</TableCell>
                  <TableCell>{task.totalAmount}</TableCell>
                  <TableCell>{task.paidAmount}</TableCell>
                  <TableCell className="text-red-600 font-bold">{task.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
