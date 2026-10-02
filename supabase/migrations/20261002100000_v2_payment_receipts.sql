-- Durable, server-only delivery records. Payment/order proofs never go into email.
BEGIN;

CREATE TABLE IF NOT EXISTS public.v2_payment_receipts (
  order_id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  user_uid UUID NOT NULL,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  mbti_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'review')),
  lease_id UUID NULL,
  claimed_at TIMESTAMPTZ NULL,
  first_attempt_at TIMESTAMPTZ NULL,
  sent_at TIMESTAMPTZ NULL,
  provider_message_id TEXT NULL,
  error_code TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_receipts_user ON public.v2_payment_receipts(user_uid);
CREATE INDEX IF NOT EXISTS idx_line_pay_orders_confirmed_user
  ON public.line_pay_orders(user_uid, confirmed_at DESC)
  WHERE status = 'confirmed';

ALTER TABLE public.v2_payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_payment_receipts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.v2_payment_receipts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.v2_payment_receipts TO service_role;

COMMIT;
