// Mock API client for interface development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

// Mock data for development
const mockUsers = [
  { id: "1", username: "admin", email: "admin@aplus.com", role: "admin", first_name: "Admin", last_name: "User" },
  {
    id: "2",
    username: "manager",
    email: "manager@aplus.com",
    role: "manager",
    first_name: "Manager",
    last_name: "User",
  },
  { id: "3", username: "tech1", email: "tech1@aplus.com", role: "technician", first_name: "John", last_name: "Tech" },
  {
    id: "4",
    username: "frontdesk",
    email: "front@aplus.com",
    role: "front_desk",
    first_name: "Front",
    last_name: "Desk",
  },
]

const mockTasks = [
  {
    id: "T-1025",
    task_id: "T-1025",
    customer_name: "David Wilson",
    laptop_model: "MacBook Air M2",
    issue: "Screen replacement needed",
    status: "assigned_not_accepted",
    technician_id: "3",
    technician: "John Tech",
    priority: "High",
    urgency: "high",
    assigned_date: "2024-01-15",
    due_date: "2024-01-17",
    estimated_time: "2-3 hours",
    description: "Customer reports cracked screen after dropping laptop. Screen is functional but has visible cracks.",
    customer_phone: "(555) 123-4567",
    customer_email: "david.wilson@email.com",
    parts_required: ["MacBook Air M2 Screen Assembly", "Adhesive Strips"],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    current_location: "Front Desk",
    serial_number: "MBA2024001",
    date_in: "2024-01-15",
    initial_issue:
      "Customer reports cracked screen after dropping laptop. Screen is functional but has visible cracks.",
    work_log: [],
  },
  {
    id: "T-1023",
    task_id: "T-1023",
    customer_name: "Jennifer Lee",
    laptop_model: "Dell XPS 13",
    issue: "Keyboard not responding",
    status: "in_progress",
    technician_id: "3",
    technician: "John Tech",
    priority: "Medium",
    urgency: "medium",
    assigned_date: "2024-01-14",
    due_date: "2024-01-16",
    estimated_time: "1-2 hours",
    started_date: "2024-01-15",
    description: "Several keys not responding, likely liquid damage. Customer spilled coffee on keyboard.",
    customer_phone: "(555) 987-6543",
    customer_email: "jennifer.lee@email.com",
    parts_required: ["Dell XPS 13 Keyboard"],
    created_at: "2024-01-14T14:30:00Z",
    updated_at: "2024-01-15T09:15:00Z",
    current_location: "Repair Bay 1",
    serial_number: "DXP2024001",
    date_in: "2024-01-14",
    initial_issue: "Several keys not responding, likely liquid damage. Customer spilled coffee on keyboard.",
    work_log: [
      { time: "10:30 AM", note: "Started diagnosis - confirmed liquid damage", type: "diagnosis", user: "John Tech" },
      { time: "11:15 AM", note: "Ordered replacement keyboard", type: "repair_step", user: "John Tech" },
    ],
  },
  {
    id: "T-1021",
    task_id: "T-1021",
    customer_name: "Robert Chen",
    laptop_model: "HP Pavilion",
    issue: "Hard drive replacement",
    status: "awaiting_parts",
    technician_id: "3",
    technician: "John Tech",
    priority: "Medium",
    urgency: "medium",
    assigned_date: "2024-01-13",
    due_date: "2024-01-15",
    estimated_time: "1 hour",
    parts_needed: "1TB SSD",
    description: "Hard drive making clicking noises, SMART test shows imminent failure.",
    customer_phone: "(555) 456-7890",
    customer_email: "robert.chen@email.com",
    parts_required: ["1TB SSD", "SATA Cable"],
    created_at: "2024-01-13T11:20:00Z",
    updated_at: "2024-01-14T16:45:00Z",
    current_location: "Repair Bay 2",
    serial_number: "HPP2024001",
    date_in: "2024-01-13",
    initial_issue: "Hard drive making clicking noises, SMART test shows imminent failure.",
    work_log: [
      { time: "2:00 PM", note: "Diagnosed failing hard drive", type: "diagnosis", user: "John Tech" },
      { time: "3:30 PM", note: "Ordered replacement SSD", type: "parts_request", user: "John Tech" },
    ],
  },
  {
    id: "T-1019",
    task_id: "T-1019",
    customer_name: "Amanda Rodriguez",
    laptop_model: "Lenovo ThinkPad",
    issue: "Battery replacement",
    status: "in_progress",
    technician_id: "3",
    technician: "John Tech",
    priority: "Low",
    urgency: "low",
    assigned_date: "2024-01-12",
    due_date: "2024-01-16",
    estimated_time: "30 minutes",
    started_date: "2024-01-14",
    description: "Battery not holding charge, needs replacement.",
    customer_phone: "(555) 111-2222",
    customer_email: "amanda.rodriguez@email.com",
    parts_required: ["Lenovo ThinkPad Battery"],
    created_at: "2024-01-12T08:00:00Z",
    updated_at: "2024-01-14T10:30:00Z",
    current_location: "Repair Bay 1",
    serial_number: "LTP2024001",
    date_in: "2024-01-12",
    initial_issue: "Battery not holding charge, needs replacement.",
    work_log: [{ time: "9:00 AM", note: "Started battery replacement", type: "repair_step", user: "John Tech" }],
  },
]

const mockCompletedTasks = [
  {
    id: "T-1020",
    task_id: "T-1020",
    customer_name: "Amanda Rodriguez",
    laptop_model: "Lenovo ThinkPad",
    issue: "Battery replacement",
    completed_date: "2024-01-14",
    time_spent: "45 minutes",
    customer_rating: 5,
    customer_feedback: "Excellent service, very professional and quick!",
    technician_id: "3",
  },
  {
    id: "T-1018",
    task_id: "T-1018",
    customer_name: "Michael Brown",
    laptop_model: "ASUS ROG",
    issue: "Overheating issues",
    completed_date: "2024-01-13",
    time_spent: "2.5 hours",
    customer_rating: 4,
    customer_feedback: "Good work, laptop runs much cooler now.",
    technician_id: "3",
  },
]

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private async mockRequest<T>(data: T, delay = 300): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, delay))
    return {
      data,
      status: 200,
      message: "Success",
    }
  }

  async login(credentials: { username: string; password: string }) {
    const user = mockUsers.find((u) => u.username === credentials.username)

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const token = `mock_token_${user.id}_${Date.now()}`
    this.token = token

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }

    return this.mockRequest({ token, user })
  }

  async logout() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
    return this.mockRequest({ message: "Logged out successfully" })
  }

  async verifyToken() {
    if (!this.token) {
      throw new Error("No token provided")
    }

    const userId = this.token.split("_")[2]
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      throw new Error("Invalid token")
    }

    return this.mockRequest({ user })
  }

  async getTasks(params?: { technician_id?: string; status?: string; search?: string }) {
    let filteredTasks = [...mockTasks]

    if (params?.technician_id) {
      filteredTasks = filteredTasks.filter((task) => task.technician_id === params.technician_id)
    }

    if (params?.status) {
      const statuses = params.status.split(",")
      filteredTasks = filteredTasks.filter((task) => statuses.includes(task.status))
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.customer_name.toLowerCase().includes(searchLower) ||
          task.laptop_model.toLowerCase().includes(searchLower) ||
          task.issue.toLowerCase().includes(searchLower) ||
          task.task_id.toLowerCase().includes(searchLower),
      )
    }

    return this.mockRequest({ tasks: filteredTasks })
  }

  async getTask(id: string) {
    const task = mockTasks.find((t) => t.id === id || t.task_id === id)
    if (!task) {
      throw new Error("Task not found")
    }
    return this.mockRequest(task)
  }

  async updateTask(id: string, updates: any) {
    const taskIndex = mockTasks.findIndex((t) => t.id === id || t.task_id === id)
    if (taskIndex === -1) {
      throw new Error("Task not found")
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    return this.mockRequest(mockTasks[taskIndex])
  }

  async updateTaskStatus(taskId: string, status: string) {
    return this.updateTask(taskId, { status })
  }

  async updateTaskLocation(taskId: string, location: string) {
    return this.updateTask(taskId, { current_location: location })
  }

  async updateTaskUrgency(taskId: string, urgency: string) {
    return this.updateTask(taskId, { urgency })
  }

  async addTaskNote(taskId: string, note: any) {
    const task = mockTasks.find((t) => t.id === taskId || t.task_id === taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    const newNote = {
      ...note,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
    }

    task.work_log = task.work_log || []
    task.work_log.unshift(newNote)

    return this.mockRequest(newNote)
  }

  async getTaskDetails(taskId: string) {
    const task = mockTasks.find((t) => t.id === taskId || t.task_id === taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    const taskDetails = {
      id: task.task_id,
      customerId: task.customer_name.toLowerCase().replace(" ", ""),
      customerName: task.customer_name,
      customerPhone: task.customer_phone,
      customerEmail: task.customer_email,
      laptopModel: task.laptop_model,
      serialNumber: task.serial_number,
      dateIn: task.date_in,
      assignedTechnician: task.technician,
      currentLocation: task.current_location,
      urgency: task.urgency,
      status: task.status,
      initialIssue: task.initial_issue,
      estimatedCompletion: task.due_date,
      notes: task.work_log || [],
    }

    return this.mockRequest({ task: taskDetails })
  }

  async getCompletedTasks(params?: { technician_id?: string }) {
    let filteredTasks = [...mockCompletedTasks]

    if (params?.technician_id) {
      filteredTasks = filteredTasks.filter((task) => task.technician_id === params.technician_id)
    }

    return this.mockRequest(filteredTasks)
  }

  async getTechnicianPerformance(technicianId: string) {
    const performanceData = {
      tasksCompletedThisWeek: 12,
      averageTimePerRepair: "2.3 hours",
      onTimeCompletionRate: "94%",
      customerSatisfactionScore: "4.8/5",
      totalTasksCompleted: mockCompletedTasks.length,
      averageRating: 4.8,
      certifications: ["CompTIA A+", "Apple Certified Mac Technician", "Dell Certified Technician"],
    }

    return this.mockRequest(performanceData)
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (endpoint === "/auth/verify/") {
      return this.verifyToken() as Promise<ApiResponse<T>>
    }

    return this.mockRequest({} as T)
  }
}

export const apiClient = new ApiClient()
export default apiClient
