"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { login as apiLogin, getProfile } from "./api-client"
import { logout as apiLogout } from "./auth"

interface User {
  id: number
  username: string
  email: string
  role: "Administrator" | "Manager" | "Technician" | "Front Desk" | "Accountant"
  first_name: string
  last_name: string
  phone: string
  profile_picture: string
  is_active: boolean
  is_workshop: boolean
  created_at: string
  last_login: string
  address?: string
  bio?: string
}

interface AuthTokens {
  access: string
  refresh: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void // Add this
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem("auth_user")
    const storedTokens = localStorage.getItem("auth_tokens")

    if (storedUser && storedTokens) {
      const parsedUser = JSON.parse(storedUser)
      const parsedTokens = JSON.parse(storedTokens)

      setUser(parsedUser)
      setTokens(parsedTokens)
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(username, password);

      if (response.data) {
        const { user: userData, access, refresh } = response.data as { user: User; access: string; refresh: string };

        setUser(userData);
        setTokens({ access, refresh });

        localStorage.setItem("auth_user", JSON.stringify(userData));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem("auth_user")
    apiLogout()
  }

  const value = {
    user,
    tokens,
    isAuthenticated: !!user,
    setUser, // Add setUser to the context value
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}