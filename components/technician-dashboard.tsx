"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Laptop,
  TrendingUp,
  Wrench,
  FileText,
  Star,
  Timer,
  Calendar,
  Search,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Mock data for technician's assigned tasks
const assignedTasks = [
  {
    id: "T-1025",
    customerName: "David Wilson",
    laptopModel: "MacBook Air M2",
    issue: "Screen replacement needed",
    priority: "High",
    assignedDate: "2024-01-15",
    dueDate: "2024-01-17",
    status: "Assigned - Not Accepted",
    estimatedTime: "2-3 hours",
    description: "Customer reports cracked screen after dropping laptop. Screen is functional but has visible cracks.",
    customerPhone: "(555) 123-4567",
    partsRequired: ["MacBook Air M2 Screen Assembly", "Adhesive Strips"],
  },
  {
    id: "T-1023",
    customerName: "Jennifer Lee",
    laptopModel: "Dell XPS 13",
    issue: "Keyboard not responding",
    priority: "Medium",
    assignedDate: "2024-01-14",
    dueDate: "2024-01-16",
    status: "In Progress",
    estimatedTime: "1-2 hours",
    startedDate: "2024-01-15",
    description: "Several keys not responding, likely liquid damage. Customer spilled coffee on keyboard.",
    customerPhone: "(555) 987-6543",
    partsRequired: ["Dell XPS 13 Keyboard"],
    workLog: [
      { time: "10:30 AM", note: "Started diagnosis - confirmed liquid damage" },
      { time: "11:15 AM", note: "Ordered replacement keyboard" },
    ],
  },
  {
    id: "T-1021",
    customerName: "Robert Chen",
    laptopModel: "HP Pavilion",
    issue: "Hard drive replacement",
    priority: "Medium",
    assignedDate: "2024-01-13",
    dueDate: "2024-01-15",
    status: "Awaiting Parts",
    estimatedTime: "1 hour",
    partsNeeded: "1TB SSD",
    description: "Hard drive making clicking noises, SMART test shows imminent failure.",
    customerPhone: "(555) 456-7890",
    partsRequired: ["1TB SSD", "SATA Cable"],
  },
  {
    id: "T-1019",
    customerName: "Amanda Rodriguez",
    laptopModel: "Lenovo ThinkPad",
    issue: "Battery replacement",
    priority: "Low",
    assignedDate: "2024-01-12",
    dueDate: "2024-01-16",
    status: "In Progress",
    estimatedTime: "30 minutes",
    startedDate: "2024-01-14",
    description: "Battery not holding charge, needs replacement.",
    customerPhone: "(555) 111-2222",
    partsRequired: ["Lenovo ThinkPad Battery"],
  },
]

// Mock performance data
const performanceData = {
  tasksCompletedThisWeek: 12,
  averageTimePerRepair: "2.3 hours",
  onTimeCompletionRate: "94%",
  customerSatisfactionScore: "4.8/5",
  totalTasksCompleted: 156,
  averageRating: 4.8,
  certifications: ["CompTIA A+", "Apple Certified Mac Technician", "Dell Certified Technician"],
}

// Mock completed tasks for history
const completedTasks = [
  {
    id: "T-1020",
    customerName: "Amanda Rodriguez",
    laptopModel: "Lenovo ThinkPad",
    issue: "Battery replacement",
    completedDate: "2024-01-14",
    timeSpent: "45 minutes",
    customerRating: 5,
    customerFeedback: "Excellent service, very professional and quick!",
  },
  {
    id: "T-1018",
    customerName: "Michael Brown",
    laptopModel: "ASUS ROG",
    issue: "Overheating issues",
    completedDate: "2024-01-13",
    timeSpent: "2.5 hours",
    customerRating: 4,
    customerFeedback: "Good work, laptop runs much cooler now.",
  },
  {
    id: "T-1016",
    customerName: "Sarah Johnson",
    laptopModel: "MacBook Pro",
    issue: "Screen flickering",
    completedDate: "2024-01-12",
    timeSpent: "1.5 hours",
    customerRating: 5,
    customerFeedback: "Perfect repair, screen works like new!",
  },
]

export function TechnicianDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState(assignedTasks)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [workNote, setWorkNote] = useState("")
  const [taskSearchQuery, setTaskSearchQuery] = useState("")
  const [historySearchQuery, setHistorySearchQuery] = useState("")

  const handleAcceptJob = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "In Progress", startedDate: new Date().toISOString().split("T")[0] }
          : task,
      ),
    )
  }

  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const handleAddWorkNote = (taskId: string) => {
    if (!workNote.trim()) return

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const updatedWorkLog = task.workLog
            ? [...task.workLog, { time: currentTime, note: workNote }]
            : [{ time: currentTime, note: workNote }]
          return { ...task, workLog: updatedWorkLog }
        }
        return task
      }),
    )
    setWorkNote("")
  }

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!taskSearchQuery) return tasks

    return tasks.filter(
      (task) =>
        task.id.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.customerName.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.laptopModel.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.issue.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(taskSearchQuery.toLowerCase()),
    )
  }, [tasks, taskSearchQuery])

  // Filter completed tasks based on search query
  const filteredCompletedTasks = useMemo(() => {
    if (!historySearchQuery) return completedTasks

    return completedTasks.filter(
      (task) =>
        task.id.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        task.customerName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        task.laptopModel.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        task.issue.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        task.customerFeedback.toLowerCase().includes(historySearchQuery.toLowerCase()),
    )
  }, [historySearchQuery])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned - Not Accepted":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Not Accepted</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "Awaiting Parts":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Parts</Badge>
      case "Ready for QC":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Ready for QC</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  // Group filtered tasks by status
  const tasksByStatus = {
    "Assigned - Not Accepted": filteredTasks.filter((task) => task.status === "Assigned - Not Accepted"),
    "In Progress": filteredTasks.filter((task) => task.status === "In Progress"),
    "Awaiting Parts": filteredTasks.filter((task) => task.status === "Awaiting Parts"),
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Technician Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here are your assigned tasks and performance metrics.
        </p>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed This Week</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.tasksCompletedThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Time Per Repair</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.averageTimePerRepair}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Completion</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.onTimeCompletionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.customerSatisfactionScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">Task History</TabsTrigger>
          <TabsTrigger value="tools">Tools & Resources</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Task Search */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks by ID, customer name, laptop model, or issue..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              {taskSearchQuery && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                  {filteredTasks.length === 0 && (
                    <span className="text-red-600 ml-2">No tasks found matching "{taskSearchQuery}"</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks Awaiting Acceptance */}
          {tasksByStatus["Assigned - Not Accepted"].length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Tasks Awaiting Acceptance
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    {tasksByStatus["Assigned - Not Accepted"].length}
                  </Badge>
                </CardTitle>
                <CardDescription>New tasks assigned to you that need acceptance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasksByStatus["Assigned - Not Accepted"].map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Laptop className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-red-600">{task.id}</span>
                            <span className="font-medium text-gray-900">{task.customerName}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {task.laptopModel} - {task.issue}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Due: {task.dueDate}</span>
                            <span>Est. Time: {task.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        >
                          View Details
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleAcceptJob(task.id)}
                        >
                          Accept Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks In Progress */}
          {tasksByStatus["In Progress"].length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Tasks In Progress
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {tasksByStatus["In Progress"].length}
                  </Badge>
                </CardTitle>
                <CardDescription>Tasks you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasksByStatus["In Progress"].map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Wrench className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-red-600">{task.id}</span>
                              <span className="font-medium text-gray-900">{task.customerName}</span>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {task.laptopModel} - {task.issue}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(value) => handleStatusUpdate(task.id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Awaiting Parts">Awaiting Parts</SelectItem>
                              <SelectItem value="Ready for QC">Ready for QC</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Work Log */}
                      {task.workLog && task.workLog.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Work Log
                          </h4>
                          <div className="space-y-2">
                            {task.workLog.map((log, index) => (
                              <div key={index} className="flex gap-3 text-sm">
                                <span className="text-gray-500 font-mono">{log.time}</span>
                                <span className="text-gray-700">{log.note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Work Note */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add work note..."
                          value={workNote}
                          onChange={(e) => setWorkNote(e.target.value)}
                          className="flex-1"
                          rows={2}
                        />
                        <Button onClick={() => handleAddWorkNote(task.id)} disabled={!workNote.trim()}>
                          <span className="h-4 w-4 mr-2">+</span>
                          Add Note
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks Awaiting Parts */}
          {tasksByStatus["Awaiting Parts"].length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-yellow-600" />
                  Tasks Awaiting Parts
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    {tasksByStatus["Awaiting Parts"].length}
                  </Badge>
                </CardTitle>
                <CardDescription>Tasks on hold waiting for parts to arrive</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasksByStatus["Awaiting Parts"].map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Package className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-red-600">{task.id}</span>
                            <span className="font-medium text-gray-900">{task.customerName}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {task.laptopModel} - {task.issue}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Parts Needed: {task.partsNeeded}</span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 hover:bg-yellow-50 bg-transparent"
                        >
                          Check Parts Status
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-50 bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Tasks Found */}
          {taskSearchQuery && filteredTasks.length === 0 && (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">No tasks match your search for "{taskSearchQuery}"</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setTaskSearchQuery("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Tasks Completed</span>
                  <span className="font-bold text-2xl">{performanceData.totalTasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Customer Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">{performanceData.averageRating}</span>
                    <div className="flex">{renderStars(Math.floor(performanceData.averageRating))}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">On-Time Completion Rate</span>
                  <span className="font-bold text-2xl text-green-600">{performanceData.onTimeCompletionRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Repair Time</span>
                  <span className="font-bold text-2xl">{performanceData.averageTimePerRepair}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* History Search */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search completed tasks by ID, customer name, laptop model, or feedback..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              {historySearchQuery && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {filteredCompletedTasks.length} of {completedTasks.length} completed tasks
                  {filteredCompletedTasks.length === 0 && (
                    <span className="text-red-600 ml-2">No completed tasks found matching "{historySearchQuery}"</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recently Completed Tasks
              </CardTitle>
              <CardDescription>Your recent completed repairs and customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCompletedTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-red-600">{task.id}</span>
                          <span className="font-medium text-gray-900">{task.customerName}</span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {task.laptopModel} - {task.issue}
                        </p>
                        <div className="text-sm text-gray-500 mt-1">
                          <p>Completed: {task.completedDate}</p>
                          <p>Time: {task.timeSpent}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Customer Rating:</span>
                          <div className="flex">{renderStars(task.customerRating)}</div>
                          <span className="text-sm text-gray-600">({task.customerRating}/5)</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{task.customerFeedback}"</p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCompletedTasks.length === 0 && historySearchQuery && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed tasks found</h3>
                    <p className="text-gray-600">No completed tasks match your search for "{historySearchQuery}"</p>
                    <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setHistorySearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-5 w-5">🔍</span>
                  Quick Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <span className="h-4 w-4 mr-2">📝</span>
                  Repair Manuals
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <span className="h-4 w-4 mr-2">📦</span>
                  Parts Catalog
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <span className="h-4 w-4 mr-2">📷</span>
                  Photo Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <span className="h-4 w-4 mr-2">💬</span>
                  Customer Communication
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-5 w-5">⚠️</span>
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Emergency Contacts</h4>
                  <p className="text-sm text-blue-700">Manager: (555) 100-0001</p>
                  <p className="text-sm text-blue-700">Parts Dept: (555) 100-0002</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Common Procedures</h4>
                  <p className="text-sm text-green-700">Data backup before repair</p>
                  <p className="text-sm text-green-700">Quality check before completion</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
