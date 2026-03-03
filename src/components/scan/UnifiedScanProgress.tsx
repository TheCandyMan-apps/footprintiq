import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getStepsForScanType, type ScanStepType } from '@/lib/scan/freeScanSteps';

interface UnifiedScanProgressProps {
  isComplete?: boolean;
  isFailed?: boolean;
  className?: string;
  scanType?: ScanStepType;
}

const ROTATION_INTERVAL = 2500; // 2.5 seconds
const LONG_SCAN_THRESHOLD = 45000; // 45 seconds

export function UnifiedScanProgress({ 
  isComplete = false, 
  isFailed = false,
  className,
  scanType = 'username'
}: UnifiedScanProgressProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTakingLong, setIsTakingLong] = useState(false);
  const [whatOpen, setWhatOpen] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Get scan-type-specific status messages from centralized steps
  const statusMessages = useMemo(() => {
    const steps = getStepsForScanType(scanType);
    return steps.map(step => step.title);
  }, [scanType]);

  // Rotate status messages
  useEffect(() => {
    if (isComplete || isFailed) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % statusMessages.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isComplete, isFailed, statusMessages.length]);

  // Check for long-running scan
  useEffect(() => {
    if (isComplete || isFailed) return;

    const timeout = setTimeout(() => {
      setIsTakingLong(true);
    }, LONG_SCAN_THRESHOLD);

    return () => clearTimeout(timeout);
  }, [isComplete, isFailed]);

  // Reset on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsTakingLong(false);
    setCurrentMessageIndex(0);
  }, []);

  if (isFailed) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            We couldn't complete this scan
          </h2>
          <p className="text-muted-foreground">
            Something went wrong while analyzing your footprint. Please try again.
          </p>
        </div>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Analysis complete
          </h2>
          <p className="text-muted-foreground">
            Preparing your results…
          </p>
        </div>
      </Card>
    );
  }

  const fakePercent = useMemo(() => {
    const elapsed = Date.now() - startTimeRef.current;
    // Cap at 92% to avoid implying completion
    return Math.min(92, Math.round((elapsed / 120000) * 100));
  }, [currentMessageIndex]); // recalc each rotation

  return (
    <Card className={cn("p-8 md:p-8 p-5", className)}>
      <div className="space-y-6 md:space-y-6 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-2 space-y-1">
          <h2 className="text-2xl md:text-2xl text-xl font-semibold text-foreground">
            Analyzing your digital footprint
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Searching publicly available sources and analyzing patterns linked to your search.
          </p>
        </div>

        {/* Progress Bar - taller on mobile with shimmer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary md:hidden">{fakePercent}% complete</span>
            <span className="text-xs text-muted-foreground/70 md:hidden">Awaiting data…</span>
          </div>
          <div className="relative w-full h-2 md:h-2 h-[6px] bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${fakePercent}%` }}
            >
              {/* Subtle shimmer overlay - mobile only */}
              <div className="absolute inset-0 md:hidden bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Rotating Status */}
        <div className="flex items-center justify-center gap-2 min-h-[28px]">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span 
            key={currentMessageIndex}
            className="text-sm text-muted-foreground animate-fade-in"
          >
            {statusMessages[currentMessageIndex]}
          </span>
        </div>

        {/* What's happening - mobile only */}
        <div className="md:hidden">
          <button
            onClick={() => setWhatOpen(!whatOpen)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", whatOpen && "rotate-180")} />
            <span>What's happening</span>
          </button>
          <div className={cn(
            "grid transition-all duration-200 ease-in-out",
            whatOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <ul className="space-y-1.5 text-xs text-muted-foreground/80 pl-5">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                  Checking public platforms
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                  Validating identifiers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                  Correlating signals
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Long scan message */}
        {isTakingLong && (
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted-foreground/80 italic">
              This scan is taking longer than usual. We're still working on it.
            </p>
          </div>
        )}

        {/* Scan scope info */}
        <div className="bg-primary/5 rounded-lg p-4 md:p-4 p-3 border border-primary/10">
          <div className="flex items-start gap-3 md:gap-3 gap-2">
            <div className="w-8 h-8 md:w-8 md:h-8 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm md:text-sm text-xs">💡</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm md:text-sm text-xs font-medium text-foreground">
                Scanning 300+ platforms using multiple OSINT tools
              </p>
              <p className="text-xs text-muted-foreground">
                We use Maigret, Sherlock, WhatsMyName, and other tools in parallel. 
                Deep scans can take up to 10 minutes for comprehensive results.
              </p>
            </div>
          </div>
        </div>

        {/* Footer reassurance */}
        <div className="pt-4 md:pt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground/70 text-center">
            Public sources only • No monitoring • Results ready shortly
          </p>
        </div>
      </div>
    </Card>
  );
}
