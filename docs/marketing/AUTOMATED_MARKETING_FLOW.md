# Automated Marketing Flow

This document defines the long-term marketing loop for Kiwimu content, search, Buffer distribution, and analytics recovery.

## System Goal

Use `/answers` as the public content asset layer, route qualified visitors into V1, V1.5, and V2, then recover intent through Passport, Shop, Gacha, and Map.

```text
/answers content
-> search and AI discovery
-> Buffer/social distribution
-> V1 quiz
-> V1 result routing
-> V1.5 / V2 / Passport / Shop / Gacha / Map
-> GA4, Search Console, Bing, Buffer analytics
-> next content update
```

## Weekly Loop

### Monday: Select

- Review Search Console queries.
- Pick one `/answers` article to publish or update.
- Prioritize keywords with impressions but weak CTR, and pages that can route into V1.

### Tuesday: Publish

- Publish or update the article.
- Run the checklist in `docs/marketing/INDEXING_WORKFLOW.md`.
- Confirm canonical, sitemap, visible FAQ, and CTA links.

### Wednesday: Distribute

Create 7-10 Buffer posts:

- direct answer
- FAQ answer
- common misunderstanding
- type comparison
- dessert/personality bridge
- V1 quiz CTA
- V1.5 quick exploration CTA
- V2 teaser CTA
- Shop/Map/Gacha extension
- interaction question

### Thursday: Submit

- Submit changed URLs through Bing/IndexNow.
- Use Google Search Console for priority URL inspection when needed.
- Do not submit noindex or private URLs.

### Friday: Recover

Review:

- article landing sessions
- `button_click`
- `quiz_start`
- `quiz_completion`
- `result_view`
- `explore_start`
- `explore_complete`
- V2 paywall views
- `begin_checkout`
- cross-site outbound clicks

Use this to decide the next article update and next CTA test.

## Monthly Loop

Week 1:

- Set the monthly theme.
- Choose four main content targets.

Week 2:

- Rewrite low-CTR titles and descriptions.
- Update 2-3 existing articles.

Week 3:

- Review five-site routing performance.
- Adjust CTA weights on `/answers`, V1 result pages, and V1.5 result pages.

Week 4:

- Produce monthly report.
- Decide the next theme and the next paid-layer test.

## Article Output Pack

Every article should generate:

- SEO title
- meta description
- AI summary
- social headline
- 7-10 Buffer post drafts
- tracked URLs for Buffer, IG, Threads, partner referral, ChatGPT context, V1, V1.5, and V2
- external channel plan for Google, ChatGPT Search, Buffer, IG, Threads, and partner distribution
- OG image brief
- sitemap update entry
- IndexNow submission list
- GA4 expected event checklist

Use the generator:

```bash
npm run generate:answers:marketing
```

Outputs are written to `docs/marketing/generated/`.

## Five-site Role Split

- `kiwimu.com`: public answers, V1, V1.5, V2 entry and teaser.
- `passport.kiwimu.com`: identity, saved results, history, membership.
- `shop.kiwimu.com`: product and purchase.
- `gacha.kiwimu.com`: sharing, draw mechanics, campaign loops.
- `map.kiwimu.com`: physical routes, menu discovery, local experience.

## First 30 Days

1. Finalize OpenAI crawler policy.
2. Finalize V2 teaser indexing policy.
3. Shrink `llms.txt` into a public AI map.
4. Publish or update the first 6-8 `/answers` pages.
5. Create Buffer templates for article repurposing.
6. Define GA4 recovery dashboard events.
7. Start weekly indexing and recovery review.
