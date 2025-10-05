import { apiClient } from './api-client';

export const getPayments = async () => {
    try {
        const response = await apiClient.get('/payments/');
        return response.data;
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};
