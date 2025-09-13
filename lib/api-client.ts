import axios from 'axios';
import { getApiUrl } from './config';

export const apiClient = axios.create({
  baseURL: getApiUrl(''),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const authTokens = localStorage.getItem('auth_tokens');
  if (authTokens) {
    const parsedTokens = JSON.parse(authTokens);
    const token = parsedTokens.access;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getProfile = () => apiClient.get('/profile/');
export const getTasks = (params: any = {}) => apiClient.get('/tasks/', { params });
export const getTask = (id: string) => apiClient.get(`/tasks/${id}/`);
export const createTask = (data: any) => apiClient.post('/tasks/', data);
export const updateTask = (id: string, data: any) => apiClient.patch(`/tasks/${id}/`, data);
export const deleteTask = (id: string) => apiClient.delete(`/tasks/${id}/`);

export const getTaskActivities = (taskId: string) => apiClient.get(`/tasks/${taskId}/activities/`);
export const addTaskActivity = (taskId: string, data: any) => apiClient.post(`/tasks/${taskId}/add-activity/`, data);

export const getTaskPayments = (taskId: string) => apiClient.get(`/tasks/${taskId}/payments/`);
export const addTaskPayment = (taskId: string, data: any) => apiClient.post(`/tasks/${taskId}/add-payment/`, data);