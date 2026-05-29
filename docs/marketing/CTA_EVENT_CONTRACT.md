# CTA Event Contract

This document defines the canonical CTA tracking names for the Kiwimu growth funnel.

All internal CTA clicks should use GA4 `button_click` through `trackButtonClick(button_name, button_location, destination_url)`.

All cross-site outbound clicks should use `outbound_click` through `trackOutboundClick(...)` and include `destination_type`, `entry_surface`, and when available `mbti_type` / `variant`.

## Funnel Surfaces

```text
answers_hub
answers_article
v1_result
explore_result
v2_paywall
v2_footer
global_nav
```

## Canonical Button Names

### `/answers` Hub

| button_name | button_location | destination |
|---|---|---|
| `answers_hub_start_v1` | `answers_hub_hero` | `/quiz` |
| `answers_hub_start_v15` | `answers_hub_hero` | `/explore` |
| `answers_hub_start_v2` | `answers_hub_bottom` | `/read/quiz` |
| `answers_hub_related_article` | `answers_hub_related` | `/answers/*` |

### `/answers/*` Article

| button_name | button_location | destination |
|---|---|---|
| `answers_article_start_v1` | `answers_article_cta` | `/quiz` |
| `answers_article_start_v15` | `answers_article_cta` | `/explore` |
| `answers_article_start_v2` | `answers_article_cta` | `/read/quiz` |
| `answers_article_related_article` | `answers_article_related` | `/answers/*` |

### V1 Result

| button_name | button_location | destination |
|---|---|---|
| `v1_result_to_explore` | `v1_result_next_journey` | `/explore` |
| `v1_result_to_v2_report` | `v1_result_next_journey` | `/read/{TYPE}-{A|T}` |
| `v1_result_to_passport` | `v1_result_next_journey` | `passport.kiwimu.com` |
| `v1_result_to_dessert_order` | `v1_result_next_journey` | `map.kiwimu.com/menu` |
| `v1_result_to_map` | `v1_result_next_journey` | `map.kiwimu.com` |
| `v1_result_to_v2_report` | `v1_result_upsell` | `/read/{TYPE}-{A|T}` |
| `v1_result_line_follow` | `v1_result_upsell` | LINE OA |

### V1.5 Explore Result

| button_name | button_location | destination |
|---|---|---|
| `explore_result_share` | `explore_result` | Web Share / clipboard |
| `explore_result_to_v1` | `explore_result` | `/` |
| `explore_result_to_v2_report` | `explore_result` | `/read/{TYPE}-{A|T}` |
| `explore_result_to_passport` | `explore_result` | `passport.kiwimu.com` |

### V2

| button_name | button_location | destination |
|---|---|---|
| `v2_paywall_begin_checkout` | `v2_paywall` | checkout endpoint |
| `v2_footer_to_dessert_order` | `v2_footer` | `map.kiwimu.com/menu` |
| `v2_footer_share_story` | `v2_footer` | Instagram |
| `v2_footer_to_passport` | `v2_footer` | `passport.kiwimu.com` |

## Required CTA Parameters

For all CTA events:

- `button_name`
- `button_location`
- `destination_url`

For cross-site outbound CTA events:

- `link_name`
- `link_url`
- `section`
- `destination_type`
- `entry_surface`
- `source_site=kiwimu`
- `origin_path` when available
- `mbti_type` and `variant` when the user has a generated result

## Naming Rules

- Use lowercase snake_case.
- Start with the source surface: `answers_`, `v1_`, `explore_`, `v2_`.
- Use `to_` for destination transitions.
- Do not use display text as the event name.
- Keep display copy free to change without changing analytics contracts.
