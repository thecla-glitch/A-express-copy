"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Badge } from "@/components/ui/core/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs"
import { Label } from "@/components/ui/core/label"
import { Textarea } from "@/components/ui/core/textarea"
import {
  Plus,
  User as UserIcon,
  Laptop,
  Mail,
  DollarSign,
  Package,
  CheckCircle,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getTasks, createTask, updateTask, deleteTask, apiClient } from "@/lib/api-client"
import { User } from "@/lib/use-user-management"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/feedback/alert-dialog"
import { TasksDisplay } from "./tasks-display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { getAllowedStatusTransitions } from "@/lib/status-transitions"

interface NewTaskForm {
  customer_name: string
  customer_phone: string
  customer_email: string
  laptop_make: string
  laptop_model: string
  serial_number: string
  description: string
  urgency: string
  assigned_to: string
  estimated_cost: string
}

export function ManagerTasksPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("list")
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [technicians, setTechnicians] = useState<User[]>([])

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState<NewTaskForm>({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    laptop_make: "",
    laptop_model: "",
    serial_number: "",
    description: "",
    urgency: "Medium",
    assigned_to: "",
    estimated_cost: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const tasksResponse = await getTasks()
        if (tasksResponse.data) {
          setTasks(tasksResponse.data)
        } else if (tasksResponse.error) {
          setError(tasksResponse.error)
        }

        const techResponse = await apiClient.get("/users/role/Technician/")
        if (techResponse.data) {
          setTechnicians(techResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteTask = async (taskId: string) => {
    const response = await deleteTask(taskId)
    if (response.error) {
      console.error("Error deleting task:", response.error)
    } else {
      setTasks(tasks.filter((task) => task.id !== taskId))
    }
  }

  const handleRowClick = (task: any) => {
    setSelectedTask(task)
    setActiveTab("details")
  }

  const handleCreateTask = async () => {
    try {
      const response = await createTask(newTaskForm)
      if (response.data) {
        setTasks((prev) => [response.data, ...prev])
      } else {
        console.error("Error creating task:", response.error)
      }
      setNewTaskForm({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        laptop_make: "",
        laptop_model: "",
        serial_number: "",
        description: "",
        urgency: "Medium",
        assigned_to: "",
        estimated_cost: "",
      })
      setActiveTab("list")
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const handleUpdateTask = async (field: string, value: any) => {
    if (!selectedTask) return

    const updatedTask = { ...selectedTask, [field]: value }
    setSelectedTask(updatedTask)

    try {
      await updateTask(selectedTask.id, { [field]: value })
      setTasks((prev) => prev.map((task) => (task.id === selectedTask.id ? updatedTask : task)))
    } catch (error) {
      console.error(`Error updating task ${selectedTask.id}:`, error)
    }
  }

  const handleProcessPickup = (taskId: string) => {
    handleUpdateTask("status", "Completed")
    handleUpdateTask("current_location", "Completed")
    handleUpdateTask("payment_status", "Paid")
    alert("Pickup processed successfully!")
  }

  const uniqueTechnicians = useMemo(() => {
    return technicians.map((tech) => ({ id: tech.id, full_name: `${tech.first_name} ${tech.last_name}`.trim() }))
  }, [technicians])

  const allowedStatuses = useMemo(() => {
    if (!user || !selectedTask) return []
    return getAllowedStatusTransitions(user.role, selectedTask.status)
  }, [user, selectedTask])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manager Tasks Portal</h1>
        <p className="text-gray-600 mt-2">Complete task management with Front Desk workflow capabilities</p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="list" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Tasks List
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            New Task
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Task Details
          </TabsTrigger>
        </TabsList>

        {/* Tasks List Tab */}
        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Tasks Overview</h3>
            <Button onClick={() => setActiveTab("create")} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </Button>
          </div>
          <TasksDisplay
            tasks={tasks}
            technicians={technicians}
            onRowClick={handleRowClick}
            showActions={true}
            onDeleteTask={handleDeleteTask}
            onProcessPickup={handleProcessPickup}
          />
        </TabsContent>

        {/* New Task Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-red-600" />
                Create New Repair Task
              </CardTitle>
              <CardDescription>Enter customer and device information to create a new repair task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-red-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">Customer Name *</Label>
                      <Input
                        id="customer_name"
                        value={newTaskForm.customer_name}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, customer_name: e.target.value })}
                        placeholder="Enter customer full name"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_phone">Phone Number *</Label>
                      <Input
                        id="customer_phone"
                        value={newTaskForm.customer_phone}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, customer_phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_email">Email Address</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        value={newTaskForm.customer_email}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, customer_email: e.target.value })}
                        placeholder="customer@email.com"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Device Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Laptop className="h-5 w-5 text-red-600" />
                    Device Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="laptop_make">Make *</Label>
                        <Input
                          id="laptop_make"
                          value={newTaskForm.laptop_make}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, laptop_make: e.target.value })}
                          placeholder="e.g., Apple, Dell, HP"
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="laptop_model">Model *</Label>
                        <Input
                          id="laptop_model"
                          value={newTaskForm.laptop_model}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, laptop_model: e.target.value })}
                          placeholder='e.g., MacBook Pro 13"'
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serial_number">Serial Number *</Label>
                      <Input
                        id="serial_number"
                        value={newTaskForm.serial_number}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, serial_number: e.target.value })}
                        placeholder="Enter device serial number"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assigned_to">Assigned Technician</Label>
                      <Select
                        value={newTaskForm.assigned_to}
                        onValueChange={(value) => setNewTaskForm({ ...newTaskForm, assigned_to: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                          <SelectValue placeholder="Select technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueTechnicians.map((technician) => (
                            <SelectItem key={technician.id} value={technician.id.toString()}>
                              {technician.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Issue Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={newTaskForm.urgency}
                      onValueChange={(value) => setNewTaskForm({ ...newTaskForm, urgency: value })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
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
                    <Label htmlFor="estimated_cost">Estimated Cost</Label>
                    <Input
                      id="estimated_cost"
                      type="number"
                      step="0.01"
                      value={newTaskForm.estimated_cost}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, estimated_cost: e.target.value })}
                      placeholder="0.00"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Issue Description *</Label>
                  <Textarea
                    id="description"
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                    placeholder="Describe the problem in detail..."
                    rows={4}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("list")}
                  className="border-gray-300 text-gray-700 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={
                    !newTaskForm.customer_name ||
                    !newTaskForm.customer_phone ||
                    !newTaskForm.laptop_make ||
                    !newTaskForm.laptop_model ||
                    !newTaskForm.serial_number ||
                    !newTaskForm.description
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {selectedTask ? (
            <div className="grid gap-6">
              {/* Task Header */}
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        Task Details - {selectedTask.id}
                      </CardTitle>
                      <CardDescription>Complete task information and management</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{selectedTask.status}</Badge>
                      <Badge>{selectedTask.urgency}</Badge>
                      <Badge>{selectedTask.payment_status}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Information */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-red-600" />
                        Customer Information
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                        className="border-gray-300 text-gray-600 bg-transparent"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {isEditingCustomer ? "Save" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                        {isEditingCustomer ? (
                          <Input
                            value={selectedTask.customer_name}
                            onChange={(e) => handleUpdateTask("customer_name", e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium mt-1">{selectedTask.customer_name}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {isEditingCustomer ? (
                            <Input
                              value={selectedTask.customer_phone}
                              onChange={(e) => handleUpdateTask("customer_phone", e.target.value)}
                            />
                          ) : (
                            <span className="text-gray-900">{selectedTask.customer_phone}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {isEditingCustomer ? (
                            <Input
                              value={selectedTask.customer_email}
                              onChange={(e) => handleUpdateTask("customer_email", e.target.value)}
                            />
                          ) : (
                            <span className="text-gray-900">{selectedTask.customer_email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Device & Payment Information */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Laptop className="h-5 w-5 text-red-600" />
                      Device & Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Device</Label>
                        <p className="text-gray-900 font-medium mt-1">{selectedTask.laptop_model}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Serial Number</Label>
                        <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border mt-1">
                          {selectedTask.serial_number}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Total Cost</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            step="0.01"
                            value={selectedTask.total_cost}
                            onChange={(e) => handleUpdateTask("total_cost", Number.parseFloat(e.target.value))}
                            className="w-32"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
                        <Select
                          value={selectedTask.payment_status}
                          onValueChange={(value) => handleUpdateTask("payment_status", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                            <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Task Management */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                      <Select
                        value={selectedTask.status}
                        onValueChange={(value) => handleUpdateTask("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Assigned Technician</Label>
                      <Select
                        value={selectedTask.assigned_to}
                        onValueChange={(value) => handleUpdateTask("assigned_to", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueTechnicians.map((technician) => (
                            <SelectItem key={technician.id} value={technician.id.toString()}>
                              {technician.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Current Location</Label>
                      <Select
                        value={selectedTask.current_location}
                        onValueChange={(value) => handleUpdateTask("current_location", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Front Desk Intake">Front Desk Intake</SelectItem>
                          <SelectItem value="Diagnostic Station">Diagnostic Station</SelectItem>
                          <SelectItem value="Repair Bay 1">Repair Bay 1</SelectItem>
                          <SelectItem value="Repair Bay 2">Repair Bay 2</SelectItem>
                          <SelectItem value="Parts Storage">Parts Storage</SelectItem>
                          <SelectItem value="Quality Control">Quality Control</SelectItem>
                          <SelectItem value="Front Desk">Front Desk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Issue Description */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Issue Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-900 leading-relaxed">{selectedTask.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <div className="flex items-center gap-3">
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Customer Update
                      </Button>
                      {selectedTask.status === "Ready for Pickup" && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleProcessPickup(selectedTask.id)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Process Pickup
                        </Button>
                      )}
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleUpdateTask("status", "Completed")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Selected</h3>
                <p className="text-gray-600 mb-4">Select a task from the Tasks List to view and edit details</p>
                <Button onClick={() => setActiveTab("list")} className="bg-red-600 hover:bg-red-700 text-white">
                  Go to Tasks List
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}