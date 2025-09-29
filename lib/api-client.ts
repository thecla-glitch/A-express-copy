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
export const createCustomer = (data: any) => apiClient.post('/customers/create/', data);

export const getTaskActivities = (taskId: string) => apiClient.get(`/tasks/${taskId}/activities/`);
export const addTaskActivity = (taskId: string, data: any) => apiClient.post(`/tasks/${taskId}/add-activity/`, data);




export const getTaskPayments = (taskId: string) => apiClient.get(`/tasks/${taskId}/payments/`);
export const addTaskPayment = (taskId: string, data: any) => apiClient.post(`/tasks/${taskId}/add-payment/`, data);

export const listTechnicians = () => apiClient.get('/technicians/');
export const getLocations = () => apiClient.get('/locations/');
export const listWorkshopLocations = () => apiClient.get('/workshop-locations/');
export const listWorkshopTechnicians = () => apiClient.get('/workshop-technicians/');

// Functions from ApiClient class
export const login = (username, password) => apiClient.post('/login/', { username, password });
export const registerUser = (userData) => apiClient.post('/register/', userData);
export const listUsers = () => apiClient.get('/users/');
export const updateProfile = (profileData) => apiClient.patch('/profile/update/', profileData);
export const changePassword = (passwordData) => apiClient.post('/profile/change-password/', passwordData);
export const uploadProfilePicture = (formData) => apiClient.post('/profile/upload-picture/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const getUserDetail = (userId) => apiClient.get(`/users/${userId}/`);
export const updateUser = (userId, userData) => apiClient.patch(`/users/${userId}/update/`, userData);
export const deleteUser = (userId) => apiClient.delete(`/users/${userId}/delete/`);
export const deactivateUser = (userId) => apiClient.post(`/users/${userId}/deactivate/`);
export const activateUser = (userId) => apiClient.post(`/users/${userId}/activate/`);
export const listUsersByRole = (role) => apiClient.get(`/users/role/${role}/`);
export const getCostBreakdowns = (taskId) => apiClient.get(`/tasks/${taskId}/cost-breakdowns/`);
export const createCostBreakdown = (taskId, costBreakdownData) => apiClient.post(`/tasks/${taskId}/cost-breakdowns/`, costBreakdownData);
export const updateCostBreakdown = (taskId, costBreakdownId, costBreakdownData) => apiClient.patch(`/tasks/${taskId}/cost-breakdowns/${costBreakdownId}/`, costBreakdownData);
export const deleteCostBreakdown = (taskId, costBreakdownId) => apiClient.delete(`/tasks/${taskId}/cost-breakdowns/${costBreakdownId}/`);
export const getBrands = () => apiClient.get('/brands/');
export const createBrand = (brandData) => apiClient.post('/brands/', brandData);