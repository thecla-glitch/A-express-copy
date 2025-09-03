"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  username: string
  email: string
  role: "Administrator" | "Manager" | "Technician" | "Front Desk"
  first_name: string
  last_name: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users
const demoUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@aplusexpress.com",
    role: "Administrator",
    first_name: "System",
    last_name: "Administrator",
    name: "System Administrator",
  },
  {
    id: "2",
    username: "manager",
    email: "manager@aplusexpress.com",
    role: "Manager",
    first_name: "John",
    last_name: "Manager",
    name: "John Manager",
  },
  {
    id: "3",
    username: "tech1",
    email: "tech1@aplusexpress.com",
    role: "Technician",
    first_name: "Mike",
    last_name: "Technician",
    name: "Mike Technician",
  },
  {
    id: "4",
    username: "frontdesk",
    email: "frontdesk@aplusexpress.com",
    role: "Front Desk",
    first_name: "Sarah",
    last_name: "Front Desk",
    name: "Sarah Front Desk",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple demo authentication
    const foundUser = demoUsers.find((u) => u.username === username)

    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("auth_user", JSON.stringify(foundUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
    window.location.href = "/"
  }

  const value = {
    user,
    isAuthenticated: !!user,
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
