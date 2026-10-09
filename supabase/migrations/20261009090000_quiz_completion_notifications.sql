-- Apply before deploying the new completion endpoint. No payment/auth tables change.
BEGIN;
CREATE TABLE public.quiz_completion_notifications (
  completion_id UUID PRIMARY KEY,
  evidence_hash TEXT NOT NULL CHECK (evidence_hash ~ '^[0-9a-f]{64}$'),
  status TEXT NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'review', 'retry')),
  delivered_channels TEXT[] NOT NULL DEFAULT '{}',
  retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.quiz_notification_budgets (
  bucket TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  used INTEGER NOT NULL CHECK (used > 0)
);
ALTER TABLE public.quiz_completion_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_completion_notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_notification_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_notification_budgets FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_completion_notifications, public.quiz_notification_budgets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.quiz_completion_notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_notification_budgets TO service_role;
CREATE POLICY quiz_notification_service_only ON public.quiz_completion_notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY quiz_budget_service_only ON public.quiz_notification_budgets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Browser roles cannot execute this atomic reservation. No raw IP is stored.
CREATE FUNCTION public.claim_quiz_completion_notification(
  p_completion_id UUID, p_evidence_hash TEXT, p_client_hash TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_window TIMESTAMPTZ;
  v_existing public.quiz_completion_notifications%ROWTYPE;
  v_bucket TEXT;
  v_used INTEGER;
BEGIN
  IF p_completion_id IS NULL OR p_evidence_hash IS NULL OR p_client_hash IS NULL
    OR p_evidence_hash !~ '^[0-9a-f]{64}$' OR p_client_hash !~ '^[0-9a-f]{64}$' THEN RETURN jsonb_build_object('status', 'invalid'); END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(73910920261009);
  v_window := date_trunc('hour', clock_timestamp());
  SELECT * INTO v_existing FROM public.quiz_completion_notifications WHERE completion_id = p_completion_id;
  IF FOUND THEN
    IF v_existing.evidence_hash <> p_evidence_hash THEN RETURN jsonb_build_object('status', 'conflict'); END IF;
    -- A concurrent request must retain its outbox while the first delivery settles.
    -- Never re-claim sending: its provider outcome may already be accepted.
    IF v_existing.status = 'sending' THEN RETURN jsonb_build_object('status', 'retry', 'retryAfter', 30); END IF;
    IF v_existing.status = 'retry' AND v_existing.retry_at <= clock_timestamp() THEN
      UPDATE public.quiz_completion_notifications SET status = 'sending', updated_at = clock_timestamp() WHERE completion_id = p_completion_id;
      RETURN jsonb_build_object('status', 'claimed', 'deliveredChannels', to_jsonb(v_existing.delivered_channels));
    END IF;
    IF v_existing.status = 'retry' THEN
      RETURN jsonb_build_object('status', 'retry', 'retryAfter', greatest(1, ceil(extract(epoch FROM v_existing.retry_at - clock_timestamp()))));
    END IF;
    RETURN jsonb_build_object('status', 'duplicate');
  END IF;
  -- 12 completions/hour/IP and 600/hour/site, shared by all versions.
  FOREACH v_bucket IN ARRAY ARRAY['global', 'client:' || p_client_hash] LOOP
    SELECT used INTO v_used FROM public.quiz_notification_budgets WHERE bucket = v_bucket AND window_start = v_window;
    IF FOUND AND v_used >= (CASE WHEN v_bucket = 'global' THEN 600 ELSE 12 END) THEN RETURN jsonb_build_object('status', 'limited'); END IF;
  END LOOP;
  -- IDs remain permanently to prevent delayed replays; only expired rate keys are removed.
  DELETE FROM public.quiz_notification_budgets WHERE window_start < v_window;
  FOREACH v_bucket IN ARRAY ARRAY['global', 'client:' || p_client_hash] LOOP
    INSERT INTO public.quiz_notification_budgets(bucket, window_start, used) VALUES(v_bucket, v_window, 1)
      ON CONFLICT (bucket) DO UPDATE SET used = public.quiz_notification_budgets.used + 1;
  END LOOP;
  INSERT INTO public.quiz_completion_notifications(completion_id, evidence_hash) VALUES(p_completion_id, p_evidence_hash);
  RETURN jsonb_build_object('status', 'claimed', 'deliveredChannels', '[]'::jsonb);
END;
$$;
REVOKE ALL ON FUNCTION public.claim_quiz_completion_notification(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_quiz_completion_notification(UUID, TEXT, TEXT) TO service_role;
COMMENT ON TABLE public.quiz_completion_notifications IS 'Server-only delivery guard. No answers, raw IP, customer identity, or payment data.';
COMMIT;
