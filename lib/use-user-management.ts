"use client"

import { useState, useEffect } from "react"
import { apiClient } from "./api-client"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

export interface User {
  id: number
  username: string
  email: string
  role: "Administrator" | "Manager" | "Technician" | "Front Desk"
  first_name: string
  last_name: string
  phone: string
  profile_picture: string
  is_active: boolean
  is_workshop: boolean
  created_at: string
  last_login: string
}

export function useUserManagement() {
  const { tokens } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

// Add this debug logging
const loadUsers = async () => {
  setIsLoading(true);
  try {
    // Get token from localStorage
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}");
    const accessToken = tokens.access;
    
    console.log("Token from localStorage:", accessToken); // Debug log
    
    if (accessToken) {
      apiClient.setToken(accessToken);
      console.log("Making API request with token"); // Debug log
      const response = await apiClient.listUsers();
      
      if (response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      } else if (response.status === 401) {
        console.error("Unauthorized - token might be invalid or expired");
        // Handle token refresh or redirect to login
      }
    } else {
      console.error("No access token found");
    }
  } catch (error) {
    console.error("Failed to load users:", error);
  } finally {
    setIsLoading(false);
  }
};

  const createUser = async (userData: {
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    phone: string
    role: "Administrator" | "Manager" | "Technician" | "Front Desk"
    is_workshop: boolean
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.registerUser(userData)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })
      
      // Reload users list
      await loadUsers()
      return true
    } catch (err: any) {
      setError(err.message || "Failed to create user")
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userId: number, userData: Partial<User>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.updateUser(userId, userData)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })
      
      // Reload users list
      await loadUsers()
      return true
    } catch (err: any) {
      setError(err.message || "Failed to update user")
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.deleteUser(userId)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      
      // Reload users list
      await loadUsers()
      return true
    } catch (err: any) {
      setError(err.message || "Failed to delete user")
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = isActive 
        ? await apiClient.activateUser(userId)
        : await apiClient.deactivateUser(userId)

      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      })
      
      // Reload users list
      await loadUsers()
      return true
    } catch (err: any) {
      setError(err.message || `Failed to ${isActive ? 'activate' : 'deactivate'} user`)
      toast({
        title: "Error",
        description: `Failed to ${isActive ? 'activate' : 'deactivate'} user`,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  }
}