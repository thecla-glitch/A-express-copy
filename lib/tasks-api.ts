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

export const getTaskPriorityOptions = async () => {
    try {
        const response = await apiClient.get('/tasks/priority-options/');
        return response.data;
    } catch (error) {
        console.error('Error fetching task priority options:', error);
        throw error;
    }
};
