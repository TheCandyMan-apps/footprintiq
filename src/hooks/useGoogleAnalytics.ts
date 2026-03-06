import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { firePageConversions } from '@/lib/retargeting';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-7B32ERNHXN';

/**
 * Hook to track page views in Google Analytics for SPA navigation
 * and fire retargeting pixel conversion events per route.
 */
export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }

    // Fire Meta Pixel / Google Ads conversion events for key pages
    firePageConversions(location.pathname);
  }, [location.pathname, location.search]);
}
