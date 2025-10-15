// Privacy-friendly analytics using Plausible
// Respects Do-Not-Track and cookie consent

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export const trackEvent = (
  eventName: string,
  props?: Record<string, string | number>
) => {
  // Respect Do-Not-Track header
  if (navigator.doNotTrack === "1" || (navigator as any).doNotTrack === "1") {
    return;
  }

  // Check if Plausible is loaded
  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props });
  }
};

// Common event tracking functions
export const analytics = {
  scanStarted: (scanType: string) => {
    trackEvent("scan_started", { type: scanType });
  },

  scanSuccess: (scanType: string, findingsCount: number) => {
    trackEvent("scan_success", { 
      type: scanType,
      findings: findingsCount 
    });
  },

  scanError: (scanType: string, errorType: string) => {
    trackEvent("scan_error", { 
      type: scanType,
      error: errorType 
    });
  },

  providerError: (provider: string) => {
    trackEvent("provider_error", { provider });
  },

  upgradeClicked: (tier: string) => {
    trackEvent("upgrade_clicked", { tier });
  },

  blogPostViewed: (slug: string) => {
    trackEvent("blog_post_viewed", { slug });
  },
};
