import React, { useState } from 'react';
import { loginWithGoogle, useSupabaseAuth } from './useSupabaseAuth';
import { signOutSupabase } from '../../utils/supabaseAuthBridge';

export default function V2AccountBar() {
  const auth = useSupabaseAuth();
  const [message, setMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    setMessage('');
    setSigningOut(true);
    try { await signOutSupabase(); }
    catch {
      setMessage('無法確認所有裝置均已登出。請查看目前登入狀態；其他裝置可能仍維持登入。');
    } finally { setSigningOut(false); }
  };
  return (
    <nav className="ad-account-bar" aria-label="報告帳號">
      <a href="/read" className="ad-account-home">V2 敘事探索</a>
      <div className="ad-account-actions">
        <a href="/read/library">我的報告 <span aria-hidden="true">↗</span></a>
        {!auth.isLoggedIn ? <button type="button" disabled={auth.isLoading}
          onClick={() => { setMessage(''); void loginWithGoogle({ onError: setMessage }); }}>
          {auth.isLoading ? '確認帳號…' : '登入'}
        </button> : <button type="button" disabled={signingOut} onClick={() => { void handleSignOut(); }}>{signingOut ? '正在登出…' : '登出'}</button>}
      </div>
      {auth.isLoggedIn ? <p className="ad-account-identity">已登入 · 報告保存在購買時的帳號</p> : null}
      {message ? <p role="status" className="ad-account-message">{message}</p> : null}
    </nav>
  );
}
