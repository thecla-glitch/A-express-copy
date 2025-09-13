import { apiClient } from './api-client';

export const listCollaborationRequests = async () => {
  return apiClient.get('/collaboration-requests/');
};

export const updateCollaborationRequest = async (requestId: string, data: any) => {
  return apiClient.patch(`/collaboration-requests/${requestId}/`, data);
};

export const createCollaborationRequest = async (taskId: string, data: any) => {
    return apiClient.post(`/tasks/${taskId}/collaboration-requests/`, data);
  };
