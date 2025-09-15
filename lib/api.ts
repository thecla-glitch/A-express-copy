import { getApiUrl } from './config'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}


export interface UserResponse {
  id: number
  username: string
  email: string
  role: "Manager" | "Technician" | "Front Desk"
  first_name: string
  last_name: string
  phone: string
  profile_picture: string
  is_active: boolean
  created_at: string
  last_login: string
  address?: string
  bio?: string
}

export interface Location {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: number;
  assigned_to_details: UserResponse;
  created_by: number;
  created_by_details: UserResponse;
  created_at: string;
  updated_at: string;
  due_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  laptop_make: string;
  laptop_model: string;
  serial_number: string;
  estimated_cost: string;
  total_cost: string;
  payment_status: string;
  current_location: string;
  urgency: string;
  date_in: string;
  approved_date: string;
  paid_date: string;
  date_out: string;
  negotiated_by: number;
  negotiated_by_details: UserResponse;
  activities: any[];
  payments: any[];
  outstanding_balance: number;
}

export interface TaskActivity {
  id: number;
  task: number;
  user: UserResponse;
  type: string;
  message: string;
  timestamp: string;
}

export interface TaskPayment {
  id: number;
  task: number;
  amount: string;
  method: string;
  date: string;
  reference: string;
}

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = getApiUrl('')
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    // Prepare headers
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Add authorization if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // For FormData requests, don't set Content-Type - let the browser handle it
    if (options.body instanceof FormData) {
      if (headers['Content-Type']) {
        delete headers['Content-Type']
      }
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // DEBUG: Print request details before sending
    console.log('📤 API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body instanceof FormData ?
        '[FormData]' :
        (typeof options.body === 'string' ? JSON.parse(options.body) : options.body),
      hasToken: !!this.token,
      token: this.token ? `${this.token.substring(0, 20)}...` : 'No token'
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // DEBUG: Print response details
      console.log('📥 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json().catch(() => null)

      // DEBUG: Print response data
      console.log('📦 Response Data:', data)

      if (!response.ok) {
        return {
          error: data?.detail || data?.message || 'Request failed',
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error: any) {
      // DEBUG: Print error details
      console.error('❌ API Error:', {
        url,
        error: error.message,
        stack: error.stack
      })

      return {
        error: error.message || 'Network error',
        status: 0,
      }
    }
  }


  async login(username: string, password: string) {
    return this.request('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>('/profile/')
  }


  async registerUser(userData: any) {
    return this.request('/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async listUsers() {
    return this.request('/users/')
  }

  async updateProfile(profileData: any) {
    return this.request('/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) {
    return this.request('/profile/change-password/', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  }

  async uploadProfilePicture(formData: FormData) {
    console.log("Uploading profile picture", formData);

    // Get the token from localStorage
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
    const accessToken = tokens.access
    console.log("Access token:", accessToken);

    if (!accessToken) {
      return {
        error: "No authentication token found",
        status: 401,
      }
    }

    // Set the token for this request
    this.setToken(accessToken)

    return this.request('/profile/upload-picture/', {
      method: 'POST',
      body: formData,
      // Don't set headers here - the request method will handle it
    })
  }


  async getUserDetail(userId: number): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>(`/users/${userId}/`);
  }

  async updateUser(userId: number, userData: any): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>(`/users/${userId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return this.request(`/users/${userId}/delete/`, {
      method: 'DELETE',
    });
  }

  async deactivateUser(userId: number): Promise<ApiResponse> {
    return this.request(`/users/${userId}/deactivate/`, {
      method: 'POST',
    });
  }

  async activateUser(userId: number): Promise<ApiResponse> {
    return this.request(`/users/${userId}/activate/`, {
      method: 'POST',
    });
  }

  async listUsersByRole(role: string): Promise<ApiResponse<UserResponse[]>> {
     const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
    const accessToken = tokens.access
    console.log("Access token:", accessToken);

    console.log("sending technician request");

    if (!accessToken) {
      return {
        error: "No authentication token found",
        status: 401,
      }
    }

    // Set the token for this request
    this.setToken(accessToken)
    return this.request<UserResponse[]>(`/users/role/${role}/`);
  }

  // Task methods
  async getTasks(): Promise<ApiResponse<Task[]>> {
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
    const accessToken = tokens.access
    console.log("Access token:", accessToken);

    if (!accessToken) {
      return {
        error: "No authentication token found",
        status: 401,
      }
    }

    // Set the token for this request
    this.setToken(accessToken)
    return this.request<Task[]>('/tasks/');
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/`);
  }

  async createTask(taskData: any): Promise<ApiResponse<Task>> {
      const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
    const accessToken = tokens.access
    console.log("Access token:", accessToken);

    if (!accessToken) {
      return {
        error: "No authentication token found",
        status: 401,
      }
    }

    return this.request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, updates: any): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse> {
    return this.request(`/tasks/${taskId}/`, {
      method: 'DELETE',
    });
  }

  async addTaskActivity(taskId: string, activityData: any): Promise<ApiResponse<TaskActivity>> {
    return this.request<TaskActivity>(`/tasks/${taskId}/activities/`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async addTaskPayment(taskId: string, paymentData: any): Promise<ApiResponse<TaskPayment>> {
    return this.request<TaskPayment>(`/tasks/${taskId}/payments/`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getTaskActivities(taskId: string): Promise<ApiResponse<TaskActivity[]>> {
    return this.request<TaskActivity[]>(`/tasks/${taskId}/activities/`);
  }

  async getTaskPayments(taskId: string): Promise<ApiResponse<TaskPayment[]>> {
    return this.request<TaskPayment[]>(`/tasks/${taskId}/payments/`);
  }

  async getTaskActivities(taskId: string): Promise<ApiResponse<TaskActivity[]>> {
    return this.request<TaskActivity[]>(`/tasks/${taskId}/activities/`);
  }

  async createCollaborationRequest(taskId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/tasks/${taskId}/collaboration-requests/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async listCollaborationRequests(): Promise<ApiResponse<any[]>> {
    return this.request('/collaboration-requests/');
  }

  async getCollaborationRequest(requestId: string): Promise<ApiResponse<any>> {
    return this.request(`/collaboration-requests/${requestId}/`);
  }

  async updateCollaborationRequest(requestId: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/collaboration-requests/${requestId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getLocations(): Promise<ApiResponse<Location[]>> {
    return this.request<Location[]>('/locations/');
  }

}


export const apiClient = new ApiClient()