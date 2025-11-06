import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  // Update elapsed time
  useEffect(() => {
    if (!startedAt || finishedAt || status !== 'running') return;

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

  const calculateProgress = (): number => {
    if (status === 'finished') return 100;
    if (resultCount === 0 || estimatedTotal === 0) return 0;
    return Math.min(Math.round((resultCount / estimatedTotal) * 100), 99);
  };

  const calculateEstimatedRemaining = (): string => {
    if (status === 'finished' || status === 'error') return '-';
    if (resultCount === 0 || elapsedSeconds === 0) return 'Calculating...';
    
    const scanRate = resultCount / elapsedSeconds; // sites per second
    const remainingSites = Math.max(0, estimatedTotal - resultCount);
    const remainingSeconds = Math.round(remainingSites / scanRate);
    
    return formatTime(remainingSeconds);
  };

  const getScanRate = (): string => {
    if (resultCount === 0 || elapsedSeconds === 0) return '-';
    const rate = (resultCount / elapsedSeconds).toFixed(1);
    return `${rate} sites/s`;
  };

  const progress = calculateProgress();
  const isRunning = status === 'running';
  const isFinished = status === 'finished';
  const isError = status === 'error';

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
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {allSites 
                  ? '⚡ Scanning all available sites. This may take several minutes.'
                  : '🎯 Scanning popular sites. Faster completion expected.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
