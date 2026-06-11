ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id text;
