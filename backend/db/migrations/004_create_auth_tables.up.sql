CREATE TABLE user_accounts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_accounts_email ON user_accounts(email);
CREATE INDEX idx_user_accounts_verification_token ON user_accounts(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX idx_user_accounts_reset_token ON user_accounts(reset_token) WHERE reset_token IS NOT NULL;

CREATE OR REPLACE FUNCTION update_user_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_accounts_updated_at
  BEFORE UPDATE ON user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_account_timestamp();

ALTER TABLE users
  ADD COLUMN account_id BIGINT REFERENCES user_accounts(id) ON DELETE SET NULL;

CREATE INDEX idx_users_account_id ON users(account_id);
