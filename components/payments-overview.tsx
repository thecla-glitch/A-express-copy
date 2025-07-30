"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Banknote,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Eye,
  RefreshCw,
  PieChart,
} from "lucide-react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock payment data
interface Payment {
  id: string
  taskId: string
  customerName: string
  amount: number
  method: "cash" | "card" | "bank_transfer" | "digital_wallet" | "check"
  status: "completed" | "pending" | "failed" | "refunded"
  date: string
  time: string
  reference: string
  description: string
  fees: number
  netAmount: number
  processedBy: string
}

const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    taskId: "T-1001",
    customerName: "John Smith",
    amount: 299.99,
    method: "card",
    status: "completed",
    date: "2024-01-15",
    time: "14:30:25",
    reference: "4532****1234",
    description: "Screen Replacement - MacBook Pro",
    fees: 8.7,
    netAmount: 291.29,
    processedBy: "Front Desk User",
  },
  {
    id: "PAY-002",
    taskId: "T-1005",
    customerName: "Sarah Johnson",
    amount: 189.5,
    method: "cash",
    status: "completed",
    date: "2024-01-15",
    time: "13:45:12",
    reference: "CASH-001",
    description: "Virus Removal - Dell XPS",
    fees: 0.0,
    netAmount: 189.5,
    processedBy: "Front Desk User",
  },
  {
    id: "PAY-003",
    taskId: "T-1012",
    customerName: "Mike Chen",
    amount: 149.99,
    method: "bank_transfer",
    status: "pending",
    date: "2024-01-15",
    time: "12:20:45",
    reference: "TXN-789456123",
    description: "Battery Replacement - HP Pavilion",
    fees: 2.25,
    netAmount: 147.74,
    processedBy: "Shop Manager",
  },
  {
    id: "PAY-004",
    taskId: "T-1018",
    customerName: "Lisa Brown",
    amount: 225.0,
    method: "digital_wallet",
    status: "completed",
    date: "2024-01-14",
    time: "16:15:33",
    reference: "PAYPAL-987654",
    description: "Motherboard Repair - Lenovo ThinkPad",
    fees: 6.75,
    netAmount: 218.25,
    processedBy: "Technician",
  },
  {
    id: "PAY-005",
    taskId: "T-1025",
    customerName: "David Wilson",
    amount: 450.0,
    method: "card",
    status: "failed",
    date: "2024-01-14",
    time: "11:30:18",
    reference: "5555****9876",
    description: "Data Recovery - MacBook Air",
    fees: 13.05,
    netAmount: 436.95,
    processedBy: "Front Desk User",
  },
  {
    id: "PAY-006",
    taskId: "T-1020",
    customerName: "Emma Davis",
    amount: 320.0,
    method: "check",
    status: "pending",
    date: "2024-01-14",
    time: "10:45:29",
    reference: "CHK-1001",
    description: "Screen Assembly - ASUS ROG",
    fees: 0.0,
    netAmount: 320.0,
    processedBy: "Shop Manager",
  },
  {
    id: "PAY-007",
    taskId: "T-1008",
    customerName: "Tom Anderson",
    amount: 180.0,
    method: "cash",
    status: "completed",
    date: "2024-01-13",
    time: "15:20:52",
    reference: "CASH-002",
    description: "Keyboard Repair - Surface Laptop",
    fees: 0.0,
    netAmount: 180.0,
    processedBy: "Front Desk User",
  },
  {
    id: "PAY-008",
    taskId: "T-1015",
    customerName: "Maria Garcia",
    amount: 95.0,
    method: "card",
    status: "refunded",
    date: "2024-01-13",
    time: "09:15:08",
    reference: "4111****5678",
    description: "Diagnostic Fee - Cancelled Service",
    fees: 2.75,
    netAmount: 92.25,
    processedBy: "Shop Manager",
  },
]

const paymentMethods = [
  { value: "all", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "digital_wallet", label: "Digital Wallet" },
  { value: "check", label: "Check" },
]

const paymentStatuses = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
]

export function PaymentsOverview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false)

  // Move this function before summaryStats
  const getMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "#22c55e"
      case "card":
        return "#3b82f6"
      case "bank_transfer":
        return "#8b5cf6"
      case "digital_wallet":
        return "#f59e0b"
      case "check":
        return "#6b7280"
      default:
        return "#9ca3af"
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4 text-green-600" />
      case "card":
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case "bank_transfer":
        return <Banknote className="h-4 w-4 text-purple-600" />
      case "digital_wallet":
        return <Smartphone className="h-4 w-4 text-orange-600" />
      case "check":
        return <Banknote className="h-4 w-4 text-gray-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Filter payments
  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      const matchesSearch =
        searchQuery === "" ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesMethod = methodFilter === "all" || payment.method === methodFilter
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter

      const matchesDateRange = (!startDate || payment.date >= startDate) && (!endDate || payment.date <= endDate)

      return matchesSearch && matchesMethod && matchesStatus && matchesDateRange
    })
  }, [searchQuery, methodFilter, statusFilter, startDate, endDate])

  // Calculate summary statistics - now getMethodColor is available
  const summaryStats = useMemo(() => {
    const totalTransactions = filteredPayments.length
    const completedPayments = filteredPayments.filter((p) => p.status === "completed")
    const pendingPayments = filteredPayments.filter((p) => p.status === "pending")
    const failedPayments = filteredPayments.filter((p) => p.status === "failed")

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalFees = completedPayments.reduce((sum, p) => sum + p.fees, 0)
    const netRevenue = completedPayments.reduce((sum, p) => sum + p.netAmount, 0)
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    // Payment method breakdown
    const methodBreakdown = paymentMethods.slice(1).map((method) => {
      const methodPayments = completedPayments.filter((p) => p.method === method.value)
      const amount = methodPayments.reduce((sum, p) => sum + p.amount, 0)
      return {
        name: method.label,
        value: amount,
        count: methodPayments.length,
        color: getMethodColor(method.value),
      }
    })

    // Daily revenue for last 7 days
    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayPayments = completedPayments.filter((p) => p.date === dateStr)
      const revenue = dayPayments.reduce((sum, p) => sum + p.amount, 0)
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue,
      }
    }).reverse()

    return {
      totalTransactions,
      totalRevenue,
      totalFees,
      netRevenue,
      pendingAmount,
      pendingCount: pendingPayments.length,
      failedCount: failedPayments.length,
      methodBreakdown,
      dailyRevenue,
    }
  }, [filteredPayments])

  // Remove the duplicate getMethodColor function that was defined later in the component
  // Keep only the one we moved to the top

  // Rest of the component remains the same...

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setPaymentDetailsOpen(true)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setMethodFilter("all")
    setStatusFilter("all")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-red-600" />
            Payment Management
          </h1>
          <p className="text-gray-600 mt-2">Track transactions, manage payments, and monitor financial performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">${summaryStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-xl font-bold text-gray-900">${summaryStats.netRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">${summaryStats.pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{summaryStats.pendingCount} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-xl font-bold text-gray-900">{summaryStats.failedCount}</p>
                <p className="text-xs text-gray-500">transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-xl font-bold text-gray-900">${summaryStats.totalFees.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-red-600" />
              Payment Methods Breakdown
            </CardTitle>
            <CardDescription>Revenue distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cash: { label: "Cash", color: "#22c55e" },
                card: { label: "Card", color: "#3b82f6" },
                bank_transfer: { label: "Bank Transfer", color: "#8b5cf6" },
                digital_wallet: { label: "Digital Wallet", color: "#f59e0b" },
                check: { label: "Check", color: "#6b7280" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={summaryStats.methodBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {summaryStats.methodBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {summaryStats.methodBreakdown.map((method) => (
                <div key={method.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }}></div>
                  <span className="text-gray-600">
                    {method.name}: ${method.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Daily Revenue Trend</CardTitle>
            <CardDescription>Revenue performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "#dc2626" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryStats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Search & Filters
          </CardTitle>
          <CardDescription>Filter transactions by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by payment ID, task ID, customer name, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-gray-300 text-gray-600 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <span>
              Showing {filteredPayments.length} of {mockPayments.length} transactions
            </span>
            {(searchQuery || methodFilter !== "all" || statusFilter !== "all" || startDate || endDate) && (
              <span className="text-red-600">Filters active</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Transaction History</CardTitle>
              <CardDescription>Complete record of all payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Payment ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Task ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900">Method</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Date & Time</TableHead>
                      <TableHead className="font-semibold text-gray-900">Reference</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-red-600">{payment.id}</TableCell>
                        <TableCell className="font-medium text-blue-600">{payment.taskId}</TableCell>
                        <TableCell className="font-medium text-gray-900">{payment.customerName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">${payment.amount.toFixed(2)}</p>
                            {payment.fees > 0 && (
                              <p className="text-xs text-gray-500">Fee: ${payment.fees.toFixed(2)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="text-sm capitalize">{payment.method.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{payment.date}</p>
                            <p className="text-gray-500">{payment.time}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">{payment.reference}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Payments
              </CardTitle>
              <CardDescription>Transactions awaiting completion or verification</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-yellow-100">
                      <TableHead className="font-semibold text-gray-900">Payment ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900">Method</TableHead>
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments
                      .filter((p) => p.status === "pending")
                      .map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-yellow-50">
                          <TableCell className="font-medium text-red-600">{payment.id}</TableCell>
                          <TableCell className="font-medium text-gray-900">{payment.customerName}</TableCell>
                          <TableCell className="font-medium text-gray-900">${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.method)}
                              <span className="text-sm capitalize">{payment.method.replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{payment.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-600 bg-transparent"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Failed Payments
              </CardTitle>
              <CardDescription>Transactions that failed to process and require attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-100">
                      <TableHead className="font-semibold text-gray-900">Payment ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900">Method</TableHead>
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments
                      .filter((p) => p.status === "failed")
                      .map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-red-50">
                          <TableCell className="font-medium text-red-600">{payment.id}</TableCell>
                          <TableCell className="font-medium text-gray-900">{payment.customerName}</TableCell>
                          <TableCell className="font-medium text-gray-900">${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.method)}
                              <span className="text-sm capitalize">{payment.method.replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{payment.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-600 bg-transparent"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Payment Method Summary</CardTitle>
                <CardDescription>Breakdown of transactions by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summaryStats.methodBreakdown.map((method) => (
                    <div key={method.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: method.color }}></div>
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${method.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {((method.value / summaryStats.totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Financial Summary</CardTitle>
                <CardDescription>Overall financial performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">Gross Revenue</span>
                    <span className="font-bold text-green-600">${summaryStats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-700">Processing Fees</span>
                    <span className="font-bold text-red-600">-${summaryStats.totalFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">Net Revenue</span>
                    <span className="font-bold text-blue-600">${summaryStats.netRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium text-gray-700">Pending Amount</span>
                    <span className="font-bold text-yellow-600">${summaryStats.pendingAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Details Dialog */}
      <Dialog open={paymentDetailsOpen} onOpenChange={setPaymentDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  Payment Details - {selectedPayment.id}
                </DialogTitle>
                <DialogDescription>Complete transaction information and processing details</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Transaction Overview */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment ID:</span>
                        <span className="text-sm font-medium text-red-600">{selectedPayment.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Task ID:</span>
                        <span className="text-sm font-medium text-blue-600">{selectedPayment.taskId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Customer:</span>
                        <span className="text-sm font-medium">{selectedPayment.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Description:</span>
                        <span className="text-sm">{selectedPayment.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processed By:</span>
                        <span className="text-sm">{selectedPayment.processedBy}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium">${selectedPayment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processing Fee:</span>
                        <span className="text-sm font-medium text-red-600">-${selectedPayment.fees.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-900">Net Amount:</span>
                        <span className="text-sm font-bold text-green-600">
                          ${selectedPayment.netAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Method:</span>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(selectedPayment.method)}
                          <span className="text-sm capitalize">{selectedPayment.method.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reference:</span>
                        <span className="text-sm font-mono">{selectedPayment.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date & Time:</span>
                        <div className="text-right">
                          <p className="text-sm font-medium">{selectedPayment.date}</p>
                          <p className="text-xs text-gray-500">{selectedPayment.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setPaymentDetailsOpen(false)}>
                    Close
                  </Button>
                  {selectedPayment.status === "pending" && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Payment
                    </Button>
                  )}
                  {selectedPayment.status === "failed" && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Payment
                    </Button>
                  )}
                  <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
