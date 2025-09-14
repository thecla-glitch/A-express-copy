"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Label } from "@/components/ui/core/label"
import { Textarea } from "@/components/ui/core/textarea"
import { Badge } from "@/components/ui/core/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/core/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/feedback/alert-dialog"
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
import { getTask, updateTask, addTaskActivity, addTaskPayment, listTechnicians, getLocations } from "@/lib/api-client"
import { getTaskStatusOptions, getTaskPriorityOptions } from "@/lib/tasks-api"
import { SendCustomerUpdateDialog } from "./send-customer-update-dialog"
import { TaskActivityLog } from "./task-activity-log"

const paymentStatusOptions = ["Unpaid", "Partially Paid", "Paid", "Refunded"];
const paymentMethodOptions = ["Cash", "Credit Card", "Debit Card", "Check", "Digital Payment"];

interface TaskDetailsPageProps {
  taskId: string
}

export function TaskDetailsPage({ taskId }: TaskDetailsPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [taskData, setTaskData] = useState<any>(null)
  const [newNote, setNewNote] = useState("")
  const [newPaymentAmount, setNewPaymentAmount] = useState("")
  const [newPaymentMethod, setNewPaymentMethod] = useState("")
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [isEditingLaptop, setIsEditingLaptop] = useState(false)
  const [isEditingCost, setIsEditingCost] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [statusOptions, setStatusOptions] = useState<any[]>([])
  const [priorityOptions, setPriorityOptions] = useState<any[]>([])
  const [paymentStatusConfirmation, setPaymentStatusConfirmation] = useState<{ open: boolean, newStatus: string | null }>({ open: false, newStatus: null });
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState<string | null>(null);
  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null);


  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await getTask(taskId)
        setTaskData(response.data)
        if (response.data.next_payment_date) {
          setNextPaymentDate(response.data.next_payment_date)
        }
      } catch (error) {
        console.error(`Error fetching task ${taskId}:`, error)
      }
    }
    const fetchDropdownData = async () => {
      try {
        const [techs, locs, statuses, priorities] = await Promise.all([
          listTechnicians(),
          getLocations(),
          getTaskStatusOptions(),
          getTaskPriorityOptions(),
        ])
        setTechnicians(techs.data)
        setLocations(locs.data)
        setStatusOptions(statuses)
        setPriorityOptions(priorities)
      } catch (error) {
        console.error("Error fetching dropdown data:", error)
      }
    }
    fetchTask()
    fetchDropdownData()
  }, [taskId])

  // Role-based permissions
  const isAdmin = user?.role === "Administrator"
  const isManager = user?.role === "Manager"
  const isTechnician = user?.role === "Technician"
  const isFrontDesk = user?.role === "Front Desk"

  const canEditCustomer = isAdmin || isManager || isFrontDesk
  const canEditTechnician = isAdmin || isManager
  const canEditStatus = isAdmin || isTechnician || isFrontDesk
  const canEditFinancials = isAdmin || isManager
  const canMarkComplete = isAdmin || isTechnician
  const canMarkPickedUp = isAdmin || isFrontDesk
  const canEditPaymentStatus = isManager || isFrontDesk;
  const canEditEstimatedCost = isManager || (isTechnician && taskData && !taskData.assigned_to);


  const handleFieldUpdate = async (field: string, value: any) => {
    if (!taskData) return

    let updatedTask = { ...taskData, [field]: value }

    if (field === "assigned_to" && taskData.status === "Pending") {
        updatedTask.status = "In Progress";
    }

    setTaskData(updatedTask)

    try {
      await updateTask(taskData.id, { [field]: value })
      if (field === "assigned_to" && taskData.status === "Pending") {
        await updateTask(taskData.id, { status: "In Progress" })
      }
    } catch (error) {
      console.error(`Error updating task ${taskData.id}:`, error)
      // Optionally revert the change in UI
    }
  }

  const showConfirmationDialog = () => {
    if (pendingPaymentStatus) {
        setPaymentStatusConfirmation({ open: true, newStatus: pendingPaymentStatus });
    }
  };

  const cancelPendingChange = () => {
      setPendingPaymentStatus(null);
  }

  const confirmPaymentStatusChange = async () => {
    if (paymentStatusConfirmation.newStatus) {
      const payload: { payment_status: string; paid_date?: string, next_payment_date?: string | null } = {
        payment_status: paymentStatusConfirmation.newStatus,
      };
      if (paymentStatusConfirmation.newStatus === 'Partially Paid' || paymentStatusConfirmation.newStatus === 'Paid') {
        payload.paid_date = new Date().toISOString();
      }
      if (paymentStatusConfirmation.newStatus === 'Partially Paid') {
        payload.next_payment_date = nextPaymentDate;
      } else {
        payload.next_payment_date = null;
      }

      try {
        const response = await updateTask(taskData.id, payload);
        setTaskData(response.data);
      } catch (error) {
        console.error(`Error updating task ${taskData.id}:`, error)
      }
    }
    setPaymentStatusConfirmation({ open: false, newStatus: null });
    setPendingPaymentStatus(null);
  };

  const cancelPaymentStatusChange = () => {
    setPaymentStatusConfirmation({ open: false, newStatus: null });
  };


  const handleAddNote = async () => {
    if (!newNote.trim() || !taskData) return

    try {
      const response = await addTaskActivity(taskData.id, { message: newNote, type: 'note' })
      setTaskData({ ...taskData, activities: [...taskData.activities, response.data] })
      setNewNote("")
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  const handleAddPayment = async () => {
    if (!newPaymentAmount || !newPaymentMethod || !taskData) return

    try {
      const response = await addTaskPayment(taskData.id, { amount: newPaymentAmount, method: newPaymentMethod })
      const newPayment = response.data
      const updatedPayments = [...taskData.payments, newPayment]
      const totalPaid = updatedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)

      let paymentStatus = "Partially Paid"
      if (totalPaid >= parseFloat(taskData.total_cost)) {
        paymentStatus = "Paid"
      }

      const updatedTask = { ...taskData, payments: updatedPayments, payment_status: paymentStatus }
      setTaskData(updatedTask)
      await updateTask(taskData.id, { payment_status: paymentStatus })

      setNewPaymentAmount("")
      setNewPaymentMethod("")
    } catch (error) {
      console.error("Error adding payment:", error)
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

  const getFilteredPaymentStatusOptions = () => {
    if (!taskData) return paymentStatusOptions;
    if (taskData.payment_status === 'Paid') {
      return ['Paid', 'Refunded'];
    }
    if (taskData.payment_status === 'Partially Paid') {
      return ['Partially Paid', 'Paid', 'Refunded'];
    }
    return paymentStatusOptions;
  };

  if (!taskData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <AlertDialog open={paymentStatusConfirmation.open} onOpenChange={(open) => !open && cancelPaymentStatusChange()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the payment status to "{paymentStatusConfirmation.newStatus}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPaymentStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPaymentStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600" onClick={() => router.push('/dashboard/tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task Details - {taskData.id}</h1>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(taskData.status)}
            {getUrgencyBadge(taskData.urgency)}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SendCustomerUpdateDialog taskId={taskId} customerEmail={taskData.customer_email} />
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="repair-management" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Repair Management
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            History
          </TabsTrigger>
          <TabsTrigger value="financials" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Financials
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
                        value={taskData.customer_name || ''}
                        onChange={(e) => handleFieldUpdate("customer_name", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{taskData.customer_name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {isEditingCustomer ? (
                        <Input
                          value={taskData.customer_phone || ''}
                          onChange={(e) => handleFieldUpdate("customer_phone", e.target.value)}
                        />
                      ) : (
                        <span className="text-gray-900">{taskData.customer_phone}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {isEditingCustomer ? (
                        <Input
                          value={taskData.customer_email || ''}
                          onChange={(e) => handleFieldUpdate("customer_email", e.target.value)}
                        />
                      ) : (
                        <span className="text-gray-900">{taskData.customer_email}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Laptop Information */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Laptop className="h-5 w-5 text-red-600" />
                    Laptop Information
                  </CardTitle>
                  {(isAdmin || isManager) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingLaptop(!isEditingLaptop)}
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
                    <Label className="text-sm font-medium text-gray-600">Make & Model</Label>
                    {isEditingLaptop ? (
                      <div className="flex gap-2">
                        <Input
                          value={taskData.laptop_make || ''}
                          onChange={(e) => handleFieldUpdate("laptop_make", e.target.value)}
                          className="mt-1"
                        />
                        <Input
                          value={taskData.laptop_model || ''}
                          onChange={(e) => handleFieldUpdate("laptop_model", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {taskData.laptop_make} {taskData.laptop_model}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Serial Number</Label>
                    {isEditingLaptop ? (
                      <Input
                        value={taskData.serial_number || ''}
                        onChange={(e) => handleFieldUpdate("serial_number", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border">
                        {taskData.serial_number}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{taskData.current_location}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Negotiated By</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      {isEditingLaptop && isManager ? (
                        <Input
                          value={taskData.negotiated_by_details?.full_name || ''}
                          onChange={(e) => handleFieldUpdate("negotiated_by", e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <span className="text-gray-900">{taskData.negotiated_by_details?.full_name || taskData.created_by_details?.full_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Initial Issue */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Initial Issue Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-900 leading-relaxed">{taskData.description}</p>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Repair Management Tab */}
        <TabsContent value="repair-management" className="space-y-6">
          <div className="grid gap-6">
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
                        value={taskData.assigned_to || ''}
                        onValueChange={(value) => handleFieldUpdate("assigned_to", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900 p-2 bg-gray-50 rounded border">{taskData.assigned_to_details?.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                    {canEditStatus ? (
                      <Select
                        value={taskData.status || ''}
                        onValueChange={(value) => handleFieldUpdate("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status[0]} value={status[0]}>
                              {status[1]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2">{getStatusBadge(taskData.status)}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                    <Select
                      value={taskData.current_location || ''}
                      onValueChange={(value) => handleFieldUpdate("current_location", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Urgency Level</Label>
                    <Select value={taskData.urgency || ''} onValueChange={(value) => handleFieldUpdate("urgency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority[0]} value={priority[0]}>
                            {priority[1]}
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

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <TaskActivityLog taskId={taskId} />
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
                      <p className="text-gray-900 font-medium">{taskData.date_in}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Approved Date</Label>
                      <p className="text-gray-900 font-medium">{taskData.approved_date || "Not approved"}</p>
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
                      <p className="text-gray-900 font-medium">{taskData.paid_date || "Not paid"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date Out</Label>
                      <p className="text-gray-900 font-medium">{taskData.date_out || "Not completed"}</p>
                    </div>
                  </div>
                </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    Cost Breakdown
                  </CardTitle>
                  {canEditEstimatedCost && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCost(!isEditingCost)}
                      className="border-gray-300 text-gray-600 bg-transparent"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {isEditingCost ? "Done" : "Edit"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">Parts Cost</Label>
                    <span className="font-medium text-gray-900">TSh {parseFloat(taskData.parts_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600">Estimated Cost</Label>
                    {isEditingCost ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={taskData.estimated_cost || ''}
                        onChange={(e) => handleFieldUpdate("estimated_cost", e.target.value ? Number.parseFloat(e.target.value) : null)}
                        className="w-24 text-right"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">TSh {parseFloat(taskData.estimated_cost || 0).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold text-gray-900">Total Cost</Label>
                      <span className="text-xl font-bold text-red-600">TSh {parseFloat(taskData.total_cost || 0).toFixed(2)}</span>
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
                    {canEditPaymentStatus ? (
                      <RadioGroup
                        value={pendingPaymentStatus || taskData.payment_status || ''}
                        onValueChange={setPendingPaymentStatus}
                        className="mt-2 flex items-center gap-4"
                      >
                        {getFilteredPaymentStatusOptions().map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <RadioGroupItem value={status} id={status} />
                            <Label htmlFor={status} className="font-normal">{status}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <p className="text-gray-900 font-medium mt-1">{taskData.payment_status}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Paid Date</Label>
                    <p className="text-gray-900 mt-1">{taskData.paid_date ? new Date(taskData.paid_date).toLocaleString() : "Not paid"}</p>
                  </div>
                  {(pendingPaymentStatus === 'Partially Paid' || (!pendingPaymentStatus && taskData.payment_status === 'Partially Paid')) && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Next Payment Date</Label>
                      <Input
                        type="date"
                        value={nextPaymentDate || ''}
                        onChange={(e) => setNextPaymentDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              {canEditPaymentStatus && pendingPaymentStatus && pendingPaymentStatus !== taskData.payment_status && (
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={cancelPendingChange}>Cancel</Button>
                  <Button size="sm" onClick={showConfirmationDialog}>Confirm</Button>
                </CardFooter>
              )}
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
                  {taskData.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-green-600">TSh {parseFloat(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {taskData.payments.length === 0 && (
                <div className="text-center py-8 text-gray-500">No payments recorded yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}