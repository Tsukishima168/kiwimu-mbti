# Google Stack SOP

This document defines the operating model for Kiwimu Google Cloud, GA4, and
Search Console automation.

## Canonical Resources

| Layer | Canonical resource |
|---|---|
| Google Cloud project | `kiwimu-site` |
| GA4 property | `Kiwimu-Core-2026-PROD` |
| GA4 property ID | `526838967` |
| GA4 measurement ID | `G-DM6F27KL8B` |
| Search Console property | `sc-domain:kiwimu.com` |
| Search Console sitemap set | `kiwimu.com`, `passport`, `shop`, `gacha`, `map` |

Do not use `G-ZYNY24LWW5` for the Kiwimu main funnel unless the codebase is
explicitly migrated to that stream. The production code currently uses
`G-DM6F27KL8B`.

## Responsibilities

- Google Cloud owns OAuth clients, API enablement, service accounts, billing,
  and permission boundaries.
- GA4 owns user behavior, event parameters, key events, and V1 / V1.5 / V2
  funnel reporting.
- Search Console owns search exposure, sitemap submission, indexing visibility,
  query/page reporting, and SEO recovery loops.

## Local Operator

The local operator uses Google REST APIs through Node scripts in
`scripts/google-stack/`.

```bash
npm run google-stack:auth
npm run google-stack:audit
npm run google-stack:apply:ga4
npm run google-stack:apply:gsc
npm run google-stack:report
```

Configuration is stored in `google-stack.config.json`. The config file must
contain only non-secret identifiers.

## Secret Policy

Never commit OAuth client secrets, refresh tokens, service account JSON keys, or
Search Console token files.

Default local paths:

```text
OAuth client JSON:
/Users/pensoair/.credentials/kiwimu-oauth-desktop-client.json

OAuth token:
/Users/pensoair/.config/kiwimu/google-stack-token.json
```

If the default OAuth client file is missing, the operator falls back to the
existing local installed-app client:

```text
/Users/pensoair/.credentials/search-console-client-secret.json
```

Override paths when needed:

```bash
GOOGLE_STACK_CLIENT_ID_FILE=/path/to/client.json npm run google-stack:auth
GOOGLE_STACK_TOKEN_FILE=/path/to/token.json npm run google-stack:audit
```

## OAuth Client Requirements

Use a Google OAuth client that is allowed to request:

- `https://www.googleapis.com/auth/analytics.edit`
- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/webmasters`

The signed-in Google user must have:

- GA4 Editor or Administrator access on `Kiwimu-Core-2026-PROD`
- Search Console owner/full access on `sc-domain:kiwimu.com`

## GA4 Apply Policy

`npm run google-stack:apply:ga4` is idempotent. It creates missing resources and
skips existing ones.

Custom dimensions:

- `page_name`
- `screen_name`
- `mbti_type`
- `source`
- `unlock_type`
- `button_name`
- `button_location`
- `campaign_id`
- `checkout_url`

Key events:

- `quiz_completion`
- `begin_checkout`
- `purchase`

Do not mark these as key events by default:

- `page_view`
- `screen_engagement`
- `button_click`
- `view_item`

## Search Console Apply Policy

`npm run google-stack:apply:gsc` is idempotent. It confirms the Search Console
property is readable, submits the five-site sitemap set, and prints latest
query/page rows for each site.

Sitemaps submitted:

- `https://kiwimu.com/sitemap.xml`
- `https://passport.kiwimu.com/sitemap.xml`
- `https://shop.kiwimu.com/sitemap.xml`
- `https://gacha.kiwimu.com/sitemap.xml`
- `https://map.kiwimu.com/sitemap.xml`

Search Console cannot force indexing. It can only submit sitemap metadata and
report search/indexing visibility.

## Canonical And Query Policy

Public search surfaces must converge to clean canonical URLs. UTM and routing
query strings are allowed for attribution, but they should not become indexable
URLs.

- `kiwimu.com`: clean public surfaces are `/`, `/answers/*`, `/explore`,
  `/read/quiz`, and `/read/{TYPE}-{A|T}`. Query versions are `noindex` and
  blocked in `robots.txt`.
- `passport.kiwimu.com`: the public canonical is `/`. UTM/from entry params are
  saved for analytics, then removed from the visible URL. Private claim and
  passport state queries stay non-indexable.
- `shop.kiwimu.com`: the public canonical is `/`. UTM/from params are preserved
  for checkout attribution, then removed from the visible URL. Functional query
  pages such as MBTI-filtered views stay non-indexable.
- `gacha.kiwimu.com`: the public canonical is `/`. Tracking query params are
  removed; any remaining query is treated as non-indexable.
- `map.kiwimu.com`: public canonicals are `/` and `/menu`. Tracking query
  params are removed while `mbti` remains available for the menu experience;
  query versions remain non-indexable.

When a Search Console report shows a URL containing `?utm_`, `from=`, `source=`,
`code=`, `orderId`, or other state parameters, treat it as a cleanup item:
confirm the canonical target, confirm `robots.txt`, then wait for Google to
recrawl after deployment.

## Reporting

`npm run google-stack:report` prints a markdown report to stdout:

- Search Console clicks, impressions, CTR, and average position
- per-site query/page rows, with `kiwimu.com` focused on `/answers/*`
- GA4 funnel event counts

Use `GOOGLE_STACK_START_DATE` and `GOOGLE_STACK_END_DATE` to override the
default reporting window.
