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
  subscription: 'free' | 'pro' | 'business';
  subscription_expires_at: number | null;
  created_at: number;
  updated_at: number;
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
