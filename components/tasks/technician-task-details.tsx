import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Badge } from "@/components/ui/core/badge"
import { Button } from "@/components/ui/core/button"
import { Textarea } from "@/components/ui/core/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { Separator } from "@/components/ui/core/separator"
import { ScrollArea } from "@/components/ui/layout/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog"
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Printer,
  Calendar,
  Wrench,
  MessageSquare,
  CheckCircle,
  Package,
  Users,
  FileText,
  Plus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getTask, updateTask, addTaskActivity, listWorkshopLocations, listWorkshopTechnicians } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface TechnicianTaskDetailsProps {
  taskId: string
}

export function TechnicianTaskDetails({ taskId }: TechnicianTaskDetailsProps) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState("note")
  const [status, setStatus] = useState("")
  const [isSendToWorkshopDialogOpen, setIsSendToWorkshopDialogOpen] = useState(false)
  const [workshopLocations, setWorkshopLocations] = useState<any[]>([])
  const [workshopTechnicians, setWorkshopTechnicians] = useState<any[]>([])
  const [selectedWorkshopLocation, setSelectedWorkshopLocation] = useState<string | undefined>(undefined)
  const [selectedWorkshopTechnician, setSelectedWorkshopTechnician] = useState<string | undefined>(undefined)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadTaskDetails()
    fetchWorkshopLocations()
    fetchWorkshopTechnicians()
  }, [taskId])

  const loadTaskDetails = async () => {
    try {
      setLoading(true)
      const response = await getTask(taskId)
      const taskData = response.data
      setTask(taskData)
      setStatus(taskData.status)
    } catch (error) {
      console.error("Failed to load task details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkshopLocations = async () => {
    try {
      const response = await listWorkshopLocations()
      setWorkshopLocations(response.data)
      if (response.data.length === 1) {
        setSelectedWorkshopLocation(response.data[0].id)
      }
    } catch (error) {
      console.error("Error fetching workshop locations:", error)
    }
  }

  const fetchWorkshopTechnicians = async () => {
    try {
      const response = await listWorkshopTechnicians()
      setWorkshopTechnicians(response.data)
    } catch (error) {
      console.error("Error fetching workshop technicians:", error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await updateTask(taskId, { status: newStatus })
      setStatus(newStatus)
      await loadTaskDetails() // Reload to get updated notes
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setUpdating(true)
      await addTaskActivity(taskId, {
        type: noteType,
        message: newNote,
      })
      setNewNote("")
      await loadTaskDetails() // Reload to get updated notes
    } catch (error) {
      console.error("Failed to add note:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkComplete = async () => {
    await handleStatusChange("Completed")
  }

  const handleSendToWorkshop = async () => {
    if (!selectedWorkshopLocation || !selectedWorkshopTechnician) {
      toast({
        title: "Error",
        description: "Please select a workshop location and technician.",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)
      await updateTask(taskId, { 
        workshop_location: selectedWorkshopLocation,
        workshop_technician: selectedWorkshopTechnician,
      })
      setIsSendToWorkshopDialogOpen(false)
      await loadTaskDetails()
      toast({
        title: "Success",
        description: "Task sent to workshop successfully.",
      })
    } catch (error) {
      console.error("Failed to send task to workshop:", error)
      toast({
        title: "Error",
        description: "Failed to send task to workshop.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleWorkshopStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await updateTask(taskId, { workshop_status: newStatus })
      await loadTaskDetails()
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}.`,
      })
    } catch (error) {
      console.error("Failed to update workshop status:", error)
      toast({
        title: "Error",
        description: "Failed to update workshop status.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      "Pending": { label: "Pending", color: "bg-gray-100 text-gray-800" },
      "In Progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
      "Awaiting Parts": { label: "Awaiting Parts", color: "bg-orange-100 text-orange-800" },
      "Ready for QC": { label: "Ready for QC", color: "bg-purple-100 text-purple-800" },
      "Completed": { label: "Completed", color: "bg-green-100 text-green-800" },
      "Ready for Pickup": { label: "Ready for Pickup", color: "bg-green-100 text-green-800" },
      "Picked Up": { label: "Picked Up", color: "bg-purple-100 text-purple-800" },
      "Cancelled": { label: "Cancelled", color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    }
    return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: any = {
      High: { label: "High", color: "bg-red-100 text-red-800" },
      Medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
      Low: { label: "Low", color: "bg-green-100 text-green-800" },
    }

    const config = urgencyConfig[urgency] || {
      label: urgency,
      color: "bg-gray-100 text-gray-800",
    }
    return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
  }

  const getNoteIcon = (type: string) => {
    const iconMap: any = {
      diagnosis: <Wrench className="h-4 w-4 text-blue-600" />,
      repair_step: <CheckCircle className="h-4 w-4 text-green-600" />,
      status_update: <Clock className="h-4 w-4 text-purple-600" />,
      customer_communication: <MessageSquare className="h-4 w-4 text-orange-600" />,
      handoff_reason: <Users className="h-4 w-4 text-red-600" />,
      parts_request: <Package className="h-4 w-4 text-yellow-600" />,
    }
    return iconMap[type] || <FileText className="h-4 w-4 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex-1 space-y-8 p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The requested task could not be found.</p>
          <Button onClick={() => router.back()} className="bg-red-600 hover:bg-red-700">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task Details - {task.title}</h1>
          <p className="text-gray-600 mt-1">Repair management and documentation</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Task Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Initial Issue */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Initial Issue Description</h4>
                <p className="text-blue-800">{task.description}</p>
              </div>

              {/* Read-only fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Task ID</label>
                  <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="text-lg font-semibold text-gray-900">{task.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Laptop Model</label>
                  <p className="text-lg font-semibold text-gray-900">{task.laptop_model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Serial Number</label>
                  <p className="text-lg font-semibold text-gray-900">{task.serial_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date In</label>
                  <p className="text-lg font-semibold text-gray-900">{task.date_in}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Assigned Technician</label>
                  <p className="text-lg font-semibold text-gray-900">{task.assigned_to_details?.full_name}</p>
                </div>
              </div>

              <Separator />

              {/* Editable fields */}
              <div className="grid gap-4 md:grid-cols-2">
              </div>
            </CardContent>
          </Card>

          {/* Repair Status & Actions */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Repair Status & Actions</CardTitle>
              <CardDescription>Update task status and perform key actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <div className="mt-2">
                    {task.workshop_status === 'In Workshop' ? (
                      <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">In Workshop</Badge>
                    ) : (
                      getStatusBadge(status)
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {task && task.status !== 'Completed' && (!task.workshop_status || ['Solved', 'Not Solved'].includes(task.workshop_status)) && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleMarkComplete}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                {task.status === 'In Progress' && !task.workshop_status && (
                  <Dialog open={isSendToWorkshopDialogOpen} onOpenChange={setIsSendToWorkshopDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent">
                        <Users className="h-4 w-4 mr-2" />
                        Send to Workshop
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send to Workshop</DialogTitle>
                        <DialogDescription>
                          Select a workshop location and technician to send the task to.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="workshop-location">Workshop Location</label>
                          <Select value={selectedWorkshopLocation} onValueChange={setSelectedWorkshopLocation}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                              {workshopLocations.map(location => (
                                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="workshop-technician">Workshop Technician</label>
                          <Select value={selectedWorkshopTechnician} onValueChange={setSelectedWorkshopTechnician}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a technician" />
                            </SelectTrigger>
                            <SelectContent>
                              {workshopTechnicians.map(technician => (
                                <SelectItem key={technician.id} value={technician.id}>{technician.full_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSendToWorkshopDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendToWorkshop} disabled={updating}>Send</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {user?.is_workshop && task.workshop_status === 'In Workshop' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleWorkshopStatusChange('Solved')} disabled={updating}>Solved</Button>
                    <Button onClick={() => handleWorkshopStatusChange('Not Solved')} disabled={updating}>Not Solved</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Repair Notes & Activity Log */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Repair Notes & Activity Log</CardTitle>
              <CardDescription>Complete history of work performed and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activity Log */}
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {task.activities && task.activities.length > 0 ? (
                    task.activities.map((note: any) => (
                      <div key={note.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full border">{getNoteIcon(note.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{note.user.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {note.type.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-700">{note.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No activity logged yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Add New Note */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex gap-3">
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="note">General Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Add a new note about this repair..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || updating}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{task.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{task.customer_phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{task.customer_email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date In</p>
                  <p className="text-sm text-gray-600">{task.date_in}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <div className="mt-1">{getUrgencyBadge(task.urgency)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
