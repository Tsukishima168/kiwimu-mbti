# Kiwimu Economy v2 Adapter

Last updated: 2026-07-16

## Authority boundary

- Browser payloads contain only `completion_id`, `quiz_version`, and canonical option indices.
- The API rejects extra fields, including client-supplied identity, points, amount, source, or result metadata.
- `/api/economy/mbti-completed` recomputes the MBTI result from the server scoring bank.
- A supplied Supabase access token is verified with `auth.getUser`; the API never trusts a body `user_id`.
- The service-role client refuses to run unless its URL resolves to project `xlqwfaailjyvsycjnzkz`.
- Point amount, weekly eligibility, rollout, idempotency, ledger writes, badges, and balance are selected by the canonical Shop migration.

## Runtime flow

1. V1 or V2 completes a full 40-question answer set.
2. Kiwimu submits the same completion UUID on timeout/5xx retry.
3. Authenticated users are sent through `economy_submit_event` as `mbti.completed`.
4. Anonymous users are sent through the service-role-only `economy_issue_pending_claim` operation.
5. A returned claim UUID is held in session storage only and appended to Passport login/CTA URLs as `economy_claim`.

Economy failure is non-authoritative and never blocks V1 results. V2 waits for one request for at most three seconds so an anonymous claim can be persisted before report navigation.

## Cross-repo dependency

Shop is the only migration publisher. This adapter must remain a Draft and rollout-disabled until the Shop Economy v2 migration provides and verifies:

- `economy_submit_event(JSONB, UUID)`;
- service-role-only `economy_issue_pending_claim(JSONB, TEXT, TIMESTAMPTZ, UUID)`;
- rollout enforcement for `kiwimu`;
- pending-claim expiry, idempotency, and `economy_claim_pending` consumption;
- grants, RLS, search path, hosted lint, and PostgREST visibility.
- a Vercel rate-limit rule for the anonymous issuance endpoint before Kiwimu reaches 100% rollout.

No Kiwimu migration is allowed to create shared Economy tables or RPCs.

## Verification

```bash
npm run test:economy
npx tsc --noEmit --pretty false
npx tsc --ignoreConfig --noEmit --pretty false --target ES2022 --module ESNext \
  --moduleResolution Bundler --skipLibCheck --types node --lib ES2022,DOM \
  api/economy/mbti-completed.ts
npm run build
vercel build
git diff --check
```

The API contract smoke must verify that a request containing `points=999999` is rejected with `INVALID_PROOF`, a cross-origin request is rejected, and app routes continue to render.
