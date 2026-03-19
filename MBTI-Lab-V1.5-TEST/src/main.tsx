import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isPreview = new URLSearchParams(window.location.search).get('preview') === 'kiwimu';

if (isPreview) {
  const { default: KiwimuPreview } = await import('./components/kiwimu/KiwimuPreview.tsx');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <KiwimuPreview />
    </StrictMode>,
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
