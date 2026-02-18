/**
 * Banner shown at the top of results for anonymous scans.
 * Prompts user to create a free account to save the report.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonScanBannerProps {
  scanId: string;
  className?: string;
}

export function AnonScanBanner({ scanId, className }: AnonScanBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  const handleSignUp = () => {
    // Pass scan ID so Auth page can claim it after signup
    navigate(`/auth?tab=signup&claim=${scanId}`);
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-4 px-5 py-3.5",
        "bg-primary/10 border border-primary/30 rounded-xl",
        "text-sm",
        className
      )}
      role="banner"
    >
      <div className="flex items-center gap-3 min-w-0">
        <BookmarkCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-foreground">
          <span className="font-semibold">Save this report to your dashboard</span>
          {" — "}
          <span className="text-muted-foreground">create a free account to monitor changes over time.</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={handleSignUp}
          className="h-8 px-4 text-xs font-medium"
        >
          Create free account
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
