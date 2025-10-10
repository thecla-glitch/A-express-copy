"use client"

import { useQuery } from '@tanstack/react-query'
import { getPayments } from '@/lib/payments-api'

interface PaymentFilters {
    method?: string;
    is_refunded?: boolean;
    date?: string;
}

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => getPayments(filters),
  });
}