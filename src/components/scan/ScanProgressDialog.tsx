import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { X, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { getStepsForScanType, type ScanStepType } from '@/lib/scan/freeScanSteps';

interface ScanProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanId: string | null;
  onComplete?: () => void;
  initialProviders?: string[];
}

// Scan lifecycle phases
type ScanPhase = 'running' | 'finalising' | 'completed' | 'failed';

// Helper functions for terminal status detection
const isTerminalStatus = (s?: string) =>
  s === 'completed' || s === 'completed_empty' || s === 'completed_partial' || s === 'failed' || s === 'timeout';

const isFailedStatus = (s?: string) => s === 'failed' || s === 'timeout';

const ROTATION_INTERVAL = 2500; // 2.5 seconds
const LONG_SCAN_THRESHOLD = 45000; // 45 seconds

export function ScanProgressDialog({ open, onOpenChange, scanId, onComplete }: ScanProgressDialogProps) {
  const navigate = useNavigate();

  // Phase and status
  const [phase, setPhase] = useState<ScanPhase>('running');
  const phaseRef = useRef<ScanPhase>('running');
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [isCancelling, setIsCancelling] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Cached scan_type and results_route for deterministic routing
  const [scanType, setScanType] = useState<string | null>(null);
  const [resultsRoute, setResultsRoute] = useState<string>('results');

  // Unified progress UI state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTakingLong, setIsTakingLong] = useState(false);
  const startTimeRef = useRef(Date.now());
  
  // Get scan-type-specific status messages from centralized steps
  const statusMessages = useMemo(() => {
    const effectiveScanType = (scanType as ScanStepType) || 'username';
    const steps = getStepsForScanType(effectiveScanType);
    return steps.map(step => step.title);
  }, [scanType]);

  // Keep phaseRef in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Reset state when dialog opens with new scan
  useEffect(() => {
    if (open && scanId) {
      startTimeRef.current = Date.now();
      setIsTakingLong(false);
      setCurrentMessageIndex(0);
      setPhase('running');
      setStatus('running');
      setTotalResults(0);
    }
  }, [open, scanId]);

  // Rotate status messages
  useEffect(() => {
    if (!open || phase !== 'running') return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % statusMessages.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [open, phase, statusMessages.length]);

  // Check for long-running scan
  useEffect(() => {
    if (!open || phase !== 'running') return;

    const timeout = setTimeout(() => {
      setIsTakingLong(true);
    }, LONG_SCAN_THRESHOLD);

    return () => clearTimeout(timeout);
  }, [open, phase]);

  // Success effects
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 523.25;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play success sound:', error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Cache scan_type and results_route on dialog open
  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('scans')
        .select('scan_type, results_route')
        .eq('id', scanId)
        .maybeSingle();

      if (!cancelled && data) {
        setScanType(data.scan_type ?? null);
        setResultsRoute((data as any).results_route ?? 'results');
      }
    })();

    return () => { cancelled = true; };
  }, [scanId]);

  // Deterministic View Results handler
  const handleViewResults = useCallback(() => {
    if (!scanId) return;

    onOpenChange(false);

    if (scanType === 'username') {
      navigate(`/scan/usernames/${scanId}`);
    } else if (scanType === 'email') {
      navigate(`/scan/emails/${scanId}`);
    } else if (resultsRoute === 'maigret') {
      navigate(`/maigret/results/${scanId}`);
    } else {
      navigate(`/results/${scanId}`);
    }
  }, [scanId, resultsRoute, scanType, navigate, onOpenChange]);

  // Completion detector - polls every 2s
  useEffect(() => {
    if (!scanId || !open) return;

    const checkCompletion = async () => {
      if (phaseRef.current !== 'running') return;

      try {
        const { data: scanData } = await supabase
          .from('scans')
          .select('status, completed_at')
          .eq('id', scanId)
          .maybeSingle();

        if (!scanData) return;

        if (isTerminalStatus(scanData.status)) {
          const isFailed = isFailedStatus(scanData.status);

          // Get findings count
          const { count } = await supabase
            .from('findings')
            .select('*', { count: 'exact', head: true })
            .eq('scan_id', scanId);

          const findingsCount = count || 0;

          flushSync(() => {
            setPhase('finalising');
            setTotalResults(findingsCount);
          });

          // Set final phase after brief delay
          setTimeout(() => {
            flushSync(() => {
              if (isFailed) {
                setStatus('failed');
                setPhase('failed');
                toast.error('Scan could not be completed');
              } else {
                setStatus('completed');
                setPhase('completed');

                if (findingsCount > 0) {
                  playSuccessSound();
                  triggerConfetti();
                  toast.success(`Analysis complete – ${findingsCount} findings`);
                } else {
                  toast.info('Analysis complete');
                }
              }
            });

            setTimeout(() => onComplete?.(), 2000);
          }, 400);
        }
      } catch (error) {
        console.error('[CompletionDetector] Error:', error);
      }
    };

    checkCompletion();
    const interval = setInterval(checkCompletion, 2000);

    return () => clearInterval(interval);
  }, [scanId, open, onComplete]);

  // Realtime subscriptions for completion
  useEffect(() => {
    if (!scanId || !open) return;

    const broadcastChannel = supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'scan_complete' }, async (payload: any) => {
        if (phaseRef.current !== 'running') return;

        const findingsCount = payload.payload.findingsCount || 0;

        flushSync(() => {
          setPhase('finalising');
          setTotalResults(findingsCount);
        });

        setTimeout(() => {
          flushSync(() => {
            setStatus('completed');
            setPhase('completed');
          });

          if (findingsCount > 0) {
            playSuccessSound();
            triggerConfetti();
            toast.success(`Analysis complete – ${findingsCount} findings`);
          } else {
            toast.info('Analysis complete');
          }

          setTimeout(() => onComplete?.(), 2000);
        }, 400);
      })
      .on('broadcast', { event: 'scan_failed' }, () => {
        if (phaseRef.current !== 'running') return;

        flushSync(() => {
          setPhase('finalising');
        });

        setTimeout(() => {
          flushSync(() => {
            setStatus('failed');
            setPhase('failed');
          });
          toast.error('Scan could not be completed');
        }, 400);
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        setStatus('cancelled');
        toast.info('Scan cancelled');
        setTimeout(() => onComplete?.(), 1000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastChannel);
    };
  }, [scanId, open, onComplete]);

  // Handle cancel
  const handleCancel = async () => {
    if (!scanId) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-scan', { body: { scanId } });
      if (error) throw error;
      toast.info('Scan cancelled');
      setStatus('cancelled');
      setTimeout(() => onOpenChange(false), 1000);
    } catch (error) {
      console.error('[Cancel] Error:', error);
      toast.error('Failed to cancel scan');
    } finally {
      setIsCancelling(false);
    }
  };

  // Dynamic dialog title based on phase
  const dialogTitle = useMemo(() => {
    switch (phase) {
      case 'completed': return 'Analysis Complete';
      case 'failed': return 'We couldn\'t complete this scan';
      case 'finalising': return 'Preparing your results';
      default: return 'Analyzing your digital footprint';
    }
  }, [phase]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{dialogTitle}</DialogTitle>
              {phase === 'running' && (
                <DialogDescription className="mt-1">
                  Searching publicly available sources and analyzing patterns linked to your search.
                </DialogDescription>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Running State */}
          {phase === 'running' && (
            <>
              {/* Indeterminate Progress Bar */}
              <div className="relative w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 w-1/3 bg-primary rounded-full animate-indeterminate-progress" />
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

              {/* Long scan message */}
              {isTakingLong && (
                <div className="text-center animate-fade-in">
                  <p className="text-sm text-muted-foreground/80 italic">
                    This scan is taking longer than usual. We're still working on it.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Finalising State */}
          {phase === 'finalising' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Preparing your results…</p>
            </div>
          )}

          {/* Completed State */}
          {phase === 'completed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                {totalResults > 0
                  ? `We found ${totalResults} findings across public sources.`
                  : 'Analysis complete. No significant findings detected.'
                }
              </p>
            </div>
          )}

          {/* Failed State */}
          {phase === 'failed' && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Something went wrong while analyzing your footprint. Please try again.
              </p>
            </div>
          )}

          {/* Footer reassurance - only during running */}
          {phase === 'running' && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground/70 text-center">
                Public sources only • No monitoring • Results ready shortly
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {status === 'running' && (
            <Button onClick={handleCancel} disabled={isCancelling} variant="outline" className="flex-1">
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
          {(phase === 'completed' || phase === 'finalising') && scanId && (
            <Button
              onClick={handleViewResults}
              className="flex-1"
              disabled={phase === 'finalising'}
            >
              <Eye className="h-4 w-4 mr-2" />
              {phase === 'finalising' ? 'Preparing...' : 'View Results'}
            </Button>
          )}
          {phase === 'failed' && (
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
