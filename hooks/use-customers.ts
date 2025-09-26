import useSWR from 'swr'
import { apiClient } from '@/lib/api-client'

export function useCustomers(query: string) {
  const { data, error, isLoading } = useSWR(query ? `customers/search/?query=${query}` : null, apiClient.get)

  return {
    data: data?.data,
    isLoading,
    isError: error,
  }
}
