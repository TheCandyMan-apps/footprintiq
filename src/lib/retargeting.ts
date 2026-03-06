// Retargeting pixel helpers for Meta Pixel & Google Ads
// Replace placeholder IDs in index.html when your ad accounts are ready.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    __GADS_ID?: string;
  }
}

/** Fire a Meta Pixel standard or custom event */
const fbEvent = (event: string, params?: Record<string, unknown>) => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
};

/** Fire a Google Ads conversion event */
const gadsEvent = (conversionLabel: string, params?: Record<string, unknown>) => {
  if (typeof window.gtag === 'function' && window.__GADS_ID) {
    window.gtag('event', 'conversion', {
      send_to: `${window.__GADS_ID}/${conversionLabel}`,
      ...params,
    });
  }
};

// ─── Funnel-specific conversion helpers ──────────────────────

/** Visitor lands on /free-scan */
export const trackFreeScanView = () => {
  fbEvent('ViewContent', { content_name: 'free-scan' });
  gadsEvent('free_scan_view');
};

/** Visitor submits a scan (free or authenticated) */
export const trackScanSubmit = (scanType: string) => {
  fbEvent('Search', { content_category: scanType });
  gadsEvent('scan_submit', { event_category: scanType });
};

/** Visitor views /auth (signup/login page) */
export const trackAuthView = () => {
  fbEvent('Lead', { content_name: 'auth-page' });
  gadsEvent('auth_view');
};

/** Successful signup */
export const trackSignup = () => {
  fbEvent('CompleteRegistration');
  gadsEvent('signup');
};

/** Visitor views /pricing */
export const trackPricingView = () => {
  fbEvent('ViewContent', { content_name: 'pricing' });
  gadsEvent('pricing_view');
};

/** Visitor begins checkout (redirect to Stripe) */
export const trackBeginCheckout = (plan: string, value?: number) => {
  fbEvent('InitiateCheckout', { content_name: plan, value, currency: 'USD' });
  gadsEvent('begin_checkout', { value, currency: 'USD' });
};

/** Successful purchase / subscription */
export const trackPurchase = (plan: string, value: number) => {
  fbEvent('Purchase', { content_name: plan, value, currency: 'USD' });
  gadsEvent('purchase', { value, currency: 'USD', transaction_id: '' });
};

// ─── Automatic page-level conversions ─────────────────────────

const PAGE_EVENTS: Record<string, () => void> = {
  '/free-scan': trackFreeScanView,
  '/auth': trackAuthView,
  '/pricing': trackPricingView,
};

/**
 * Call on every route change to fire page-level conversion events.
 * Already integrated into useGoogleAnalytics hook.
 */
export const firePageConversions = (pathname: string) => {
  const handler = PAGE_EVENTS[pathname];
  if (handler) handler();
};
