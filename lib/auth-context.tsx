"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Mock user data with all roles
const mockUsers = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Admin User",
    email: "admin@aplusexpress.com",
    role: "Administrator",
  },
  {
    id: "2",
    username: "manager",
    password: "manager123",
    name: "Shop Manager",
    email: "manager@aplusexpress.com",
    role: "Manager",
  },
  {
    id: "3",
    username: "technician",
    password: "tech123",
    name: "John Technician",
    email: "john.tech@aplusexpress.com",
    role: "Technician",
  },
  {
    id: "4",
    username: "frontdesk",
    password: "desk123",
    name: "Sarah Receptionist",
    email: "sarah.desk@aplusexpress.com",
    role: "Front Desk",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("aplus-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("aplus-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.username === username && u.password === password)

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      }
      setUser(userData)
      localStorage.setItem("aplus-user", JSON.stringify(userData))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("aplus-user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
