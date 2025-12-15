export interface User {
  id: string;
  email: string;
  name: string | null;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise' | 'pro' | 'business';
  subscription_expires_at?: number | null;
  is_admin?: boolean;
  created_at?: number;
}

export interface Link {
  id: string;
  slug: string; // Represents subdomain (e.g., 'myapp' for myapp.digitalin.online)
  destination_url: string;
  title: string | null;
  description: string | null;
  category: string | null;
  redirect_mode: 'auto' | 'iframe' | 'direct';
  is_subdomain: boolean;
  is_active: boolean;
  click_count: number;
  created_at: number;
  updated_at: number;
  last_accessed_at: number | null;
}

export interface CreateLinkInput {
  slug: string; // Subdomain name
  destination_url: string;
  title?: string;
  description?: string;
  category?: string;
  redirect_mode?: 'auto' | 'iframe' | 'direct';
}

export interface UpdateLinkInput {
  slug?: string;
  destination_url?: string;
  title?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}
