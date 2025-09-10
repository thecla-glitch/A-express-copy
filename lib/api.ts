import { getApiUrl } from './config'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

// Add a specific interface for user response
export interface UserResponse {
  id: number
  username: string
  email: string
  role: "Administrator" | "Manager" | "Technician" | "Front Desk"
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
      // Remove Content-Type header to let browser set it automatically
      if (headers['Content-Type']) {
        delete headers['Content-Type']
      }
    } else if (!headers['Content-Type']) {
      // Set default Content-Type for non-FormData requests
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json().catch(() => null)

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
      return {
        error: error.message || 'Network error',
        status: 0,
      }
    }
  }


  async login(username: string, password: string) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>('/auth/profile/')
  }

  async registerUser(userData: any) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async listUsers() {
    return this.request('/auth/users/')
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    })
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) {
    return this.request('/auth/change-password/', {
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

    return this.request('/auth/profile/upload-picture/', {
      method: 'POST',
      body: formData,
      // Don't set headers here - the request method will handle it
    })
  }


  async getUserDetail(userId: number): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>(`/auth/users/${userId}/`);
  }

  async updateUser(userId: number, userData: any): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>(`/auth/users/${userId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return this.request(`/auth/users/${userId}/delete/`, {
      method: 'DELETE',
    });
  }

  async deactivateUser(userId: number): Promise<ApiResponse> {
    return this.request(`/auth/users/${userId}/deactivate/`, {
      method: 'POST',
    });
  }

  async activateUser(userId: number): Promise<ApiResponse> {
    return this.request(`/auth/users/${userId}/activate/`, {
      method: 'POST',
    });
  }

  async listUsersByRole(role: string): Promise<ApiResponse<UserResponse[]>> {
    return this.request<UserResponse[]>(`/auth/users/role/${role}/`);
  }


}

// Create a singleton instance
export const apiClient = new ApiClient()