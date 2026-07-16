# Kiwimu Economy v2 Adapter

Last updated: 2026-07-16

## Authority boundary

- Browser completion payloads contain only a server-issued `attempt_proof`, `completion_id`, `quiz_version`, and canonical option indices.
- The API rejects extra fields, including client-supplied identity, points, amount, source, or result metadata.
- `/api/economy/mbti-attempt` creates a short-lived, user-bound when available, one-time attempt credential.
- `/api/economy/mbti-completed` recomputes the MBTI result from the server scoring bank; the canonical RPC atomically consumes the attempt credential and creates the event or pending claim.
- A supplied Supabase access token is verified with `auth.getUser`; the API never trusts a body `user_id`.
- The service-role client refuses to run unless its URL resolves to project `xlqwfaailjyvsycjnzkz`.
- Point amount, weekly eligibility, rollout, idempotency, ledger writes, badges, and balance are selected by the canonical Shop migration.

## Runtime flow

1. V1 or V2 requests an attempt proof when the user starts the quiz. Issuance never blocks the quiz UI.
2. Completion writes the answer indices, stable completion UUID, and attempt proof to a bounded local outbox before any network request.
3. Result navigation happens immediately. Timeout, 5xx, offline, hidden-tab, or reload paths retry the same completion UUID in the background.
4. `economy_complete_mbti_attempt` validates expiry, minimum elapsed time, optional subject binding, one-time use, result hash, and idempotency in one transaction.
5. Authenticated attempts submit `mbti.completed`; anonymous attempts create an expiring pending claim.
6. A returned claim UUID is held in session storage only and appended to Passport login/CTA URLs as `economy_claim`.

Economy failure is non-authoritative and never blocks V1 or V2 results. Supabase session lookup is capped at one second and each HTTP request at three seconds; rollout-disabled entries remain in the outbox with bounded backoff.

## Cross-repo dependency

Shop is the only migration publisher. This adapter must remain a Draft and rollout-disabled until the Shop Economy v2 migration provides and verifies:

- service-role-only `economy_issue_mbti_attempt(UUID, TEXT, UUID, TIMESTAMPTZ, UUID)`;
- service-role-only `economy_complete_mbti_attempt(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, UUID, TIMESTAMPTZ, UUID)`;
- an attempt table with proof hash, not-before, expiry, subject binding, consumed-at, completion UUID, and stored replay response;
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
  api/economy/mbti-attempt.ts api/economy/mbti-completed.ts
npm run build
vercel build
git diff --check
```

The API contract smoke must verify that a request containing `points=999999` is rejected with `INVALID_PROOF`, a missing/forged/replayed/expired attempt proof cannot create an event, a cross-origin request is rejected, V2 navigation is not blocked, and app routes continue to render.
