# Buffer Post Decomposition

Each `/answers/*` article should be decomposed into a reusable 10-post pack.

The generated pack is a first draft for Buffer scheduling. Edit tone and channel fit before posting.

## Required Post Types

1. `direct-answer`
2. `takeaway`
3. `faq`
4. `misunderstanding`
5. `kiwimu-angle`
6. `v1-cta`
7. `v15-cta`
8. `v2-cta`
9. `interaction`
10. `evergreen-repost`

## Generator

```bash
npm run generate:answers:marketing
```

Generate one article only:

```bash
node scripts/generate-answer-marketing-pack.mjs mbti
```

Single-article mode updates only the requested article file and writes
`docs/marketing/generated/indexnow-urls.selected.txt`; it does not rewrite the
global `INDEX.md` or `indexnow-urls.txt`.

## Output

- `docs/marketing/generated/INDEX.md`
- `docs/marketing/generated/indexnow-urls.txt`
- `docs/marketing/generated/{slug}.md`

Each `{slug}.md` pack includes:

- SEO and AI summary fields
- tracked URLs for Buffer, IG, Threads, partner referral, ChatGPT context, V1, V1.5, and V2
- external channel plan for Google, ChatGPT Search, Buffer, IG, Threads, and partner distribution
- 10 Buffer-ready post drafts
- OG image brief
- IndexNow URL
- GA4 expected events

## Editing Rules

- Keep one clear CTA per post.
- Keep tracked URLs intact.
- Do not post token, checkout, auth, or user-specific URLs.
- Prefer routing cold audiences to `/answers` or V1.
- Route warmer audiences to V1.5 or V2.
- Use Passport only after the user has generated or selected a result.
