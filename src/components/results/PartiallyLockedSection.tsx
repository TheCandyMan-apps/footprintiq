import { useState, ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProUpgradeModal } from "./ProUpgradeModal";

interface PartiallyLockedSectionProps {
  /** Section title shown even when locked */
  title: string;
  /** Optional icon for the section header */
  icon?: React.ComponentType<{ className?: string }>;
  /** Content to show for Pro users */
  children: ReactNode;
  /** Blurred preview content for Free users (optional) */
  blurredPreview?: ReactNode;
  /** Short reason why this is locked */
  lockedReason?: string;
  /** Additional classes */
  className?: string;
  /** Whether content is gated */
  isGated: boolean;
  /** Show as inline lock (smaller) vs section block */
  inline?: boolean;
}

/**
 * PartiallyLockedSection - Displays section header visible, content blurred/truncated for Free users.
 * Opens ProUpgradeModal on click (no navigation).
 * 
 * Design: Calm, investigative tone. Creates curiosity without frustration.
 */
export function PartiallyLockedSection({
  title,
  icon: Icon,
  children,
  blurredPreview,
  lockedReason = "Unlock full context",
  className,
  isGated,
  inline = false,
}: PartiallyLockedSectionProps) {
  const [showModal, setShowModal] = useState(false);

  // Pro user - show content normally
  if (!isGated) {
    return <>{children}</>;
  }

  // Free user - show locked state
  if (inline) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer",
            className
          )}
        >
          <Lock className="h-3 w-3" />
          <span>{lockedReason}</span>
        </button>
        <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "relative rounded-lg border border-border/50 bg-muted/20 overflow-hidden cursor-pointer group",
          className
        )}
        onClick={() => setShowModal(true)}
      >
        {/* Section Header - Always visible */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/30">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span className="font-medium text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <Lock className="h-3 w-3" />
            <span>{lockedReason}</span>
          </div>
        </div>

        {/* Content Area - Blurred/Truncated */}
        <div className="relative p-4">
          {/* Blurred preview content */}
          {blurredPreview ? (
            <div className="blur-[6px] select-none pointer-events-none opacity-60">
              {blurredPreview}
            </div>
          ) : (
            <div className="h-16 blur-sm select-none pointer-events-none opacity-40 bg-gradient-to-b from-muted/50 to-transparent" />
          )}

          {/* Overlay gradient + prompt */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/90 flex items-end justify-center pb-4">
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
              Click to unlock
            </span>
          </div>
        </div>
      </div>

      <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

/**
 * InlineLockBadge - Small inline lock indicator that opens modal.
 * Use within cards to indicate gated details.
 */
interface InlineLockBadgeProps {
  label?: string;
  className?: string;
}

export function InlineLockBadge({ label = "Pro", className }: InlineLockBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors",
          className
        )}
      >
        <Lock className="h-2.5 w-2.5" />
        <span>{label}</span>
      </button>
      <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
