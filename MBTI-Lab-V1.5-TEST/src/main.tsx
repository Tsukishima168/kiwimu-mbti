import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const params = new URLSearchParams(window.location.search);
const isPreview = params.get('preview') === 'kiwimu';
const isV2 = window.location.pathname.startsWith('/v2');

if (isPreview) {
  const { default: KiwimuPreview } = await import('./components/kiwimu/KiwimuPreview.tsx');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <KiwimuPreview />
    </StrictMode>,
  );
} else if (isV2) {
  const { default: V2App } = await import('./v2/V2App.tsx');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <V2App />
    </StrictMode>,
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
