"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Badge } from "@/components/ui/core/badge"
import { Textarea } from "@/components/ui/core/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog"
import { Label } from "@/components/ui/core/label"
import {
  Search,
  UserPlus,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Laptop,
  User,
  Phone,
  Calendar,
  DollarSign,
  HelpCircle,
  Users,
} from "lucide-react"

// Mock data for new tasks awaiting assignment or collaboration
const newAssignments = [
  {
    id: "T-1028",
    customerName: "Robert Johnson",
    laptopModel: "MacBook Air 13",
    issue: "Liquid damage - won't turn on",
    priority: "High",
    dateCreated: "2024-01-16",
    estimatedCost: "$450.00",
    urgency: "High",
    phone: "(555) 789-0123",
  },
  {
    id: "T-1029",
    customerName: "Linda Martinez",
    laptopModel: "Dell Inspiron 15",
    issue: "Blue screen errors and random shutdowns",
    priority: "Medium",
    dateCreated: "2024-01-16",
    estimatedCost: "$199.99",
    urgency: "Medium",
    phone: "(555) 456-7890",
  },
  {
    id: "T-1030",
    customerName: "Kevin Wong",
    laptopModel: "HP Envy x360",
    issue: "Need help with motherboard replacement",
    priority: "Medium",
    dateCreated: "2024-01-15",
    estimatedCost: "$320.00",
    urgency: "Low",
    phone: "(555) 321-6543",
    isCollaboration: true,
    originalTechnician: "tech2",
    collaborationReason:
      "Need assistance with micro-soldering on the motherboard. Complex repair requiring two technicians.",
  },
]

// Mock data for assigned tasks
const assignedTasks = [
  {
    id: "T-1025",
    customerName: "Sarah Connor",
    laptopModel: "MacBook Pro 16",
    issue: "Screen replacement needed",
    status: "In Progress",
    priority: "High",
    dateAssigned: "2024-01-15",
    estimatedCost: "$299.99",
    phone: "(555) 123-4567",
    urgency: "High",
  },
  {
    id: "T-1026",
    customerName: "Mike Davis",
    laptopModel: "Lenovo ThinkPad X1",
    issue: "Keyboard replacement and cleaning",
    status: "Awaiting Parts",
    priority: "Medium",
    dateAssigned: "2024-01-14",
    estimatedCost: "$149.50",
    phone: "(555) 987-6543",
    urgency: "Medium",
  },
  {
    id: "T-1027",
    customerName: "Emily Johnson",
    laptopModel: "ASUS ROG Gaming",
    issue: "Overheating issues - thermal paste replacement",
    status: "In Progress",
    priority: "Low",
    dateAssigned: "2024-01-13",
    estimatedCost: "$89.99",
    phone: "(555) 555-0123",
    urgency: "Low",
  },
  {
    id: "T-1024",
    customerName: "David Wilson",
    laptopModel: "Surface Laptop 4",
    issue: "Battery replacement completed",
    status: "Completed",
    priority: "Medium",
    dateAssigned: "2024-01-12",
    estimatedCost: "$179.99",
    phone: "(555) 111-2222",
    urgency: "Medium",
  },
]

export function TechnicianTasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [collaborationReason, setCollaborationReason] = useState("")
  const [isSubmittingCollaboration, setIsSubmittingCollaboration] = useState(false)
  const [isAcceptingTask, setIsAcceptingTask] = useState(false)
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null)

  // Filter assigned tasks based on search query
  const filteredTasks = assignedTasks.filter(
    (task) =>
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.laptopModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAcceptTask = async (taskId: string) => {
    setIsAcceptingTask(true)
    setAcceptingTaskId(taskId)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert(`Task ${taskId} has been accepted and added to your assigned tasks!`)
    setIsAcceptingTask(false)
    setAcceptingTaskId(null)
  }

  const handleRequestCollaboration = async () => {
    if (!selectedTask || !collaborationReason.trim()) return

    setIsSubmittingCollaboration(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert(`Collaboration request for task ${selectedTask.id} has been submitted successfully!`)
    setIsSubmittingCollaboration(false)
    setSelectedTask(null)
    setCollaborationReason("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "Awaiting Parts":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Awaiting Parts</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "Awaiting Parts":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-2">Manage your assigned tasks and collaboration requests</p>
      </div>

      {/* New Assignments/Collaboration Requests */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-red-600" />
            New Assignments & Collaboration Requests
          </CardTitle>
          <CardDescription className="text-red-800">
            Tasks awaiting your acceptance or collaboration expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newAssignments.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-red-200 p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      {task.isCollaboration ? (
                        <Users className="h-5 w-5 text-red-600" />
                      ) : (
                        <Wrench className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-red-600">{task.id}</span>
                        <span className="font-medium text-gray-900">{task.customerName}</span>
                        {getUrgencyBadge(task.urgency)}
                        {task.isCollaboration && (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Collaboration</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Laptop className="h-3 w-3" />
                          {task.laptopModel}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {task.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {task.estimatedCost}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Created: {task.dateCreated}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Issue Description:</h4>
                  <p className="text-sm text-gray-700">{task.issue}</p>

                  {task.isCollaboration && task.collaborationReason && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Collaboration Request from {task.originalTechnician}:
                      </h4>
                      <p className="text-sm text-purple-800 bg-purple-50 p-3 rounded">{task.collaborationReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleAcceptTask(task.id)}
                    disabled={isAcceptingTask && acceptingTaskId === task.id}
                  >
                    {isAcceptingTask && acceptingTaskId === task.id ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Accept Job
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {newAssignments.length === 0 && (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">No new assignments</h3>
                <p className="text-red-800">All available tasks have been assigned</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Assigned Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            My Assigned Tasks ({assignedTasks.length})
          </CardTitle>
          <CardDescription>Tasks currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your tasks by ID, customer, laptop model, issue, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">{getStatusIcon(task.status)}</div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-blue-600">{task.id}</span>
                        <span className="font-medium text-gray-900">{task.customerName}</span>
                        {getStatusBadge(task.status)}
                        {getUrgencyBadge(task.urgency)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Laptop className="h-3 w-3" />
                          {task.laptopModel}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {task.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {task.estimatedCost}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.dateAssigned}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Issue Description:</h4>
                  <p className="text-sm text-gray-700">{task.issue}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                  >
                    <User className="h-3 w-3 mr-1" />
                    View Details
                  </Button>

                  {task.status !== "Completed" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                          onClick={() => setSelectedTask(task)}
                        >
                          <HelpCircle className="h-3 w-3 mr-1" />
                          Request Help
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Request Collaboration</DialogTitle>
                          <DialogDescription>Request help from other technicians for this task</DialogDescription>
                        </DialogHeader>

                        {selectedTask && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <h4 className="font-medium text-gray-900">Task Details:</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>ID:</strong> {selectedTask.id}
                                </p>
                                <p>
                                  <strong>Customer:</strong> {selectedTask.customerName}
                                </p>
                                <p>
                                  <strong>Device:</strong> {selectedTask.laptopModel}
                                </p>
                                <p>
                                  <strong>Issue:</strong> {selectedTask.issue}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="collaboration-reason">Why do you need help with this task? *</Label>
                              <Textarea
                                id="collaboration-reason"
                                placeholder="Please explain what specific help you need (e.g., second opinion, specialized skills, complex procedure, etc.)"
                                value={collaborationReason}
                                onChange={(e) => setCollaborationReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                              />
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedTask(null)
                              setCollaborationReason("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleRequestCollaboration}
                            disabled={!collaborationReason.trim() || isSubmittingCollaboration}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {isSubmittingCollaboration ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Submit Request
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">No tasks match your search for "{searchQuery}"</p>
                <Button
                  variant="outline"
                  className="mt-4 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            )}

            {filteredTasks.length === 0 && !searchQuery && (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned tasks</h3>
                <p className="text-gray-600">You don't have any tasks assigned at the moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
