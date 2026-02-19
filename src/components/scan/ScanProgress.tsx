import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Rotating live status messages shown during scan
const SCAN_PHASES = [
  { message: 'Initialising OSINT pipeline...', minElapsed: 0 },
  { message: 'Querying WhatsMyName database...', minElapsed: 5 },
  { message: 'Scanning social media platforms...', minElapsed: 12 },
  { message: 'Cross-referencing usernames across 300+ sites...', minElapsed: 20 },
  { message: 'Running Maigret profile detection...', minElapsed: 30 },
  { message: 'Mapping linked profiles and entities...', minElapsed: 45 },
  { message: 'Correlating identity signals...', minElapsed: 60 },
  { message: 'Checking breach exposure databases...', minElapsed: 80 },
  { message: 'Filtering false positives...', minElapsed: 100 },
  { message: 'Aggregating and scoring results...', minElapsed: 130 },
  { message: 'Building digital footprint profile...', minElapsed: 160 },
  { message: 'Almost there — finalising intelligence report...', minElapsed: 200 },
];

interface ScanProgressProps {
  startedAt: string | null;
  finishedAt: string | null;
  status: string;
  resultCount: number;
  allSites: boolean;
}

export const ScanProgress = ({ startedAt, finishedAt, status, resultCount, allSites }: ScanProgressProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [liveMessage, setLiveMessage] = useState(SCAN_PHASES[0].message);
  const [messageVisible, setMessageVisible] = useState(true);
  const messageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Estimated total sites based on scan type
  useEffect(() => {
    if (allSites) {
      // All sites mode - rough estimate based on Maigret's database
      setEstimatedTotal(500);
    } else {
      // Standard mode - smaller set of popular sites
      setEstimatedTotal(100);
    }
  }, [allSites]);

  // Drive live status message based on elapsed time
  useEffect(() => {
    if (!['running', 'pending'].includes(status) || finishedAt) return;

    const updateMessage = (seconds: number) => {
      // Find the most advanced phase that has been reached
      let phase = SCAN_PHASES[0];
      for (const p of SCAN_PHASES) {
        if (seconds >= p.minElapsed) phase = p;
      }
      if (phase.message !== liveMessage) {
        // Fade out → swap → fade in
        setMessageVisible(false);
        setTimeout(() => {
          setLiveMessage(phase.message);
          setMessageVisible(true);
        }, 300);
      }
    };

    updateMessage(elapsedSeconds);
  }, [elapsedSeconds, status, finishedAt]);

  // Update elapsed time

  useEffect(() => {
    if (!startedAt || finishedAt || !['running', 'pending'].includes(status)) return;

    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, finishedAt, status]);

  // Calculate initial elapsed time if scan is finished
  useEffect(() => {
    if (startedAt && finishedAt) {
      const start = new Date(startedAt).getTime();
      const end = new Date(finishedAt).getTime();
      setElapsedSeconds(Math.floor((end - start) / 1000));
    } else if (startedAt && status === 'running') {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }
  }, [startedAt, finishedAt, status]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const [lastProgress, setLastProgress] = useState(0);

  const calculateProgress = (): number => {
    if (['finished', 'completed', 'completed_partial', 'completed_empty'].includes(status)) return 100;
    if (resultCount === 0 || estimatedTotal === 0) return Math.max(5, lastProgress);
    
    // Ensure progress is monotonically increasing
    const newProgress = Math.min(Math.round((resultCount / estimatedTotal) * 100), 99);
    const clampedProgress = Math.max(newProgress, lastProgress);
    
    if (clampedProgress > lastProgress) {
      setLastProgress(clampedProgress);
    }
    
    return clampedProgress;
  };

  const calculateEstimatedRemaining = (): string => {
    if (['finished', 'completed', 'completed_partial', 'completed_empty', 'error', 'failed', 'timeout'].includes(status)) return '-';
    
    // If no results yet but scan is running, show time-based estimate
    if (resultCount === 0) {
      // Deep scans typically take 3-10 minutes
      const estimatedTotalSeconds = allSites ? 600 : 180; // 10 min for all sites, 3 min for popular
      const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
      if (remainingSeconds <= 0) return 'Almost done...';
      return formatTime(remainingSeconds);
    }
    
    if (elapsedSeconds === 0) return 'Starting...';
    
    const scanRate = resultCount / elapsedSeconds; // sites per second
    const remainingSites = Math.max(0, estimatedTotal - resultCount);
    const remainingSeconds = Math.round(remainingSites / scanRate);
    
    return formatTime(remainingSeconds);
  };

  const getScanRate = (): string => {
    // If no results yet, show "awaiting" status instead of confusing 0.0
    if (resultCount === 0) return 'Awaiting data...';
    if (elapsedSeconds === 0) return '-';
    const rate = (resultCount / elapsedSeconds).toFixed(1);
    return `${rate} sites/s`;
  };

  const progress = calculateProgress();
  const isRunning = status === 'running' || status === 'pending';
  const isFinished = ['finished', 'completed', 'completed_partial', 'completed_empty'].includes(status);
  const isError = ['error', 'failed', 'failed_timeout', 'timeout'].includes(status);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRunning && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {isFinished && <CheckCircle className="h-5 w-5 text-success" />}
              {isError && <span className="h-5 w-5 text-destructive">⚠️</span>}
              <span className="font-semibold">
                {isRunning && 'Scan in Progress'}
                {isFinished && 'Scan Complete'}
                {isError && 'Scan Failed'}
                {!isRunning && !isFinished && !isError && 'Scan Queued'}
              </span>
            </div>
            <Badge variant={isFinished ? 'default' : 'secondary'}>
              {resultCount} / ~{estimatedTotal} sites
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{progress}% complete</span>
              {isRunning && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {getScanRate()}
                </span>
              )}
            </div>
          </div>

          {/* Time Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Elapsed Time</div>
                <div className="font-medium">{formatTime(elapsedSeconds)}</div>
              </div>
            </div>

            {isRunning && (
              <>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Est. Remaining</div>
                    <div className="font-medium">{calculateEstimatedRemaining()}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Scan Rate</div>
                    <div className="font-medium">{getScanRate()}</div>
                  </div>
                </div>
              </>
            )}

            {isFinished && (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Total Time</div>
                  <div className="font-medium text-success">{formatTime(elapsedSeconds)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {isRunning && (
            <div className="pt-2 border-t space-y-3">
              {/* Live rolling status message */}
              <div className="flex items-center gap-2 min-h-[20px]">
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                <p
                  className="text-xs text-foreground font-medium transition-opacity duration-300"
                  style={{ opacity: messageVisible ? 1 : 0 }}
                >
                  {liveMessage}
                </p>
              </div>

              <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground">
                  {allSites
                    ? '⚡ Running full-depth scan across all available sites. This may take several minutes.'
                    : '🎯 Maigret · Sherlock · WhatsMyName running in parallel. Deep scans can take up to 10 minutes.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
