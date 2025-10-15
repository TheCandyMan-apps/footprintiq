import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-foreground mb-2">
              <strong>Your Privacy Matters</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              We use essential cookies to ensure our service works properly. We never store or sell your personal data. 
              By continuing, you accept our{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectCookies}
              className="whitespace-nowrap"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="whitespace-nowrap"
            >
              Accept Essential
            </Button>
            <button
              onClick={rejectCookies}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
