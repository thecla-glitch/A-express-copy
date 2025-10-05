"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Badge } from "@/components/ui/core/badge"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Users, DollarSign, ClipboardList, TrendingUp, Search, Plus, Edit, Trash2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const monthlyData = [
  { month: "Jan", customers: 45 },
  { month: "Feb", customers: 52 },
  { month: "Mar", customers: 48 },
  { month: "Apr", customers: 61 },
  { month: "May", customers: 55 },
  { month: "Jun", customers: 67 },
]

const customers = [
  {
    id: "CUST001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    totalOrders: 8,
    totalSpent: 1250,
    lastVisit: "2024-01-15",
    status: "Active",
  },
  {
    id: "CUST002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    totalOrders: 12,
    totalSpent: 2100,
    lastVisit: "2024-01-14",
    status: "Active",
  },
  {
    id: "CUST003",
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "(555) 345-6789",
    totalOrders: 5,
    totalSpent: 750,
    lastVisit: "2024-01-10",
    status: "Active",
  },
  {
    id: "CUST004",
    name: "Emily Wilson",
    email: "emily.w@email.com",
    phone: "(555) 456-7890",
    totalOrders: 15,
    totalSpent: 3200,
    lastVisit: "2024-01-12",
    status: "Active",
  },
  {
    id: "CUST005",
    name: "Robert Brown",
    email: "robert.brown@email.com",
    phone: "(555) 567-8901",
    totalOrders: 3,
    totalSpent: 450,
    lastVisit: "2024-01-08",
    status: "Inactive",
  },
]

export function CustomersOverview() {
  return (
    <div className="space-y-6">
      {/* Essential KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-2xl font-bold">TSh 45,231</div>            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Customer Acquisition Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Customer Acquisition
          </CardTitle>
          <CardDescription>New customers acquired each month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Manage your customer database</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>TSh {customer.totalSpent}</TableCell>
                  <TableCell>{customer.lastVisit}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "Active" ? "default" : "secondary"}>{customer.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
