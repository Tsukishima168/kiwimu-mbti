import type { VercelRequest, VercelResponse } from '@vercel/node';
import reportHandler from '../../server/routes/v2/report.js';
import verifyUnlockHandler from '../../server/routes/v2/verify-unlock.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  const routeValue = request.query.operation;
  const route = Array.isArray(routeValue) ? routeValue[0] : routeValue;

  if (route === 'report') return reportHandler(request, response);
  if (route === 'verify-unlock') return verifyUnlockHandler(request, response);

  return response.status(404).json({ ok: false, code: 'NOT_FOUND' });
}
