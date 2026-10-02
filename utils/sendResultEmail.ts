import { getAuthSupabaseClient } from './supabaseAuthBridge';

interface ResultSummary {
  title?: string;
  summary?: string;
  dessert?: { name?: string };
}

export async function sendResultEmail(
  _to: string,
  mbtiType: string,
  variant: string,
  _resultSummary?: ResultSummary
): Promise<void> {
  try {
    const client = getAuthSupabaseClient();
    if (!client) return;
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mbtiType, variant }),
    });
    if (!res.ok) {
      console.warn('Send result email failed:', res.status);
    }
  } catch {
    console.warn('Send result email failed');
  }
}
