export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  JWT_EXPIRES_IN: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise' | 'pro' | 'business';
  subscription_status: 'active' | 'pending' | 'expired' | 'cancelled';
  subscription_requested: 'basic' | 'premium' | 'enterprise' | null;
  subscription_expires_at: number | null;
  is_admin: number;
  whatsapp_number: string | null;
  created_at: number;
  updated_at: number;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  email: string;
  requested_plan: 'basic' | 'premium' | 'enterprise';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  payment_proof_url: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
  approved_by: string | null;
  approved_at: number | null;
}

export interface Link {
  id: string;
  user_id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  description: string | null;
  category: string | null;
  is_active: number;
  click_count: number;
  created_at: number;
  updated_at: number;
  last_accessed_at: number | null;
}

export interface Analytics {
  id: string;
  link_id: string;
  timestamp: number;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
  subscription: string;
}

export interface CreateLinkInput {
  slug: string;
  destination_url: string;
  title?: string;
  description?: string;
  category?: string;
}

export interface UpdateLinkInput {
  slug?: string;
  destination_url?: string;
  title?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}
