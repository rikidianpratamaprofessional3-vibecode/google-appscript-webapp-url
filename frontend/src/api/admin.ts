import { API_BASE_URL } from '../config';
import { api } from './client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  subscription: string;
  subscription_status: string;
  subscription_requested: string | null;
  subscription_expires_at: number | null;
  is_admin: number;
  created_at: number;
  link_count: number;
}

export interface AdminStats {
  users: {
    total: number;
    by_plan: Array<{ subscription: string; count: number }>;
  };
  links: {
    total: number;
  };
  clicks: {
    total: number;
  };
  payments: {
    pending: number;
  };
  revenue: {
    total: number;
    formatted: string;
  };
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  email: string;
  requested_plan: string;
  amount: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface Setting {
  value: string;
  description: string | null;
  updated_at: number;
  updated_by: string | null;
}

export const adminApi = {
  // Stats
  getStats: () => 
    api.get<AdminStats>(`${API_BASE_URL}/api/admin/stats`),

  // Users
  getAllUsers: () => 
    api.get<{ users: User[]; total: number }>(`${API_BASE_URL}/api/admin/users`),

  // Payment requests
  getPaymentRequests: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<{ requests: PaymentRequest[]; total: number }>(`${API_BASE_URL}/api/admin/payments${query}`);
  },

  // Approve/Reject subscription
  approveSubscription: (userId: string, plan: 'basic' | 'premium' | 'enterprise') =>
    api.post(`${API_BASE_URL}/api/admin/approve`, { userId, plan }),

  rejectSubscription: (userId: string, reason?: string) =>
    api.post(`${API_BASE_URL}/api/admin/reject`, { userId, reason }),

  downgradeUser: (userId: string) =>
    api.post(`${API_BASE_URL}/api/admin/downgrade`, { userId }),

  // Settings
  getSettings: () =>
    api.get<{ settings: Record<string, Setting> }>(`${API_BASE_URL}/api/settings`),

  getSetting: (key: string) =>
    api.get<{ key: string; value: string }>(`${API_BASE_URL}/api/settings/${key}`),

  updateSetting: (key: string, value: string) =>
    api.put(`${API_BASE_URL}/api/settings/${key}`, { key, value }),

  updateSettings: (settings: Record<string, string>) =>
    api.post(`${API_BASE_URL}/api/settings`, { settings }),
};
