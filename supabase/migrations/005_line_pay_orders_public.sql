-- LINE Pay order log in public schema
-- Replaces the mbti.line_pay_orders approach (mbti schema not exposed in PostgREST).
-- Accessed via service role key only — no public RLS policies.

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS v2_unlocked_at TIMESTAMPTZ NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.line_pay_orders (
  order_id TEXT PRIMARY KEY,
  mbti_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'direct',
  user_uid UUID NULL,
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN (
      'created',
      'requested',
      'request_failed',
      'confirmed',
      'confirm_failed',
      'cancelled'
    )),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TWD',
  line_transaction_id TEXT NULL,
  line_return_code TEXT NULL,
  line_return_message TEXT NULL,
  request_payload JSONB NULL,
  request_response JSONB NULL,
  confirm_response JSONB NULL,
  cancel_context JSONB NULL,
  last_error TEXT NULL,
  requested_at TIMESTAMPTZ NULL,
  confirmed_at TIMESTAMPTZ NULL,
  cancelled_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_user_uid
  ON public.line_pay_orders(user_uid);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_status
  ON public.line_pay_orders(status);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_mbti_type
  ON public.line_pay_orders(mbti_type);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_line_transaction_id
  ON public.line_pay_orders(line_transaction_id);

CREATE OR REPLACE FUNCTION public.update_line_pay_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_line_pay_orders_updated_at ON public.line_pay_orders;
CREATE TRIGGER update_line_pay_orders_updated_at
  BEFORE UPDATE ON public.line_pay_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_line_pay_orders_updated_at();

ALTER TABLE public.line_pay_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_pay_orders FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.line_pay_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.line_pay_orders FROM anon;
REVOKE ALL ON TABLE public.line_pay_orders FROM authenticated;
REVOKE ALL ON FUNCTION public.update_line_pay_orders_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_line_pay_orders_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.update_line_pay_orders_updated_at() FROM authenticated;

-- No public policies or grants — server-side API routes use the service role key only.
