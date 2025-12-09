export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric, hyphens, and underscores
  // Length: 3-50 characters
  const slugRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return slugRegex.test(slug);
}

export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 50);
}

// Reserved slugs that cannot be used
export const RESERVED_SLUGS = [
  'api',
  'admin',
  'dashboard',
  'login',
  'signup',
  'logout',
  'auth',
  'settings',
  'billing',
  'analytics',
  'static',
  'assets',
  'public',
  'health',
  'status',
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}
