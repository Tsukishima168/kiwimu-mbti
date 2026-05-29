# UTM Naming Contract

This document defines URL tracking conventions for Kiwimu social, Buffer, search, and cross-site routing.

## Required UTM Fields

```text
utm_source
utm_medium
utm_campaign
utm_content
```

Use `utm_term` only for keyword or paid-search experiments.

## Allowed Values

### `utm_source`

- `buffer`
- `instagram`
- `threads`
- `facebook`
- `line`
- `organic-search`
- `chatgpt`
- `perplexity`
- `bing`
- `qr`
- `referral`
- `mbti-lab`

### `utm_medium`

- `social-post`
- `social-story`
- `answer-cta`
- `result-cta`
- `navigation`
- `search-referral`
- `ai-referral`
- `qr`
- `referral`

### `utm_campaign`

Format:

```text
yyyy-q[1-4]-kiwimu-[theme]
```

Examples:

```text
2026-q2-kiwimu-answers
2026-q2-kiwimu-v1-growth
2026-q3-kiwimu-infp-month
```

### `utm_content`

Format:

```text
[surface]-[topic]-[variant]
```

Examples:

```text
post01-mbti-hook
answers-intj-cta
result-soul-dessert-button
explore-state-card-a
```

## Cross-site Routing Parameters

Use these when linking from Kiwimu to another Kiwimu site:

```text
source_site=kiwimu
origin_path=/answers/example
entry_surface=answers_article | answers_related_card | result_top_action | result_dessert_card | explore_result | v2_footer
destination_type=passport | order_menu | shop_product | gacha_draw | map_explore | v2_unlock | community
mbti_type=INFP
variant=A
```

Only include `mbti_type` and `variant` when the user has explicitly generated or selected that result.

## Examples

Buffer article link:

```text
https://kiwimu.com/answers/mbti
?utm_source=buffer
&utm_medium=social-post
&utm_campaign=2026-q2-kiwimu-answers
&utm_content=post01-mbti-hook
```

V1 result to Map menu:

```text
https://map.kiwimu.com/menu
?utm_source=mbti-lab
&utm_medium=result-cta
&utm_campaign=2026-q2-kiwimu-routing
&utm_content=result-soul-dessert-button
&source_site=kiwimu
&entry_surface=result_dessert_card
&destination_type=order_menu
```

Explore result to V2:

```text
https://kiwimu.com/read/INFP-A
?utm_source=mbti-lab
&utm_medium=result-cta
&utm_campaign=2026-q2-kiwimu-v2
&utm_content=explore-result-v2
&entry_surface=explore_result
&destination_type=v2_unlock
```
