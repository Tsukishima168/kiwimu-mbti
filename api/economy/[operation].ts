import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleMbtiEconomyRequest, type MbtiEconomyOperation } from '../../server/economy/mbtiHandler.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  const routeValue = request.query.operation;
  const route = Array.isArray(routeValue) ? routeValue[0] : routeValue;
  const operation: MbtiEconomyOperation | null = route === 'mbti-attempt'
    ? 'attempt'
    : route === 'mbti-completed'
      ? 'completion'
      : null;

  if (!operation) {
    return response.status(404).json({ ok: false, code: 'NOT_ELIGIBLE' });
  }

  return handleMbtiEconomyRequest(request, response, operation);
}
