import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertCircle, Activity } from 'lucide-react';
import { CircularProgress } from '@/components/CircularProgress';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/lib/haptics';

interface ProgressUpdate {
  scanId: string;
  status: 'started' | 'processing' | 'aggregating' | 'premium' | 'completed';
  totalProviders?: number;
  completedProviders?: number;
  currentProvider?: string;
  currentProviders?: string[];
  findingsCount?: number;
  totalFindings?: number;
  message?: string;
  error?: boolean;
  tookMs?: number;
}

interface ScanProgressTrackerProps {
  scanId: string | null;
  onComplete?: () => void;
}

export const ScanProgressTracker = ({ scanId, onComplete }: ScanProgressTrackerProps) => {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [activeProviders, setActiveProviders] = useState<Set<string>>(new Set());
  const [completedProviders, setCompletedProviders] = useState<Set<string>>(new Set());
  const [failedProviders, setFailedProviders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!scanId) return;

    console.log('[ScanProgress] Subscribing to scan progress:', scanId);

    const channel = supabase.channel(`scan_progress:${scanId}`);

    channel
      .on('broadcast', { event: 'progress' }, ({ payload }: { payload: ProgressUpdate }) => {
        console.log('[ScanProgress] Progress update:', payload);
        setProgress(payload);

        // Track active providers
        if (payload.currentProvider) {
          setActiveProviders(prev => new Set([...prev, payload.currentProvider!]));
        }

        // Track completed providers
        if (payload.status === 'processing' && payload.currentProvider) {
          if (payload.error) {
            setFailedProviders(prev => new Set([...prev, payload.currentProvider!]));
          } else if (payload.findingsCount !== undefined) {
            setCompletedProviders(prev => new Set([...prev, payload.currentProvider!]));
          }
        }

        // Call onComplete when scan finishes
        if (payload.status === 'completed' && onComplete) {
          // Trigger haptic feedback
          triggerHaptic('success');
          
          // Fire confetti
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // Fire confetti from two sides
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
          }, 250);

          setTimeout(() => onComplete(), 1500);
        }
      })
      .subscribe((status) => {
        console.log('[ScanProgress] Channel status:', status);
      });

    return () => {
      console.log('[ScanProgress] Unsubscribing from scan progress');
      supabase.removeChannel(channel);
    };
  }, [scanId, onComplete]);

  if (!progress) {
    return null;
  }

  const progressPercentage = progress.totalProviders
    ? Math.round(((progress.completedProviders || 0) / progress.totalProviders) * 100)
    : 0;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'started':
        return <Activity className="w-4 h-4 animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'aggregating':
      case 'premium':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'text-success';
      case 'started':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Status Header with Circular Progress */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={getStatusColor()}>
                  {getStatusIcon()}
                </div>
                <span className="text-sm font-medium">
                  {progress.message || 'Processing...'}
                </span>
              </div>
              {progress.status === 'completed' && progress.tookMs && (
                <Badge variant="secondary" className="text-xs">
                  Completed in {(progress.tookMs / 1000).toFixed(1)}s
                </Badge>
              )}
            </div>
            
            {progress.totalProviders && progress.status !== 'completed' && (
              <CircularProgress 
                value={progressPercentage} 
                size={80}
                strokeWidth={6}
              />
            )}
          </div>

          {/* Progress Bar */}
          {progress.totalProviders && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium">
                  {progress.completedProviders || 0} / {progress.totalProviders} providers
                </span>
                <span className="font-semibold text-primary animate-fade-in">
                  {progressPercentage}%
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                showPercentage={false}
                animated={true}
                className="h-3"
              />
            </div>
          )}

          {/* Active Providers */}
          {progress.status === 'processing' && activeProviders.size > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Querying Providers:
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(activeProviders).map((provider) => {
                  const isCompleted = completedProviders.has(provider);
                  const isFailed = failedProviders.has(provider);
                  
                  return (
                    <Badge
                      key={provider}
                      variant={isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary'}
                      className="text-xs gap-1"
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      {isFailed && <AlertCircle className="w-3 h-3" />}
                      {!isCompleted && !isFailed && <Loader2 className="w-3 h-3 animate-spin" />}
                      {provider}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Status */}
          {progress.status === 'completed' && progress.totalFindings !== undefined && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">
                Found {progress.totalFindings} results
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
