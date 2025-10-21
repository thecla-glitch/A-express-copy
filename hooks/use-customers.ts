import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Customer } from '@/lib/api';

export function useCustomers(query: string) {
  const { data: customers, isLoading, isError } = useQuery<Customer[]>({
    queryKey: ['customers', query],
    queryFn: async () => {
      const url = query ? `customers/search/?query=${query}` : 'customers/';
      const response = await apiClient.get(url);
      return response.data;
    },
  });

  return { customers, isLoading, isError };
}