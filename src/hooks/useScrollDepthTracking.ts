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

  useEffect(() => {
    // Track pageview on mount (only once)
    if (!hasTrackedPageview.current) {
      analytics.trackEvent('pageview', {
        page: pageId,
        page_type: pageType,
      });
      hasTrackedPageview.current = true;
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

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageId, thresholds, pageType]);

  // Reset on unmount for SPA navigation
  useEffect(() => {
    return () => {
      trackedThresholds.current.clear();
      hasTrackedPageview.current = false;
    };
  }, [pageId]);
}
