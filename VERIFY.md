# Kiwimu / MBTI Verify

Last updated: 2026-06-04

## Minimum Local Verification

```bash
npm run build
```

If changing Google/SEO tracking:

```bash
npm run google-stack:audit
```

The Google Stack command requires local OAuth/token setup. A credentials failure is not an app build failure, but it must be recorded before shipping SEO/analytics changes.

## Preview Smoke

```bash
npm run preview -- --host 127.0.0.1 --port 4110
```

Check these paths:

- `http://127.0.0.1:4110/`
- `http://127.0.0.1:4110/quiz`
- `http://127.0.0.1:4110/answers`
- `http://127.0.0.1:4110/read/quiz`
- `http://127.0.0.1:4110/read/INFP-T`
- `http://127.0.0.1:4110/explore`
- `http://127.0.0.1:4110/robots.txt`
- `http://127.0.0.1:4110/sitemap.xml`
- `http://127.0.0.1:4110/llms.txt`

## Browser Checks

- No blank screen on first load.
- No blocking console error during route navigation.
- Quiz can start from `/` or `/quiz`.
- `/answers` renders article links.
- `/read/quiz` renders the V2 quiz entry.
- A concrete report route such as `/read/INFP-T` renders or shows the intended locked/CTA state.
- Footer legal links resolve to the correct localized static HTML files.

## Cross-Site Checks

- Login CTA goes to Passport, not a duplicated local login authority.
- Commerce CTA goes to Shop when it is a product/order action.
- LINE share/LIFF functionality remains guarded by environment configuration.

## Release Gate

Before push:

```bash
git diff --check
npm run build
```

Before production deploy:

- Confirm branch is `main`.
- Confirm `origin/main` contains the intended commit.
- Run the preview smoke list above.
- Check production after deploy for `/`, `/answers`, `/read/quiz`, `robots.txt`, and `sitemap.xml`.
