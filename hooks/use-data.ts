import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { User } from "@/lib/use-user-management"
import { Brand } from '@/lib/api'

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
