# Test Coverage Analysis

## Current State

The codebase has **zero automated tests**. There is no test runner (Jest, Vitest, etc.), no test configuration, and no `*.test.*` or `*.spec.*` files. The only testing artifacts are:

- **3 manual scripts** in `/scripts/` for Discord API connectivity
- **`LOCAL_TEST_GUIDE.md`** with a manual QA checklist

This means every deployment relies entirely on manual verification.

---

## Priority 1: Core Business Logic (High Impact, Easy to Test)

These are pure functions with no external dependencies — the highest-ROI targets.

### `utils/logic.ts` — MBTI Calculation Engine

| What to test | Why |
|---|---|
| `calculateResults()` — score accumulation from answers | This is the core of the product. A bug here means wrong personality types for every user. |
| `calculateResults()` — weighted scoring (questions with `weight > 1`) | Weights silently default to 1 via `\|\| 1` — verify this fallback and that weights actually multiply correctly. |
| `calculateResults()` — tie-breaking (`>=` favors E, S, T, J) | The `>=` operator means ties go to the first letter. This is an intentional design decision that should be tested to prevent accidental regression. |
| `getVariant()` — A vs T determination | Edge case: scores `{A: 0, Turbulent: 0}` defaults to `'A'` — document and verify. |
| `calculatePercentages()` — percentage math | Verify percentages always sum to 100 per dimension. Edge case: both values 0 → `[50, 50]`. |

### `utils/changeAnalysis.ts` — Score Change Detection

| What to test | Why |
|---|---|
| `analyzeChange()` — threshold classification | `delta < 3` = stable, `3–9` = minor, `≥10` = major. These thresholds directly affect what users see. |
| `analyzeChange()` — direction detection | Verify increase/decrease/stable for positive, negative, and near-zero deltas. |
| `getPersonalityChangeSummary()` — 4 branches | Same type + same suffix, same type + different suffix, different type + same suffix, fully different. Each produces distinct Chinese text. |
| `generateInterpretation()` — template rendering | Verify `{delta}` placeholder is replaced correctly with absolute value. |

---

## Priority 2: URL/Parameter Construction (Medium Impact, Easy to Test)

These are pure functions but bugs silently break tracking and attribution.

### `utils/utmTracking.ts` — UTM Link Builder

| What to test | Why |
|---|---|
| `buildUTMLink()` — constructs valid URLs with correct params | A malformed URL silently breaks all outbound tracking. |
| `buildDessertOrderLink()` — includes mbti type in format `TYPE-VARIANT` | Users clicking the dessert order button must land on the right page with correct MBTI data. |
| `buildPassportClaimLink()` — includes claim code and auto_unlock | Broken claim links mean users don't get their stamp rewards. |
| `buildUTMLink()` with invalid linkKey — returns `''` | Verify graceful degradation, not a crash. |

### `utils/referralTracking.ts` — Referral System

| What to test | Why |
|---|---|
| `generateShortCode()` — deterministic output for same input | The short code must be stable (same userId always produces same code), or referral links break. |
| `generateReferralLink()` — includes all required params | Missing `ref`, `ref_type`, or UTM params silently breaks referral attribution. |
| `parseReferralParams()` — handles both `ref` and `referrer` param names | Supports legacy and new param formats — verify both work. |
| `parseReferralParams()` — short code prefix (`code:`) | When `?code=ABC123` is present, referrer_id should be `"code:ABC123"`. |

### `utils/campaignTracking.ts` — Campaign Detection

| What to test | Why |
|---|---|
| `getCampaignData()` — returns null when no params | Prevents false campaign attribution for organic traffic. |
| `isFromStore()` — checks `source === 'poster' \|\| 'dm'` | Controls whether in-store promo UI is shown. |
| `getMonthlyPromo()` — month/content matching | Each month has different promo text. Wrong match = wrong discount shown to user. |

---

## Priority 3: Security-Critical Code (High Impact, Moderate Effort)

### `server/discord/verifyDiscordSignature.ts`

| What to test | Why |
|---|---|
| `verifyDiscordSignature()` — valid signature passes | Discord will stop sending interactions if verification is broken. |
| `verifyDiscordSignature()` — tampered body fails | Security: accepting invalid signatures allows spoofed Discord commands. |
| `verifyDiscordSignature()` — missing params return false | Null/undefined inputs should fail gracefully, not throw. |
| `hexToUint8Array()` — hex conversion edge cases | Empty string, odd-length hex, `0x` prefix — all should be handled. |

---

## Priority 4: API Endpoints (High Impact, Higher Effort)

These require mocking external services but protect against production outages.

### `api/save-user.ts`, `api/send-email.ts`, `api/notify-discord.ts`

| What to test | Why |
|---|---|
| Request validation — reject malformed bodies | Prevents silent data corruption in Firestore/Supabase. |
| HTTP method enforcement — reject non-POST | Missing method checks could expose data or cause errors. |
| Error handling — external service failures return proper status codes | Users should see meaningful errors, not 500s with stack traces. |

### `api/discord/interaction.ts`

| What to test | Why |
|---|---|
| PING response (type 1 → type 1) | Required by Discord for endpoint verification. Already tested manually but should be automated. |
| Command routing — unknown commands handled gracefully | New Discord commands could crash the handler without tests. |

---

## Priority 5: React Hooks (Medium Impact, Moderate Effort)

### `hooks/useProgressStorage.ts`

| What to test | Why |
|---|---|
| Save/restore quiz progress round-trip | Users losing progress mid-quiz is a major UX failure. |
| Handles corrupted localStorage gracefully | `JSON.parse` on garbage data should not crash the app. |

### `hooks/useFirestoreSync.ts`

| What to test | Why |
|---|---|
| Sync triggers on auth state change | Data must persist when user logs in after completing quiz as anonymous. |
| Handles offline/network errors | Firebase calls can fail; the hook should degrade gracefully. |

---

## Recommended Setup

**Test runner:** Vitest (already using Vite — zero-config integration)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Suggested `vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': '.' },
  },
});
```

**Suggested `package.json` script:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Suggested Implementation Order

1. **`utils/logic.ts`** — Start here. 5-10 tests, pure functions, highest business impact.
2. **`utils/changeAnalysis.ts`** — Pure functions, straightforward assertions.
3. **`utils/utmTracking.ts`** (buildUTMLink family) — Pure URL construction, easy to verify.
4. **`utils/referralTracking.ts`** (generateShortCode, generateReferralLink) — Pure functions.
5. **`server/discord/verifyDiscordSignature.ts`** — Security-critical, needs `tweetnacl` in test.
6. **`utils/campaignTracking.ts`** — Needs `window.location` mocking but logic is simple.
7. **API endpoint tests** — Requires mocking Firebase/Supabase SDKs.
8. **React hook tests** — Requires `@testing-library/react` + mock providers.

Starting with items 1-4 would cover the most critical pure business logic with minimal setup effort.
