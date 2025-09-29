import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, getTasks, getTask, listWorkshopLocations, listWorkshopTechnicians, updateTask } from '@/lib/api-client'
import { getTaskStatusOptions, getTaskPriorityOptions } from '@/lib/tasks-api'
import { User } from "@/lib/use-user-management"
import { Brand, Task } from '@/lib/api'

interface Location {
    id: number;
    name: string;
  }

export function useTechnicians() {
  return useQuery<User[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const response = await apiClient.get('/users/role/Technician/')
      return response.data
    },
  })
}

export function useManagers() {
    return useQuery<User[]>({
      queryKey: ['managers'],
      queryFn: async () => {
        const response = await apiClient.get('/users/role/Manager/')
        return response.data
      },
    })
  }

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await apiClient.get('/brands/')
      return response.data
    },
  })
}

export function useLocations() {
    return useQuery<Location[]>({
      queryKey: ['locations'],
      queryFn: async () => {
        const response = await apiClient.get('/locations/')
        return response.data
      },
    })
  }


export function useInProgressTasks(isWorkshopView: boolean, userId: string | undefined) {
    return useQuery<Task[]>({
        queryKey: ['inProgressTasks', isWorkshopView, userId],
        queryFn: async () => {
            if (!userId) return [];
            const params = isWorkshopView
                ? { workshop_technician: userId, workshop_status: "In Workshop" }
                : { assigned_to: userId, status: "In Progress" };
            const response = await getTasks(params);
            if (isWorkshopView) {
                return response.data;
            }
            return response.data.filter((task: any) => task.workshop_status !== "In Workshop");
        },
        enabled: !!userId, // only run the query if the user ID is available
    });
}

export function useInWorkshopTasks() {
    return useQuery<Task[]>({
        queryKey: ['inWorkshopTasks'],
        queryFn: async () => {
            const response = await getTasks({ workshop_status: "In Workshop" });
            return response.data;
        },
    });
}

export function useCompletedTasks(userId: string | undefined) {
    return useQuery<Task[]>({
        queryKey: ['completedTasks', userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await getTasks({ status: "Completed", assigned_to: userId });
            return response.data;
        },
        enabled: !!userId, // only run the query if the user ID is available
    });
}

export function useTask(taskId: string) {
    return useQuery<Task>({
        queryKey: ['task', taskId],
        queryFn: async () => {
            const response = await getTask(taskId);
            return response.data;
        },
        enabled: !!taskId,
    });
}

export function useTaskStatusOptions() {
    return useQuery<string[][]>({
        queryKey: ['taskStatusOptions'],
        queryFn: async () => {
            const response = await getTaskStatusOptions();
            return response;
        },
    });
}

export function useTaskPriorityOptions() {
    return useQuery<string[][]>({
        queryKey: ['taskPriorityOptions'],
        queryFn: async () => {
            const response = await getTaskPriorityOptions();
            return response;
        },
    });
}

export function useWorkshopLocations() {
    return useQuery<Location[]>({
        queryKey: ['workshopLocations'],
        queryFn: async () => {
            const response = await listWorkshopLocations();
            return response.data;
        },
    });
}

export function useWorkshopTechnicians() {
    return useQuery<User[]>({
        queryKey: ['workshopTechnicians'],
        queryFn: async () => {
            const response = await listWorkshopTechnicians();
            return response.data;
        },
    });
}
