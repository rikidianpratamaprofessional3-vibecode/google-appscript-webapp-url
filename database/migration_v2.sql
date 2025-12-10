-- Migration V2: Add subscription management & admin features

-- Update users table with new subscription fields
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'pending', 'expired', 'cancelled'));
ALTER TABLE users ADD COLUMN subscription_requested TEXT CHECK(subscription_requested IN ('basic', 'premium'));
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN whatsapp_number TEXT;

-- Payment requests table for manual payment tracking
CREATE TABLE IF NOT EXISTS payment_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  requested_plan TEXT NOT NULL CHECK(requested_plan IN ('basic', 'premium')),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  payment_proof_url TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  approved_by TEXT,
  approved_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created ON payment_requests(created_at);

-- Settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at INTEGER NOT NULL,
  updated_by TEXT
);

-- Insert default settings
INSERT INTO settings (key, value, description, updated_at) VALUES
  ('admin_whatsapp', '6281234567890', 'Admin WhatsApp number for payment confirmation', strftime('%s', 'now') * 1000),
  ('site_name', 'GAS Link', 'Website name', strftime('%s', 'now') * 1000),
  ('support_email', 'support@gaslink.com', 'Support email address', strftime('%s', 'now') * 1000)
ON CONFLICT(key) DO NOTHING;
