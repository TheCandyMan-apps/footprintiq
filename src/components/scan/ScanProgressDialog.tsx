import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface ProviderStatus {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'failed' | 'retrying';
  message?: string;
  resultCount?: number;
  retryCount?: number;
  maxRetries?: number;
}

interface ScanProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanId: string | null;
  onComplete?: () => void;
}

export function ScanProgressDialog({ open, onOpenChange, scanId, onComplete }: ScanProgressDialogProps) {
  const [progress, setProgress] = useState(0);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [isCancelling, setIsCancelling] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isSavingCase, setIsSavingCase] = useState(false);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play a pleasant success sound (C major chord)
      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Add second note for harmony
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 659.25; // E5
      oscillator2.type = 'sine';
      gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator2.start(audioContext.currentTime + 0.1);
      oscillator2.stop(audioContext.currentTime + 0.6);
    } catch (error) {
      console.log('Could not play success sound:', error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
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
  };

  useEffect(() => {
    if (!scanId || !open) return;

    console.log('[ScanProgressDialog] Subscribing to channels for scanId:', scanId);

    // Reset state
    setProgress(5); // Show 5% to indicate we're listening
    setProviders([]);
    setCreditsUsed(0);
    setStatus('running');
    setTotalResults(0);
    setIsSavingCase(false);

    // Helper to upsert provider status
    const upsertProvider = (
      name: string, 
      status: ProviderStatus['status'], 
      message?: string,
      retryCount?: number,
      maxRetries?: number
    ) => {
      setProviders((prev) => {
        const existing = prev.find((p) => p.name === name);
        if (existing) {
          return prev.map((p) =>
            p.name === name 
              ? { 
                  ...p, 
                  status, 
                  message: message || p.message,
                  retryCount: retryCount !== undefined ? retryCount : p.retryCount,
                  maxRetries: maxRetries !== undefined ? maxRetries : p.maxRetries
                } 
              : p
          );
        }
        return [...prev, { name, status, message: message || '', retryCount, maxRetries }];
      });
    };

    // Subscribe to Maigret scan progress updates (username scans)
    const maigretChannel = supabase
      .channel(`scan_progress_${scanId}`)
      .on('broadcast', { event: 'provider_update' }, (payload: any) => {
        console.debug('[ScanProgressDialog] Maigret provider_update:', payload);
        const update = payload.payload;
        upsertProvider(update.provider, update.status, update.message);

        if (update.creditsUsed !== undefined) {
          setCreditsUsed(update.creditsUsed);
        }

        const completed = update.creditsUsed || 0;
        const total = 100;
        setProgress(Math.min((completed / total) * 100, 95));
      })
      .on('broadcast', { event: 'scan_complete' }, async (payload: any) => {
        console.debug('[ScanProgressDialog] Maigret scan_complete:', payload);
        setStatus('completed');
        setProgress(100);
        
        const resultsCount = payload.payload?.resultsCount || 0;
        setTotalResults(resultsCount);
        
        if (resultsCount === 0) {
          // Zero results - save partial case and show helpful toast
          toast.info('No results found', {
            description: 'Try a broader query or different username variant',
            duration: 5000,
          });
          void handleZeroResults(); // Fire and forget
        } else {
          playSuccessSound();
          triggerConfetti();
          toast.success(`Scan completed - ${resultsCount} results found`);
        }
        
        setTimeout(() => onComplete?.(), 2000);
      })
      .on('broadcast', { event: 'scan_failed' }, (payload: any) => {
        console.debug('[ScanProgressDialog] Maigret scan_failed:', payload);
        setStatus('failed');
        toast.error(payload.payload.error || 'Scan failed');
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        console.debug('[ScanProgressDialog] Maigret scan_cancelled');
        setStatus('cancelled');
        toast.info('Scan cancelled');
        setTimeout(() => onComplete?.(), 1000);
      })
      .subscribe();

    // Subscribe to orchestrator progress updates (advanced scans)
    const orchestratorChannel = supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'progress' }, (payload: any) => {
        console.debug('[ScanProgressDialog] Orchestrator progress:', payload);
        const update = payload.payload;
        
        // Map orchestrator messages to provider updates
        if (update.message) {
          const queryMatch = update.message.match(/Querying (.+)\.\.\./);
          const completedMatch = update.message.match(/Completed (.+)\.\.\./);
          const retryMatch = update.message.match(/Retry (\d+)\/(\d+) for (.+)\.\.\./);
          
          if (retryMatch) {
            const [, current, max, providerName] = retryMatch;
            upsertProvider(
              providerName, 
              'retrying', 
              `Retrying (${current}/${max})...`,
              parseInt(current),
              parseInt(max)
            );
          } else if (queryMatch) {
            upsertProvider(queryMatch[1], 'loading', 'Querying...');
          } else if (completedMatch) {
            const findingsText = update.findingsCount !== undefined 
              ? ` (${update.findingsCount} findings)` 
              : '';
            upsertProvider(completedMatch[1], 'success', `Completed${findingsText}`);
          } else if (update.error) {
            const providerName = update.provider || 'Provider';
            upsertProvider(providerName, 'failed', update.message);
          }
        }

        // Update overall progress from orchestrator
        if (update.completedProviders !== undefined && update.totalProviders !== undefined) {
          const pct = (update.completedProviders / update.totalProviders) * 100;
          setProgress(Math.min(pct, 95));
        }

        if (update.creditsUsed !== undefined) {
          setCreditsUsed(update.creditsUsed);
        }

        // Handle completion
        if (update.status === 'completed') {
          console.debug('[ScanProgressDialog] Orchestrator completed');
          setStatus('completed');
          setProgress(100);
          
          const resultsCount = update.resultsCount || update.findingsCount || 0;
          setTotalResults(resultsCount);
          
          if (resultsCount === 0) {
            // Zero results - save partial case and show helpful toast
            toast.info('No results found', {
              description: 'Try a broader query or different identifier',
              duration: 5000,
            });
            void handleZeroResults(); // Fire and forget
          } else {
            playSuccessSound();
            triggerConfetti();
            toast.success(`Scan completed - ${resultsCount} results found`);
          }
          
          setTimeout(() => onComplete?.(), 2000);
        } else if (update.status === 'failed') {
          console.debug('[ScanProgressDialog] Orchestrator failed');
          setStatus('failed');
          toast.error(update.message || 'Scan failed');
        }
      })
      .on('broadcast', { event: 'scan_cancelled' }, () => {
        console.debug('[ScanProgressDialog] Orchestrator scan_cancelled');
        setStatus('cancelled');
        toast.info('Scan cancelled');
        setTimeout(() => onComplete?.(), 1000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(maigretChannel);
      supabase.removeChannel(orchestratorChannel);
    };
  }, [scanId, open, onComplete]);

  const handleZeroResults = async () => {
    if (!scanId || isSavingCase) return;
    
    setIsSavingCase(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch scan details
      const { data: scan } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (!scan) return;

      // Save partial case with zero results
      const { error: caseError } = await supabase
        .from('cases')
        .insert({
          title: `No Results Scan - ${scan.scan_type || 'Unknown'}`,
          description: `Scan completed with no findings. Target: ${scan.email || scan.username || scan.phone || 'N/A'}. Consider trying broader search terms or alternative identifiers.`,
          user_id: user.id,
          scan_id: scanId,
          status: 'closed',
          priority: 'low',
          results: [], // Empty results
        });

      if (caseError) {
        console.error('[ScanProgressDialog] Failed to save zero-results case:', caseError);
      } else {
        console.log('[ScanProgressDialog] Saved zero-results case for scan:', scanId);
      }
    } catch (error) {
      console.error('[ScanProgressDialog] Error in handleZeroResults:', error);
    } finally {
      setIsSavingCase(false);
    }
  };

  const handleCancel = async () => {
    if (!scanId) return;
    
    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-scan', {
        body: { scanId },
      });

      if (error) throw error;

      setStatus('cancelled');
      toast.info('Scan cancelled - partial results saved');
      
      // Save partial results to case
      await handleZeroResults();
      
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel scan');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = async () => {
    if (!scanId) return;
    
    try {
      // Close the dialog
      onOpenChange(false);
      
      // Fetch scan details to retry with same parameters
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (scanError || !scan) {
        toast.error('Unable to retry - scan details not found');
        return;
      }

      toast.info('Retrying scan with same parameters...');
      
      // Trigger callback to restart the scan
      setTimeout(() => {
        onComplete?.();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry scan');
    }
  };

  const getStatusIcon = (status: ProviderStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'retrying':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ProviderStatus['status'], retryCount?: number, maxRetries?: number) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Done</Badge>;
      case 'loading':
        return <Badge variant="default" className="bg-blue-500">Loading</Badge>;
      case 'retrying':
        return (
          <Badge variant="default" className="bg-yellow-500">
            Retry {retryCount}/{maxRetries}
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Scan Progress</DialogTitle>
              <DialogDescription>
                Real-time updates from providers
              </DialogDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {creditsUsed > 0 && (
                <span className="font-medium">
                  {creditsUsed} credits used
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Provider List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {providers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Initializing scan...</p>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(provider.status)}
                    <div className="flex-1">
                      <div className="font-medium">{provider.name}</div>
                      {provider.message && (
                        <div className="text-sm text-muted-foreground">
                          {provider.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {provider.resultCount !== undefined && provider.resultCount > 0 && (
                      <Badge variant="outline">
                        {provider.resultCount} results
                      </Badge>
                    )}
                    {getStatusBadge(provider.status)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
            <div className="text-sm order-2 sm:order-1">
              {status === 'completed' && totalResults > 0 && (
                <span className="text-green-600 dark:text-green-400 font-medium animate-fade-in">
                  🎉 Found {totalResults} results!
                </span>
              )}
              {status === 'completed' && totalResults === 0 && (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  ⚠️ No results found - partial case saved
                </span>
              )}
              {status === 'failed' && (
                <span className="text-destructive font-medium">Scan failed - you can retry</span>
              )}
              {status === 'cancelled' && (
                <span className="text-muted-foreground">Scan cancelled - partial results saved</span>
              )}
              {status === 'running' && (
                <span className="text-muted-foreground">
                  Scan in progress... {providers.filter(p => p.status === 'success').length}/{providers.length} providers complete
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 order-1 sm:order-2">
              {status === 'running' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 sm:flex-none"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Scan
                    </>
                  )}
                </Button>
              )}
              {status === 'failed' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRetry}
                  className="flex-1 sm:flex-none"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Retry Scan
                </Button>
              )}
              {(status === 'completed' || status === 'cancelled') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
