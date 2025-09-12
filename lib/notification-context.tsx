"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  priority: "low" | "medium" | "high"
  read: boolean
  timestamp: Date
  taskId?: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Task Stuck Alert",
      message: "Task T-1015 has been stuck in 'Awaiting Parts' for 12 days",
      type: "warning",
      priority: "high",
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      taskId: "T-1015",
      actionUrl: "/dashboard/tasks/T-1015",
    },
    {
      id: "2",
      title: "Critical Bottleneck",
      message: "Task T-1019 requires immediate attention - 10 days stuck",
      type: "error",
      priority: "high",
      read: false,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      taskId: "T-1019",
      actionUrl: "/dashboard/tasks/T-1019",
    },
    {
      id: "3",
      title: "Payment Received",
      message: "Payment of $299.99 received for Task T-1001",
      type: "success",
      priority: "medium",
      read: true,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      taskId: "T-1001",
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Simulate real-time notifications for stuck tasks
  useEffect(() => {
    const interval = setInterval(
      () => {
        // Check for tasks that might be stuck (this would normally come from your backend)
        const now = new Date()
        const shouldAddNotification = Math.random() < 0.1 // 10% chance every 5 minutes

        if (shouldAddNotification) {
          addNotification({
            title: "Task Status Update",
            message: `Task T-${Math.floor(Math.random() * 9000) + 1000} status has been updated`,
            type: "info",
            priority: "low",
          })
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
