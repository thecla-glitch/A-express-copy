import useSWR from 'swr'
import { apiClient } from '@/lib/api-client'

export function useReferrers(search: string) {
  const { data, error, isLoading } = useSWR(
    search ? `/referrers/search/?query=${search}` : null,
    apiClient.get
  )

  return {
    data: data?.data,
    error,
    isLoading,
  }
}
