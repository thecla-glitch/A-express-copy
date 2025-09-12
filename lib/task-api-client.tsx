import { apiClient, type Task, type TaskActivity, type TaskPayment } from './api'
import { User } from './use-user-management'

// Helper function to enhance user details with full_name
export const enhanceUserDetails = (user: any) => ({
  ...user,
  full_name: `${user.first_name} ${user.last_name}`.trim()
})

// Helper to enhance task data for frontend compatibility
export const enhanceTaskData = (task: Task): Task => ({
  ...task,
  assigned_to_details: enhanceUserDetails(task.assigned_to_details),
  created_by_details: enhanceUserDetails(task.created_by_details),
  negotiated_by_details: task.negotiated_by_details ? enhanceUserDetails(task.negotiated_by_details) : task.negotiated_by_details,
  // Map priority to urgency for frontend compatibility
  urgency: task.priority
})

// Task API functions
export const getTasks = async () => {
  const response = await apiClient.getTasks()
  if (response.data) {
    return {
      ...response,
      data: response.data.map(enhanceTaskData)
    }
  }
  return response
}

export const getTask = async (taskId: string) => {
  const response = await apiClient.getTask(taskId)
  if (response.data) {
    return {
      ...response,
      data: enhanceTaskData(response.data)
    }
  }
  return response
}

export const createTask = async (taskData: any, technicians: User[] = []) => {
  // Find technician ID by name
  let assignedToId = null;
  if (taskData.assigned_to) {
    const technician = technicians.find(tech => 
      `${tech.first_name} ${tech.last_name}`.trim() === taskData.assigned_to
    );
    assignedToId = technician ? technician.id : null;
  }

  // Map frontend fields to backend fields
  const backendTaskData = {
    title: `${taskData.laptop_make} ${taskData.laptop_model} - ${taskData.description?.substring(0, 50)}...` || 'Repair Task',
    description: taskData.description,
    status: 'Pending',
    priority: taskData.urgency,
    assigned_to: assignedToId, // Send the ID instead of name
    customer_name: taskData.customer_name,
    customer_phone: taskData.customer_phone,
    customer_email: taskData.customer_email,
    laptop_make: taskData.laptop_make,
    laptop_model: taskData.laptop_model,
    serial_number: taskData.serial_number,
    estimated_cost: taskData.estimated_cost ? parseFloat(taskData.estimated_cost) : null,
    total_cost: null,
    current_location: 'Front Desk Intake',
    urgency: taskData.urgency,
    date_in: new Date().toISOString().split('T')[0],
  }
  
  console.log('Sending task data to backend:', backendTaskData);
  
  const response = await apiClient.createTask(backendTaskData)
  if (response.data) {
    return {
      ...response,
      data: enhanceTaskData(response.data)
    }
  }
  return response
}

export const updateTask = async (taskId: string, updates: any) => {
  // Handle field mapping if needed
  if (updates.urgency) {
    updates.priority = updates.urgency
    delete updates.urgency
  }
  
  const response = await apiClient.updateTask(taskId, updates)
  if (response.data) {
    return {
      ...response,
      data: enhanceTaskData(response.data)
    }
  }
  return response
}

export const addTaskActivity = async (taskId: string, activityData: any) => {
  return apiClient.addTaskActivity(taskId, activityData)
}

export const addTaskPayment = async (taskId: string, paymentData: any) => {
  return apiClient.addTaskPayment(taskId, paymentData)
}

// Export the raw API client for direct access if needed
export { apiClient }