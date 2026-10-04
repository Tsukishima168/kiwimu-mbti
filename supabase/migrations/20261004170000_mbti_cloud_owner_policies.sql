-- V1 cloud records are private account data, not public personality pages.
-- Apply this before adding mbti to PostgREST's exposed schemas.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $policies$
DECLARE item record;
BEGIN
  FOR item IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'mbti' AND tablename IN
      ('users', 'quiz_progress', 'test_runs', 'share_links', 'user_behaviors', 'user_stats')
  LOOP
    EXECUTE format('DROP POLICY %I ON mbti.%I', item.policyname, item.tablename);
  END LOOP;
END;
$policies$;

REVOKE ALL ON SCHEMA mbti FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA mbti TO authenticated, service_role;
REVOKE ALL ON TABLE mbti.users, mbti.quiz_progress, mbti.test_runs,
  mbti.share_links, mbti.user_behaviors, mbti.user_stats, mbti.line_pay_orders
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON mbti.users, mbti.user_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mbti.quiz_progress TO authenticated;
GRANT SELECT, INSERT ON mbti.test_runs, mbti.share_links TO authenticated;
GRANT INSERT ON mbti.user_behaviors TO authenticated;
GRANT ALL ON TABLE mbti.users, mbti.quiz_progress, mbti.test_runs,
  mbti.share_links, mbti.user_behaviors, mbti.user_stats, mbti.line_pay_orders TO service_role;

ALTER TABLE mbti.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.line_pay_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti.test_runs ALTER COLUMN is_public SET DEFAULT false;

CREATE POLICY account_owner ON mbti.users TO authenticated
  USING (uid = (SELECT auth.uid())::text)
  WITH CHECK (uid = (SELECT auth.uid())::text);
CREATE POLICY account_owner ON mbti.quiz_progress TO authenticated
  USING (uid = (SELECT auth.uid())::text)
  WITH CHECK (uid = (SELECT auth.uid())::text);
CREATE POLICY account_owner ON mbti.test_runs TO authenticated
  USING (uid = (SELECT auth.uid())::text)
  WITH CHECK (uid = (SELECT auth.uid())::text);
CREATE POLICY account_owner_read ON mbti.share_links FOR SELECT TO authenticated
  USING (uid = (SELECT auth.uid())::text);
CREATE POLICY account_owner_insert ON mbti.share_links FOR INSERT TO authenticated
  WITH CHECK (uid = (SELECT auth.uid())::text AND EXISTS (
    SELECT 1 FROM mbti.test_runs run
    WHERE run.id = test_id AND run.uid = (SELECT auth.uid())::text
  ));
CREATE POLICY account_owner_insert ON mbti.user_behaviors FOR INSERT TO authenticated
  WITH CHECK (uid = (SELECT auth.uid())::text);
CREATE POLICY account_owner ON mbti.user_stats TO authenticated
  USING (uid = (SELECT auth.uid())::text)
  WITH CHECK (uid = (SELECT auth.uid())::text);

NOTIFY pgrst, 'reload schema';
COMMIT;
