import type { VercelRequest, VercelResponse } from '@vercel/node';
import cancelHandler from '../../server/routes/linepay/cancel.js';
import confirmHandler from '../../server/routes/linepay/confirm.js';
import requestHandler from '../../server/routes/linepay/request.js';
import statusHandler from '../../server/routes/linepay/status.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  const routeValue = request.query.operation;
  const route = Array.isArray(routeValue) ? routeValue[0] : routeValue;

  if (route === 'request') return requestHandler(request, response);
  if (route === 'confirm') return confirmHandler(request, response);
  if (route === 'cancel') return cancelHandler(request, response);
  if (route === 'status') return statusHandler(request, response);

  return response.status(404).json({ ok: false, error: 'Not found' });
}
