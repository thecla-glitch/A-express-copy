import { apiClient } from './api-client';

interface PaymentFilters {
    method?: string;
    is_refunded?: boolean;
    date?: string;
    category?: string;
    search?: string;
    task_payments?: boolean;
    page?: number;
    page_size?: number;
}

export const getPayments = async (filters: PaymentFilters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.method && filters.method !== 'all') params.append('method_name', filters.method);
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.is_refunded) params.append('is_refunded', String(filters.is_refunded));
        if (filters.date) params.append('date', filters.date);
        if (filters.search) params.append('search', filters.search);
        if (filters.task_payments) params.append('task_payments', String(filters.task_payments));
        if (filters.page) params.append('page', String(filters.page));
        if (filters.page_size) params.append('page_size', String(filters.page_size));

        const response = await apiClient.get('/payments/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};
