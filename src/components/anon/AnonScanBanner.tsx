/**
 * Banner shown at the top of results for anonymous scans.
 * Prompts user to create a free account to save the report.
 * Dismissal persists for 7 days via localStorage.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "dismiss_save_report_banner";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const expiry = Number(raw);
    if (Number.isNaN(expiry)) return false;
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

function persistDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
  } catch { /* noop */ }
}

interface AnonScanBannerProps {
  scanId: string;
  className?: string;
}

export function AnonScanBanner({ scanId, className }: AnonScanBannerProps) {
  const [dismissed, setDismissed] = useState(isDismissed);
  const navigate = useNavigate();

  const handleDismiss = useCallback(() => {
    persistDismiss();
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  const handleSignUp = () => {
    navigate(`/auth?tab=signup&claim=${scanId}`);
  };

  return (
    <div
      className={cn(
        "relative w-full",
        "px-4 py-3 md:px-5 md:py-3.5",
        "bg-muted/20 md:bg-primary/10 border border-border/30 md:border-primary/30 rounded-lg md:rounded-xl",
        className
      )}
      role="banner"
    >
      {/* Close button — always top-right, large tap target */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="pr-10 flex items-start gap-3">
        <BookmarkCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">
            Want to track changes over time?
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create a free account to save this report and get alerts when your exposure changes.
          </p>
        </div>
      </div>

      {/* Buttons — stacked on mobile, inline on desktop */}
      <div className="mt-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 md:pl-8">
        <Button
          size="sm"
          onClick={handleSignUp}
          className="w-full md:w-auto h-11 md:h-9 px-5 text-sm font-medium"
        >
          Create free account
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
        <button
          onClick={handleDismiss}
          className="w-full md:w-auto text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 md:py-0"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
