# Indexing Workflow

This document defines how Kiwimu publishes public URLs for search engines and AI search systems.

## Public URL Policy

Public and indexable:

- `/`
- `/answers`
- `/answers/*`
- `/explore`
- `/read/quiz`
- `/read/{TYPE}-{A|T}` public teaser pages
- `/privacy*.html`
- `/terms*.html`

Private or restricted:

- `/api/`
- `/admin/`
- `/private/`
- `/internal/`
- `/user-data/`
- `/auth/`
- `/callback`
- `/quiz/archive`
- token, auth, checkout, order, transaction, or user-specific URLs
- paid V2 locked chapters and Passport private data

## OpenAI Crawler Policy

- `OAI-SearchBot`: allowed for public search and citation surfaces.
- `GPTBot`: disallowed for model-training crawl.
- `ChatGPT-User`: allowed for public surfaces, but private/token/user-specific paths remain disallowed. This agent is user-triggered and should not be treated as the main Search control.

## Publishing Checklist

For each new public `/answers/*` page:

- Add canonical URL.
- Add title and meta description.
- Add visible answer-first copy.
- Add Article or WebPage JSON-LD.
- Add Breadcrumb JSON-LD.
- Add FAQ JSON-LD only when the FAQ is visible on the page.
- Add internal links to V1, V1.5, V2, and relevant five-site destinations.
- Add the URL to sitemap if it is intended to be indexed.
- Add or reference the page in `llms.txt` only if it is a canonical public surface.

## Submission Flow

1. Publish or update the page.
2. Update `public/sitemap.xml`.
3. Keep `lastmod` accurate for meaningful content changes.
4. Use Google Search Console sitemap submission and URL Inspection for priority pages.
5. Use Bing Webmaster Tools and IndexNow for newly added, updated, or deleted URLs.
6. Submit only URLs with meaningful content changes; do not submit cosmetic edits.

## IndexNow Rule

Submit only:

- newly published public URLs
- materially updated public URLs
- deleted public URLs that should be removed

Do not submit:

- noindex pages
- private pages
- checkout success URLs
- tokenized URLs
- user-specific result URLs
- unchanged pages

## First URLs To Prioritize

1. `https://kiwimu.com/`
2. `https://kiwimu.com/answers`
3. `https://kiwimu.com/explore`
4. `https://kiwimu.com/read/quiz`
5. `https://kiwimu.com/read/{TYPE}-{A|T}` public teaser pages
6. first evergreen `/answers/*` articles

Initial `/answers/*` articles:

- `https://kiwimu.com/answers/mbti`
- `https://kiwimu.com/answers/at-variants`
- `https://kiwimu.com/answers/soul-dessert`
- `https://kiwimu.com/answers/tiramisu-guide`
- `https://kiwimu.com/answers/gift-guide`
