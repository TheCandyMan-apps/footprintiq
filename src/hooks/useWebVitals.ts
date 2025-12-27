/**
 * React hook for accessing Web Vitals data
 * Provides real-time performance metrics for debugging and monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { WEB_VITALS_THRESHOLDS } from '@/lib/webVitals';

interface WebVitalsData {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  fcp: number | null;
}

interface WebVitalsRatings {
  lcp: 'good' | 'needs-improvement' | 'poor' | null;
  cls: 'good' | 'needs-improvement' | 'poor' | null;
  inp: 'good' | 'needs-improvement' | 'poor' | null;
  ttfb: 'good' | 'needs-improvement' | 'poor' | null;
}

function getRating(name: keyof typeof WEB_VITALS_THRESHOLDS, value: number | null): 'good' | 'needs-improvement' | 'poor' | null {
  if (value === null) return null;
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsData>({
    lcp: null,
    cls: null,
    inp: null,
    ttfb: null,
    fcp: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const collectMetrics = useCallback(() => {
    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    // Get navigation timing for TTFB
    const navEntries = performance.getEntriesByType('navigation');
    const navigation = navEntries[0] as PerformanceNavigationTiming | undefined;
    
    setMetrics(prev => ({
      ...prev,
      fcp: fcp?.startTime ?? null,
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : null,
    }));
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Wait for page load to collect metrics
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, [collectMetrics]);

  // Subscribe to web-vitals updates
  useEffect(() => {
    let mounted = true;

    import('web-vitals').then(({ onLCP, onCLS, onINP, onTTFB }) => {
      if (!mounted) return;

      onLCP((metric) => {
        if (mounted) setMetrics(prev => ({ ...prev, lcp: metric.value }));
      });

      onCLS((metric) => {
        if (mounted) setMetrics(prev => ({ ...prev, cls: metric.value }));
      });

      onINP((metric) => {
        if (mounted) setMetrics(prev => ({ ...prev, inp: metric.value }));
      });

      onTTFB((metric) => {
        if (mounted) setMetrics(prev => ({ ...prev, ttfb: metric.value }));
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const ratings: WebVitalsRatings = {
    lcp: getRating('LCP', metrics.lcp),
    cls: getRating('CLS', metrics.cls),
    inp: getRating('INP', metrics.inp),
    ttfb: getRating('TTFB', metrics.ttfb),
  };

  const overallScore = Object.values(ratings).filter(r => r === 'good').length;
  const totalMetrics = Object.values(ratings).filter(r => r !== null).length;

  return {
    metrics,
    ratings,
    isLoading,
    overallScore,
    totalMetrics,
    isHealthy: overallScore === totalMetrics && totalMetrics > 0,
  };
}
