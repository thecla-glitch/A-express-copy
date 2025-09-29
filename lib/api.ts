export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}


export interface UserResponse {
  id: number
  username: string
  email: string
  role: "Manager" | "Technician" | "Front Desk"
  first_name: string
  last_name: string
  phone: string
  profile_picture: string
  is_active: boolean
  is_workshop: boolean
  created_at: string
  last_login: string
  address?: string
  bio?: string
}

export interface Brand {
  id: number;
  name: string;
}

export interface CostBreakdown {
  id: number;
  description: string;
  amount: string;
  cost_type: 'Additive' | 'Subtractive' | 'Inclusive';
  category: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: number;
  assigned_to_details: UserResponse;
  created_by: number;
  created_by_details: UserResponse;
  created_at: string;
  updated_at: string;
  due_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  brand: number;
  brand_details: Brand;
  device_type: string;
  device_notes: string;
  laptop_model: string;
  serial_number: string;
  estimated_cost: string;
  total_cost: string;
  payment_status: string;
  current_location: string;
  urgency: string;
  date_in: string;
  approved_date: string;
  paid_date: string;
  date_out: string;
  negotiated_by: number;
  negotiated_by_details: UserResponse;
  activities: any[];
  payments: any[];
  outstanding_balance: number;
  is_commissioned: boolean;
  commissioned_by: string;
  cost_breakdowns: CostBreakdown[];
}

export interface TaskActivity {
  id: number;
  task: number;
  user: UserResponse;
  type: string;
  message: string;
  timestamp: string;
}

export interface TaskPayment {
  id: number;
  task: number;
  amount: string;
  method: string;
  date: string;
  reference: string;
}
