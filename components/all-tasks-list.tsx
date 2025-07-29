"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  MapPin,
  AlertTriangle,
  Laptop,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Mock data for all tasks
const allTasks = [
  {
    id: "T-1001",
    customerName: "John Smith",
    laptopModel: 'MacBook Pro 13"',
    initialIssue: "Screen replacement needed",
    dateIn: "2024-01-10",
    assignedTechnician: "Sarah Johnson",
    currentStatus: "Ready for Pickup",
    urgency: "Medium",
    currentLocation: "Front Desk",
    customerPhone: "(555) 123-4567",
    estimatedCompletion: "2024-01-15",
  },
  {
    id: "T-1002",
    customerName: "Emily Davis",
    laptopModel: "Dell XPS 15",
    initialIssue: "Won't turn on",
    dateIn: "2024-01-12",
    assignedTechnician: "John Smith",
    currentStatus: "In Progress",
    urgency: "High",
    currentLocation: "Repair Bay 1",
    customerPhone: "(555) 987-6543",
    estimatedCompletion: "2024-01-16",
  },
  {
    id: "T-1003",
    customerName: "Michael Brown",
    laptopModel: "HP Pavilion",
    initialIssue: "Keyboard not working",
    dateIn: "2024-01-08",
    assignedTechnician: "Mike Chen",
    currentStatus: "Awaiting Parts",
    urgency: "Low",
    currentLocation: "Parts Storage",
    customerPhone: "(555) 456-7890",
    estimatedCompletion: "2024-01-18",
  },
  {
    id: "T-1004",
    customerName: "Sarah Wilson",
    laptopModel: "Lenovo ThinkPad",
    initialIssue: "Slow performance",
    dateIn: "2024-01-14",
    assignedTechnician: "Lisa Brown",
    currentStatus: "Diagnostic",
    urgency: "Medium",
    currentLocation: "Diagnostic Station",
    customerPhone: "(555) 321-0987",
    estimatedCompletion: "2024-01-17",
  },
  {
    id: "T-1005",
    customerName: "David Wilson",
    laptopModel: "MacBook Air M2",
    initialIssue: "Battery replacement",
    dateIn: "2024-01-11",
    assignedTechnician: "David Wilson",
    currentStatus: "Completed",
    urgency: "Low",
    currentLocation: "Quality Control",
    customerPhone: "(555) 654-3210",
    estimatedCompletion: "2024-01-15",
  },
  {
    id: "T-1006",
    customerName: "Lisa Garcia",
    laptopModel: "ASUS ROG",
    initialIssue: "Overheating issues",
    dateIn: "2024-01-13",
    assignedTechnician: "Sarah Johnson",
    currentStatus: "In Progress",
    urgency: "High",
    currentLocation: "Repair Bay 2",
    customerPhone: "(555) 789-0123",
    estimatedCompletion: "2024-01-16",
  },
  {
    id: "T-1007",
    customerName: "Robert Chen",
    laptopModel: "Surface Laptop",
    initialIssue: "Hard drive failure",
    dateIn: "2024-01-09",
    assignedTechnician: "John Smith",
    currentStatus: "Awaiting Parts",
    urgency: "High",
    currentLocation: "Parts Storage",
    customerPhone: "(555) 234-5678",
    estimatedCompletion: "2024-01-19",
  },
  {
    id: "T-1008",
    customerName: "Amanda Rodriguez",
    laptopModel: "Dell Inspiron",
    initialIssue: "Virus removal",
    dateIn: "2024-01-15",
    assignedTechnician: "Mike Chen",
    currentStatus: "Assigned - Not Accepted",
    urgency: "Medium",
    currentLocation: "Intake",
    customerPhone: "(555) 345-6789",
    estimatedCompletion: "2024-01-18",
  },
  {
    id: "T-1009",
    customerName: "Tom Anderson",
    laptopModel: 'MacBook Pro 16"',
    initialIssue: "Water damage",
    dateIn: "2024-01-07",
    assignedTechnician: "Lisa Brown",
    currentStatus: "Ready for Pickup",
    urgency: "High",
    currentLocation: "Front Desk",
    customerPhone: "(555) 456-7891",
    estimatedCompletion: "2024-01-14",
  },
  {
    id: "T-1010",
    customerName: "Jennifer Lee",
    laptopModel: "HP Spectre",
    initialIssue: "Screen flickering",
    dateIn: "2024-01-16",
    assignedTechnician: "David Wilson",
    currentStatus: "Diagnostic",
    urgency: "Medium",
    currentLocation: "Diagnostic Station",
    customerPhone: "(555) 567-8901",
    estimatedCompletion: "2024-01-19",
  },
]

type SortField = keyof (typeof allTasks)[0]
type SortDirection = "asc" | "desc" | null

export function AllTasksList() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [technicianFilter, setTechnicianFilter] = useState<string>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Check if user can create new tasks (Admin, Manager, or Front Desk roles)
  const canCreateTasks = user?.role === "Administrator" || user?.role === "Manager" || user?.role === "Front Desk"

  // Get unique values for filter dropdowns
  const uniqueStatuses = [...new Set(allTasks.map((task) => task.currentStatus))]
  const uniqueTechnicians = [...new Set(allTasks.map((task) => task.assignedTechnician))]
  const uniqueUrgencies = [...new Set(allTasks.map((task) => task.urgency))]
  const uniqueLocations = [...new Set(allTasks.map((task) => task.currentLocation))]

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = allTasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.laptopModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.initialIssue.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.currentStatus === statusFilter
      const matchesTechnician = technicianFilter === "all" || task.assignedTechnician === technicianFilter
      const matchesUrgency = urgencyFilter === "all" || task.urgency === urgencyFilter
      const matchesLocation = locationFilter === "all" || task.currentLocation === locationFilter

      return matchesSearch && matchesStatus && matchesTechnician && matchesUrgency && matchesLocation
    })

    // Sort tasks
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [searchQuery, statusFilter, technicianFilter, urgencyFilter, locationFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
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
      case "Ready for Pickup":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready for Pickup</Badge>
      case "Completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>
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

  const handleRowClick = (taskId: string) => {
    // Navigate to task details page
    window.location.href = `/dashboard/tasks/${taskId}`
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTechnicianFilter("all")
    setUrgencyFilter("all")
    setLocationFilter("all")
    setSortField(null)
    setSortDirection(null)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-2">Comprehensive view of all repair tasks in the system</p>
        </div>
        {canCreateTasks && (
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Search & Filters
          </CardTitle>
          <CardDescription>Use the search bar and filters to find specific tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Task ID, Customer Name, Laptop Model, or Issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {uniqueTechnicians.map((technician) => (
                  <SelectItem key={technician} value={technician}>
                    {technician}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Urgencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                {uniqueUrgencies.map((urgency) => (
                  <SelectItem key={urgency} value={urgency}>
                    {urgency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-gray-300 text-gray-600 bg-transparent"
            >
              Clear Filters
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedTasks.length} of {allTasks.length} tasks
            </span>
            {(searchQuery ||
              statusFilter !== "all" ||
              technicianFilter !== "all" ||
              urgencyFilter !== "all" ||
              locationFilter !== "all") && <span className="text-red-600">Filters active</span>}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("id")}
                      className="h-auto p-0 font-semibold text-gray-900 hover:text-red-600"
                    >
                      Task ID {getSortIcon("id")}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("customerName")}
                      className="h-auto p-0 font-semibold text-gray-900 hover:text-red-600"
                    >
                      Customer Name {getSortIcon("customerName")}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("laptopModel")}
                      className="h-auto p-0 font-semibold text-gray-900 hover:text-red-600"
                    >
                      Laptop Model {getSortIcon("laptopModel")}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Initial Issue</TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("dateIn")}
                      className="h-auto p-0 font-semibold text-gray-900 hover:text-red-600"
                    >
                      Date In {getSortIcon("dateIn")}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("assignedTechnician")}
                      className="h-auto p-0 font-semibold text-gray-900 hover:text-red-600"
                    >
                      Assigned Technician {getSortIcon("assignedTechnician")}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Current Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Urgency</TableHead>
                  <TableHead className="font-semibold text-gray-900">Current Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(task.id)}
                  >
                    <TableCell className="font-medium text-red-600">{task.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{task.customerName}</p>
                        <p className="text-sm text-gray-500">{task.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Laptop className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{task.laptopModel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{task.initialIssue}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{task.dateIn}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{task.assignedTechnician}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.currentStatus)}</TableCell>
                    <TableCell>{getUrgencyBadge(task.urgency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{task.currentLocation}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedTasks.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
