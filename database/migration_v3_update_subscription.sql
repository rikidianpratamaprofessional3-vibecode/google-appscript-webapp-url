-- Migration V3: Update subscription enum to include new plans

-- Create new users table with updated constraints
CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  subscription TEXT DEFAULT 'free' CHECK(subscription IN ('free', 'basic', 'premium', 'enterprise', 'pro', 'business')),
  subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'pending', 'expired', 'cancelled')),
  subscription_requested TEXT CHECK(subscription_requested IN ('basic', 'premium', 'enterprise')),
  subscription_expires_at INTEGER,
  is_admin INTEGER DEFAULT 0,
  whatsapp_number TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Copy data from old table to new table
INSERT INTO users_new SELECT * FROM users;

-- Drop old table
DROP TABLE users;

-- Rename new table
ALTER TABLE users_new RENAME TO users;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
