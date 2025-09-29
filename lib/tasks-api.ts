import { apiClient } from './api-client';

export const getTaskStatusOptions = async () => {
    try {
        const response = await apiClient.get('/tasks/status-options/');
        return response.data;
    } catch (error) {
        console.error('Error fetching task status options:', error);
        throw error;
    }
};

export const getTaskUrgencyOptions = async () => {
    try {
        const response = await apiClient.get('/tasks/urgency-options/');
        return response.data;
    } catch (error) {
        console.error('Error fetching task urgency options:', error);
        throw error;
    }
};
