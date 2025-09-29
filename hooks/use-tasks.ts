"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTask as apiUpdateTask } from '@/lib/api-client'
import { Task } from '@/lib/api'

export function useTasks(filters?: {
  status?: string
  technician?: string
  search?: string
}) {
  return useQuery<Task[]>({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters).then(res => res.data),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => createTask(taskData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Task> }) => apiUpdateTask(id, updates).then(res => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });
}
