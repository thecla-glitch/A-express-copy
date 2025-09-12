"use client"

import { useState } from "react"
import { apiClient } from "./api"
import { useAuth } from "./auth-context"

export interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone: string

}



export function useProfile() {
  const { user, refreshAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

const updateProfile = async (profileData: ProfileData) => {
  setIsLoading(true)
  setError(null)
  setSuccess(null)

  try {
    // Ensure we have the latest token
    const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
    if (tokens.access) {
      apiClient.setToken(tokens.access)
    }

    let response = await apiClient.updateProfile(profileData)

    // If we get a 401, try to refresh the token and retry
    if (response.status === 401) {
      const refreshSuccess = await refreshAuth()
      if (refreshSuccess) {
        // Get the new token and retry
        const newTokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
        if (newTokens.access) {
          apiClient.setToken(newTokens.access)
          response = await apiClient.updateProfile(profileData)
        }
      } else {
        setError("Session expired. Please log in again.")
        return false
      }
    }

    if (response.error) {
      setError(response.error)
      return false
    }

    await refreshAuth()
    setSuccess("Profile updated successfully!")
    return true
  } catch (err: any) {
    setError(err.message || "Failed to update profile")
    return false
  } finally {
    setIsLoading(false)
  }
}
  const changePassword = async (passwordData: {
    current_password: string
    new_password: string
    confirm_password: string
  }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiClient.changePassword(passwordData)

      if (response.error) {
        setError(response.error)
        return false
      }

      setSuccess("Password changed successfully!")
      return true
    } catch (err: any) {
      setError(err.message || "Failed to change password")
      return false
    } finally {
      setIsLoading(false)
    }
  }

const uploadProfilePicture = async (file: File) => {
  console.log("Uploading file:", file.name, file.size, file.type)
  setIsLoading(true)
  setError(null)
  setSuccess(null)

  try {
    const formData = new FormData()
    formData.append("profile_picture", file)
    console.log("FormData created, entries:", Array.from(formData.entries()))

    const response = await apiClient.uploadProfilePicture(formData)
    console.log("API response:", response)

    if (response.error) {
      setError(response.error)
      return false
    }

    await refreshAuth()
    setSuccess("Profile picture updated successfully!")
    return true
  } catch (err: any) {
    console.error("Upload error:", err)
    setError(err.message || "Failed to upload profile picture")
    return false
  } finally {
    setIsLoading(false)
  }
}

  return {
    isLoading,
    error,
    success,
    updateProfile,
    changePassword,
    uploadProfilePicture,
    clearMessages: () => {
      setError(null)
      setSuccess(null)
    }
  }
}