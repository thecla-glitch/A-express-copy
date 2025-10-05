import { useQuery } from '@tanstack/react-query';
import { getPaymentMethods } from '@/lib/api-client';

export interface PaymentMethod {
  id: number;
  name: string;
}

export function usePaymentMethods() {
  return useQuery<PaymentMethod[]>({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const response = await getPaymentMethods();
      return response.data;
    },
  });
}
