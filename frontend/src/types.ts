export interface User {
  id: string;
  email: string;
  name: string | null;
  subscription: 'free' | 'pro' | 'business';
  subscription_expires_at?: number | null;
  created_at?: number;
}

export interface Link {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean;
  click_count: number;
  created_at: number;
  updated_at: number;
  last_accessed_at: number | null;
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
