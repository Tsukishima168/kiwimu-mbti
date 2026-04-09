import type { AppUser } from '../types';
import React, { useEffect, useState } from 'react';

type Props = {
  user: AppUser | null;
  onLogin: () => void;
};

export default function DiscordLinkGate({ user, onLogin }: Props) {
  // Read discord_link_state from URL, or from sessionStorage as fallback
  // (sessionStorage is set by handleLogin before OAuth redirect so state survives /callback)
  const [state] = useState<string | null>(() => {
    const urlState = new URLSearchParams(window.location.search).get('discord_link_state');
    if (urlState) return urlState;
    const ssState = sessionStorage.getItem('discord_link_state');
    if (ssState) {
      sessionStorage.removeItem('discord_link_state');
      return ssState;
    }
    return null;
  });

  const [status, setStatus] = useState<'idle' | 'linking' | 'linked' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!state) return;

    const run = async () => {
      if (!user || user.isAnonymous) {
        setStatus('idle');
        setMessage('請先登入以完成 Discord 綁定。');
        return;
      }

      try {
        setStatus('linking');
        setMessage('正在完成綁定…');

        const res = await fetch('/api/discord/link/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state,
            firebaseUid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.error || `HTTP ${res.status}`);
        }

        setStatus('linked');
        setMessage('綁定成功！你可以回到 Discord 使用 /result 查看你的結果。');

        // Remove query param to avoid re-post on refresh.
        const url = new URL(window.location.href);
        url.searchParams.delete('discord_link_state');
        window.history.replaceState({}, '', url.toString());
      } catch (e: any) {
        setStatus('error');
        setMessage(`綁定失敗：${e?.message || 'unknown error'}`);
      }
    };

    run();
  }, [state, user]);

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg border border-gray-200 shadow-2xl p-8 text-center">
        <p className="text-[10px] font-mono tracking-[0.5em] uppercase text-gray-400 font-bold mb-6">
          DISCORD LINK
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-kiwi-dark mb-4">
          綁定你的 Discord
        </h2>
        <p className="text-sm md:text-base text-gray-600 font-serif leading-relaxed mb-8">
          {message || '請在此完成帳號綁定。'}
        </p>

        {(!user || user.isAnonymous) && (
          <button
            onClick={onLogin}
            className="px-10 py-4 border-2 border-kiwi-dark text-kiwi-dark hover:bg-kiwi-dark hover:text-white transition-colors font-mono text-xs tracking-widest uppercase font-bold"
          >
            立即登入完成綁定
          </button>
        )}

        {status === 'linked' && (
          <button
            onClick={() => {
              // close overlay
              const url = new URL(window.location.href);
              url.searchParams.delete('discord_link_state');
              window.history.replaceState({}, '', url.toString());
              window.location.reload();
            }}
            className="px-10 py-4 border border-gray-300 text-gray-600 hover:border-kiwi-dark hover:text-kiwi-dark transition-colors font-mono text-xs tracking-widest uppercase font-bold"
          >
            返回網站
          </button>
        )}
      </div>
    </div>
  );
}

