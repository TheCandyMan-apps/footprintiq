/**
 * Core Web Vitals Monitoring
 * Tracks LCP, INP, CLS, TTFB for performance optimization
 * Integrates with Plausible analytics for privacy-friendly tracking
 */

import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { trackEvent } from './analytics';

// Thresholds for Core Web Vitals (in ms for timing, unitless for CLS)
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get rating for a metric value based on thresholds
 */
function getMetricRating(name: string, value: number): MetricRating {
  const thresholds = WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Report metric to analytics
 */
function reportMetric(metric: Metric) {
  const rating = getMetricRating(metric.name, metric.value);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    const color = rating === 'good' ? '#0cce6b' : rating === 'needs-improvement' ? '#ffa400' : '#ff4e42';
    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }

  // Track in Plausible analytics
  trackEvent('web_vital', {
    metric: metric.name,
    value: Math.round(metric.value),
    rating,
    // Include navigation type for context
    navigationType: metric.navigationType || 'unknown',
  });
}

/**
 * Initialize Core Web Vitals monitoring
 * Call this once on app initialization
 */
export function initWebVitals() {
  // Largest Contentful Paint - measures loading performance
  onLCP(reportMetric);
  
  // Cumulative Layout Shift - measures visual stability
  onCLS(reportMetric);
  
  // Time to First Byte - measures server response time
  onTTFB(reportMetric);
  
  // Interaction to Next Paint - measures interactivity (replaced FID)
  onINP(reportMetric);
}

/**
 * Get current performance metrics for debugging
 */
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
  const fp = paint.find(entry => entry.name === 'first-paint');
  
  return {
    // Navigation timing
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcp: navigation?.connectEnd - navigation?.connectStart,
    ssl: navigation?.secureConnectionStart > 0 
      ? navigation?.connectEnd - navigation?.secureConnectionStart 
      : 0,
    ttfb: navigation?.responseStart - navigation?.requestStart,
    download: navigation?.responseEnd - navigation?.responseStart,
    domInteractive: navigation?.domInteractive - navigation?.fetchStart,
    domComplete: navigation?.domComplete - navigation?.fetchStart,
    loadComplete: navigation?.loadEventEnd - navigation?.fetchStart,
    
    // Paint timing
    firstPaint: fp?.startTime,
    firstContentfulPaint: fcp?.startTime,
    
    // Resource counts
    resourceCount: performance.getEntriesByType('resource').length,
  };
}

/**
 * Log performance summary to console (development only)
 */
export function logPerformanceSummary() {
  if (!import.meta.env.DEV) return;
  
  const metrics = getPerformanceMetrics();
  
  console.group('%c📊 Performance Summary', 'font-weight: bold; font-size: 14px;');
  console.log(`TTFB: ${metrics.ttfb?.toFixed(0)}ms`);
  console.log(`First Paint: ${metrics.firstPaint?.toFixed(0)}ms`);
  console.log(`First Contentful Paint: ${metrics.firstContentfulPaint?.toFixed(0)}ms`);
  console.log(`DOM Interactive: ${metrics.domInteractive?.toFixed(0)}ms`);
  console.log(`DOM Complete: ${metrics.domComplete?.toFixed(0)}ms`);
  console.log(`Load Complete: ${metrics.loadComplete?.toFixed(0)}ms`);
  console.log(`Resources Loaded: ${metrics.resourceCount}`);
  console.groupEnd();
}
