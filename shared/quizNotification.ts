export type QuizNotificationFunnel = 'v1' | 'v1_5' | 'v2';
export type QuizNotificationLocale = 'zh' | 'en' | 'ja' | 'ko';

export interface QuizNotificationInput {
  completionId: string;
  funnel: QuizNotificationFunnel;
  locale: QuizNotificationLocale;
  answerIndices: (0 | 1)[];
}

export function parseQuizNotification(value: unknown): QuizNotificationInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some(key => !['completionId', 'funnel', 'locale', 'answerIndices'].includes(key))) return null;
  if (typeof body.completionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.completionId)) return null;
  if (typeof body.funnel !== 'string' || !['v1', 'v1_5', 'v2'].includes(body.funnel)
    || typeof body.locale !== 'string' || !['zh', 'en', 'ja', 'ko'].includes(body.locale)) return null;
  if (!Array.isArray(body.answerIndices) || body.answerIndices.length !== (body.funnel === 'v1_5' ? 5 : 40)
    || !body.answerIndices.every(value => value === 0 || value === 1)) return null;
  return { completionId: body.completionId.toLowerCase(), funnel: body.funnel, locale: body.locale,
    answerIndices: body.answerIndices } as QuizNotificationInput;
}
