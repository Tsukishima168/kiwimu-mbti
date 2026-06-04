# Kiwimu / MBTI Boot

Last updated: 2026-06-04

## First Read

Read these files in order before changing code:

1. `CURRENT.md`
2. `VERIFY.md`
3. `package.json`
4. `App.tsx`
5. `utils/v2Routes.ts`
6. `utils/supabaseAuthBridge.ts`
7. `utils/analytics.ts`
8. `components/v2/V2App.tsx`
9. `pages/AnswersHub.tsx`
10. `pages/AnswerArticle.tsx`

Use older reports such as `FINAL_IMPLEMENTATION_REPORT.md`, `PROJECT_PROGRESS.md`, and `DEPLOYMENT_READY_CHECKLIST.md` only as historical context.

## Local Start

```bash
npm install
npm run dev
```

Default Vite dev URL is usually `http://localhost:5173`.

Preview flow:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4110
```

## Core Responsibilities

- `/`: Kiwimu main landing and quiz entry.
- `/quiz`: V1 MBTI quiz flow.
- `/answers`: content/answer hub.
- `/answers/:slug`: answer article pages.
- `/read/quiz`: V2 quiz.
- `/read/:TYPE-A` and `/read/:TYPE-T`: V2 reading/report pages.
- `/explore`: exploratory quiz surface.
- Auth return/callback paths must continue to interoperate with Passport.

## Environment Areas

Common frontend env names found in docs/code:

- `VITE_LINE_LIFF_ID`
- `VITE_GA4_ID`
- Passport/Supabase URL/key values used by auth bridge helpers
- Google Stack local credentials and tokens for `scripts/google-stack/*`
- Resend/Gemini/server-side values only where existing server/API code already expects them

Do not add secrets to documentation or committed files.

## Cross-Site Rules

- Passport owns account/login authority.
- Shop owns checkout, payment status, order fulfillment, and commerce operations.
- Map owns store/menu/location flows.
- Gacha owns campaign/reward mechanics.
- Blog is content/long-form publishing when the canonical repo is restored.

When adding CTAs, prefer explicit cross-site links instead of duplicating another site's feature.

## Change Rules

- Keep route changes paired with `VERIFY.md` route checks.
- For SEO/content work, inspect `public/sitemap.xml`, `public/robots.txt`, runtime SEO helpers, and Google Stack scripts.
- For auth work, verify both anonymous and logged-in flows.
- For V2/report work, verify `/read/quiz` and at least one concrete report route.
