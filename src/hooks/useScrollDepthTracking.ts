import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

interface ScrollDepthOptions {
  /** Page identifier for tracking */
  pageId: string;
  /** Depth thresholds to track (default: [25, 50, 75, 100]) */
  thresholds?: number[];
  /** Page type for categorization */
  pageType?: string;
}

/**
 * Hook to track scroll depth on a page.
 * Fires events when user scrolls past specified thresholds.
 * Each threshold only fires once per page load.
 */
export function useScrollDepthTracking({
  pageId,
  thresholds = [25, 50, 75, 100],
  pageType = 'content',
}: ScrollDepthOptions) {
  const trackedThresholds = useRef<Set<number>>(new Set());
  const hasTrackedPageview = useRef(false);
  const startTime = useRef<number>(Date.now());
  const trackedTimeThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Track pageview on mount (only once)
    if (!hasTrackedPageview.current) {
      analytics.trackEvent('pageview', {
        page: pageId,
        page_type: pageType,
      });
      hasTrackedPageview.current = true;
      startTime.current = Date.now();
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          analytics.trackEvent('scroll_depth', {
            page: pageId,
            depth: threshold,
            page_type: pageType,
          });
        }
      }
    };

    // Time on page tracking at intervals (30s, 60s, 120s, 300s)
    const timeThresholds = [30, 60, 120, 300];
    const timeInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime.current) / 1000);
      
      for (const threshold of timeThresholds) {
        if (elapsedSeconds >= threshold && !trackedTimeThresholds.current.has(threshold)) {
          trackedTimeThresholds.current.add(threshold);
          analytics.trackEvent('time_on_page', {
            page: pageId,
            seconds: threshold,
            page_type: pageType,
          });
        }
      }
    }, 5000);

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, [pageId, thresholds, pageType]);

  // Reset on unmount for SPA navigation
  useEffect(() => {
    return () => {
      trackedThresholds.current.clear();
      trackedTimeThresholds.current.clear();
      hasTrackedPageview.current = false;
    };
  }, [pageId]);
}
