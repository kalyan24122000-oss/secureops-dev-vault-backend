CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    private_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS private_key TEXT;

CREATE TABLE IF NOT EXISTS pending_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'forgot_password')),
    password_hash TEXT,
    otp_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (email, purpose)
);

CREATE TABLE IF NOT EXISTS vault_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('server', 'api_key', 'database', 'note')),
    title TEXT NOT NULL,
    subtitle TEXT,
    search_text TEXT NOT NULL DEFAULT '',
    cipher_text TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_user_type ON vault_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_vault_search ON vault_items USING GIN (to_tsvector('simple', search_text));
