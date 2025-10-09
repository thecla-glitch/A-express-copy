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
export const getDebts = (params: any = {}) => apiClient.get('/tasks/debts/', { params });
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
export const login = (username: any, password: any) => apiClient.post('/login/', { username, password });
export const registerUser = (userData: any) => apiClient.post('/users/', userData);
export const listUsers = () => apiClient.get('/users/');
export const updateProfile = (profileData: any) => apiClient.patch('/profile/update/', profileData);
export const changePassword = (passwordData: any) => apiClient.post('/profile/change-password/', passwordData);
export const uploadProfilePicture = (formData: any) => apiClient.post('/profile/upload-picture/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const getUserDetail = (userId: any) => apiClient.get(`/users/${userId}/`);
export const updateUser = (userId: any, userData: any) => apiClient.patch(`/users/${userId}/update/`, userData);
export const deleteUser = (userId: any) => apiClient.delete(`/users/${userId}/delete/`);
export const deactivateUser = (userId: any) => apiClient.post(`/users/${userId}/deactivate/`);
export const activateUser = (userId: any) => apiClient.post(`/users/${userId}/activate/`);
export const listUsersByRole = (role: string) => apiClient.get(`/users/role/${role}/`);
export const getCostBreakdowns = (taskId: any) => apiClient.get(`/tasks/${taskId}/cost-breakdowns/`);
export const createCostBreakdown = (taskId: string, costBreakdownData: any) => apiClient.post(`/tasks/${taskId}/cost-breakdowns/`, costBreakdownData);
export const updateCostBreakdown = (taskId: any, costBreakdownId: any, costBreakdownData: any) => apiClient.patch(`/tasks/${taskId}/cost-breakdowns/${costBreakdownId}/`, costBreakdownData);
export const deleteCostBreakdown = (taskId: string, costBreakdownId: number) => apiClient.delete(`/tasks/${taskId}/cost-breakdowns/${costBreakdownId}/`);
export const approveRefund = (costBreakdownId: number) => apiClient.post(`/cost-breakdowns/${costBreakdownId}/approve/`);
export const rejectRefund = (costBreakdownId: number) => apiClient.post(`/cost-breakdowns/${costBreakdownId}/reject/`);
export const getBrands = () => apiClient.get('/brands/');
export const createBrand = (brandData: { name: string; }) => apiClient.post('/brands/', brandData);

export const getPaymentMethods = () => apiClient.get('/payment-methods/');
export const createPaymentMethod = (paymentMethodData: { name: string; }) => apiClient.post('/payment-methods/', paymentMethodData);
export const updatePaymentMethod = (paymentMethodId: number, paymentMethodData: { name: string; }) => apiClient.patch(`/payment-methods/${paymentMethodId}/`, paymentMethodData);
export const deletePaymentMethod = (paymentMethodId: number) => apiClient.delete(`/payment-methods/${paymentMethodId}/`);

export const getAccounts = () => apiClient.get('/accounts/');
export const createAccount = (accountData: { name: string; balance: number; }) => apiClient.post('/accounts/', accountData);
export const updateAccount = (accountId: number, accountData: { name: string; }) => apiClient.patch(`/accounts/${accountId}/`, accountData);
export const deleteAccount = (accountId: number) => apiClient.delete(`/accounts/${accountId}/`);