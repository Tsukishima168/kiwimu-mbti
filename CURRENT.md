# Kiwimu / MBTI Current

Last updated: 2026-06-04

## Status

- Repository: `/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com`
- Current branch: `main`
- Remote tracking: `origin/main`
- Latest checked commit: `4f34363 fix(mbti): reduce initial bundle warnings`
- Working tree at handoff: clean before this documentation pass
- Production role: primary Kiwimu identity site, MBTI quiz, answer/content hub, V2 reading/report surface, cross-site entry point

## Stack

- App runtime: React 19 + Vite 6
- Styling: Tailwind CSS 4 through Vite plugin
- Auth/data: Passport SSO bridge + Supabase integration helpers
- Integrations: LINE LIFF/share, GA4 and Google Stack scripts, Resend result email helper, Discord bridge, PWA/service worker
- Routing model: client-side routing from `App.tsx`, with public paths such as `/`, `/quiz`, `/answers`, `/read/quiz`, `/read/:type-variant`, `/explore`

## Operational Boundary

- This repo is not the Shop checkout system. Keep checkout/cart/order fulfillment in `shop-kiwimu-com`.
- Keep Passport SSO ownership in `passport-kiwimu-com`; MBTI should consume auth/session bridge helpers, not become the account authority.
- Use this site as the main discovery and personality-content surface for the five-site universe.
- Do not treat `_Archive/mbti/` under the workspace router as current source.

## Current Controls

- Build script is `npm run build`.
- Google Stack controls live under `scripts/google-stack/*`.
- Public crawler files are in `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
- Existing README is an old cold-start snapshot from 2026-03-10. Prefer this `CURRENT.md` plus `BOOT.md` when onboarding an AI agent.

## Known Risks

- The repo contains many historical implementation reports and design docs; treat them as reference unless explicitly named in `BOOT.md`.
- Some browser-only logic uses direct `window.location` routing; verify production paths through preview/browser smoke tests, not only TypeScript.
- Google Stack audit depends on OAuth/token state and may fail locally even if the app build is healthy.
- Node version warnings may appear from Vite/Tailwind dependency internals on newer Node runtimes; separate warnings from build failures.

## Next Work Queue

- Keep `/answers` and `/read` content aligned with the five-site CTA map.
- Re-run Google Stack audit before major SEO/content deployment.
- Confirm SSO return paths with Passport after any auth redirect change.
- Keep Kiwimu outbound commerce CTAs pointed at Shop, not duplicated payment flows.
