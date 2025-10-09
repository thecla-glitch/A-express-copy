import { apiClient } from './api-client';

interface PaymentFilters {
    search?: string;
    method?: string;
    is_refunded?: boolean;
    date?: string;
}

export const getPayments = async (filters: PaymentFilters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.search) params.append('task__title', filters.search);
        if (filters.method && filters.method !== 'all') params.append('method_name', filters.method);
        if (filters.is_refunded) params.append('is_refunded', String(filters.is_refunded));
        if (filters.date) params.append('date', filters.date);

        const response = await apiClient.get('/payments/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};
