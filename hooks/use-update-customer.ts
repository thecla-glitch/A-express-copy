import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Customer, PhoneNumber } from '@/lib/api';

// This allows for phone numbers that don't have an ID yet
type UpdatablePhoneNumber = Omit<PhoneNumber, 'id'> & { id?: number };

type UpdatableCustomer = Omit<Customer, 'has_debt' | 'phone_numbers'> & {
  phone_numbers: UpdatablePhoneNumber[];
};

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: UpdatableCustomer) => {
      const response = await apiClient.put(`customers/${customer.id}/`, customer);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}