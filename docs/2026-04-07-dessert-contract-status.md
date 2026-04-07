# 2026-04-07 Dessert Contract Status

## Active Contract

- local endpoint: `/api/mbti-dessert`
- upstream contract: `https://shop.kiwimu.com/api/menu/mbti/[mbtiType]`
- loader path: `utils/dataLoader.ts`
- returned CTA: `https://map.kiwimu.com/menu`

## Current Rules

- `kiwimu` no longer needs its own dessert-name truth source for live CTA resolution.
- MBTI dessert display now resolves from `shop` unified dessert contract.
- User-facing dessert CTA must remain `map/menu` until `shop` is ready as a landing surface.

## V2 Guardrail

- `V2` route / prototype code still exists internally.
- Public result-card upgrade entry is hidden.
- Do not re-open public V2 entrypoints before product launch and entitlement flow are ready.

## Related Tables

- active:
  - `mbti_menu_links`
  - `menu_items`
  - `menu_variants`

- not current runtime truth:
  - `mbti_recommendations`
  - `menu_items.mbti_type`
