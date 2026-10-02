import type { VercelRequest, VercelResponse } from '@vercel/node';
import reportHandler from '../../server/routes/v2/report.js';
import verifyUnlockHandler from '../../server/routes/v2/verify-unlock.js';
import myReportsHandler from '../../server/routes/v2/my-reports.js';
import claimReportHandler from '../../server/routes/v2/claim-report.js';
import receiptHandler from '../../server/routes/v2/receipt.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  const routeValue = request.query.operation;
  const route = Array.isArray(routeValue) ? routeValue[0] : routeValue;

  if (route === 'report') return reportHandler(request, response);
  if (route === 'verify-unlock') return verifyUnlockHandler(request, response);
  if (route === 'my-reports') return myReportsHandler(request, response);
  if (route === 'claim-report') return claimReportHandler(request, response);
  if (route === 'receipt') return receiptHandler(request, response);

  return response.status(404).json({ ok: false, code: 'NOT_FOUND' });
}
