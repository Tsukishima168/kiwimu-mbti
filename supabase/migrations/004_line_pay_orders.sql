-- ============================================
-- KIWIMU MBTI Lab - LINE Pay V2 order log
-- ============================================
-- This table is used by the V2 paywall MVP flow.
-- It intentionally stores operational payment metadata only; LINE Pay card/payment
-- credentials never pass through or get stored by Kiwimu.

CREATE SCHEMA IF NOT EXISTS mbti;

CREATE TABLE IF NOT EXISTS mbti.line_pay_orders (
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
  ON mbti.line_pay_orders(user_uid);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_status
  ON mbti.line_pay_orders(status);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_mbti_type
  ON mbti.line_pay_orders(mbti_type);

CREATE INDEX IF NOT EXISTS idx_line_pay_orders_line_transaction_id
  ON mbti.line_pay_orders(line_transaction_id);

CREATE OR REPLACE FUNCTION mbti.update_line_pay_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_line_pay_orders_updated_at ON mbti.line_pay_orders;
CREATE TRIGGER update_line_pay_orders_updated_at
  BEFORE UPDATE ON mbti.line_pay_orders
  FOR EACH ROW EXECUTE FUNCTION mbti.update_line_pay_orders_updated_at();

ALTER TABLE mbti.line_pay_orders ENABLE ROW LEVEL SECURITY;

-- No public policies are added on purpose.
-- Server-side API routes use the service role key through `server/supabase/user-admin.ts`.
