"use client"

// Custom hook for task management with Django backend
import { useState, useEffect } from "react"
import apiClient from "@/lib/api-client"

interface Task {
  id: string
  task_id: string
  customer_name: string
  laptop_model: string
  issue: string
  status: "pending" | "in_progress" | "completed" | "on_hold"
  technician: string
  urgency: "low" | "medium" | "high"
  created_at: string
  updated_at: string
}

export function useTasks(filters?: {
  status?: string
  technician?: string
  search?: string
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTasks(filters)
      setTasks(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await apiClient.createTask(taskData)
      setTasks((prev) => [response.data, ...prev])
      return response.data
    } catch (err) {
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await apiClient.updateTask(id, updates)
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...response.data } : task)))
      return response.data
    } catch (err) {
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
  }
}
