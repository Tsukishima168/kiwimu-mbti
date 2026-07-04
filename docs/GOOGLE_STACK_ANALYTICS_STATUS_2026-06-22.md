# Google Stack / Supabase Analytics Status - 2026-06-22

This file records the current five-site analytics state after the Passport,
Supabase, Search Console, and GA4 upgrade pass.

## Scope

Sites:

- `kiwimu.com`
- `passport.kiwimu.com`
- `shop.kiwimu.com`
- `gacha.kiwimu.com`
- `map.kiwimu.com`

Canonical GA4 property:

- Property: `Kiwimu-Core-2026-PROD`
- Property ID: `526838967`
- Measurement ID: `G-DM6F27KL8B`
- Data stream: `Kiwimu 5站全漏斗`

Search Console property:

- `sc-domain:kiwimu.com`

Supabase project:

- Shared runtime project ref: `xlqwfaailjyvsycjnzkz`

## Fixed Blockers

### Google OAuth

The old Search Console refresh token returned `invalid_grant`.

Fixed by rerunning:

```bash
npm run google-stack:auth
```

The renewed token is stored locally at:

```text
~/.config/kiwimu/google-stack-token.json
```

Do not commit this file.

### GA4 Admin

The previous `gcloud auth print-access-token` token did not include
`analytics.edit`, so GA4 Admin API writes failed with
`ACCESS_TOKEN_SCOPE_INSUFFICIENT`.

Fixed by using the Google Stack OAuth token and rerunning:

```bash
npm run google-stack:apply:ga4
```

Created key events:

- `sign_up`
- `login`
- `passport_checkin`
- `stamp_claim`
- `reward_redeemed`

Existing key events confirmed:

- `quiz_completion`
- `add_to_cart`
- `begin_checkout`
- `purchase`

### Search Console

Reran:

```bash
npm run google-stack:apply:gsc
```

Confirmed:

- Search Console access: `siteOwner`
- Sitemap submitted: `https://kiwimu.com/sitemap.xml`
- Sitemap submitted: `https://passport.kiwimu.com/sitemap.xml`
- Sitemap submitted: `https://shop.kiwimu.com/sitemap.xml`
- Sitemap submitted: `https://gacha.kiwimu.com/sitemap.xml`
- Sitemap submitted: `https://map.kiwimu.com/sitemap.xml`

### Shop Admin Analytics

`shop-kiwimu-com` now reads the shared Google Stack token before the old
Search Console token, so `/admin/site-analytics` can use the renewed OAuth
credentials.

Smoke result:

```text
GSC_OK rows=1 token=google-stack-token.json
SUPABASE_RPC_OK rows=10
```

### Shop Build

The first production build failed in Tailwind/PostCSS because local
`node_modules` contained inconsistent Tailwind files.

Fixed by rerunning:

```bash
npm ci
```

Then verified:

```bash
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Result: build passed.

## Current GA4 Custom Dimensions

Event-scoped dimensions now expected by the operator:

- `site_id`
- `page_name`
- `screen_name`
- `mbti_type`
- `source`
- `source_site`
- `target_site`
- `unlock_type`
- `button_name`
- `button_location`
- `campaign_id`
- `checkout_url`
- `reward_id`
- `stamp_id`
- `prize_type`
- `entrance_source`
- `method`
- `intent`

High-cardinality URL fields such as `landing_url` should not be registered as
GA4 custom dimensions unless there is a specific analysis need.

## Current Search Console Snapshot

Window: `2026-05-23` to `2026-06-20`

Highlights:

- `kiwimu.com`: 5 query/page rows, mainly `32人格`, `32型人格`,
  `mbti 32型人格`.
- `shop.kiwimu.com`: 5 query/page rows, strongest branded query
  `月島甜點` with 1 click and 5 impressions.
- `map.kiwimu.com`: 10 query/page rows, strongest branded query
  `月島甜點` with 7 clicks and 95 impressions.
- `passport.kiwimu.com`: 0 query/page rows in this window.
- `gacha.kiwimu.com`: 0 query/page rows in this window.

## Supabase User Events Snapshot

The Shop admin dashboard reads Supabase via:

```sql
public.get_site_event_rollup(p_start timestamptz, p_end timestamptz)
```

The function returns aggregate counts only. It does not expose event metadata or
user-level rows.

Access policy:

- `PUBLIC`: revoked
- `anon`: revoked
- `authenticated`: revoked
- `service_role`: granted

## Supabase Advisor Snapshot

Command:

```bash
supabase db advisors --linked --type security --level warn --fail-on none --output json
```

Current advisor count:

- Total: 90
- Error: 10
- Warning: 80

Top categories:

- `function_search_path_mutable`: 20
- `authenticated_security_definer_function_executable`: 20
- `anon_security_definer_function_executable`: 20
- `rls_policy_always_true`: 19
- `security_definer_view`: 6
- `rls_disabled_in_public`: 4
- `auth_leaked_password_protection`: 1

Current `ERROR` items:

- Security definer views:
  - `public.shop_order_summary`
  - `public.user_funnel_summary`
  - `public.v_point_history`
  - `public.v_user_points_summary`
  - `public.v_user_journey`
  - `public.v_funnel_conversion`
- Public tables without RLS:
  - `public.push_templates`
  - `public.email_templates`
  - `public.banners`
  - `public.mbti_recommendations`

These are existing database architecture issues and should be fixed in a
separate database hardening pass with function-by-function permission review.
Do not bulk revoke or bulk enable RLS without checking the app paths that call
each table/function.

## Verification Commands

Google Stack:

```bash
npm run google-stack:audit
npm run google-stack:apply:ga4
npm run google-stack:apply:gsc
```

Shop:

```bash
npm run lint
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Supabase:

```bash
supabase db advisors --linked --type security --level warn --fail-on none
```

## Remaining Work

- Deploy the verified changes only after each repo's unrelated dirty changes
  are reviewed or committed intentionally.
- Run GA4 Realtime verification after deploying Map, Gacha, Passport, and Shop
  tracking changes; historical `site_id` values before registration remain
  `(not set)`.
- Plan a Supabase security hardening pass for the 10 advisor errors before
  touching the 80 warnings.
- Replace the fallback OAuth client path with
  `~/.credentials/kiwimu-oauth-desktop-client.json` when a dedicated client is
  created.
