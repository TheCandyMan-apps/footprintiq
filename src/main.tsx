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

// Clean up any stale service workers that might be caching old builds
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
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
