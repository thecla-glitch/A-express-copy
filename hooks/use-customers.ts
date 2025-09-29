import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useCustomers(query: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      const response = await apiClient.get(`customers/search/?query=${query}`);
      return response.data;
    },
    enabled: !!query,
  });

  return {
    data,
    isLoading,
    isError,
  }
}
