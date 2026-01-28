import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UnifiedScanProgressProps {
  isComplete?: boolean;
  isFailed?: boolean;
  className?: string;
}

const STATUS_MESSAGES = [
  "Searching public platforms…",
  "Checking historical exposure…",
  "Analyzing reuse and patterns…",
  "Finalizing results…",
];

const ROTATION_INTERVAL = 2500; // 2.5 seconds
const LONG_SCAN_THRESHOLD = 45000; // 45 seconds

export function UnifiedScanProgress({ 
  isComplete = false, 
  isFailed = false,
  className 
}: UnifiedScanProgressProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTakingLong, setIsTakingLong] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Rotate status messages
  useEffect(() => {
    if (isComplete || isFailed) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isComplete, isFailed]);

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

  return (
    <Card className={cn("p-8", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Analyzing your digital footprint
          </h2>
          <p className="text-muted-foreground">
            Searching publicly available sources and analyzing patterns linked to your search.
          </p>
        </div>

        {/* Indeterminate Progress Bar */}
        <div className="relative w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 w-1/3 bg-primary rounded-full animate-indeterminate-progress"
          />
        </div>

        {/* Rotating Status */}
        <div className="flex items-center justify-center gap-2 min-h-[28px]">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span 
            key={currentMessageIndex}
            className="text-sm text-muted-foreground animate-fade-in"
          >
            {STATUS_MESSAGES[currentMessageIndex]}
          </span>
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
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">💡</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
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
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground/70 text-center">
            Public sources only • No monitoring • Results ready shortly
          </p>
        </div>
      </div>
    </Card>
  );
}
