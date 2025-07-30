"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Package,
  Phone,
  Clock,
  Laptop,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  User,
  Mail,
  MapPin,
  Wrench,
} from "lucide-react"

// Mock data for ready for pickup tasks
const readyForPickupTasks = [
  {
    id: "T-1001",
    customerName: "John Smith",
    laptopModel: 'MacBook Pro 13"',
    completedDate: "2024-01-15",
    phoneNumber: "(555) 123-4567",
    totalAmount: "$299.99",
    status: "Ready for Pickup",
    technicianNotes: "Screen replacement completed successfully. All functions tested.",
  },
  {
    id: "T-1005",
    customerName: "Sarah Johnson",
    laptopModel: "Dell XPS 15",
    completedDate: "2024-01-14",
    phoneNumber: "(555) 987-6543",
    totalAmount: "$189.50",
    status: "Ready for Pickup",
    technicianNotes: "Keyboard replacement and cleaning completed.",
  },
  {
    id: "T-1012",
    customerName: "Mike Chen",
    laptopModel: "HP Pavilion",
    completedDate: "2024-01-13",
    phoneNumber: "(555) 456-7890",
    totalAmount: "$149.99",
    status: "Ready for Pickup",
    technicianNotes: "Hard drive replacement and data recovery completed.",
  },
]

// Mock data for recent customer interactions
const recentInteractions = [
  {
    id: "T-1025",
    customerName: "David Wilson",
    action: "Task Created",
    laptopModel: "MacBook Air",
    time: "5 minutes ago",
    status: "In Progress",
    type: "new",
    priority: "High",
  },
  {
    id: "T-1003",
    customerName: "Emma Davis",
    action: "Status Updated",
    laptopModel: "ASUS ROG",
    time: "12 minutes ago",
    status: "Awaiting Parts",
    type: "update",
    priority: "Medium",
  },
  {
    id: "T-1020",
    customerName: "Tom Anderson",
    action: "Customer Called",
    laptopModel: "Surface Laptop",
    time: "25 minutes ago",
    status: "In Progress",
    type: "inquiry",
    priority: "Low",
  },
  {
    id: "T-1018",
    customerName: "Lisa Brown",
    action: "Payment Received",
    laptopModel: "Lenovo ThinkPad",
    time: "1 hour ago",
    status: "Completed",
    type: "payment",
    priority: "Medium",
  },
]

// Mock customer database
const customerDatabase = [
  {
    id: "CUST-001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    totalRepairs: 3,
    lastVisit: "2024-01-15",
    customerType: "Regular",
    notes: "Prefers email communication. Usually drops off in mornings.",
  },
  {
    id: "CUST-002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Somewhere, ST 67890",
    totalRepairs: 1,
    lastVisit: "2024-01-14",
    customerType: "New",
    notes: "First-time customer. Very satisfied with service.",
  },
  {
    id: "CUST-003",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "(555) 456-7890",
    address: "789 Pine St, Another City, ST 11111",
    totalRepairs: 5,
    lastVisit: "2024-01-13",
    customerType: "VIP",
    notes: "Business customer with multiple devices. Priority service.",
  },
  {
    id: "CUST-004",
    name: "Emma Davis",
    email: "emma.davis@email.com",
    phone: "(555) 321-0987",
    address: "321 Elm St, Different Town, ST 22222",
    totalRepairs: 2,
    lastVisit: "2024-01-10",
    customerType: "Regular",
    notes: "Student discount applied. Prefers text messages.",
  },
]

// Mock appointment data
const upcomingAppointments = [
  {
    id: "APT-001",
    customerName: "Lisa Brown",
    phone: "(555) 321-0987",
    appointmentTime: "2024-01-16 10:00 AM",
    service: "Laptop Diagnosis",
    laptopModel: "Lenovo ThinkPad",
    issue: "Won't turn on",
  },
  {
    id: "APT-002",
    customerName: "Mark Wilson",
    phone: "(555) 654-3210",
    appointmentTime: "2024-01-16 2:00 PM",
    service: "Screen Repair",
    laptopModel: "MacBook Pro",
    issue: "Cracked screen",
  },
  {
    id: "APT-003",
    customerName: "Jennifer Lee",
    phone: "(555) 111-2222",
    appointmentTime: "2024-01-17 9:00 AM",
    service: "Data Recovery",
    laptopModel: "Dell XPS",
    issue: "Hard drive failure",
  },
]

export function FrontDeskDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState("")
  const [pickupSearchQuery, setPickupSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [newTaskForm, setNewTaskForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    laptopModel: "",
    issue: "",
    priority: "Medium",
    notes: "",
  })

  // Filter functions
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery) return customerDatabase

    return customerDatabase.filter(
      (customer) =>
        customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.phone.includes(customerSearchQuery) ||
        customer.id.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.notes.toLowerCase().includes(customerSearchQuery.toLowerCase()),
    )
  }, [customerSearchQuery])

  const filteredAppointments = useMemo(() => {
    if (!appointmentSearchQuery) return upcomingAppointments

    return upcomingAppointments.filter(
      (appointment) =>
        appointment.customerName.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
        appointment.phone.includes(appointmentSearchQuery) ||
        appointment.service.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
        appointment.laptopModel.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
        appointment.issue.toLowerCase().includes(appointmentSearchQuery.toLowerCase()),
    )
  }, [appointmentSearchQuery])

  const filteredPickupTasks = useMemo(() => {
    if (!pickupSearchQuery) return readyForPickupTasks

    return readyForPickupTasks.filter(
      (task) =>
        task.id.toLowerCase().includes(pickupSearchQuery.toLowerCase()) ||
        task.customerName.toLowerCase().includes(pickupSearchQuery.toLowerCase()) ||
        task.laptopModel.toLowerCase().includes(pickupSearchQuery.toLowerCase()) ||
        task.phoneNumber.includes(pickupSearchQuery) ||
        task.technicianNotes.toLowerCase().includes(pickupSearchQuery.toLowerCase()),
    )
  }, [pickupSearchQuery])

  const filteredInteractions = useMemo(() => {
    if (!searchQuery) return recentInteractions

    return recentInteractions.filter(
      (interaction) =>
        interaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.laptopModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.action.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const handleInitiatePickup = (taskId: string, customerName: string) => {
    alert(`Initiating pickup process for ${taskId} - ${customerName}`)
  }

  const handleCallCustomer = (phoneNumber: string, customerName: string) => {
    alert(`Calling ${customerName} at ${phoneNumber}`)
  }

  const handleCreateTask = () => {
    // In a real app, this would submit to an API
    alert(`New task created for ${newTaskForm.customerName}`)
    setNewTaskForm({
      customerName: "",
      phone: "",
      email: "",
      laptopModel: "",
      issue: "",
      priority: "Medium",
      notes: "",
    })
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "new":
        return <Plus className="h-4 w-4 text-green-600" />
      case "update":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "inquiry":
        return <Phone className="h-4 w-4 text-blue-600" />
      case "payment":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pickup":
        return <Package className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ready for Pickup":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready for Pickup</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "Awaiting Parts":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Awaiting Parts</Badge>
      case "Completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "VIP":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">VIP</Badge>
      case "Regular":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Regular</Badge>
      case "New":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Front Desk Dashboard</h1>
        <p className="text-gray-600 mt-2">Customer service hub for task management and customer interactions</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="newtask">New Task</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="pickup">Pickup</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* New Task Quick Access */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Task</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Start a new repair task for walk-in customers or phone inquiries
                    </p>
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="h-5 w-5 mr-2" />
                      New Task
                    </Button>
                  </div>
                  <div className="p-4 bg-red-100 rounded-full">
                    <Plus className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Search */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Search</h3>
                    <p className="text-gray-600 text-sm mb-4">Find tasks by customer name or Task ID</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search interactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Search className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Ready for Pickup */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Tasks Ready for Pickup
                  </CardTitle>
                  <CardDescription>Completed repairs awaiting customer collection</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {readyForPickupTasks.length} Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Laptop Model</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyForPickupTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-red-600">{task.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{task.customerName}</p>
                            <p className="text-sm text-gray-500">{task.phoneNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Laptop className="h-4 w-4 text-gray-400" />
                            {task.laptopModel}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{task.completedDate}</TableCell>
                        <TableCell className="font-medium text-gray-900">{task.totalAmount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleInitiatePickup(task.id, task.customerName)}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Pickup
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                              onClick={() => handleCallCustomer(task.phoneNumber, task.customerName)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
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

          {/* Recent Customer Interactions */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Customer Interactions
              </CardTitle>
              <CardDescription>Latest task updates and customer activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInteractions.map((interaction) => (
                  <div
                    key={`${interaction.id}-${interaction.time}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-full">{getInteractionIcon(interaction.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-red-600">{interaction.id}</span>
                          <span className="font-medium text-gray-900">{interaction.customerName}</span>
                          {getStatusBadge(interaction.status)}
                          {getPriorityBadge(interaction.priority)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{interaction.action}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Laptop className="h-3 w-3" />
                            {interaction.laptopModel}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{interaction.time}</p>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredInteractions.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No interactions found matching "{searchQuery}"</p>
                    <Button variant="outline" className="mt-2 bg-transparent" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Task Tab */}
        <TabsContent value="newtask" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Repair Task
              </CardTitle>
              <CardDescription>Enter customer and device information to create a new repair task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={newTaskForm.customerName}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                      placeholder="Enter customer full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newTaskForm.phone}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTaskForm.email}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, email: e.target.value })}
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="laptopModel">Laptop Model *</Label>
                    <Input
                      id="laptopModel"
                      value={newTaskForm.laptopModel}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, laptopModel: e.target.value })}
                      placeholder="e.g., MacBook Pro 13-inch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select
                      value={newTaskForm.priority}
                      onValueChange={(value) => setNewTaskForm({ ...newTaskForm, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="High">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue">Issue Description *</Label>
                    <Textarea
                      id="issue"
                      value={newTaskForm.issue}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, issue: e.target.value })}
                      placeholder="Describe the problem with the laptop..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newTaskForm.notes}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes: e.target.value })}
                  placeholder="Any additional information or special instructions..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewTaskForm({
                      customerName: "",
                      phone: "",
                      email: "",
                      laptopModel: "",
                      issue: "",
                      priority: "Medium",
                      notes: "",
                    })
                  }
                >
                  Clear Form
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleCreateTask}
                  disabled={
                    !newTaskForm.customerName || !newTaskForm.phone || !newTaskForm.laptopModel || !newTaskForm.issue
                  }
                >
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Database
              </CardTitle>
              <CardDescription>Search and manage customer information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers by name, phone, email, or ID..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                {customerSearchQuery && (
                  <div className="text-sm text-gray-600">
                    Showing {filteredCustomers.length} of {customerDatabase.length} customers
                    {filteredCustomers.length === 0 && (
                      <span className="text-red-600 ml-2">No customers found matching "{customerSearchQuery}"</span>
                    )}
                  </div>
                )}
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-gray-900">{customer.name}</span>
                              {getCustomerTypeBadge(customer.customerType)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Last Visit: {customer.lastVisit}</p>
                          <p className="text-sm text-gray-500">Total Repairs: {customer.totalRepairs}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-700">{customer.address}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-700">{customer.notes}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          View History
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-3 w-3 mr-1" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && customerSearchQuery && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                      <p className="text-gray-600">No customers match your search for "{customerSearchQuery}"</p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={() => setCustomerSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Scheduled appointments and drop-offs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search appointments by customer name, service, or laptop model..."
                    value={appointmentSearchQuery}
                    onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                {appointmentSearchQuery && (
                  <div className="text-sm text-gray-600">
                    Showing {filteredAppointments.length} of {upcomingAppointments.length} appointments
                    {filteredAppointments.length === 0 && (
                      <span className="text-red-600 ml-2">
                        No appointments found matching "{appointmentSearchQuery}"
                      </span>
                    )}
                  </div>
                )}
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-gray-900">{appointment.customerName}</span>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                              {appointment.service}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.appointmentTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.laptopModel}</p>
                        <p className="text-sm text-gray-600">{appointment.issue}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-3 w-3 mr-1" />
                        Call Customer
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Check In
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAppointments.length === 0 && appointmentSearchQuery && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">No appointments match your search for "{appointmentSearchQuery}"</p>
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => setAppointmentSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pickup Tab */}
        <TabsContent value="pickup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pickup Management
              </CardTitle>
              <CardDescription>Process customer pickups and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search pickup tasks by ID, customer name, or laptop model..."
                    value={pickupSearchQuery}
                    onChange={(e) => setPickupSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                {pickupSearchQuery && (
                  <div className="text-sm text-gray-600">
                    Showing {filteredPickupTasks.length} of {readyForPickupTasks.length} pickup tasks
                    {filteredPickupTasks.length === 0 && (
                      <span className="text-red-600 ml-2">No pickup tasks found matching "{pickupSearchQuery}"</span>
                    )}
                  </div>
                )}
                {filteredPickupTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-red-600">{task.id}</span>
                            <span className="font-medium text-gray-900">{task.customerName}</span>
                            {getStatusBadge(task.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Laptop className="h-3 w-3" />
                              {task.laptopModel}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {task.phoneNumber}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {task.totalAmount}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Completed: {task.completedDate}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Technician Notes
                      </h4>
                      <p className="text-sm text-blue-800">{task.technicianNotes}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallCustomer(task.phoneNumber, task.customerName)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call Customer
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        onClick={() => handleInitiatePickup(task.id, task.customerName)}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Process Pickup
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredPickupTasks.length === 0 && pickupSearchQuery && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pickup tasks found</h3>
                    <p className="text-gray-600">No pickup tasks match your search for "{pickupSearchQuery}"</p>
                    <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setPickupSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
