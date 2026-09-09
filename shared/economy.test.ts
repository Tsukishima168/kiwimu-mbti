import { describe, expect, it } from 'vitest';
import { parseEconomyResponse } from './economy';

const REQUEST_ID = '11111111-1111-4111-8111-111111111111';

describe('parseEconomyResponse', () => {
  it('accepts the canonical response envelope', () => {
    expect(parseEconomyResponse({
      ok: true,
      code: 'OK',
      request_id: REQUEST_ID,
      data: { status: 'shadow' },
    }, REQUEST_ID)).toEqual({
      ok: true,
      code: 'OK',
      request_id: REQUEST_ID,
      data: { status: 'shadow' },
    });
  });

  it.each([
    { ok: true, code: 'LIMIT_REACHED', request_id: REQUEST_ID, data: {} },
    { ok: false, code: 'OK', request_id: REQUEST_ID, data: {} },
    { ok: false, code: 'UNKNOWN', request_id: REQUEST_ID, data: {} },
    { ok: false, code: 'AUTH_REQUIRED', request_id: 'not-a-uuid', data: {} },
    { ok: false, code: 'AUTH_REQUIRED', request_id: REQUEST_ID, data: [] },
  ])('rejects malformed or contradictory envelopes', value => {
    expect(parseEconomyResponse(value)).toBeNull();
  });

  it('rejects a response belonging to another request', () => {
    expect(parseEconomyResponse({
      ok: false,
      code: 'ROLLOUT_DISABLED',
      request_id: REQUEST_ID,
      data: {},
    }, '22222222-2222-4222-8222-222222222222')).toBeNull();
  });
});
