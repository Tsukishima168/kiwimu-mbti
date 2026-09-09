import { useEffect, useState } from 'react';
import {
  PENDING_ECONOMY_CLAIM_EVENT,
  withPendingEconomyClaim,
} from '../utils/economyClaims';

export function usePendingEconomyClaimUrl(baseUrl: string): string {
  const [url, setUrl] = useState(() => withPendingEconomyClaim(baseUrl));

  useEffect(() => {
    const refresh = () => setUrl(withPendingEconomyClaim(baseUrl));
    refresh();
    window.addEventListener(PENDING_ECONOMY_CLAIM_EVENT, refresh);
    return () => window.removeEventListener(PENDING_ECONOMY_CLAIM_EVENT, refresh);
  }, [baseUrl]);

  return url;
}
