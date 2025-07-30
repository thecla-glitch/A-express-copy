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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Star,
  DollarSign,
  Eye,
  Edit,
  Send,
  Plus,
  Download,
  RefreshCw,
  Crown,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock customer data
interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  status: "Active" | "VIP" | "Inactive"
  totalSpent: number
  tasksCompleted: number
  averageRating: number
  lastVisit: string
  joinDate: string
  preferredContact: "email" | "phone" | "sms"
  notes: string
  loyaltyPoints: number
}

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St",
    city: "New York",
    status: "VIP",
    totalSpent: 1250.99,
    tasksCompleted: 8,
    averageRating: 4.8,
    lastVisit: "2024-01-15",
    joinDate: "2023-03-15",
    preferredContact: "email",
    notes: "Prefers premium service, always pays on time",
    loyaltyPoints: 1250,
  },
  {
    id: "CUST-002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 987-6543",
    address: "456 Oak Ave",
    city: "Los Angeles",
    status: "Active",
    totalSpent: 789.5,
    tasksCompleted: 5,
    averageRating: 4.6,
    lastVisit: "2024-01-12",
    joinDate: "2023-06-20",
    preferredContact: "phone",
    notes: "Works from home, flexible pickup times",
    loyaltyPoints: 789,
  },
  {
    id: "CUST-003",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "(555) 456-7890",
    address: "789 Pine St",
    city: "Chicago",
    status: "Active",
    totalSpent: 445.25,
    tasksCompleted: 3,
    averageRating: 4.9,
    lastVisit: "2024-01-10",
    joinDate: "2023-08-10",
    preferredContact: "sms",
    notes: "Tech-savvy, prefers detailed explanations",
    loyaltyPoints: 445,
  },
  {
    id: "CUST-004",
    name: "Lisa Brown",
    email: "lisa.brown@email.com",
    phone: "(555) 321-0987",
    address: "321 Elm St",
    city: "Houston",
    status: "VIP",
    totalSpent: 2100.75,
    tasksCompleted: 12,
    averageRating: 4.7,
    lastVisit: "2024-01-08",
    joinDate: "2022-11-05",
    preferredContact: "email",
    notes: "Business customer, multiple devices",
    loyaltyPoints: 2100,
  },
  {
    id: "CUST-005",
    name: "David Wilson",
    email: "david.w@email.com",
    phone: "(555) 654-3210",
    address: "654 Maple Ave",
    city: "Phoenix",
    status: "Inactive",
    totalSpent: 125.0,
    tasksCompleted: 1,
    averageRating: 4.0,
    lastVisit: "2023-11-20",
    joinDate: "2023-11-15",
    preferredContact: "phone",
    notes: "First-time customer, price-sensitive",
    loyaltyPoints: 125,
  },
  {
    id: "CUST-006",
    name: "Emma Davis",
    email: "emma.davis@email.com",
    phone: "(555) 789-0123",
    address: "987 Cedar St",
    city: "Denver",
    status: "Active",
    totalSpent: 567.8,
    tasksCompleted: 4,
    averageRating: 4.5,
    lastVisit: "2024-01-05",
    joinDate: "2023-04-12",
    preferredContact: "email",
    notes: "Student discount applied, quick turnaround needed",
    loyaltyPoints: 567,
  },
]

const customerStatuses = [
  { value: "all", label: "All Customers" },
  { value: "Active", label: "Active" },
  { value: "VIP", label: "VIP" },
  { value: "Inactive", label: "Inactive" },
]

const contactPreferences = [
  { value: "all", label: "All Preferences" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "SMS" },
]

export function CustomersOverview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contactFilter, setContactFilter] = useState("all")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false)
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false)
  const [messageType, setMessageType] = useState<"email" | "sms">("email")
  const [messageSubject, setMessageSubject] = useState("")
  const [messageContent, setMessageContent] = useState("")

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter((customer) => {
      const matchesSearch =
        searchQuery === "" ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      const matchesContact = contactFilter === "all" || customer.preferredContact === contactFilter

      return matchesSearch && matchesStatus && matchesContact
    })
  }, [searchQuery, statusFilter, contactFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCustomers = filteredCustomers.length
    const activeCustomers = filteredCustomers.filter((c) => c.status === "Active").length
    const vipCustomers = filteredCustomers.filter((c) => c.status === "VIP").length
    const inactiveCustomers = filteredCustomers.filter((c) => c.status === "Inactive").length

    const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
    const averageSpending = totalRevenue / totalCustomers || 0
    const totalTasks = filteredCustomers.reduce((sum, c) => sum + c.tasksCompleted, 0)
    const averageRating = filteredCustomers.reduce((sum, c) => sum + c.averageRating, 0) / totalCustomers || 0

    // Customer status breakdown for pie chart
    const statusBreakdown = [
      { name: "Active", value: activeCustomers, color: "#22c55e" },
      { name: "VIP", value: vipCustomers, color: "#f59e0b" },
      { name: "Inactive", value: inactiveCustomers, color: "#6b7280" },
    ].filter((item) => item.value > 0)

    // Monthly customer acquisition (last 6 months)
    const monthlyAcquisition = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().slice(0, 7)
      const monthCustomers = filteredCustomers.filter((c) => c.joinDate.startsWith(monthStr)).length
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        customers: monthCustomers,
      }
    }).reverse()

    // Spending distribution
    const spendingRanges = [
      { range: "$0-$200", count: filteredCustomers.filter((c) => c.totalSpent < 200).length, color: "#ef4444" },
      {
        range: "$200-$500",
        count: filteredCustomers.filter((c) => c.totalSpent >= 200 && c.totalSpent < 500).length,
        color: "#f97316",
      },
      {
        range: "$500-$1000",
        count: filteredCustomers.filter((c) => c.totalSpent >= 500 && c.totalSpent < 1000).length,
        color: "#eab308",
      },
      { range: "$1000+", count: filteredCustomers.filter((c) => c.totalSpent >= 1000).length, color: "#22c55e" },
    ]

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      inactiveCustomers,
      totalRevenue,
      averageSpending,
      totalTasks,
      averageRating,
      statusBreakdown,
      monthlyAcquisition,
      spendingRanges,
    }
  }, [filteredCustomers])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "VIP":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Crown className="h-3 w-3 mr-1" />
            VIP
          </Badge>
        )
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getContactIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="h-4 w-4 text-blue-600" />
      case "phone":
        return <Phone className="h-4 w-4 text-green-600" />
      case "sms":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      default:
        return <Mail className="h-4 w-4 text-gray-600" />
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId],
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id))
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerDetailsOpen(true)
  }

  const handleBulkMessage = () => {
    if (selectedCustomers.length === 0) {
      alert("Please select customers to send messages to")
      return
    }
    setBulkMessageOpen(true)
  }

  const handleSendBulkMessage = () => {
    // Simulate sending bulk message
    console.log({
      type: messageType,
      subject: messageSubject,
      content: messageContent,
      recipients: selectedCustomers,
    })
    setBulkMessageOpen(false)
    setMessageSubject("")
    setMessageContent("")
    setSelectedCustomers([])
    alert(`${messageType.toUpperCase()} sent to ${selectedCustomers.length} customers successfully!`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setContactFilter("all")
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-red-600" />
            Customer Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage customer relationships, track interactions, and send communications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBulkMessage}
            disabled={selectedCustomers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Bulk Message ({selectedCustomers.length})
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
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
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-xl font-bold text-gray-900">{summaryStats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Crown className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">VIP Customers</p>
                <p className="text-xl font-bold text-gray-900">{summaryStats.vipCustomers}</p>
                <p className="text-xs text-gray-500">
                  {((summaryStats.vipCustomers / summaryStats.totalCustomers) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Spending</p>
                <p className="text-xl font-bold text-gray-900">${summaryStats.averageSpending.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Star className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-xl font-bold text-gray-900">{summaryStats.averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">out of 5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Customer Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of customers by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Active: { label: "Active", color: "#22c55e" },
                VIP: { label: "VIP", color: "#f59e0b" },
                Inactive: { label: "Inactive", color: "#6b7280" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryStats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {summaryStats.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {summaryStats.statusBreakdown.map((status) => (
                <div key={status.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <span className="text-gray-600">{status.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Monthly Customer Acquisition</CardTitle>
            <CardDescription>New customers acquired over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                customers: { label: "New Customers", color: "#dc2626" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summaryStats.monthlyAcquisition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Spending Distribution</CardTitle>
            <CardDescription>Customer distribution by spending ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Customers", color: "#dc2626" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryStats.spendingRanges} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" />
                  <YAxis dataKey="range" type="category" width={80} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {summaryStats.spendingRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
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
          <CardDescription>Find and filter customers by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Customer Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact Preference</Label>
              <Select value={contactFilter} onValueChange={setContactFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactPreferences.map((pref) => (
                    <SelectItem key={pref.value} value={pref.value}>
                      {pref.label}
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
                Clear Filters
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="w-full border-red-300 text-red-600 bg-transparent hover:bg-red-50"
              >
                {selectedCustomers.length === filteredCustomers.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <span>
              Showing {filteredCustomers.length} of {mockCustomers.length} customers
            </span>
            {selectedCustomers.length > 0 && (
              <span className="text-red-600">{selectedCustomers.length} selected for bulk actions</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="vip">VIP Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Customer Directory</CardTitle>
              <CardDescription>Complete list of all customers with detailed information</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Total Spent</TableHead>
                      <TableHead className="font-semibold text-gray-900">Tasks</TableHead>
                      <TableHead className="font-semibold text-gray-900">Rating</TableHead>
                      <TableHead className="font-semibold text-gray-900">Last Visit</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() => handleCustomerSelect(customer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getContactIcon(customer.preferredContact)}
                              <span className="text-xs text-gray-500 capitalize">
                                Prefers {customer.preferredContact}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">${customer.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{customer.loyaltyPoints} points</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{customer.tasksCompleted}</p>
                            <p className="text-xs text-gray-500">completed</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-900">{customer.averageRating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{customer.lastVisit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip" className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                VIP Customers
              </CardTitle>
              <CardDescription>High-value customers with premium status and benefits</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-yellow-100">
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Total Spent</TableHead>
                      <TableHead className="font-semibold text-gray-900">Loyalty Points</TableHead>
                      <TableHead className="font-semibold text-gray-900">Tasks Completed</TableHead>
                      <TableHead className="font-semibold text-gray-900">Member Since</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers
                      .filter((c) => c.status === "VIP")
                      .map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-yellow-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Crown className="h-4 w-4 text-yellow-600" />
                              <div>
                                <p className="font-medium text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${customer.totalSpent.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-purple-600">{customer.loyaltyPoints}</TableCell>
                          <TableCell className="text-center font-medium">{customer.tasksCompleted}</TableCell>
                          <TableCell className="text-sm text-gray-600">{customer.joinDate}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Active Customers</CardTitle>
              <CardDescription>Customers with recent activity and ongoing engagement</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-100">
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Last Visit</TableHead>
                      <TableHead className="font-semibold text-gray-900">Total Spent</TableHead>
                      <TableHead className="font-semibold text-gray-900">Rating</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers
                      .filter((c) => c.status === "Active")
                      .map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-green-50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{customer.lastVisit}</TableCell>
                          <TableCell className="font-medium text-gray-900">
                            ${customer.totalSpent.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{customer.averageRating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Inactive Customers</CardTitle>
              <CardDescription>Customers who haven't visited recently and may need re-engagement</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Last Visit</TableHead>
                      <TableHead className="font-semibold text-gray-900">Days Inactive</TableHead>
                      <TableHead className="font-semibold text-gray-900">Total Spent</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers
                      .filter((c) => c.status === "Inactive")
                      .map((customer) => {
                        const daysSinceLastVisit = Math.floor(
                          (new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
                        )
                        return (
                          <TableRow key={customer.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{customer.lastVisit}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                {daysSinceLastVisit} days
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              ${customer.totalSpent.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Re-engage
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCustomer(customer)}
                                  className="border-gray-300 text-gray-600 bg-transparent"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog */}
      <Dialog open={customerDetailsOpen} onOpenChange={setCustomerDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Customer Profile - {selectedCustomer.name}
                  {selectedCustomer.status === "VIP" && <Crown className="h-4 w-4 text-yellow-600" />}
                </DialogTitle>
                <DialogDescription>Complete customer information and interaction history</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">Service History</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Customer ID:</span>
                          <span className="text-sm font-medium text-red-600">{selectedCustomer.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium">{selectedCustomer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm">{selectedCustomer.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm">{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Address:</span>
                          <span className="text-sm">{selectedCustomer.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">City:</span>
                          <span className="text-sm">{selectedCustomer.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          {getStatusBadge(selectedCustomer.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Preferred Contact:</span>
                          <div className="flex items-center gap-2">
                            {getContactIcon(selectedCustomer.preferredContact)}
                            <span className="text-sm capitalize">{selectedCustomer.preferredContact}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Customer Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Spent:</span>
                          <span className="text-sm font-medium text-green-600">
                            ${selectedCustomer.totalSpent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tasks Completed:</span>
                          <span className="text-sm font-medium">{selectedCustomer.tasksCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{selectedCustomer.averageRating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loyalty Points:</span>
                          <span className="text-sm font-medium text-purple-600">{selectedCustomer.loyaltyPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Customer Since:</span>
                          <span className="text-sm">{selectedCustomer.joinDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Visit:</span>
                          <span className="text-sm">{selectedCustomer.lastVisit}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Notes & Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedCustomer.notes}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base">Service History</CardTitle>
                      <CardDescription>Complete history of repairs and services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Mock service history */}
                        <div className="border-l-2 border-red-200 pl-4 space-y-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">Screen Replacement - MacBook Pro</h4>
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Task ID: T-1001 • Amount: $299.99</p>
                            <p className="text-xs text-gray-500">Completed on 2024-01-15 by John Smith (Technician)</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">Battery Replacement - MacBook Pro</h4>
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Task ID: T-0892 • Amount: $189.99</p>
                            <p className="text-xs text-gray-500">
                              Completed on 2023-11-20 by Sarah Johnson (Technician)
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="communication" className="space-y-4">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base">Communication History</CardTitle>
                      <CardDescription>Record of all communications with this customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900">Email Sent</span>
                              <span className="text-xs text-gray-500">2024-01-15 10:30 AM</span>
                            </div>
                            <p className="text-sm text-gray-700">Subject: Your MacBook Pro repair is complete</p>
                            <p className="text-xs text-gray-500 mt-1">Sent by: Front Desk User</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">Phone Call</span>
                              <span className="text-xs text-gray-500">2024-01-10 2:15 PM</span>
                            </div>
                            <p className="text-sm text-gray-700">Called to confirm repair details and timeline</p>
                            <p className="text-xs text-gray-500 mt-1">Duration: 5 minutes • By: Shop Manager</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setCustomerDetailsOpen(false)}>
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Message Dialog */}
      <Dialog open={bulkMessageOpen} onOpenChange={setBulkMessageOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Send Bulk Message
            </DialogTitle>
            <DialogDescription>
              Send {messageType.toUpperCase()} to {selectedCustomers.length} selected customers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={(value: "email" | "sms") => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {messageType === "email" && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Enter email subject..."
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                placeholder={
                  messageType === "email"
                    ? "Enter your email message..."
                    : "Enter your SMS message (160 characters max)..."
                }
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={messageType === "email" ? 6 : 3}
                maxLength={messageType === "sms" ? 160 : undefined}
              />
              {messageType === "sms" && <p className="text-xs text-gray-500">{messageContent.length}/160 characters</p>}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Recipients ({selectedCustomers.length})</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedCustomers.map((customerId) => {
                  const customer = mockCustomers.find((c) => c.id === customerId)
                  return (
                    <div key={customerId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{customer?.name}</span>
                      <span className="text-gray-500">
                        {messageType === "email" ? customer?.email : customer?.phone}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setBulkMessageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendBulkMessage}
              disabled={!messageContent || (messageType === "email" && !messageSubject)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send {messageType.toUpperCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
