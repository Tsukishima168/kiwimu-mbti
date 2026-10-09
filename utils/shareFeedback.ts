export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';
type ShareApi = { share?: (data: ShareData) => Promise<void>; clipboard?: { writeText: (text: string) => Promise<void> } };

/** A dismissed share sheet stays silent; success is shown only after it resolves. */
export async function shareWithFeedback(data: ShareData, api: ShareApi = navigator): Promise<ShareOutcome> {
  if (api.share) {
    try { await api.share(data); return 'shared'; }
    catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    if (!api.clipboard) return 'failed';
    const text = data.text?.includes(data.url || '\u0000') ? data.text : [data.text, data.url].filter(Boolean).join('\n\n');
    await api.clipboard.writeText(text || data.title || '');
    return 'copied';
  } catch { return 'failed'; }
}
