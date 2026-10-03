import type { V2VariantReport } from '../../data/v2VariantReports.generated';

export type PaidReportBundle = {
  report: V2VariantReport;
  oppositeReport: V2VariantReport | null;
};

export class ReportAccessError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

// Read-only retries always verify the existing purchase; they never create an order.
export async function requestPaidReport(fullType: string, headers: Record<string, string>): Promise<PaidReportBundle> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch('/api/v2/report', {
      method: 'POST', credentials: 'same-origin', headers,
      body: JSON.stringify({ mbtiType: fullType }), signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ReportAccessError(response.status, typeof payload?.code === 'string' ? payload.code : 'REPORT_ACCESS_FAILED');
    }
    if (!payload?.ok || payload?.data?.report?.fullCode !== fullType) {
      throw new ReportAccessError(502, 'REPORT_ACCESS_FAILED');
    }
    return payload.data as PaidReportBundle;
  } finally {
    clearTimeout(timeout);
  }
}

export function reportAccessFailure(error: unknown): { status: 'denied' | 'error'; message: string } {
  if (error instanceof ReportAccessError && (error.status === 401 || error.status === 403)) {
    return {
      status: 'denied',
      message: error.status === 401
        ? '登入已失效，請重新登入購買時的帳號。原付款不需要重付。'
        : '尚未確認這個帳號的報告權限。若已購買，請使用購買時的帳號；匿名付款請在原付款裝置開啟。原付款不需要重付。',
    };
  }
  return { status: 'error', message: '完整報告暫時無法載入，請重新載入。你的付款紀錄會保留，不需要重新付款。' };
}
