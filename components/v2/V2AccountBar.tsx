import React, { useState } from 'react';
import { loginWithGoogle, useSupabaseAuth } from './useSupabaseAuth';
import { signOutSupabase } from '../../utils/supabaseAuthBridge';

export default function V2AccountBar() {
  const auth = useSupabaseAuth();
  const [message, setMessage] = useState('');
  return (
    <nav className="ad-account-bar" aria-label="報告帳號">
      <a href="/read" className="ad-account-home">KIWIMU / QUIET ATLAS</a>
      <div className="ad-account-actions">
        <a href="/read/library">我的報告 <span aria-hidden="true">↗</span></a>
        {!auth.isLoggedIn ? <button type="button" disabled={auth.isLoading}
          onClick={() => { void loginWithGoogle({ onError: setMessage }); }}>
          {auth.isLoading ? '確認帳號…' : '登入'}
        </button> : <button type="button" onClick={() => { void signOutSupabase().catch(() => setMessage('暫時無法登出，請再試一次。')); }}>登出</button>}
      </div>
      {message ? <p role="status" className="ad-account-message">{message}</p> : null}
    </nav>
  );
}
