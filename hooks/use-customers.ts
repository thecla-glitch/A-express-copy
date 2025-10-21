import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Customer, PaginatedResponse } from '@/lib/api';

export function useCustomers({ query, page }: { query: string; page: number }) {
  const { data, isLoading, isError } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers', { query, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) {
        params.set('search', query);
      }
      if (page) {
        params.set('page', page.toString());
      }
      const response = await apiClient.get(`customers/?${params.toString()}`);
      return response.data;
    },
  });

  return { data, isLoading, isError };
}
