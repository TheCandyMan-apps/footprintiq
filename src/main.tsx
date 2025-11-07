import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { SubscriptionProvider } from "./hooks/useSubscription.tsx";
import { initSentry } from "./lib/sentry";

// Initialize Sentry for error tracking
initSentry();

const helmetContext = {};

createRoot(document.getElementById("root")!).render(
  <HelmetProvider context={helmetContext}>
    <SubscriptionProvider>
      <App />
    </SubscriptionProvider>
  </HelmetProvider>
);
