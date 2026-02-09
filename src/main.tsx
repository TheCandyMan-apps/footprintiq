// React entry point
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { SubscriptionProvider } from "./hooks/useSubscription.tsx";
import { initSentry } from "./lib/sentry";
import { initWebVitals, logPerformanceSummary } from "./lib/webVitals";

// Initialize Sentry for error tracking
initSentry();

// Initialize Core Web Vitals monitoring
initWebVitals();

// Log performance summary in development after page load
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(logPerformanceSummary, 1000);
  });
}

// Defer service worker registration to avoid blocking critical path
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Wait for page to be fully interactive before registering SW
    setTimeout(() => {
      navigator.serviceWorker.register('/registerSW.js').catch(() => {
        // SW registration failed silently - not critical for app functionality
      });
    }, 3000);
  });
}

const helmetContext = {};

createRoot(document.getElementById("root")!).render(
  <HelmetProvider context={helmetContext}>
    <SubscriptionProvider>
      <App />
    </SubscriptionProvider>
  </HelmetProvider>
);
