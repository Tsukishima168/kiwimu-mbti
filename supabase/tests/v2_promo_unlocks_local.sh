#!/usr/bin/env bash
# Local throwaway PostgreSQL only: a fresh cluster on a unix socket in a short temp dir,
# removed on exit. Never reads .env* and never connects to any remote database.
# Usage: bash supabase/tests/v2_promo_unlocks_local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIGRATION="$ROOT/supabase/migrations/20261020100000_v2_promo_unlocks.sql"
while IFS= read -r name; do unset "$name"; done < <(env | sed -n 's/^\(PG[A-Z_]*\)=.*/\1/p')
# macOS postmaster refuses to start under some user locales ("became multithreaded").
export LC_ALL=C

BASE="/tmp/claude-501"
mkdir -p "$BASE"
WORK="$(mktemp -d "$BASE/pg.XXXX")"
DATA="$WORK/data"
cleanup() {
  pg_ctl -D "$DATA" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

INITDB=(initdb -D "$DATA" -A trust -U postgres --no-instructions --locale=C -E UTF8)
PGCTL_OPTS=(-c "listen_addresses=" -k "$WORK" -c "TimeZone=UTC")
"${INITDB[@]}" >/dev/null
pg_ctl -D "$DATA" -l "$WORK/server.log" -w -o "${PGCTL_OPTS[*]}" start >/dev/null

PSQL=(psql -X -q -At -v ON_ERROR_STOP=1 -h "$WORK" -U postgres)
DB=(-d postgres)
passed=0
q() { "${PSQL[@]}" "${DB[@]}" -c "$1"; }
ok() { passed=$((passed + 1)); echo "PASS $1"; }
fail() { echo "FAIL $1"; exit 1; }
expect_eq() {
  local label=$1 expected=$2 sql=$3 got
  got="$(q "$sql")"
  [[ "$got" == "$expected" ]] || fail "$label: expected [$expected] got [$got]"
  ok "$label"
}
expect_error() {
  local label=$1 pattern=$2 sql=$3 out
  if out="$(q "$sql" 2>&1)"; then fail "$label: statement unexpectedly succeeded"; fi
  grep -q -- "$pattern" <<<"$out" || fail "$label: unexpected error: $out"
  ok "$label"
}
snapshot() {
  q "SELECT string_agg(item, E'\n' ORDER BY item) FROM (
       SELECT 'con:' || conname || '=' || pg_get_constraintdef(oid) AS item
         FROM pg_constraint WHERE conrelid = 'public.v2_promo_unlocks'::regclass
       UNION ALL SELECT 'pol:' || polname || '=' || pg_get_expr(polqual, polrelid)
         FROM pg_policy WHERE polrelid = 'public.v2_promo_unlocks'::regclass
       UNION ALL SELECT 'acl:' || coalesce(relacl::text, '') FROM pg_class WHERE oid = 'public.v2_promo_unlocks'::regclass
       UNION ALL SELECT 'col:' || attname || '=' || coalesce(attacl::text, '')
         FROM pg_attribute WHERE attrelid = 'public.v2_promo_unlocks'::regclass AND attnum > 0
       UNION ALL SELECT 'rls:' || relrowsecurity || '/' || relforcerowsecurity FROM pg_class WHERE oid = 'public.v2_promo_unlocks'::regclass
     ) items"
}

# Supabase-like baseline: browser roles, BYPASSRLS service role, default table grants, auth.users.
q "CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
   GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
   CREATE SCHEMA auth; GRANT USAGE ON SCHEMA auth TO service_role;
   CREATE TABLE auth.users (id uuid PRIMARY KEY);
   INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');"
USER_A="00000000-0000-0000-0000-00000000000a"
USER_B="00000000-0000-0000-0000-00000000000b"

"${PSQL[@]}" "${DB[@]}" -f "$MIGRATION"
ok "migration applies on a fresh database"
first="$(snapshot)"
q "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at)
   VALUES ('$USER_B', 'INFP-T', 'v2_free_202611', '2026-11-01 12:00:00+08')"
"${PSQL[@]}" "${DB[@]}" -f "$MIGRATION"
[[ "$(snapshot)" == "$first" ]] || fail "re-running changed the table definition, policies or grants"
expect_eq "re-running the migration is idempotent and keeps existing rows" "1" \
  "SELECT count(*) FROM public.v2_promo_unlocks WHERE user_uid = '$USER_B'"

expect_eq "RLS is enabled and forced" "t|t" \
  "SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid = 'public.v2_promo_unlocks'::regclass"
for role in anon authenticated; do
  expect_eq "$role has no table privileges" "f|f|f|f" \
    "SELECT has_table_privilege('$role', 'public.v2_promo_unlocks', 'SELECT'), has_table_privilege('$role', 'public.v2_promo_unlocks', 'INSERT'),
            has_table_privilege('$role', 'public.v2_promo_unlocks', 'UPDATE'), has_table_privilege('$role', 'public.v2_promo_unlocks', 'DELETE')"
  expect_error "$role cannot read rows" "permission denied" \
    "SET ROLE $role; SELECT count(*) FROM public.v2_promo_unlocks"
  expect_error "$role cannot insert a grant" "permission denied" \
    "SET ROLE $role; INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id) VALUES ('$USER_A', 'ESTJ-A', 'v2_free_202611')"
done

window_open="$(q "SELECT now() < TIMESTAMPTZ '2026-12-01 00:00:00+08'")"
if [[ "$window_open" == "t" ]]; then
  expect_eq "service_role can insert (created_at defaulted by the DB) and read back" "ESTJ-A|v2_free_202611|t" \
    "SET ROLE service_role;
     INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, source) VALUES ('$USER_A', 'ESTJ-A', 'v2_free_202611', 'direct');
     SELECT mbti_type, promo_id, created_at <= now() FROM public.v2_promo_unlocks WHERE user_uid = '$USER_A'"
else
  expect_error "after the end, even service_role inserts are rejected by the DB guard" "v2_promo_unlocks_before_end" \
    "SET ROLE service_role; INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id) VALUES ('$USER_A', 'ESTJ-A', 'v2_free_202611')"
  q "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at) VALUES ('$USER_A', 'ESTJ-A', 'v2_free_202611', '2026-11-01 00:00:00+08')"
fi
expect_error "a repeated claim hits the primary key (idempotency is enforced by the DB)" "duplicate key value" \
  "SET ROLE service_role; INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id) VALUES ('$USER_A', 'ESTJ-A', 'v2_free_202611')"
expect_error "service_role cannot supply created_at to bypass the end guard" "permission denied" \
  "SET ROLE service_role; INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at) VALUES ('$USER_A', 'ENFP-A', 'v2_free_202611', '2026-11-01 00:00:00+08')"
expect_error "service_role cannot update grants" "permission denied" \
  "SET ROLE service_role; UPDATE public.v2_promo_unlocks SET source = 'x' WHERE user_uid = '$USER_A'"
expect_error "service_role cannot delete grants" "permission denied" \
  "SET ROLE service_role; DELETE FROM public.v2_promo_unlocks WHERE user_uid = '$USER_A'"

q "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at) VALUES ('$USER_B', 'ISTJ-A', 'v2_free_202611', '2026-11-30 23:59:59.999+08')"
ok "end guard accepts 2026-11-30 23:59:59.999 Asia/Taipei"
q "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at) VALUES ('$USER_B', 'ISTJ-T', 'v2_free_202611', '2026-11-30T15:59:59Z')"
ok "end guard accepts 2026-11-30T15:59:59Z (same instant as 23:59:59 Taipei)"
expect_error "end guard rejects 2026-12-01 00:00:00 Asia/Taipei" "v2_promo_unlocks_before_end" \
  "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at) VALUES ('$USER_B', 'ESFP-A', 'v2_free_202611', '2026-12-01 00:00:00+08')"
expect_error "end guard rejects 2026-11-30T16:00:00Z" "v2_promo_unlocks_before_end" \
  "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id, created_at) VALUES ('$USER_B', 'ESFP-T', 'v2_free_202611', '2026-11-30T16:00:00Z')"
expect_error "invalid MBTI codes are rejected" "v2_promo_unlocks_mbti_type_check" \
  "INSERT INTO public.v2_promo_unlocks (user_uid, mbti_type, promo_id) VALUES ('$USER_B', 'ABCD-A', 'v2_free_202611')"

q "CREATE DATABASE restore_check"
pg_dump -h "$WORK" -U postgres -d postgres | "${PSQL[@]}" -d restore_check >/dev/null
DB=(-d restore_check)
expect_eq "dump/restore keeps every row (constant guard, no now() in CHECK or trigger)" "4" \
  "SELECT count(*) FROM public.v2_promo_unlocks"
DB=(-d postgres)

q "DELETE FROM auth.users WHERE id = '$USER_A'"
expect_eq "deleting the auth user removes its grants" "0" \
  "SELECT count(*) FROM public.v2_promo_unlocks WHERE user_uid = '$USER_A'"

echo "OK: $passed checks passed (throwaway cluster at $WORK, removed on exit)"
