type V2EventName =
  | 'quiz_start'
  | 'v2_transition'
  | 'v2_complete'
  | 'v2_result_view'

type GtagFn = (
  command: 'event',
  action: string,
  params?: Record<string, unknown>
) => void

function getGtag(): GtagFn | null {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    return (window as unknown as { gtag: GtagFn }).gtag
  }
  return null
}

export function trackV2Event(
  event: V2EventName,
  params?: Record<string, unknown>
): void {
  const gtag = getGtag()
  if (!gtag) return
  gtag('event', event, params)
}
