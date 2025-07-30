"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  User,
  Laptop,
  ClipboardList,
  DollarSign,
  Calendar,
  Settings,
  Edit,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Mock task data
const mockTaskData = {
  id: "T-1001",
  customerName: "John Smith",
  customerPhone: "(555) 123-4567",
  customerEmail: "john.smith@email.com",
  laptopMake: "Apple",
  laptopModel: 'MacBook Pro 13"',
  serialNumber: "C02XK1XMJGH5",
  initialIssue:
    "Screen replacement needed. Customer reported that the screen cracked after dropping the laptop. Display shows vertical lines and some areas are completely black. Touch functionality still works in some areas.",
  assignedTechnician: "Sarah Johnson",
  currentStatus: "In Progress",
  currentLocation: "Repair Bay 1",
  urgency: "Medium",
  dateIn: "2024-01-10",
  approvedDate: "2024-01-11",
  estimatedCompletion: "2024-01-15",
  totalCost: 299.99,
  partsCost: 189.99,
  laborCost: 110.0,
  paymentStatus: "Partially Paid",
  paidDate: "2024-01-11",
  dateOut: null,
}

// Mock activity log
const mockActivityLog = [
  {
    id: 1,
    timestamp: "2024-01-15 10:30 AM",
    user: "Sarah Johnson",
    type: "status_update",
    message: "Started screen replacement procedure. Removed back panel and disconnected battery.",
  },
  {
    id: 2,
    timestamp: "2024-01-15 09:15 AM",
    user: "Sarah Johnson",
    type: "note",
    message: 'Confirmed screen part availability. MacBook Pro 13" Retina display in stock.',
  },
  {
    id: 3,
    timestamp: "2024-01-14 2:45 PM",
    user: "Mike Chen",
    type: "diagnosis",
    message:
      "Diagnostic complete. LCD panel damaged, digitizer functional. Recommend full screen assembly replacement.",
  },
  {
    id: 4,
    timestamp: "2024-01-11 11:20 AM",
    user: "Lisa Brown",
    type: "customer_contact",
    message: "Called customer to confirm repair approval and cost estimate. Customer approved $299.99 total cost.",
  },
  {
    id: 5,
    timestamp: "2024-01-10 3:30 PM",
    user: "Front Desk",
    type: "intake",
    message: "Task created. Initial assessment: Screen cracked, vertical lines visible, partial display functionality.",
  },
]

// Mock payment history
const mockPaymentHistory = [
  {
    id: 1,
    amount: 150.0,
    date: "2024-01-11",
    method: "Credit Card",
    reference: "PAY-001",
  },
]

const statusOptions = [
  "Assigned - Not Accepted",
  "Diagnostic",
  "In Progress",
  "Awaiting Parts",
  "Ready for QC",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
]

const locationOptions = [
  "Front Desk Intake",
  "Diagnostic Station",
  "Repair Bay 1",
  "Repair Bay 2",
  "Parts Storage",
  "Quality Control",
  "Front Desk",
]

const technicianOptions = ["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Brown", "David Wilson"]

const urgencyOptions = ["Low", "Medium", "High"]

const paymentStatusOptions = ["Unpaid", "Partially Paid", "Paid", "Refunded"]

const paymentMethodOptions = ["Cash", "Credit Card", "Debit Card", "Check", "Digital Payment"]

interface TaskDetailsPageProps {
  taskId: string
}

export function TaskDetailsPage({ taskId }: TaskDetailsPageProps) {
  const { user } = useAuth()
  const [taskData, setTaskData] = useState(mockTaskData)
  const [activityLog, setActivityLog] = useState(mockActivityLog)
  const [paymentHistory, setPaymentHistory] = useState(mockPaymentHistory)
  const [newNote, setNewNote] = useState("")
  const [newPaymentAmount, setNewPaymentAmount] = useState("")
  const [newPaymentMethod, setNewPaymentMethod] = useState("")
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)

  // Role-based permissions
  const isAdmin = user?.role === "Administrator"
  const isManager = user?.role === "Manager"
  const isTechnician = user?.role === "Technician"
  const isFrontDesk = user?.role === "Front Desk"

  const canEditCustomer = isAdmin || isFrontDesk
  const canEditTechnician = isAdmin || isManager
  const canEditStatus = isAdmin || isTechnician
  const canEditFinancials = isAdmin || isManager
  const canMarkComplete = isAdmin || isTechnician
  const canMarkPickedUp = isAdmin || isFrontDesk

  const handleFieldUpdate = (field: string, value: string | number) => {
    setTaskData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note = {
      id: activityLog.length + 1,
      timestamp: new Date().toLocaleString(),
      user: user?.name || "Current User",
      type: "note",
      message: newNote,
    }

    setActivityLog((prev) => [note, ...prev])
    setNewNote("")
  }

  const handleAddPayment = () => {
    if (!newPaymentAmount || !newPaymentMethod) return

    const payment = {
      id: paymentHistory.length + 1,
      amount: Number.parseFloat(newPaymentAmount),
      date: new Date().toISOString().split("T")[0],
      method: newPaymentMethod,
      reference: `PAY-${String(paymentHistory.length + 1).padStart(3, "0")}`,
    }

    setPaymentHistory((prev) => [payment, ...prev])
    setNewPaymentAmount("")
    setNewPaymentMethod("")

    // Update payment status based on total paid
    const totalPaid = [...paymentHistory, payment].reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid >= taskData.totalCost) {
      handleFieldUpdate("paymentStatus", "Paid")
    } else if (totalPaid > 0) {
      handleFieldUpdate("paymentStatus", "Partially Paid")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned - Not Accepted":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Not Accepted</Badge>
      case "Diagnostic":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Diagnostic</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "Awaiting Parts":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Parts</Badge>
      case "Ready for QC":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Ready for QC</Badge>
      case "Ready for Pickup":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready for Pickup</Badge>
      case "Completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "High":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge variant="secondary">{urgency}</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_update":
        return <Settings className="h-4 w-4 text-blue-600" />
      case "note":
        return <MessageSquare className="h-4 w-4 text-gray-600" />
      case "diagnosis":
        return <ClipboardList className="h-4 w-4 text-purple-600" />
      case "customer_contact":
        return <Phone className="h-4 w-4 text-green-600" />
      case "intake":
        return <Plus className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task Details - {taskData.id}</h1>
          <p className="text-gray-600 mt-2">Complete information and management for this repair task</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(taskData.currentStatus)}
          {getUrgencyBadge(taskData.urgency)}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="repair" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Repair Details
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="financials" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Financials
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Customer Information
                  </CardTitle>
                  {canEditCustomer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                      className="border-gray-300 text-gray-600 bg-transparent"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                    {isEditingCustomer ? (
                      <Input
                        value={taskData.customerName}
                        onChange={(e) => handleFieldUpdate("customerName", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{taskData.customerName}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {isEditingCustomer ? (
                        <Input
                          value={taskData.customerPhone}
                          onChange={(e) => handleFieldUpdate("customerPhone", e.target.value)}
                        />
                      ) : (
                        <span className="text-gray-900">{taskData.customerPhone}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {isEditingCustomer ? (
                        <Input
                          value={taskData.customerEmail}
                          onChange={(e) => handleFieldUpdate("customerEmail", e.target.value)}
                        />
                      ) : (
                        <span className="text-gray-900">{taskData.customerEmail}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Laptop Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-red-600" />
                  Laptop Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Make & Model</Label>
                    <p className="text-gray-900 font-medium">
                      {taskData.laptopMake} {taskData.laptopModel}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Serial Number</Label>
                    <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border">
                      {taskData.serialNumber}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{taskData.currentLocation}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Repair Details Tab */}
        <TabsContent value="repair" className="space-y-6">
          <div className="grid gap-6">
            {/* Initial Issue */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Initial Issue Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-900 leading-relaxed">{taskData.initialIssue}</p>
                </div>
              </CardContent>
            </Card>

            {/* Repair Management */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Repair Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Assigned Technician</Label>
                    {canEditTechnician ? (
                      <Select
                        value={taskData.assignedTechnician}
                        onValueChange={(value) => handleFieldUpdate("assignedTechnician", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {technicianOptions.map((tech) => (
                            <SelectItem key={tech} value={tech}>
                              {tech}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900 p-2 bg-gray-50 rounded border">{taskData.assignedTechnician}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                    {canEditStatus ? (
                      <Select
                        value={taskData.currentStatus}
                        onValueChange={(value) => handleFieldUpdate("currentStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2">{getStatusBadge(taskData.currentStatus)}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                    <Select
                      value={taskData.currentLocation}
                      onValueChange={(value) => handleFieldUpdate("currentLocation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Urgency Level</Label>
                    <Select value={taskData.urgency} onValueChange={(value) => handleFieldUpdate("urgency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyOptions.map((urgency) => (
                          <SelectItem key={urgency} value={urgency}>
                            {urgency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Activity & Notes Log</CardTitle>
              <CardDescription>Chronological record of all task activities and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Note Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <Label className="text-sm font-medium text-gray-700">Add New Note</Label>
                <Textarea
                  placeholder="Enter your note, diagnosis, repair step, or communication details..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {/* Activity Log */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 bg-white border rounded-lg">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{activity.user}</span>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{activity.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cost Breakdown */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">Parts Cost</Label>
                    {canEditFinancials ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={taskData.partsCost}
                        onChange={(e) => handleFieldUpdate("partsCost", Number.parseFloat(e.target.value))}
                        className="w-24 text-right"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">${taskData.partsCost.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">Labor Cost</Label>
                    {canEditFinancials ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={taskData.laborCost}
                        onChange={(e) => handleFieldUpdate("laborCost", Number.parseFloat(e.target.value))}
                        className="w-24 text-right"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">${taskData.laborCost.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold text-gray-900">Total Cost</Label>
                      <span className="text-xl font-bold text-red-600">${taskData.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
                    {canEditFinancials ? (
                      <Select
                        value={taskData.paymentStatus}
                        onValueChange={(value) => handleFieldUpdate("paymentStatus", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900 font-medium mt-1">{taskData.paymentStatus}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Paid Date</Label>
                    <p className="text-gray-900 mt-1">{taskData.paidDate || "Not paid"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">Payment History</CardTitle>
                {canEditFinancials && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={newPaymentAmount}
                      onChange={(e) => setNewPaymentAmount(e.target.value)}
                      className="w-24"
                    />
                    <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAddPayment}
                      disabled={!newPaymentAmount || !newPaymentMethod}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Payment
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-green-600">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paymentHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">No payments recorded yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Dates & Milestones
              </CardTitle>
              <CardDescription>Key dates and milestones for this repair task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date In</Label>
                      <p className="text-gray-900 font-medium">{taskData.dateIn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Approved Date</Label>
                      <p className="text-gray-900 font-medium">{taskData.approvedDate || "Not approved"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Paid Date</Label>
                      <p className="text-gray-900 font-medium">{taskData.paidDate || "Not paid"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date Out</Label>
                      <p className="text-gray-900 font-medium">{taskData.dateOut || "Not completed"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="flex items-center gap-3">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Mail className="h-4 w-4 mr-2" />
                Send Customer Update
              </Button>
              {canMarkComplete && (
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              {canMarkPickedUp && (
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Picked Up
                </Button>
              )}
              {isAdmin && (
                <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancel Task
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
