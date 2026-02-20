import { NextRequest, NextResponse } from 'next/server';

/**
 * i18n 性能監控 API
 * 用於報告 Core Web Vitals 和性能指標
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, locale, url } = body;

    // 記錄性能數據
    console.log('[Performance]', {
      metric: metric.name,
      value: metric.value,
      locale,
      url,
      timestamp: new Date().toISOString(),
    });

    // 可以將其發送到外部分析服務
    // await sendToAnalytics({ metric, locale, url });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Performance Error]', error);
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}
