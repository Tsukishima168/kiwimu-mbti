-- Private durable log; no customer identity is included in Discord messages.
BEGIN;
CREATE TABLE IF NOT EXISTS public.v2_merchant_notifications (
  order_id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'review')),
  lease_id UUID NULL,
  claimed_at TIMESTAMPTZ NULL,
  sent_at TIMESTAMPTZ NULL,
  provider_message_id TEXT NULL,
  error_code TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.v2_merchant_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_merchant_notifications FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.v2_merchant_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.v2_merchant_notifications TO service_role;
COMMIT;
