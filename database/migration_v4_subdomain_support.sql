-- Migration V4: Add subdomain support and redirect mode

-- Update links table
ALTER TABLE links ADD COLUMN redirect_mode TEXT DEFAULT 'auto' CHECK(redirect_mode IN ('auto', 'iframe', 'direct'));
ALTER TABLE links ADD COLUMN is_subdomain INTEGER DEFAULT 1; -- All links are subdomain now

-- Update slug column comment (slug = subdomain now)
-- No schema change needed, just rename concept: slug → subdomain

-- Update users table for subscription expiration tracking
ALTER TABLE users ADD COLUMN subscription_expired_at INTEGER;
ALTER TABLE users ADD COLUMN subscription_grace_until INTEGER;

-- Create index for subdomain lookup (performance)
CREATE INDEX IF NOT EXISTS idx_links_slug_active ON links(slug, is_active);

-- Add comments for clarity
-- slug column now represents subdomain (e.g., 'myapp' for myapp.linkku.com)
-- redirect_mode: 'auto' (detect GAS), 'iframe' (force iframe), 'direct' (force redirect)
